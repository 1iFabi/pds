"""
Utilidades para el manejo de emails en la aplicación SeqUOH utilizando la API de Gmail
"""
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
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

# Paleta basada en tu frontend (Navbar --brand y tonos Login)
BRAND_PRIMARY = "#277EAF"  # barra superior / acento
BRAND_DARK = "#0D5E8C"     # títulos y acentos
BANNER_TEXT = "#FFFFFF"


def _asset_url(path: str) -> str:
    base = getattr(settings, 'FRONTEND_DOMAIN', 'http://localhost:5173').rstrip('/')
    if not path.startswith('/'):
        path = '/' + path
    return f"{base}{path}"


def load_logo_bytes() -> bytes | None:
    """Intenta cargar el logo desde el repo para incrustarlo inline (CID).
    Prioriza backend/static (para Railway), luego frontend.
    """
    candidates = [
        settings.BASE_DIR / 'static' / 'branding' / 'logo.png',
        settings.BASE_DIR / 'sequoh' / 'static' / 'branding' / 'logo.png',
        settings.BASE_DIR.parent.parent / 'frontend' / 'public' / 'SeqUoh_Logo.png',
        settings.BASE_DIR.parent.parent / 'frontend' / 'public' / 'Logo.png',
        settings.BASE_DIR.parent.parent / 'frontend' / 'dist' / 'SeqUoh_Logo.png',
        settings.BASE_DIR.parent.parent / 'frontend' / 'dist' / 'Logo.png',
    ]
    for p in candidates:
        try:
            if p.exists():
                with open(p, 'rb') as f:
                    return f.read()
        except Exception:
            continue
    return None


def build_branded_html(inner_html: str, title_text: str | None = None, logo_src: str | None = None) -> str:
    """Envuelve contenido con banner + contenedor central inspirado en EmailTemplate.

    - Banner con logo centrado y nombre del sitio
    - Card central con sombra, fondo limpio
    - Botón con acento de la paleta
    """
    _default_url = _asset_url('SeqUoh_Logo.png')
    _logo_src = logo_src or 'cid:logo_cid'
    title_html = ''
    if title_text:
        title_html = f'<h2 style="color: {BRAND_DARK}; margin: 0 0 16px 0; font-size: 24px; font-weight: 700; line-height: 1.3;">{title_text}</h2>'

    return f"""
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style=\"margin:0; padding:0; background:#f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;\">
        <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#f9fafb; padding:32px 16px;\">
          <tr>
            <td align=\"center\">
              <table role=\"presentation\" width=\"600\" cellspacing=\"0\" cellpadding=\"0\" style=\"max-width:600px; width:100%;\">
                <!-- Logo y nombre del sitio -->
                <tr>
                  <td align=\"center\" style=\"padding:0 0 24px 0;\">
                    <img src=\"{_logo_src if _logo_src.startswith('cid:') else (_logo_src or _default_url)}\" width=\"48\" height=\"48\" alt=\"Genomia\" style=\"display:block; border:0; border-radius:8px;\" />
                  </td>
                </tr>
                <!-- Card principal -->
                <tr>
                  <td>
                    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background:#ffffff; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06); border:1px solid #e5e7eb;\">
                      <tr>
                        <td style=\"padding:40px 32px;\">
                          {title_html}
                          <div style=\"color:#374151; font-size:15px; line-height:1.6;\">
                            {inner_html}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td align=\"center\" style=\"padding:24px 0 0 0;\">
                    <p style=\"margin:0; color:#6b7280; font-size:13px; line-height:1.5;\">Genomia</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """

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

