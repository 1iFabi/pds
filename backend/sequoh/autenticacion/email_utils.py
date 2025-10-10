"""
Utilidades para el manejo de emails en la aplicación SeqUOH (Genomia) usando la API de Gmail.
Incluye:
- Branding accesible (paleta nueva + tokens)
- Preheader
- Botones consistentes
- Card con sombra y radios
- Soporte dark mode básico (Apple Mail / algunos clientes)
- Fallback de logo a /cNormal.png (no usa SeqUOHLogo.png)
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

# =========================
#   Configuración Gmail
# =========================
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

# =========================
#   Branding & UI tokens
# =========================
BRAND = {
    "name": "Genomia",
    "colors": {
        # petróleo accesible (AA sobre blanco y en botón)
        "primary": "#0E7490",   # teal-700
        "primary_dark": "#0B5C70",
        "accent": "#14B8A6",    # teal-500
        "ink": "#111827",       # gray-900
        "body": "#374151",      # gray-700
        "muted": "#6B7280",     # gray-500
        "border": "#E5E7EB",    # gray-200
        "card_bg": "#FFFFFF",
        "bg": "#F8FAFC"         # slate-50
    },
    "radius": 14,
    "shadow": "0 2px 6px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)"
}


# =========================
#   Helpers de assets/UI
# =========================
def _asset_url(path: str) -> str:
    base = getattr(settings, 'FRONTEND_DOMAIN', 'http://localhost:5173').rstrip('/')
    if not path.startswith('/'):
        path = '/' + path
    return f"{base}{path}"

def load_logo_bytes() -> bytes | None:
    """
    Busca *primero* cNormal.png en distintas ubicaciones (backend y frontend).
    No usa SeqUOHLogo.png.
    """
    candidates = [
        # backend/static
        settings.BASE_DIR / 'static' / 'branding' / 'cNormal.png',
        settings.BASE_DIR / 'sequoh' / 'static' / 'branding' / 'cNormal.png',
        # frontend
        settings.BASE_DIR.parent.parent / 'frontend' / 'public' / 'cNormal.png',
        settings.BASE_DIR.parent.parent / 'frontend' / 'dist' / 'cNormal.png',
        # fallback a Logo.png si no existe cNormal.png
        settings.BASE_DIR / 'static' / 'branding' / 'Logo.png',
        settings.BASE_DIR.parent.parent / 'frontend' / 'public' / 'Logo.png',
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


def email_button(url: str, label: str, *, kind: str = "primary") -> str:
    """
    Botón bulletproof para email (anchor con estilos inline).
    kind: "primary" | "neutral"
    """
    c = BRAND["colors"]
    if kind == "neutral":
        bg = c["ink"]
        # ojo: :hover no siempre aplica en clientes de correo, lo dejamos informativo
    else:
        bg = c["primary"]
    return (
        f'<a href="{url}" '
        f'style="background:{bg}; color:#FFFFFF; text-decoration:none; '
        f'display:inline-block; line-height:1; font-weight:700; '
        f'padding:12px 22px; border-radius:{BRAND["radius"]}px; '
        f'box-shadow: {BRAND["shadow"]};">'
        f'{label}</a>'
    )


def build_branded_html(inner_html: str,
                       title_text: str | None = None,
                       logo_src: str | None = None,
                       preheader: str | None = None) -> str:
    """
    Plantilla base con:
    - preheader (oculto visual, visible en inbox preview)
    - banner con logo cNormal.png (CID si viene)
    - card central prolija y accesible
    - light/dark tweaks donde aplica
    """
    c = BRAND["colors"]
    _default_logo = _asset_url('cNormal.png')
    _logo_src = logo_src or 'cid:logo_cid'
    _pre = (preheader or "").replace('"', "'")

    title_html = (
        f'<h2 style="color:{c["ink"]}; margin:0 0 16px 0; '
        f'font-size:24px; font-weight:800; line-height:1.25;">{title_text}</h2>'
        if title_text else ""
    )

    return f"""
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>{(title_text or BRAND["name"])}</title>
    <!-- Preheader: mostrado en la bandeja, oculto en el cuerpo -->
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;
      height:0;width:0;overflow:hidden;mso-hide:all;">
      {_pre}
    </span>
    <style>
      /* Dark mode (Apple Mail / algunos clientes) */
      @media (prefers-color-scheme: dark) {{
        :root {{
          color-scheme: dark;
          supported-color-schemes: dark;
        }}
        .bg {{
          background: #0B1220 !important;
        }}
        .card {{
          background: #0F172A !important;
          border-color: #1F2937 !important;
        }}
        .text {{
          color: #E5E7EB !important;
        }}
        .muted {{
          color: #9CA3AF !important;
        }}
      }}
    </style>
  </head>
  <body style="margin:0; padding:0; background:{c["bg"]}; 
               font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="bg"
           style="background:{c["bg"]}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0"
                 style="max-width:600px; width:100%;">
            <!-- Logo -->
            <tr>
              <td align="center" style="padding:0 0 16px 0;">
                <img src="{_logo_src if _logo_src.startswith('cid:') else (_logo_src or _default_logo)}"
                  alt="{BRAND["name"]}"
                  style="display:block; border:0; border-radius:12px;
                          max-width:100px; height:auto; aspect-ratio:1/1; object-fit:contain;" />

              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                       class="card"
                       style="background:{c["card_bg"]}; border-radius:{BRAND["radius"]}px; 
                              box-shadow:{BRAND["shadow"]}; border:1px solid {c["border"]};">
                  <tr>
                    <td style="padding:36px 28px;">
                      {title_html}
                      <div class="text" style="color:{c["body"]}; font-size:15px; line-height:1.65;">
                        {inner_html}
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:18px 0 0 0;">
                <p class="muted" style="margin:0; color:{c["muted"]}; font-size:12px; line-height:1.5;">
                  {BRAND["name"]}
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""


