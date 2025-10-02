"""
Utilidades para el manejo de emails en la aplicación SeqUOH utilizando la API de Gmail
"""
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from django.conf import settings
import os
import json
import logging

logger = logging.getLogger(__name__)

# Configuración de Gmail API
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def get_gmail_service():
    """Obtiene el servicio de Gmail usando OAuth2 y rutas configurables."""
    creds = None
    cred_path = getattr(settings, 'GMAIL_CREDENTIALS_FILE', os.path.join(settings.BASE_DIR, 'config', 'credentials.json'))
    token_path = getattr(settings, 'GMAIL_TOKEN_FILE', os.path.join(settings.BASE_DIR, 'config', 'token.json'))

    # Cargar token si existe
    if os.path.exists(token_path):
        try:
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        except Exception:
            creds = None

    # Si no hay credenciales válidas, ejecutar flujo OAuth
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(cred_path, SCOPES)
            creds = flow.run_local_server(port=0)
        # Guardar token en JSON
        try:
            os.makedirs(os.path.dirname(token_path), exist_ok=True)
            with open(token_path, 'w', encoding='utf-8') as f:
                f.write(creds.to_json())
        except Exception:
            pass

    service = build('gmail', 'v1', credentials=creds)
    return service

def send_email(to_email: str, subject: str, html_body: str | None = None, text_body: str = "") -> bool:
    """Envía un email genérico usando la API de Gmail (texto y/o HTML)."""
    try:
        service = get_gmail_service()

        if html_body:
            msg = MIMEMultipart('alternative')
            if text_body:
                msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
            msg.attach(MIMEText(html_body, 'html', 'utf-8'))
        else:
            # Solo texto
            msg = MIMEText(text_body or "", 'plain', 'utf-8')

        from_addr = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@example.com')
        # Si DEFAULT_FROM_EMAIL viene con nombre "Nombre <correo>", Gmail ignora el nombre pero no rompe
        if isinstance(msg, MIMEMultipart):
            msg['Subject'] = subject
            msg['From'] = from_addr
            msg['To'] = to_email
            raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
        else:
            msg['Subject'] = subject
            msg['From'] = from_addr
            msg['To'] = to_email
            raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')

        result = service.users().messages().send(userId='me', body={'raw': raw}).execute()
        logger.info(f"Email enviado a {to_email} - asunto: {subject} - id: {result.get('id')} ")
        return True
    except Exception as e:
        logger.error(f"Error enviando email a {to_email}: {e}")
        return False


