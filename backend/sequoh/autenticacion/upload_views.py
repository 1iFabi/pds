from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .authentication import JWTAuthentication
from .models import Profile, ServiceStatus, SNP, UserSNP
from .email_utils import send_results_ready_email
import os
import logging
import json
from django.conf import settings

logger = logging.getLogger(__name__)


@method_decorator(csrf_exempt, name='dispatch')
class UploadGeneticFileAPIView(APIView):
    """Vista para procesar archivos genéticos y crear asociaciones user-snp"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Verificar que el usuario sea staff
        if not request.user.is_staff:
            return Response(
                {"error": "No tienes permisos para realizar esta acción"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Obtener datos del body (JSON)
            try:
                data = json.loads(request.body or '{}')
            except json.JSONDecodeError:
                data = {}

            user_id = data.get('userId')
            file_content = data.get('fileContent', '').strip()
            rut_from_file = data.get('rutFromFile', '').strip()
            filename = data.get('filename', 'report.txt').strip()

            # Validaciones
            if not user_id:
                return Response(
                    {"error": "userId es obligatorio"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not file_content:
                return Response(
                    {"error": "fileContent es obligatorio"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not rut_from_file:
                return Response(
                    {"error": "rutFromFile es obligatorio"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verificar que el usuario exista
            try:
                target_user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {"error": "Usuario no encontrado"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Validar que el RUT del archivo coincida con el RUT del usuario en BD
            try:
                user_profile = target_user.profile
                user_rut = user_profile.rut
                # Comparar: el rut_from_file debe coincidir exactamente con el RUT sin guiones
                # Ej: rut_from_file="211977760", user_rut="21197776-0" -> "211977760"
                user_rut_clean = user_rut.replace('-', '').replace('.', '')
                if rut_from_file != user_rut_clean:
                    return Response(
                        {"error": f"El RUT del archivo ({rut_from_file}) no coincide con el RUT del usuario ({user_rut}) en la base de datos."},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except Profile.DoesNotExist:
                return Response(
                    {"error": "El usuario no tiene perfil configurado"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Procesar archivo genético
            snps_count = self._process_genetic_file(target_user, file_content)

            if snps_count < 0:
                return Response(
                    {"error": "Error al procesar el archivo genético"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Actualizar el service_status del usuario a COMPLETED y guardar nombre del archivo
            try:
                from django.utils import timezone
                profile, created = Profile.objects.get_or_create(user=target_user)
                profile.service_status = ServiceStatus.COMPLETED
                profile.report_filename = filename
                profile.report_uploaded_at = timezone.now()
                profile.save()
                logger.info(f"Service status actualizado a COMPLETED para usuario {target_user.email}. Archivo: {filename}")
            except Exception as e:
                logger.error(f"Error actualizando service_status: {str(e)}")

            # Enviar email de notificación al usuario
            user_name = target_user.first_name or target_user.username or target_user.email.split('@')[0]
            email_sent = False
            try:
                email_sent = send_results_ready_email(target_user.email, user_name)
                if email_sent:
                    logger.info(f"Email de resultados listos enviado a {target_user.email}")
                else:
                    logger.warning(f"No se pudo enviar email de notificación a {target_user.email}")
            except Exception as e:
                logger.error(f"Error enviando email de notificación: {str(e)}")

            return Response({
                "success": True,
                "message": f"Archivo procesado correctamente. {snps_count} variantes genéticas agregadas.",
                "user_id": user_id,
                "snps_count": snps_count,
                "status_updated": True,
                "email_sent": email_sent
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            logger.error(f"Error en UploadGeneticFileAPIView: {str(e)}")
            return Response(
                {"error": f"Error interno del servidor: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _process_genetic_file(self, user, file_content):
        """
        Procesa el contenido del archivo genético y crea asociaciones user-snp.
        
        Formato esperado (líneas):
        rsid, genotipo
        rs6060369, A/G
        rs713598, C/C
        """
        try:
            lines = file_content.strip().split('\n')
            logger.info(f"Total de líneas en archivo: {len(lines)}")
            
            if not lines:
                logger.warning("Archivo vacío")
                return 0

            snps_added = 0
            snps_skipped = 0

            for idx, line in enumerate(lines):
                # Saltar líneas vacías
                if not line.strip():
                    continue

                # Parsear línea (separado por coma)
                parts = line.strip().split(',')
                
                if len(parts) < 2:
                    # Formato incompleto, saltar
                    logger.warning(f"Línea {idx}: formato incompleto (partes={len(parts)}): {line[:100]}")
                    snps_skipped += 1
                    continue

                rsid = parts[0].strip()
                genotipo = parts[1].strip()
                # Usar genotipo como fenotipo ya que no viene en el archivo
                fenotipo = f"Genotipo: {genotipo}"
                categoria = None
                importancia = None

                # Validar que tenga al menos rsid y genotipo
                if not rsid or not genotipo:
                    logger.warning(f"Línea {idx}: rsid o genotipo vacío (rsid='{rsid}', genotipo='{genotipo}')")
                    snps_skipped += 1
                    continue

                try:
                    # Crear o obtener SNP
                    snp, created = SNP.objects.get_or_create(
                        rsid=rsid,
                        genotipo=genotipo,
                        defaults={
                            'fenotipo': fenotipo,
                            'categoria': categoria,
                            'importancia': importancia
                        }
                    )

                    # Crear asociación user-snp si no existe
                    user_snp, created = UserSNP.objects.get_or_create(
                        user=user,
                        snp=snp
                    )

                    if created:
                        snps_added += 1
                        logger.debug(f"SNP agregado: rsid={rsid}, genotipo={genotipo}")
                except Exception as snp_error:
                    logger.error(f"Error creando SNP en línea {idx}: {str(snp_error)}")
                    snps_skipped += 1

            logger.info(f"Procesamiento completado: {snps_added} SNPs agregados, {snps_skipped} saltados")
            return snps_added

        except Exception as e:
            logger.error(f"Error procesando archivo genético: {str(e)}", exc_info=True)
            return -1


@method_decorator(csrf_exempt, name='dispatch')
class DeleteGeneticFileAPIView(APIView):
    """Vista para eliminar reportes genéticos de un usuario"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Verificar que el usuario sea staff
        if not request.user.is_staff:
            return Response(
                {"error": "No tienes permisos para realizar esta acción"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Obtener datos del body
            try:
                data = json.loads(request.body or '{}')
            except json.JSONDecodeError:
                data = {}

            user_id = data.get('userId')

            if not user_id:
                return Response(
                    {"error": "userId es obligatorio"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verificar que el usuario exista
            try:
                target_user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {"error": "Usuario no encontrado"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Eliminar todas las asociaciones user-snp del usuario
            deleted_count, _ = UserSNP.objects.filter(user=target_user).delete()
            logger.info(f"Eliminadas {deleted_count} variantes genéticas del usuario {target_user.email}")

            # Actualizar el service_status a NO_PURCHASED
            try:
                profile = target_user.profile
                profile.service_status = ServiceStatus.NO_PURCHASED
                profile.save()
                logger.info(f"Service status actualizado a NO_PURCHASED para usuario {target_user.email}")
            except Profile.DoesNotExist:
                logger.warning(f"El usuario {target_user.email} no tiene perfil")

            return Response({
                "success": True,
                "message": f"Reporte genético eliminado. {deleted_count} variantes removidas.",
                "user_id": user_id,
                "deleted_count": deleted_count
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error en DeleteGeneticFileAPIView: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Error interno del servidor: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class GetUserReportStatusAPIView(APIView):
    """Vista para obtener el estado de reportes de un usuario"""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # Verificar que el usuario sea staff
        if not request.user.is_staff:
            return Response(
                {"error": "No tienes permisos para realizar esta ación"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            # Verificar que el usuario exista
            try:
                target_user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response(
                    {"error": "Usuario no encontrado"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Verificar si tiene UserSNP
            has_snps = UserSNP.objects.filter(user=target_user).exists()
            snp_count = UserSNP.objects.filter(user=target_user).count()
            
            # Obtener el service_status y datos del archivo
            try:
                profile = target_user.profile
                service_status = profile.service_status
                report_filename = profile.report_filename
                report_uploaded_at = profile.report_uploaded_at.strftime("%Y-%m-%d") if profile.report_uploaded_at else None
            except Profile.DoesNotExist:
                service_status = ServiceStatus.NO_PURCHASED
                report_filename = None
                report_uploaded_at = None

            return Response({
                "user_id": user_id,
                "has_report": has_snps,
                "snp_count": snp_count,
                "service_status": service_status,
                "report_filename": report_filename,
                "report_date": report_uploaded_at
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error en GetUserReportStatusAPIView: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Error interno del servidor: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
