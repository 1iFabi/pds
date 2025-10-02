from django.core.management.base import BaseCommand
from django.conf import settings
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import os
import webbrowser

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

class Command(BaseCommand):
    help = 'Genera/actualiza el token de Gmail API para la cuenta correcta usando un flujo de consola.'

    def handle(self, *args, **options):
        cred_path = getattr(settings, 'GMAIL_CREDENTIALS_FILE', os.path.join(settings.BASE_DIR, 'config', 'credentials.json'))
        token_path = getattr(settings, 'GMAIL_TOKEN_FILE', os.path.join(settings.BASE_DIR, 'config', 'token.json'))
        login_hint = None
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', '')
        if '<' in from_email and '>' in from_email:
            login_hint = from_email.split('<',1)[1].split('>',1)[0].strip()
        elif '@' in from_email:
            login_hint = from_email.strip()

        self.stdout.write(self.style.NOTICE('Usando credenciales: %s' % cred_path))
        self.stdout.write(self.style.NOTICE('Guardará token en: %s' % token_path))
        if login_hint:
            self.stdout.write(self.style.NOTICE('login_hint: %s' % login_hint))

        if not os.path.exists(cred_path):
            self.stderr.write(self.style.ERROR('No se encontró credentials.json en %s' % cred_path))
            self.stderr.write('Coloca tu archivo de credenciales de OAuth de Google en esa ruta o define GMAIL_CREDENTIALS_FILE')
            return

        flow = InstalledAppFlow.from_client_secrets_file(cred_path, SCOPES)
        # Ejecutar servidor local para evitar problemas de redirect_uri
        # y forzar escoger cuenta con login_hint
        try:
            creds = flow.run_local_server(
                host='localhost',
                port=8080,
                open_browser=True,
                authorization_prompt_message='',
                success_message='Autorización exitosa. Puedes cerrar esta ventana.',
                authorization_url_kwargs={
                    'access_type': 'offline',
                    'prompt': 'consent',
                    **({'login_hint': login_hint} if login_hint else {})
                }
            )
        except OSError:
            # Si el puerto 8080 está ocupado, intenta 9090
            creds = flow.run_local_server(
                host='localhost',
                port=9090,
                open_browser=True,
                authorization_prompt_message='',
                success_message='Autorización exitosa. Puedes cerrar esta ventana.',
                authorization_url_kwargs={
                    'access_type': 'offline',
                    'prompt': 'consent',
                    **({'login_hint': login_hint} if login_hint else {})
                }
            )

        # Guardar token
        os.makedirs(os.path.dirname(token_path), exist_ok=True)
        with open(token_path, 'w', encoding='utf-8') as f:
            f.write(creds.to_json())

        self.stdout.write(self.style.SUCCESS('\nToken guardado correctamente en %s' % token_path))
        self.stdout.write(self.style.HTTP_INFO('Cuenta autorizada: %s' % (login_hint or '(consulta en la consola de Google)')))
