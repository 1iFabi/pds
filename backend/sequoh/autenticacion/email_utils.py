"""
Utilidades para el manejo de emails en la aplicación SeqUOH/Genomia utilizando la API de Gmail
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
import logging

logger = logging.getLogger(__name__)

# Configuración de Gmail API
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

# Paleta
BRAND_PRIMARY = "#277EAF"
BRAND_DARK = "#0D5E8C"

def _asset_url(path: str) -> str:
    base = getattr(settings, 'FRONTEND_DOMAIN', 'http://localhost:5173').rstrip('/')
    if not path.startswith('/'):
        path = '/' + path
    return f"{base}{path}"

def load_logo_bytes() -> bytes | None:
    """
    Intenta cargar el logo cNormal.png para incrustarlo inline (CID).
    Prioriza el backend/static y luego el frontend.
    """
    candidates = [
        settings.BASE_DIR / 'static' / 'branding' / 'cNormal.png',
        settings.BASE_DIR / 'sequoh' / 'static' / 'branding' / 'cNormal.png',
        settings.BASE_DIR.parent.parent / 'frontend' / 'public' / 'cNormal.png',
        settings.BASE_DIR.parent.parent / 'frontend' / 'dist' / 'cNormal.png',
    ]
    for p in candidates:
        try:
            if p.exists():
                with open(p, 'rb') as f:
                    return f.read()
        except Exception:
            continue
    return None

# ---------- Template moderno único ----------
def build_modern_email(
    title_text: str,
    inner_html: str,
    preheader: str = "",
    logo_src: str | None = None,
    brand_primary: str = BRAND_PRIMARY,
    brand_dark: str = BRAND_DARK,
    brand_text: str = "#111827",
    brand_muted: str = "#6B7280",
    footer_text: str = "GenomIA · Todos los derechos reservados",
) -> str:
    """
    Template moderno y único para todos los correos de Genomia.
    """
    default_logo_url = _asset_url('cNormal.png')
    _logo = (logo_src or "cid:logo_cid").strip()
    if not _logo.startswith('cid:'):
        _logo = default_logo_url

    preheader_html = f"""
      <div style="display:none;max-height:0px;overflow:hidden;font-size:1px;line-height:1px;color:#fff;opacity:0;">
        {preheader[:180]}
      </div>
    """ if preheader else ""

    return f"""