def send_email(to_email: str, subject: str, html_body: str | None = None, text_body: str = "", inline_images: dict[str, bytes] | None = None) -> bool:
    """Envía un email genérico usando la API de Gmail (texto y/o HTML)."""
    try:
        service = get_gmail_service()

        if inline_images:
            # multipart/related -> alternative (text, html)
            msg = MIMEMultipart('related')
            alt = MIMEMultipart('alternative')
            if text_body:
                alt.attach(MIMEText(text_body, 'plain', 'utf-8'))
            if html_body:
                alt.attach(MIMEText(html_body, 'html', 'utf-8'))
            msg.attach(alt)
            # Adjuntar imágenes inline por CID
            for cid, content in inline_images.items():
                try:
                    img = MIMEImage(content)
                except Exception:
                    # fallback content-type genérico
                    img = MIMEImage(content, _subtype='png')
                img.add_header('Content-ID', f'<{cid}>')
                img.add_header('Content-Disposition', 'inline', filename=f'{cid}.png')
                img.add_header('X-Attachment-Id', cid)
                msg.attach(img)
        elif html_body:
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

        subject = 'Verifica tu correo'
        
        # Preparar logo inline (CID) si hay archivo disponible
        inline_images = {}
        logo_bytes = load_logo_bytes()
        if logo_bytes:
            inline_images['logo_cid'] = logo_bytes
            logo_src = 'cid:logo_cid'
        else:
            logo_src = _asset_url('SeqUoh_Logo.png')
        
        inner = f"""
          <p>Hola {user_name},</p>
          <p>
            Gracias por registrarte en Genomia. Para activar tu cuenta, por favor verifica tu correo haciendo clic en el siguiente botón:
          </p>
          <div style=\"text-align:center; margin: 24px 0;\">
            <a href=\"{verification_url}\" style=\"display:inline-block; background:{BRAND_PRIMARY}; color:#ffffff; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:700; font-size:15px;\">Verificar mi cuenta</a>
          </div>
          <p style=\"background:#fff8e1; border:1px solid #ffeaa7; border-radius:8px; padding:12px; color:#7c5a00;\">
            <strong>Importante:</strong> Este enlace caduca en {getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24)} horas.
          </p>
          <p style=\"color:#6b7280; font-size:13px;\">Si no solicitaste esta cuenta, puedes ignorar este email.</p>
        """
        html_content = build_branded_html(inner_html=inner, title_text='Verifica tu correo', logo_src=logo_src)
        
        text_content = f"""
        Hola {user_name},

        Gracias por registrarte en Genomia. Para activar tu cuenta, visita:
        {verification_url}

        Este enlace caduca en {getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24)} horas.

        Equipo Genomia
        """

        # Enviar
        send_email(
            to_email=user_email,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
            inline_images=inline_images or None,
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
        # Preparar logo inline (CID) si hay archivo disponible
        inline_images = {}
        logo_bytes = load_logo_bytes()
        if logo_bytes:
            inline_images['logo_cid'] = logo_bytes
            logo_src = 'cid:logo_cid'
        else:
            logo_src = _asset_url('SeqUoh_Logo.png')

        inner = f"""
          <p>Hola {user_name},</p>
          <p>¡Bienvenido a Genomia! Aquí podrás explorar tu perfil genético, descubrir tu ancestría y mucho más.</p>
          <div style=\"text-align:center; margin: 24px 0;\">
            <a href=\"{login_url}\" style=\"background:#1f2937; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:8px; font-weight:700; display:inline-block;\">Ir a mi cuenta</a>
          </div>
        """
        html_content = build_branded_html(inner_html=inner, title_text='¡Bienvenido a Genomia!', logo_src=logo_src)

        text_content = f"""
        ¡Bienvenido a Genomia, {user_name}!

        Aquí podrás explorar tu perfil genético, descubrir tu ancestría y mucho más.

        Ingresa a tu cuenta: {login_url}

        Equipo Genomia
        """
        
        send_email(
            to_email=user_email,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
            inline_images=inline_images or None,
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
        # Preparar logo inline (CID) si hay archivo disponible
        inline_images = {}
        logo_bytes = load_logo_bytes()
        if logo_bytes:
            inline_images['logo_cid'] = logo_bytes
            logo_src = 'cid:logo_cid'
        else:
            logo_src = _asset_url('SeqUoh_Logo.png')

        inner = f"""
          <p>Hola {user_name or ''},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
          <div style=\"text-align:center; margin: 24px 0;\">
            <a href=\"{reset_url}\" style=\"background:#1f2937; color:#ffffff; text-decoration:none; padding:12px 22px; border-radius:8px; font-weight:700; display:inline-block;\">Restablecer contraseña</a>
          </div>
          <p style=\"background:#fff8e1; border:1px solid #ffeaa7; border-radius:8px; padding:12px; color:#7c5a00;\"><strong>Importante:</strong> Este enlace caduca en {getattr(settings, 'PASSWORD_RESET_EXPIRE_HOURS', getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24))} horas.</p>
          <p style=\"color:#6b7280; font-size:13px;\">Si no solicitaste este cambio, puedes ignorar este correo.</p>
        """
        html_content = build_branded_html(inner_html=inner, title_text='Recuperación de contraseña', logo_src=logo_src)
        text_content = f"""
        Restablece tu contraseña

        Para continuar, visita: {reset_url}

        Este enlace caduca en {getattr(settings, 'PASSWORD_RESET_EXPIRE_HOURS', getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24))} horas.

        Equipo Genomia
        """
        inline_images = {}
        logo_bytes = load_logo_bytes()
        if logo_bytes:
            inline_images['logo_cid'] = logo_bytes
        return send_email(to_email=user_email, subject=subject, html_body=html_content, text_body=text_content, inline_images=inline_images or None)
    except Exception as e:
        logger.error(f"Error enviando email de reset a {user_email}: {str(e)}")
        return False
