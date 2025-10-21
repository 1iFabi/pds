from django.db import models
from django.conf import settings
from django.utils import timezone
import uuid


class ServiceStatus(models.TextChoices):
    NO_PURCHASED = "NO_PURCHASED", "Sin servicio"
    PENDING = "PENDING", "Pendiente"
    COMPLETED = "COMPLETED", "Completado"


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    # Estado del servicio para distinguir 3 tipos de usuario
    service_status = models.CharField(
        max_length=20,
        choices=ServiceStatus.choices,
        default=ServiceStatus.NO_PURCHASED,
        db_index=True,
    )
    service_updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile(user={self.user_id}, phone={self.phone})"


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


class WelcomeStatus(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='welcome_status')
    welcome_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"WelcomeStatus(user={self.user_id}, sent={self.welcome_sent})"


class PasswordResetToken(models.Model):
    """
    Token de restablecimiento de contraseña con expiración
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='password_reset_tokens'
    )
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"PasswordResetToken(user={self.user_id}, used={self.used})"

    @property
    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at or self.used


class SNP(models.Model):
    """
    Modelo para almacenar información de SNPs (Single Nucleotide Polymorphisms)
    """
    rsid = models.CharField(max_length=20, verbose_name="rsID")
    genotipo = models.CharField(max_length=10, verbose_name="Genotipo")
    fenotipo = models.TextField(verbose_name="Fenotipo")
    categoria = models.CharField(max_length=50, blank=True, null=True, verbose_name="Categoría")
    importancia = models.IntegerField(blank=True, null=True, verbose_name="Nivel de importancia")

    class Meta:
        db_table = 'snps'
        verbose_name = 'SNP'
        verbose_name_plural = 'SNPs'
        unique_together = [('rsid', 'genotipo')]
        indexes = [
            models.Index(fields=['rsid']),
            models.Index(fields=['categoria']),
        ]

    def __str__(self):
        return f"SNP({self.rsid}, {self.genotipo})"


class UserSNP(models.Model):
    """
    Modelo de relación entre usuarios y sus SNPs
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_snps',
        verbose_name="Usuario"
    )
    snp = models.ForeignKey(
        SNP,
        on_delete=models.CASCADE,
        related_name='user_associations',
        verbose_name="SNP"
    )

    class Meta:
        db_table = 'user_snps'
        verbose_name = 'SNP de Usuario'
        verbose_name_plural = 'SNPs de Usuarios'
        unique_together = [('user', 'snp')]
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['snp']),
        ]

    def __str__(self):
        return f"UserSNP(user={self.user_id}, snp={self.snp_id})"
