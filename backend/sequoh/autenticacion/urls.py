from django.urls import path
from .views import LoginAPIView, RegisterAPIView

urlpatterns = [
    # Esta ruta conectará /login/ con la clase LoginAPIView
    path('login/', LoginAPIView.as_view(), name='api_login'),
    # Esta ruta conectará /register/ con la clase RegisterAPIView
    path('register/', RegisterAPIView.as_view(), name='api_register'),
]
