from allauth.account.adapter import DefaultAccountAdapter
from django.utils.translation import gettext_lazy as _
from .email_utils import send_email

class GmailAPIAccountAdapter(DefaultAccountAdapter):
    """Adapter de allauth que envía correos vía Gmail API usando email_utils.send_email.

    Este adapter intercepta TODOS los correos que dispara allauth (confirmación,
    reset password, etc.) y los reenvía con Gmail API en lugar del backend SMTP.
    """

    def send_mail(self, template_prefix, email, context):
        # Usa el renderizador de allauth para construir asunto/cuerpos
        message = self.render_mail(template_prefix, email, context)
        subject = message.subject
        text_body = message.body or ""

        # Busca versión HTML si existe y aplica el branding
        html_body = None
        if hasattr(message, "alternatives") and message.alternatives:
            for content, content_type in message.alternatives:
                if content_type == "text/html":
                    html_body = content
                    break
        
        from .email_utils import build_branded_html
        if html_body:
            # Envolver el HTML que genera allauth dentro del layout de Genomia
            html_body = build_branded_html(html_body, title_text=None)
        else:
            # Si no hay HTML, generamos uno mínimo basado en el texto
            html_body = build_branded_html(f"<pre style=\"white-space:pre-wrap\">{text_body}</pre>")

        # Envía con Gmail API (nuestra utilidad)
        send_email(to_email=email, subject=subject, html_body=html_body, text_body=text_body)
        # No llamamos a message.send() para evitar SMTP
