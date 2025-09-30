from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class EmailVerification(models.Model):
    """
    Modelo para gestionar tokens de verificación de correo electrónico
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='email_verifications'
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    email = models.EmailField()
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
    verified_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()

    class Meta:
        verbose_name = 'Verificación de Email'
        verbose_name_plural = 'Verificaciones de Email'
        ordering = ['-created_at']

    def __str__(self):
        return f"Verificación de {self.email} (usuario={self.user_id})"

    @property
    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at
