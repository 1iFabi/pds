from django.urls import path
from .views import (
    LoginAPIView,
    RegisterAPIView,
    ResendVerificationAPIView,
    PasswordResetRequestAPIView,
    PasswordResetConfirmAPIView,
    MeAPIView,
    ChangePasswordAPIView,
    LogoutAPIView,
    DashboardAPIView,
    DeleteAccountAPIView,
)

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='api_login'),
    path('register/', RegisterAPIView.as_view(), name='api_register'),
    path('resend-verification/', ResendVerificationAPIView.as_view(), name='api_resend_verification'),
    path('password-reset/', PasswordResetRequestAPIView.as_view(), name='api_password_reset'),
    path('password-reset-confirm/', PasswordResetConfirmAPIView.as_view(), name='api_password_reset_confirm'),
    # Endpoints protegidos por sesión
    path('me/', MeAPIView.as_view(), name='api_me'),
    path('me/change-password/', ChangePasswordAPIView.as_view(), name='api_change_password'),
    path('me/delete-account/', DeleteAccountAPIView.as_view(), name='api_delete_account'),
    path('logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('dashboard/', DashboardAPIView.as_view(), name='api_dashboard'),
]
