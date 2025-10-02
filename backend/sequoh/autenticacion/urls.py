from django.urls import path
from .views import (
    LoginAPIView,
    RegisterAPIView,
    ResendVerificationAPIView,
    PasswordResetRequestAPIView,
    PasswordResetConfirmAPIView,
)

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='api_login'),
    path('register/', RegisterAPIView.as_view(), name='api_register'),
    path('resend-verification/', ResendVerificationAPIView.as_view(), name='api_resend_verification'),
    path('password-reset/', PasswordResetRequestAPIView.as_view(), name='api_password_reset'),
    path('password-reset-confirm/', PasswordResetConfirmAPIView.as_view(), name='api_password_reset_confirm'),
]