def text_block(*lines: str) -> str:
    """Crea un bloque de texto plano coherente para multipart/alternative."""
    return "\n".join(lines).strip() + "\n"


# =========================
#   Gmail Service & Send
# =========================
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


def send_email(to_email: str,
               subject: str,
               html_body: str | None = None,
               text_body: str = "",
               inline_images: dict[str, bytes] | None = None) -> bool:
    """Envía un email genérico usando la API de Gmail (texto y/o HTML)."""
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

        from_addr = getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@example.com')
        msg['Subject'] = subject
        msg['From'] = from_addr
        msg['To'] = to_email

        raw = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
        result = service.users().messages().send(userId='me', body={'raw': raw}).execute()
        logger.info(f"Email enviado a {to_email} - asunto: {subject} - id: {result.get('id')}")
        return True
    except Exception as e:
        logger.error(f"Error enviando email a {to_email}: {e}")
        return False


# =========================
#   Mails específicos
# =========================
def send_verification_email(user_email: str, user_name: str, verification_url: str) -> bool:
    """
    Envía email con enlace de verificación de cuenta.
    """
    try:
        subject = 'Verifica tu correo'

        # Preparar logo inline (CID) si hay archivo disponible
        inline_images = {}
        logo_bytes = load_logo_bytes()
        logo_src = None
        if logo_bytes:
            inline_images['logo_cid'] = logo_bytes
            logo_src = 'cid:logo_cid'
        else:
            logo_src = _asset_url('cNormal.png')

        btn_html = email_button(verification_url, "Verificar mi cuenta", kind="primary")
        inner = f"""
          <p>Hola {user_name},</p>
          <p>Gracias por registrarte en {BRAND["name"]}. Para activar tu cuenta, haz clic en el botón:</p>
          <div style="text-align:center; margin: 22px 0;">
            {btn_html}
          </div>
          <p style="background:#FFF8E1; border:1px solid #FFE08A; border-radius:10px; padding:12px; color:#7C5A00;">
            <strong>Importante:</strong> Este enlace caduca en {getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24)} horas.
          </p>
          <p style="color:#6B7280; font-size:13px;">Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
        """
        html_content = build_branded_html(
            inner_html=inner,
            title_text='Verifica tu correo',
            logo_src=logo_src,
            preheader="Activa tu cuenta con un clic."
        )

        text_content = text_block(
            f"Hola {user_name},",
            f"Gracias por registrarte en {BRAND['name']}. Para activar tu cuenta, visita:",
            verification_url,
            "",
            f"Este enlace caduca en {getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24)} horas.",
            "",
            f"Equipo {BRAND['name']}"
        )

        ok = send_email(
            to_email=user_email,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
            inline_images=inline_images or None,
            from_name="Genomia",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'proyectogenomia@gmail.com'),
        )
        if ok:
            logger.info(f"Email de verificación enviado a {user_email}")
        return ok
    except Exception as e:
        logger.error(f"Error enviando email de verificación a {user_email}: {str(e)}")
        return False


