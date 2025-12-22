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
    ContactAPIView,
    UserServiceStatusAPIView,
    AdminStatsAPIView,
    GetUsersAPIView,
    ManageAnalystRoleAPIView,
)
from .upload_views import UploadGeneticFileAPIView, DeleteGeneticFileAPIView, GetUserReportStatusAPIView
from .diseases_views import DiseasesAPIView
from .patient_variants_views import PatientVariantsAPIView
from .snp_views import VariantesAPIView
from .ancestry_views import AncestryAPIView
from .indigenous_views import IndigenousPeoplesAPIView
from .traits_views import TraitsAPIView
from .biometrics_views import BiometricsAPIView
from .biomarkers_views import BiomarkersAPIView
from .pharmacogenetics_views import PharmacogeneticsAPIView
from .reception_views import (
    ReceptionSearchAPIView,
    ReceptionArrivalAPIView,
    ReceptionSampleCodeAPIView,
    ReceptionSampleStatusAPIView,
)

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='api_login'),
    path('register/', RegisterAPIView.as_view(), name='api_register'),
    path('resend-verification/', ResendVerificationAPIView.as_view(), name='api_resend_verification'),
    path('password-reset/', PasswordResetRequestAPIView.as_view(), name='api_password_reset'),
    path('password-reset-confirm/', PasswordResetConfirmAPIView.as_view(), name='api_password_reset_confirm'),

    # Público
    path('contact/', ContactAPIView.as_view(), name='api_contact'),

    # Endpoints protegidos por sesión
    path('me/', MeAPIView.as_view(), name='api_me'),
    path('me/change-password/', ChangePasswordAPIView.as_view(), name='api_change_password'),
    path('me/delete-account/', DeleteAccountAPIView.as_view(), name='api_delete_account'),
    path('logout/', LogoutAPIView.as_view(), name='api_logout'),
    path('dashboard/', DashboardAPIView.as_view(), name='api_dashboard'),

    # Estado de servicio
    path('service/status/', UserServiceStatusAPIView.as_view(), name='api_service_status'),

    # Endpoint para administradores
    path('admin/stats/', AdminStatsAPIView.as_view(), name='api_admin_stats'),
    path('admin/analysts/', ManageAnalystRoleAPIView.as_view(), name='api_admin_manage_analysts'),
    path('users/', GetUsersAPIView.as_view(), name='api_get_users'),
    path('upload-genetic-file/', UploadGeneticFileAPIView.as_view(), name='api_upload_genetic_file'),
    path('delete-genetic-file/', DeleteGeneticFileAPIView.as_view(), name='api_delete_genetic_file'),
    path('user-report-status/<int:user_id>/', GetUserReportStatusAPIView.as_view(), name='api_user_report_status'),
    path('diseases/', DiseasesAPIView.as_view(), name='api_diseases'),
    path('patient-variants/<int:user_id>/', PatientVariantsAPIView.as_view(), name='api_patient_variants'),
    path('variantes/', VariantesAPIView.as_view(), name='api_variantes'),
    path('ancestry/', AncestryAPIView.as_view(), name='api_ancestry'),
    path('indigenous/', IndigenousPeoplesAPIView.as_view(), name='api_indigenous'),
    path('traits/', TraitsAPIView.as_view(), name='api_traits'),
    path('biometrics/', BiometricsAPIView.as_view(), name='api_biometrics'),
    path('biomarkers/', BiomarkersAPIView.as_view(), name='api_biomarkers'),
    path('pharmacogenetics/', PharmacogeneticsAPIView.as_view(), name='api_pharmacogenetics'),
    # Recepción (solo identidad, sin datos genéticos)
    path('reception/search/', ReceptionSearchAPIView.as_view(), name='api_reception_search'),
    path('reception/arrival/', ReceptionArrivalAPIView.as_view(), name='api_reception_arrival'),
    path('reception/sample-code/', ReceptionSampleCodeAPIView.as_view(), name='api_reception_sample_code'),
    path('reception/sample-status/', ReceptionSampleStatusAPIView.as_view(), name='api_reception_sample_status'),
]
