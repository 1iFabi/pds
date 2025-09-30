"""
Backend personalizado para envío de emails usando Gmail API
"""
import os
import base64
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

logger = logging.getLogger(__name__)

# Scopes necesarios para Gmail API
SCOPES = ['https://www.googleapis.com/auth/gmail.send']

class GmailBackend(BaseEmailBackend):
    """
    Backend personalizado para Django que usa Gmail API
    """
    
    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently)
        self.connection = None
        self.credentials_file = getattr(settings, 'GMAIL_CREDENTIALS_FILE', None)
        self.token_file = getattr(settings, 'GMAIL_TOKEN_FILE', None)
        
    def open(self):
        """
        Establece conexión con Gmail API
        """
        if self.connection:
            return False
            
        try:
            creds = None
            
            # Verificar si ya tenemos token guardado
            if self.token_file and os.path.exists(self.token_file):
                creds = Credentials.from_authorized_user_file(self.token_file, SCOPES)
            
            # Si no hay credenciales válidas, autenticar
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    if not self.credentials_file:
                        logger.error("No se ha configurado GMAIL_CREDENTIALS_FILE")
                        return False
                        
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_file, SCOPES
                    )
                    
                    # Configurar flujo OAuth con parámetros específicos para evitar CSRF
                    try:
                        logger.info("Configurando OAuth con parámetros seguros...")
                        print("\n=== CONFIGURACIÓN OAUTH ===")
                        print("Puerto: 8080")
                        print("URI de redirección: http://localhost:8080/")
                        print("================================\n")
                        
                        # Configurar el flujo con parámetros específicos
                        creds = flow.run_local_server(
                            port=8080,
                            host='localhost',
                            open_browser=True,
                            bind_addr='127.0.0.1',
                            authorization_prompt_message="",
                            success_message='Autorización exitosa! Puedes cerrar esta ventana.',
                            failure_message='Fallo en la autorización. Por favor inténtalo de nuevo.'
                        )
                    except OSError:
                        # Si el puerto 8080 está ocupado, intentar con 9090
                        logger.info("Puerto 8080 ocupado, intentando 9090...")
                        print("Puerto 8080 ocupado, usando puerto 9090")
                        creds = flow.run_local_server(
                            port=9090,
                            host='localhost',
                            open_browser=True,
                            bind_addr='127.0.0.1'
                        )
                
                # Guardar credenciales para próximas ejecuciones
                if self.token_file:
                    with open(self.token_file, 'w') as token:
                        token.write(creds.to_json())
            
            # Crear servicio de Gmail
            self.connection = build('gmail', 'v1', credentials=creds)
            return True
            
        except Exception as e:
            logger.error(f"Error conectando a Gmail API: {e}")
            if not self.fail_silently:
                raise
            return False
    
    def close(self):
        """
        Cierra la conexión
        """
        self.connection = None
    
    def send_messages(self, email_messages):
        """
        Envía una lista de mensajes de email
        """
        if not email_messages:
            return 0
            
        if not self.open():
            return 0
            
        num_sent = 0
        for message in email_messages:
            if self._send_single_message(message):
                num_sent += 1
                
        return num_sent
    
    def _send_single_message(self, email_message):
        """
        Envía un solo mensaje de email
        """
        try:
            # Crear mensaje MIME
            msg = MIMEMultipart('alternative')
            msg['Subject'] = email_message.subject
            msg['From'] = email_message.from_email
            msg['To'] = ', '.join(email_message.to)
            
            if email_message.cc:
                msg['Cc'] = ', '.join(email_message.cc)
            if email_message.bcc:
                msg['Bcc'] = ', '.join(email_message.bcc)
            
            # Agregar cuerpo del mensaje
            if email_message.body:
                text_part = MIMEText(email_message.body, 'plain', 'utf-8')
                msg.attach(text_part)
            
            # Si hay alternativas HTML
            if hasattr(email_message, 'alternatives') and email_message.alternatives:
                for content, content_type in email_message.alternatives:
                    if content_type == 'text/html':
                        html_part = MIMEText(content, 'html', 'utf-8')
                        msg.attach(html_part)
            
            # Codificar mensaje
            raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
            
            # Enviar usando Gmail API
            send_message = {
                'raw': raw_message
            }
            
            result = self.connection.users().messages().send(
                userId='me',
                body=send_message
            ).execute()
            
            logger.info(f"Email enviado exitosamente. ID: {result['id']}")
            return True
            
        except Exception as e:
            logger.error(f"Error enviando email: {e}")
            if not self.fail_silently:
                raise
            return False