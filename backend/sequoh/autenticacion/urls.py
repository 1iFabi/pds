from django.urls import path
from .views import LoginAPIView

urlpatterns = [
    # Esta ruta conectará /login/ con la clase LoginAPIView
    path('login/', LoginAPIView.as_view(), name='api_login'),
]