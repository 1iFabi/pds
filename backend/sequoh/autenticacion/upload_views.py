from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .authentication import JWTAuthentication
from .models import Profile, ServiceStatus
from .email_utils import send_results_ready_email
import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class UploadGeneticFileAPIView(APIView):
    """Vista para que administradores suban archivos genéticos de usuarios"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Verificar que el usuario sea staff
        if not request.user.is_staff:
            return Response(
                {"error": "No tienes permisos para realizar esta acción"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Obtener datos
        user_email = request.data.get('userEmail')
        uploaded_file = request.FILES.get('file')

        # Validaciones
        if not user_email:
            return Response(
                {"error": "El email del usuario es obligatorio"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not uploaded_file:
            return Response(
                {"error": "Debes subir un archivo"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verificar que el usuario exista
        try:
            target_user = User.objects.get(email=user_email)
        except User.DoesNotExist:
            return Response(
                {"error": f"No existe un usuario con el email {user_email}"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validar tipo de archivo
        allowed_extensions = ['.vcf', '.txt', '.csv', '.zip', '.rar']
        file_extension = os.path.splitext(uploaded_file.name)[1].lower()
        
        if file_extension not in allowed_extensions:
            return Response(
                {"error": f"Tipo de archivo no permitido. Formatos aceptados: {', '.join(allowed_extensions)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar tamaño (100MB máximo)
        max_size = 100 * 1024 * 1024  # 100MB
        if uploaded_file.size > max_size:
            return Response(
                {"error": "El archivo es demasiado grande. Tamaño máximo: 100MB"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crear directorio si no existe
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'genetic_files')
        os.makedirs(upload_dir, exist_ok=True)

        # Guardar archivo con nombre único
        file_name = f"{target_user.id}_{uploaded_file.name}"
        file_path = os.path.join(upload_dir, file_name)

        try:
            with open(file_path, 'wb+') as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            # Actualizar el service_status del usuario a COMPLETED
            try:
                profile, created = Profile.objects.get_or_create(user=target_user)
                profile.service_status = ServiceStatus.COMPLETED
                profile.save()
                logger.info(f"Service status actualizado a COMPLETED para usuario {target_user.email}")
            except Exception as e:
                logger.error(f"Error actualizando service_status: {str(e)}")
                # Continuar aunque falle esta parte

            # Enviar email de notificación al usuario
            user_name = target_user.first_name or target_user.username or target_user.email.split('@')[0]
            try:
                email_sent = send_results_ready_email(target_user.email, user_name)
                if email_sent:
                    logger.info(f"Email de resultados listos enviado a {target_user.email}")
                else:
                    logger.warning(f"No se pudo enviar email de notificación a {target_user.email}")
            except Exception as e:
                logger.error(f"Error enviando email de notificación: {str(e)}")
                # Continuar aunque falle el envío de email

            return Response({
                "success": True,
                "message": "Archivo subido correctamente. Usuario notificado por email.",
                "user_email": user_email,
                "file_name": file_name,
                "file_size": uploaded_file.size,
                "status_updated": True,
                "email_sent": email_sent if 'email_sent' in locals() else False
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": f"Error al guardar el archivo: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
