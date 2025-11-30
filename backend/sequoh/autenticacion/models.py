from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError
import uuid
import re


class ServiceStatus(models.TextChoices):
    NO_PURCHASED = "NO_PURCHASED", "Sin servicio"
    PENDING = "PENDING", "Pendiente"
    COMPLETED = "COMPLETED", "Completado"


class SampleStatus(models.TextChoices):
    PENDING_COLLECTION = "PENDING_COLLECTION", "Pendiente de toma"
    COLLECTED_PENDING_ANALYSIS = "COLLECTED_PENDING_ANALYSIS", "Muestra tomada / Pendiente de análisis"
    SENT_TO_LAB = "SENT_TO_LAB", "Enviada al laboratorio"
    RECEIVED_AT_LAB = "RECEIVED_AT_LAB", "Recibida en laboratorio"


def validate_rut_format(value):
    """
    Valida que el RUT tenga el formato XXXXXXX-R donde:
    - X son números (7-8 dígitos)
    - R puede ser un dígito (0-9) o la letra K
    """
    if not value:
        raise ValidationError('El RUT es obligatorio.')
    
    # Formato: 7-8 dígitos, guión, y luego 0-9 o K
    pattern = r'^\d{7,8}-[0-9Kk]$'
    if not re.match(pattern, value):
        raise ValidationError('El RUT debe tener el formato XXXXXXX-R (ejemplo: 12345678-9 o 1234567-K)')
    
    return value


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    rut = models.CharField(
        max_length=12,
        unique=True,
        null=True,
        blank=False,
        validators=[validate_rut_format],
        help_text='RUT en formato XXXXXXX-R (ejemplo: 12345678-9 o 1234567-K)',
        verbose_name='RUT'
    )
    # Estado del servicio para distinguir 3 tipos de usuario
    service_status = models.CharField(
        max_length=20,
        choices=ServiceStatus.choices,
        default=ServiceStatus.NO_PURCHASED,
        db_index=True,
    )
    service_updated_at = models.DateTimeField(auto_now=True)
    sample_code = models.CharField(
        max_length=30,
        unique=True,
        null=True,
        blank=True,
        db_index=True,
        verbose_name='Código de Muestra'
    )
    sample_code_created_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de creación del código'
    )
    sample_status = models.CharField(
        max_length=40,
        choices=SampleStatus.choices,
        default=SampleStatus.PENDING_COLLECTION,
        db_index=True,
        verbose_name='Estado de la muestra'
    )
    arrival_confirmed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Llegada confirmada en recepción'
    )
    sample_taken_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de toma de muestra'
    )
    sample_sent_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Fecha de envío al laboratorio'
    )
    # Nombre del archivo de reporte genético
    report_filename = models.CharField(max_length=255, blank=True, null=True)
    # Fecha de carga del reporte
    report_uploaded_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Profile(user={self.user_id}, rut={self.rut}, phone={self.phone})"


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
    # Campos básicos
    rsid = models.CharField(max_length=20, verbose_name="rsID")
    genotipo = models.CharField(max_length=10, verbose_name="Genotipo")
    fenotipo = models.TextField(verbose_name="Fenotipo")
    categoria = models.CharField(max_length=50, blank=True, null=True, verbose_name="Categoría")
    grupo = models.CharField(max_length=100, blank=True, null=True, verbose_name="Grupo del Rasgo")
    
    # Campos genómicos
    cromosoma = models.CharField(max_length=5, blank=True, null=True, verbose_name="Cromosoma")
    posicion = models.BigIntegerField(blank=True, null=True, verbose_name="Posición genómica")
    alelo_referencia = models.CharField(max_length=50, blank=True, null=True, verbose_name="Alelo de referencia")
    alelo_alternativo = models.CharField(max_length=50, blank=True, null=True, verbose_name="Alelo alternativo")
    
    # Campos clínicos
    nivel_riesgo = models.CharField(max_length=50, blank=True, null=True, verbose_name="Nivel de riesgo")
    magnitud_efecto = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, verbose_name="Magnitud del efecto")
    
    # Metadata
    fuente_base_datos = models.CharField(max_length=100, blank=True, null=True, verbose_name="Fuente de base de datos")
    tipo_evidencia = models.CharField(max_length=50, blank=True, null=True, verbose_name="Tipo de evidencia")
    fecha_actualizacion = models.CharField(max_length=10, blank=True, null=True, verbose_name="Fecha de actualización")
    
    # Datos de Ancestría - Continente
    continente = models.CharField(max_length=50, blank=True, null=True, verbose_name="Continente")
    af_continente = models.DecimalField(max_digits=5, decimal_places=4, blank=True, null=True, verbose_name="Frecuencia Alélica - Continente")
    fuente_continente = models.CharField(max_length=100, blank=True, null=True, verbose_name="Fuente - Continente")
    poblacion_continente = models.CharField(max_length=50, blank=True, null=True, verbose_name="Población - Continente")
    
    # Datos de Ancestría - País
    pais = models.CharField(max_length=50, blank=True, null=True, verbose_name="País")
    af_pais = models.DecimalField(max_digits=5, decimal_places=4, blank=True, null=True, verbose_name="Frecuencia Alélica - País")
    fuente_pais = models.CharField(max_length=100, blank=True, null=True, verbose_name="Fuente - País")
    poblacion_pais = models.CharField(max_length=50, blank=True, null=True, verbose_name="Población - País")

    class Meta:
        db_table = 'snps'
        verbose_name = 'SNP'
        verbose_name_plural = 'SNPs'
        unique_together = [('rsid', 'genotipo', 'fenotipo', 'categoria')]
        indexes = [
            models.Index(fields=['rsid']),
            models.Index(fields=['categoria']),
            models.Index(fields=['cromosoma']),
            models.Index(fields=['nivel_riesgo']),
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
