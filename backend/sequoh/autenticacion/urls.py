from django.urls import path
from .views import (
    LoginAPIView,
    RegisterAPIView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    VerifyEmailView
)

urlpatterns = [
    # Esta ruta conectará /login/ con la clase LoginAPIView
    path('login/', LoginAPIView.as_view(), name='api_login'),
    # Esta ruta conectará /register/ con la clase RegisterAPIView
    path('register/', RegisterAPIView.as_view(), name='api_register'),
    # Verificación de correo
    path('verify-email/', VerifyEmailView.as_view(), name='api_verify_email'),
    path('verify/<uuid:token>/', VerifyEmailView.as_view(), name='api_verify_email_token'),
    # Esta ruta conectará /password-reset/ con la clase PasswordResetRequestView
    path('password-reset/', PasswordResetRequestView.as_view(), name='api_password_reset'),
    # Esta ruta conectará /password-reset-confirm/ con la clase PasswordResetConfirmView
    path('password-reset-confirm/', PasswordResetConfirmView.as_view(), name='api_password_reset_confirm'),
]