def send_welcome_email(user_email: str, user_name: str) -> bool:
    """Envía email de bienvenida tras verificación."""
    try:
        subject = 'Bienvenid@ a Genomia'
        login_url = getattr(
            settings,
            'FRONTEND_LOGIN_REDIRECT',
            f"{getattr(settings, 'FRONTEND_DOMAIN', 'http://localhost:5173').rstrip('/')}/login"
        )

        inline_images = {}
        logo_bytes = load_logo_bytes()
        logo_src = None
        if logo_bytes:
            inline_images['logo_cid'] = logo_bytes
            logo_src = 'cid:logo_cid'
        else:
            logo_src = _asset_url('cNormal.png')

        btn_html = email_button(login_url, "Ir a mi cuenta", kind="neutral")
        inner = f"""
          <p>Hola {user_name},</p>
          <p>¡Bienvenid@ a {BRAND["name"]}! Aquí podrás explorar tu perfil genético, tu ancestría y más.</p>
          <div style="text-align:center; margin: 22px 0;">
            {btn_html}
          </div>
        """
        html_content = build_branded_html(
            inner_html=inner,
            title_text='¡Bienvenid@!',
            logo_src=logo_src,
            preheader="Tu cuenta ya está lista. Entra cuando quieras."
        )

        text_content = text_block(
            f"¡Bienvenid@ a {BRAND['name']}, {user_name}!",
            "Explora tu perfil genético, ancestría y más.",
            f"Inicia sesión: {login_url}",
            "",
            f"Equipo {BRAND['name']}"
        )

        ok = send_email(
            to_email=user_email,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
            inline_images=inline_images or None,
            from_name="Genomia",
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'proyectogenomia@gmail.com'),
        )
        if ok:
            logger.info(f"Email de bienvenida enviado a {user_email}")
        return ok
    except Exception as e:
        logger.error(f"Error enviando email de bienvenida a {user_email}: {str(e)}")
        return False

def send_password_reset_email(user_email: str, user_name: str, reset_url: str) -> bool:
    try:
        subject = 'Restablece tu contraseña'
        inline_images = {}
        logo_bytes = load_logo_bytes()
        logo_src = None
        if logo_bytes:
            inline_images['logo_cid'] = logo_bytes
            logo_src = 'cid:logo_cid'
        else:
            logo_src = _asset_url('cNormal.png')

        expire_hours = getattr(settings, 'PASSWORD_RESET_EXPIRE_HOURS',
                               getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24))

        btn_html = email_button(reset_url, "Restablecer contraseña", kind="neutral")
        inner = f"""
          <p>Hola {user_name or ''},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Continúa aquí:</p>
          <div style="text-align:center; margin: 22px 0;">
            {btn_html}
          </div>
          <p style="background:#FFF8E1; border:1px solid #FFE08A; border-radius:10px; padding:12px; color:#7C5A00;">
            <strong>Importante:</strong> Este enlace caduca en {expire_hours} horas.
          </p>
          <p style="color:#6B7280; font-size:13px;">Si no solicitaste este cambio, ignora este correo.</p>
        """
        html_content = build_branded_html(
            inner_html=inner,
            title_text='Recuperación de contraseña',
            logo_src=logo_src,
            preheader="Tu link de recuperación está listo."
        )

        text_content = text_block(
            "Restablece tu contraseña",
            f"Enlace: {reset_url}",
            f"Este link caduca en {expire_hours} horas.",
            "",
            f"Equipo {BRAND['name']}"
        )

        ok = send_email(
            to_email=user_email,
            subject=subject,
            html_body=html_content,
            text_body=text_content,
            inline_images=inline_images or None
        )
        if ok:
            logger.info(f"Email de reset enviado a {user_email}")
        return ok
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
