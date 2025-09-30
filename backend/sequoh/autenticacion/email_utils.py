"""
Utilidades para el manejo de emails en la aplicación SeqUOH
"""
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
import logging

logger = logging.getLogger(__name__)

def send_verification_email(user_email, user_name, verification_token: str):
    """
    Envía email con enlace de verificación de cuenta
    """
    try:
        subject = 'SeqUOH - Verifica tu correo'
        # Construimos enlace directo al backend para verificación por GET
        backend_base = getattr(settings, 'BACKEND_DOMAIN', None)
        if not backend_base:
            railway_domain = getattr(settings, 'RAILWAY_PUBLIC_DOMAIN', None)
            if railway_domain:
                backend_base = f"https://{railway_domain}"
            else:
                backend_base = "http://localhost:8000"
        verification_link = f"{backend_base}/api/auth/verify/{verification_token}/"

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
                    <a href="{verification_link}" 
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
        {verification_link}

        Este enlace caduca en {getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24)} horas.

        Equipo SeqUOH
        """

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email]
        )
        msg.attach_alternative(html_content, "text/html")

        msg.send()
        logger.info(f"Email de verificación enviado a {user_email}")
        return True
    except Exception as e:
        logger.error(f"Error enviando email de verificación a {user_email}: {str(e)}")
        return False


def send_welcome_email(user_email, user_name):
    """
    Envía email de bienvenida al usuario recién registrado
    """
    try:
        subject = 'Bienvenido a SeqUOH - Tu perfil genético te espera'
        
        # Crear el contenido HTML del email
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4A90E2 0%, #277EAF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">¡Bienvenido a SeqUOH!</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu viaje genético comienza ahora</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">Hola {user_name},</h2>
                
                <p style="color: #666; line-height: 1.6; font-size: 16px;">
                    Te damos la bienvenida a SeqUOH, la plataforma líder en análisis genético personalizado. 
                    Tu cuenta ha sido creada exitosamente y ya puedes comenzar a explorar tu perfil genético.
                </p>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4A90E2;">
                    <h3 style="color: #4A90E2; margin: 0 0 10px 0; font-size: 18px;">¿Qué puedes hacer ahora?</h3>
                    <ul style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
                        <li>🧬 Explorar tu análisis de enfermedades</li>
                        <li>🌍 Descubrir tu ancestría genética</li>
                        <li>💊 Conocer tu farmacogenética</li>
                        <li>📊 Revisar tus biomarcadores</li>
                        <li>🎯 Analizar tus rasgos únicos</li>
                        <li>📈 Ver tus datos biométricos</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://localhost:5173/login"
                       style="background: linear-gradient(135deg, #4A90E2 0%, #277EAF 100%); 
                              color: white; text-decoration: none; padding: 15px 30px; 
                              border-radius: 8px; font-weight: bold; display: inline-block;
                              font-size: 16px; transition: all 0.3s ease;">
                        Acceder a mi Dashboard
                    </a>
                </div>
                
                <div style="background: #fffbf0; border: 1px solid #ffd93d; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="color: #8b5cf6; margin: 0; font-size: 14px; text-align: center;">
                        <strong>💡 Consejo:</strong> Guarda este email para futuras consultas sobre tu cuenta.
                    </p>
                </div>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #888; font-size: 14px; text-align: center; margin: 0;">
                    Si tienes alguna pregunta, no dudes en contactarnos.<br>
                    <strong>Equipo SeqUOH</strong><br>
                    <em>Descubre la historia que tu ADN tiene para contarte</em>
                </p>
            </div>
        </body>
        </html>
        """
        
        # Versión texto plano del email
        text_content = f"""
        ¡Bienvenido a SeqUOH, {user_name}!
        
        Tu cuenta ha sido creada exitosamente y ya puedes comenzar a explorar tu perfil genético.
        
        ¿Qué puedes hacer ahora?
        - Explorar tu análisis de enfermedades
        - Descubrir tu ancestría genética  
        - Conocer tu farmacogenética
        - Revisar tus biomarcadores
        - Analizar tus rasgos únicos
        - Ver tus datos biométricos
        
        Accede a tu dashboard en: http://localhost:5173/login
        
        Equipo SeqUOH
        Descubre la historia que tu ADN tiene para contarte
        """
        
        # Crear email con HTML y texto
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email]
        )
        msg.attach_alternative(html_content, "text/html")
        
        # Enviar email
        msg.send()
        logger.info(f"Email de bienvenida enviado a {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Error enviando email de bienvenida a {user_email}: {str(e)}")
        return False