def send_verification_email(user_email, user_name, verification_url):
    """
    Envía email con enlace de verificación de cuenta usando la API de Gmail
    """
    try:
        # Creamos el servicio de Gmail
        service = get_gmail_service()

        subject = 'SeqUOH - Verifica tu correo'
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4A90E2 0%, #277EAF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Verifica tu correo</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">SeqUOH</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">Hola {user_name},</h2>
                
                <p style="color: #666; line-height: 1.6; font-size: 16px;">
                    Gracias por registrarte en SeqUOH. Para activar tu cuenta, por favor verifica tu correo haciendo clic en el siguiente botón:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="background: linear-gradient(135deg, #4A90E2 0%, #277EAF 100%); 
                              color: white; text-decoration: none; padding: 15px 30px; 
                              border-radius: 8px; font-weight: bold; display: inline-block;
                              font-size: 16px;">
                        Verificar mi cuenta
                    </a>
                </div>

                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="color: #856404; margin: 0; font-size: 14px;">
                        <strong>Importante:</strong> Por seguridad, este enlace caduca en {getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24)} horas.
                    </p>
                </div>

                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    Si no solicitaste esta cuenta, puedes ignorar este email.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #888; font-size: 14px; text-align: center; margin: 0;">
                    <strong>Equipo SeqUOH</strong>
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Hola {user_name},

        Gracias por registrarte en SeqUOH. Para activar tu cuenta, visita:
        {verification_url}

        Este enlace caduca en {getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24)} horas.

        Equipo SeqUOH
        """

        # Enviar con helper genérico (incluye HTML + texto)
        send_email(
            to_email=user_email,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
        )
        logger.info(f"Email de verificación enviado a {user_email}")
        return True
    except Exception as e:
        logger.error(f"Error enviando email de verificación a {user_email}: {str(e)}")
        return False

def send_welcome_email(user_email, user_name):
    """Envía email de bienvenida tras verificación usando la API de Gmail."""
    try:
        subject = 'Bienvenido a Genomia'
        login_url = getattr(settings, 'FRONTEND_LOGIN_REDIRECT', f"{getattr(settings, 'FRONTEND_DOMAIN', 'http://localhost:5173').rstrip('/')}/login")
        html_content = f"""
        <html>
        <body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">
            <div style=\"background: linear-gradient(135deg, #4A90E2 0%, #277EAF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;\">
                <h1 style=\"color: white; margin: 0; font-size: 28px;\">¡Bienvenido a Genomia!</h1>
            </div>
            
            <div style=\"background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\">
                <h2 style=\"color: #333; margin-bottom: 20px;\">Hola {user_name},</h2>
                <p style=\"color: #666; line-height: 1.6; font-size: 16px;\">
                    ¡Bienvenido a Genomia! Aquí podrás explorar tu perfil genético, descubrir tu ancestría y mucho más.
                </p>
                <div style=\"text-align: center; margin: 30px 0;\">
                    <a href=\"{login_url}\" style=\"background: linear-gradient(135deg, #4A90E2 0%, #277EAF 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;\">Ir a mi cuenta</a>
                </div>
                <hr style=\"border: none; border-top: 1px solid #eee; margin: 30px 0;\">
                <p style=\"color: #888; font-size: 14px; text-align: center; margin: 0;\"><strong>Equipo SeqUOH</strong></p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        ¡Bienvenido a Genomia, {user_name}!

        Aquí podrás explorar tu perfil genético, descubrir tu ancestría y mucho más.

        Ingresa a tu cuenta: {login_url}

        Equipo SeqUOH
        """
        
        send_email(
            to_email=user_email,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
        )
        logger.info(f"Email de bienvenida enviado a {user_email}")
        return True
    except Exception as e:
        logger.error(f"Error enviando email de bienvenida a {user_email}: {str(e)}")
        return False


def send_password_reset_email(user_email: str, user_name: str, reset_url: str) -> bool:
    """Envía un email de restablecimiento de contraseña con botón al frontend."""
    try:
        subject = 'Restablece tu contraseña - Genomia'
        html_content = f"""
        <html>
        <body style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">
            <div style=\"background: linear-gradient(135deg, #4A90E2 0%, #277EAF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;\">
                <h1 style=\"color: white; margin: 0; font-size: 24px;\">Recuperación de contraseña</h1>
                <p style=\"color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;\">Genomia</p>
            </div>
            <div style=\"background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\">
                <p style=\"color: #333; font-size: 16px; line-height: 1.6;\">Hola {user_name or ''},</p>
                <p style=\"color: #666; font-size: 16px; line-height: 1.6;\">Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
                <div style=\"text-align: center; margin: 24px 0;\">
                    <a href=\"{reset_url}\" style=\"background: linear-gradient(135deg, #4A90E2 0%, #277EAF 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;\">Restablecer contraseña</a>
                </div>
                <div style=\"background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 12px; margin: 20px 0;\">
                    <p style=\"color: #856404; margin: 0; font-size: 14px;\"><strong>Importante:</strong> Por seguridad, este enlace caduca en {getattr(settings, 'PASSWORD_RESET_EXPIRE_HOURS', getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24))} horas.</p>
                </div>
                <p style=\"color: #666; font-size: 14px; line-height: 1.6;\">Si no solicitaste este cambio, puedes ignorar este correo.</p>
            </div>
        </body>
        </html>
        """
        text_content = f"""
        Restablece tu contraseña

        Para continuar, visita: {reset_url}

        Este enlace caduca en {getattr(settings, 'PASSWORD_RESET_EXPIRE_HOURS', getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24))} horas.

        Equipo Genomia
        """
        return send_email(to_email=user_email, subject=subject, html_body=html_content, text_body=text_content)
    except Exception as e:
        logger.error(f"Error enviando email de reset a {user_email}: {str(e)}")
        return False