<!DOCTYPE html>
<html lang="es" xmlns:v="urn:schemas-microsoft-com:vml">
  <head>
    <meta charset="utf-8">
    <meta name="x-apple-disable-message-reformatting">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{title_text}</title>
    <style>
      body{{margin:0;padding:0;background:#F5F7FB;-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly;}}
      table{{border-collapse:collapse !important}}
      img{{border:0;line-height:100%;outline:none;text-decoration:none;display:block}}
      a{{text-decoration:none}}
      .container{{max-width:640px;width:100%}}
      .card{{background:#ffffff;border:1px solid #e5e7eb;border-radius:14px}}
      .px{{padding-left:28px;padding-right:28px}}
      .py{{padding-top:36px;padding-bottom:36px}}
      .heading{{color:{brand_dark};font-size:22px;line-height:1.35;font-weight:600;margin:0 0 10px 0}}
      .body{{color:{brand_text};font-size:15px;line-height:1.7}}
      .muted{{color:{brand_muted};font-size:12px;line-height:1.6}}
      .btn{{display:inline-block;background:{brand_primary};color:#fff;font-weight:700;
            padding:12px 22px;border-radius:10px;font-size:15px}}
      @media (prefers-color-scheme: dark) {{
        body{{background:#0B1220}}
        .card{{background:#0F172A;border-color:#1F2937}}
        .heading{{color:#E5F2FA}}
        .body{{color:#E5E7EB}}
        .muted{{color:#9CA3AF}}
      }}
      @media (max-width:600px){{
        .px{{padding-left:20px;padding-right:20px}}
        .py{{padding-top:28px;padding-bottom:28px}}
      }}
    </style>
  </head>
  <body style="background:#F5F7FB;">
    {preheader_html}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:30px 16px">
      <tr>
        <td align="center">
          <table role="presentation" class="container" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:8px 0 22px 0">
                <img src="{_logo}" alt="Genomia" width="56" style="display:block; height:auto; max-width:56px; border:0; border-radius:12px;" />
              </td>
            </tr>
            <tr>
              <td>
                <table role="presentation" width="100%" class="card">
                  <tr>
                    <td class="px py">
                      <h1 class="heading">{title_text}</h1>
                      <div class="body">
                        {inner_html}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top:18px">
                <div class="muted">{footer_text}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
    """

# ---------- Autenticación Gmail ----------
def get_gmail_service():
    creds = None
    cred_path = getattr(settings, 'GMAIL_CREDENTIALS_FILE', os.path.join(settings.BASE_DIR, 'config', 'credentials.json'))
    token_path = getattr(settings, 'GMAIL_TOKEN_FILE', os.path.join(settings.BASE_DIR, 'config', 'token.json'))

    if os.path.exists(token_path):
        try:
            creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        except Exception:
            creds = None

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(cred_path, SCOPES)
            creds = flow.run_local_server(port=0)
        try:
            os.makedirs(os.path.dirname(token_path), exist_ok=True)
            with open(token_path, 'w', encoding='utf-8') as f:
                f.write(creds.to_json())
        except Exception:
            pass

    return build('gmail', 'v1', credentials=creds)

# ---------- Envío genérico con From/Reply-To ----------
def send_email(
    to_email: str,
    subject: str,
    html_body: str | None = None,
    text_body: str = "",
    inline_images: dict[str, bytes] | None = None,
    from_email: str | None = None,
    from_name: str | None = None,
    reply_to: str | None = None,
) -> bool:
    """
    Envía un email genérico usando la API de Gmail.
    - from_name: nombre visible del remitente
    - from_email: dirección visible del remitente (debe pertenecer a la cuenta o estar configurada en "Send mail as")
    - reply_to: dirección a la que se responderá al usar "Reply"
    """
    try:
        service = get_gmail_service()

        if inline_images:
            msg = MIMEMultipart('related')
            alt = MIMEMultipart('alternative')
            if text_body:
                alt.attach(MIMEText(text_body, 'plain', 'utf-8'))
            if html_body:
                alt.attach(MIMEText(html_body, 'html', 'utf-8'))
            msg.attach(alt)
            for cid, content in inline_images.items():
                try:
                    img = MIMEImage(content)
                except Exception:
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
            msg = MIMEText(text_body or "", 'plain', 'utf-8')

        visible_from_email = from_email or getattr(settings, 'DEFAULT_FROM_EMAIL', 'proyectogenomia@gmail.com')
        visible_from_name = (from_name or getattr(settings, 'DEFAULT_FROM_NAME', 'Genomia')).strip()
        msg['Subject'] = subject
        msg['From'] = f"{visible_from_name} <{visible_from_email}>"
        msg['To'] = to_email
        if reply_to:
            msg['Reply-To'] = reply_to

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
        result = service.users().messages().send(userId='me', body={'raw': raw}).execute()
        logger.info(f"Email enviado a {to_email} - asunto: {subject} - id: {result.get('id')}")
        return True
    except Exception as e:
        logger.error(f"Error enviando email a {to_email}: {e}")
        return False

# ---------- Correos transaccionales ----------
def send_verification_email(user_email, user_name, verification_url):
    try:
        subject = 'Verifica tu correo'
        inline_images = {}
        logo_bytes = load_logo_bytes()
        logo_src = None
        if logo_bytes:
            inline_images['logo_cid'] = logo_bytes
            logo_src = 'cid:logo_cid'

        html_content = build_modern_email(
            title_text="Verifica tu correo",
            preheader="Activa tu cuenta de Genomia con un solo clic.",
            logo_src=logo_src,
            inner_html=f"""
              <p>Hola {user_name},</p>
              <p>Gracias por registrarte en <strong>Genomia</strong>. Para activar tu cuenta, por favor verifica tu correo:</p>
              <p style="text-align:center;margin:22px 0;">
                <a class="btn" href="{verification_url}" style="display:inline-block;background:{BRAND_PRIMARY};color:#fff;
                   font-weight:700;padding:12px 22px;border-radius:10px;font-size:15px">Verificar mi cuenta</a>
              </p>
              <div style="height:1px;background:#e5e7eb;line-height:1px;margin:22px 0;"></div>
              <p class="muted" style="color:#6B7280;font-size:12px;line-height:1.6">
                Este enlace caduca en {getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24)} horas.
                Si no solicitaste esta cuenta, puedes ignorar este correo.
              </p>
            """,
        )

        text_content = f"""Hola {user_name},

Gracias por registrarte en Genomia. Para activar tu cuenta, visita:
{verification_url}

Este enlace caduca en {getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24)} horas.

Equipo Genomia
"""

        return send_email(
            to_email=user_email,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
            inline_images=inline_images or None,
            from_name="Genomia",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'proyectogenomia@gmail.com'),
        )
    except Exception as e:
        logger.error(f"Error enviando email de verificación a {user_email}: {str(e)}")
        return False

def send_welcome_email(user_email, user_name):
    try:
        subject = 'Bienvenido a Genomia'
        login_url = getattr(settings, 'FRONTEND_LOGIN_REDIRECT', f"{getattr(settings, 'FRONTEND_DOMAIN', 'http://localhost:5173').rstrip('/')}/login")

        inline_images = {}
        logo_bytes = load_logo_bytes()
        logo_src = None
        if logo_bytes:
            inline_images['logo_cid'] = logo_bytes
            logo_src = 'cid:logo_cid'

        html_content = build_modern_email(
            title_text="¡Bienvenido a Genomia!",
            preheader="Tu cuenta ya está lista. Explora tu perfil genético y más.",
            logo_src=logo_src,
            inner_html=f"""
              <p>Hola {user_name},</p>
              <p>¡Bienvenido a <strong>Genomia</strong>! Aquí podrás explorar tu perfil genético, descubrir tu ancestría y mucho más.</p>
              <p style="text-align:center;margin:22px 0;">
                <a class="btn" href="{login_url}" style="display:inline-block;background:#111827;color:#fff;
                   font-weight:700;padding:12px 22px;border-radius:10px;font-size:15px">Ir a mi cuenta</a>
              </p>
            """,
        )

        text_content = f"""¡Bienvenido a Genomia, {user_name}!

Aquí podrás explorar tu perfil genético, descubrir tu ancestría y mucho más.
Ingresa a tu cuenta: {login_url}

Equipo Genomia
"""

        return send_email(
            to_email=user_email,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
            inline_images=inline_images or None,
            from_name="Genomia",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'proyectogenomia@gmail.com'),
        )
    except Exception as e:
        logger.error(f"Error enviando email de bienvenida a {user_email}: {str(e)}")
        return False

def send_password_reset_email(user_email: str, user_name: str, reset_url: str) -> bool:
    try:
        subject = 'Restablece tu contraseña - Genomia'

        inline_images = {}
        logo_bytes = load_logo_bytes()
        logo_src = None
        if logo_bytes:
            inline_images['logo_cid'] = logo_bytes
            logo_src = 'cid:logo_cid'

        html_content = build_modern_email(
            title_text="Restablece tu contraseña",
            preheader="Has solicitado cambiar tu contraseña en Genomia.",
            logo_src=logo_src,
            inner_html=f"""
              <p>Hola {user_name or ''},</p>
              <p>Recibimos una solicitud para restablecer tu contraseña. Para continuar, usa el siguiente botón:</p>
              <p style="text-align:center;margin:22px 0;">
                <a class="btn" href="{reset_url}" style="display:inline-block;background:#111827;color:#fff;
                   font-weight:700;padding:12px 22px;border-radius:10px;font-size:15px">Restablecer contraseña</a>
              </p>
              <div style="height:1px;background:#e5e7eb;line-height:1px;margin:22px 0;"></div>
              <p class="muted" style="color:#6B7280;font-size:12px;line-height:1.6">
                Este enlace caduca en {getattr(settings, 'PASSWORD_RESET_EXPIRE_HOURS', getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24))} horas.
                Si no solicitaste este cambio, puedes ignorar este correo.
              </p>
            """,
        )

        text_content = f"""Restablece tu contraseña

Para continuar, visita: {reset_url}

Este enlace caduca en {getattr(settings, 'PASSWORD_RESET_EXPIRE_HOURS', getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24))} horas.

Equipo Genomia
"""

        return send_email(
            to_email=user_email,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
            inline_images=inline_images or None,
            from_name="Genomia",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'proyectogenomia@gmail.com'),
        )
    except Exception as e:
        logger.error(f"Error enviando email de reset a {user_email}: {str(e)}")
        return False

def send_contact_form_email(nombre: str, email: str, mensaje: str) -> bool:
    """
    Envía un email de contacto desde el formulario web a proyectogenomia@gmail.com.
    - From visible: "Genomia · Contacto <proyectogenomia@gmail.com>"
    - Reply-To: email del usuario (para responder directo a la persona)
    """
    try:
        contact_email = getattr(settings, 'CONTACT_EMAIL', 'proyectogenomia@gmail.com')
        subject = f'Nuevo mensaje de contacto de {nombre}'

        inline_images = {}
        logo_bytes = load_logo_bytes()
        logo_src = None
        if logo_bytes:
            inline_images['logo_cid'] = logo_bytes
            logo_src = 'cid:logo_cid'

        html_content = build_modern_email(
            title_text="Contacto",
            preheader="Nuevo mensaje desde el sitio de Genomia.",
            logo_src=logo_src,
            inner_html=f"""
              <div style="background:#F3F4F6;border-left:4px solid {BRAND_PRIMARY};padding:16px;border-radius:8px;margin-bottom:20px;">
                <p style="margin:0 0 8px 0;color:#6B7280;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase">Nuevo Mensaje de Contacto</p>
                <h2 style="margin:0;color:{BRAND_DARK};font-size:18px">De: {nombre}</h2>
              </div>

              <div style="display:inline-block;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:8px;padding:10px 12px;margin-bottom:16px;">
                <span style="color:#6B7280;font-size:12px;font-weight:700;letter-spacing:0.5px">Email:</span>
                <a href="mailto:{email}" style="color:{BRAND_PRIMARY};font-weight:700;margin-left:8px">{email}</a>
              </div>

              <div style="background:#FFFFFF;border:1px solid #E5E7EB;border-radius:12px;padding:18px 16px;">
                <p style="margin:0 0 10px 0;color:#6B7280;font-size:12px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase">Mensaje</p>
                <div style="color:#111827;font-size:15px;line-height:1.7;white-space:pre-wrap">{mensaje}</div>
              </div>

              <p class="muted" style="color:#6B7280;font-size:12px;line-height:1.6;margin-top:18px">
                Puedes responder directamente a <a href="mailto:{email}" style="color:{BRAND_PRIMARY};font-weight:700">{email}</a>.
              </p>
            """,
        )

        text_content = f"""Nuevo mensaje de contacto

De: {nombre}
Email: {email}

Mensaje:
{mensaje}

---
Puedes responder directamente a {email}
"""

        return send_email(
            to_email=contact_email,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
            inline_images=inline_images or None,
            from_name="Genomia · Contacto",  # <- evita "me"
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'proyectogenomia@gmail.com'),
            reply_to=email,  # <- responde directo al usuario
        )
    except Exception as e:
        logger.error(f"Error enviando email de contacto: {str(e)}")
        return False
