from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Profile, EmailVerification, WelcomeStatus, PasswordResetToken, ServiceStatus, SNP, UserSNP


class ProfileInline(admin.StackedInline):
    """Inline para mostrar el Profile dentro del User admin"""
    model = Profile
    can_delete = False
    verbose_name = 'Perfil'
    verbose_name_plural = 'Perfil'
    fields = ('phone', 'service_status')


class CustomUserAdmin(BaseUserAdmin):
    """Admin personalizado para User que incluye el teléfono del Profile"""
    inlines = (ProfileInline,)
    
    # Columnas mostradas en la lista
    list_display = (
        'username', 'email', 'first_name', 'last_name',
        'get_phone', 'get_service_status', 'is_staff', 'is_active', 'date_joined'
    )
    list_filter = ('is_staff', 'is_active', 'date_joined',)
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    # Campos editables en el formulario
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información personal', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    
    def get_phone(self, obj):
        """Obtiene el teléfono del Profile relacionado"""
        try:
            return obj.profile.phone or '-'
        except Profile.DoesNotExist:
            return '-'
    get_phone.short_description = 'Teléfono'

    def get_service_status(self, obj):
        try:
            return obj.profile.service_status or ServiceStatus.NO_PURCHASED
        except Profile.DoesNotExist:
            return ServiceStatus.NO_PURCHASED
    get_service_status.short_description = 'Estado servicio'


# Desregistrar el UserAdmin por defecto y registrar el personalizado
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


# Registrar otros modelos
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone', 'service_status', 'service_updated_at')
    search_fields = ('user__username', 'user__email', 'phone')
    list_filter = ('user__date_joined', 'service_status')


@admin.register(EmailVerification)
class EmailVerificationAdmin(admin.ModelAdmin):
    list_display = ('email', 'user', 'is_verified', 'created_at', 'expires_at', 'is_expired')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('email', 'user__username')
    readonly_fields = ('token', 'created_at', 'verified_at')
    ordering = ('-created_at',)
    
    def is_expired(self, obj):
        return obj.is_expired
    is_expired.boolean = True
    is_expired.short_description = 'Expirado'


@admin.register(WelcomeStatus)
class WelcomeStatusAdmin(admin.ModelAdmin):
    list_display = ('user', 'welcome_sent', 'sent_at')
    list_filter = ('welcome_sent', 'sent_at')
    search_fields = ('user__username', 'user__email')


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'expires_at', 'used', 'is_expired')
    list_filter = ('used', 'created_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('token', 'created_at')
    ordering = ('-created_at',)
    
    def is_expired(self, obj):
        return obj.is_expired
    is_expired.boolean = True
    is_expired.short_description = 'Expirado'


@admin.register(SNP)
class SNPAdmin(admin.ModelAdmin):
    list_display = ('rsid', 'genotipo', 'categoria', 'importancia', 'fenotipo_preview')
    list_filter = ('categoria', 'importancia')
    search_fields = ('rsid', 'genotipo', 'fenotipo')
    ordering = ('rsid', 'genotipo')
    
    def fenotipo_preview(self, obj):
        """Muestra un preview del fenotipo"""
        return obj.fenotipo[:50] + '...' if len(obj.fenotipo) > 50 else obj.fenotipo
    fenotipo_preview.short_description = 'Fenotipo (preview)'


@admin.register(UserSNP)
class UserSNPAdmin(admin.ModelAdmin):
    list_display = ('user', 'get_rsid', 'get_genotipo', 'get_categoria')
    list_filter = ('snp__categoria',)
    search_fields = ('user__username', 'user__email', 'snp__rsid')
    raw_id_fields = ('user', 'snp')
    
    def get_rsid(self, obj):
        return obj.snp.rsid
    get_rsid.short_description = 'rsID'
    
    def get_genotipo(self, obj):
        return obj.snp.genotipo
    get_genotipo.short_description = 'Genotipo'
    
    def get_categoria(self, obj):
        return obj.snp.categoria or '-'
    get_categoria.short_description = 'Categoría'