def send_password_reset_email(user_email, user_name, reset_token):
    """
    Envía email de recuperación de contraseña
    """
    try:
        subject = 'SeqUOH - Recuperación de contraseña'
        reset_link = f"http://localhost:5173/login?token={reset_token}"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #4A90E2 0%, #277EAF 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Recuperación de Contraseña</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">SeqUOH</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #333; margin-bottom: 20px;">Hola {user_name},</h2>
                
                <p style="color: #666; line-height: 1.6; font-size: 16px;">
                    Recibimos una solicitud para restablecer la contraseña de tu cuenta SeqUOH.
                    Si fuiste tú quien solicitó este cambio, haz clic en el botón de abajo:
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" 
                       style="background: linear-gradient(135deg, #4A90E2 0%, #277EAF 100%); 
                              color: white; text-decoration: none; padding: 15px 30px; 
                              border-radius: 8px; font-weight: bold; display: inline-block;
                              font-size: 16px;">
                        Restablecer Contraseña
                    </a>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                    <p style="color: #856404; margin: 0; font-size: 14px;">
                        <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas por seguridad.
                    </p>
                </div>
                
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                    Si no solicitaste este cambio, puedes ignorar este email. 
                    Tu contraseña permanecerá sin cambios.
                </p>
                
                <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                
                <p style="color: #888; font-size: 14px; text-align: center; margin: 0;">
                    <strong>Equipo SeqUOH</strong><br>
                    <em>Tu seguridad es nuestra prioridad</em>
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Hola {user_name},
        
        Recibimos una solicitud para restablecer la contraseña de tu cuenta SeqUOH.
        
        Si fuiste tú quien solicitó este cambio, accede al siguiente enlace:
        {reset_link}
        
        Este enlace expirará en 24 horas por seguridad.
        
        Si no solicitaste este cambio, puedes ignorar este email.
        
        Equipo SeqUOH
        """
        
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email]
        )
        msg.attach_alternative(html_content, "text/html")
        
        msg.send()
        logger.info(f"Email de recuperación enviado a {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Error enviando email de recuperación a {user_email}: {str(e)}")
        return False

def send_login_notification_email(user_email, user_name, login_time, ip_address=None):
    """
    Envía notificación de nuevo login (opcional, para seguridad)
    """
    try:
        subject = 'SeqUOH - Nuevo acceso a tu cuenta'
        
        location_info = f"desde {ip_address}" if ip_address else ""
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #28a745; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Acceso Exitoso</h1>
                <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">SeqUOH</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #333;">Hola {user_name},</h2>
                
                <p style="color: #666; line-height: 1.6;">
                    Te notificamos que se ha accedido a tu cuenta SeqUOH:
                </p>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #333;">
                        <strong>Fecha y hora:</strong> {login_time}<br>
                        {f'<strong>Ubicación:</strong> {location_info}<br>' if location_info else ''}
                    </p>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    Si fuiste tú, puedes ignorar este email. Si no reconoces este acceso, 
                    cambia tu contraseña inmediatamente.
                </p>
                
                <p style="color: #888; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
                    <strong>Equipo SeqUOH</strong>
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Hola {user_name},
        
        Te notificamos que se ha accedido a tu cuenta SeqUOH:
        
        Fecha y hora: {login_time}
        {f'Ubicación: {location_info}' if location_info else ''}
        
        Si fuiste tú, puedes ignorar este email. Si no reconoces este acceso, 
        cambia tu contraseña inmediatamente.
        
        Equipo SeqUOH
        """
        
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email]
        )
        msg.attach_alternative(html_content, "text/html")
        
        msg.send()
        logger.info(f"Notificación de login enviada a {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Error enviando notificación de login a {user_email}: {str(e)}")
        return False