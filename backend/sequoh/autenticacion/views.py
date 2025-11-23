from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import redirect
from django.utils import timezone
from urllib.parse import urlencode, quote
from datetime import timedelta
from allauth.account.models import EmailAddress
from .email_utils import send_welcome_email, send_password_reset_email, send_email, build_branded_html
from .jwt_utils import encode_jwt
from .authentication import JWTAuthentication
from .models import ServiceStatus, Profile, SNP
import json
import re


@method_decorator(csrf_exempt, name='dispatch')
class UserServiceStatusAPIView(APIView):
    """Permite consultar tu estado y a admin/staff actualizar el estado de otro usuario."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Devuelve el estado del usuario autenticado."""
        u = request.user
        from .models import Profile, ServiceStatus
        try:
            status_value = u.profile.service_status
            updated_at = u.profile.service_updated_at
        except Profile.DoesNotExist:
            status_value = ServiceStatus.NO_PURCHASED
            updated_at = None
        return Response({
            "user_id": u.id,
            "service_status": status_value,
            "can_view_results": status_value == ServiceStatus.COMPLETED,
            "updated_at": updated_at,
        })

    def post(self, request):
        """Actualiza el estado de servicio de un usuario (solo staff). Body: {userId, status} """
        if not request.user.is_staff:
            return Response({"error": "No tienes permisos"}, status=status.HTTP_403_FORBIDDEN)
        try:
            data = json.loads(request.body or '{}')
        except json.JSONDecodeError:
            data = request.data or {}
        user_id = data.get('userId')
        status_str = data.get('status')
        if not user_id or not status_str:
            return Response({"error": "userId y status son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)
        if status_str not in {s.value for s in ServiceStatus}:
            return Response({"error": f"status inválido. Usa uno de: {[s.value for s in ServiceStatus]}"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            target = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        # Asegurar que el profile exista
        from .models import Profile
        profile, _ = Profile.objects.get_or_create(user=target)
        profile.service_status = status_str
        profile.save(update_fields=["service_status", "service_updated_at"])
        return Response({
            "user_id": target.id,
            "service_status": profile.service_status,
            "updated_at": profile.service_updated_at,
        })


def normalize_cl_phone(raw: str):
    """Normaliza teléfonos móviles de Chile a formato +569XXXXXXXX.
    Acepta variantes comunes: +569XXXXXXXX, 569XXXXXXXX, 09XXXXXXXX, 9XXXXXXXX.
    Retorna el número normalizado o None si no es válido.
    """
    if not raw:
        return None
    s = raw.strip().replace(" ", "").replace("-", "")
    # +569XXXXXXXX
    if re.fullmatch(r"\+569\d{8}", s):
        return s
    # 569XXXXXXXX
    if re.fullmatch(r"569\d{8}", s):
        return "+" + s
    # 09XXXXXXXX
    if re.fullmatch(r"09\d{8}", s):
        return "+569" + s[2:]
    # 9XXXXXXXX
    if re.fullmatch(r"9\d{8}", s):
        return "+569" + s
    return None


@method_decorator(csrf_exempt, name='dispatch')
class LoginAPIView(APIView):
    def post(self, request):
        try:
            # Obtiene el cuerpo de la petición y lo decodifica de JSON
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            # Autentica al usuario usando las credenciales
            user = authenticate(request, username=username, password=password)

            if user is not None:
                # Verificar email confirmado con allauth
                if getattr(settings, 'REQUIRE_EMAIL_VERIFICATION', False):
                    is_verified = EmailAddress.objects.filter(user=user, email=user.email, verified=True).exists()
                    if not is_verified:
                        return Response({
                            "error": "Tu cuenta aún no ha sido verificada. Revisa tu correo para completar la verificación.",
                            "requires_verification": True
                        }, status=400)

                # Generar JWT (stateless) para Vercel/Render
                token = encode_jwt({
                    "sub": str(user.id),
                    "email": user.email,
                })
                return Response({"mensaje": "Inicio de sesión exitoso", "success": True, "token": token})
            else:
                # Detectar caso de usuario pendiente de verificación (is_active=False)
                try:
                    possible_user = None
                    if username:
                        # Buscar por username (en tu registro, usas el correo como username)
                        possible_user = User.objects.filter(username=username).first()
                        if not possible_user:
                            # Intentar por email en caso de que envíen username distinto
                            possible_user = User.objects.filter(email=username).first()
                    if possible_user and getattr(settings, 'REQUIRE_EMAIL_VERIFICATION', False):
                        if not EmailAddress.objects.filter(user=possible_user, email=possible_user.email, verified=True).exists():
                            return Response({
                                "error": "Tu cuenta está pendiente de verificación. Revisa tu correo para activar tu cuenta.",
                                "requires_verification": True
                            }, status=400)
                except Exception:
                    pass
                
                # Determinar qué campo específico está mal
                error_response = {}
                
                # Verificar si el usuario existe para identificar si es email o password incorrecto
                try:
                    user_exists = False
                    if username:
                        # Buscar por username o email
                        user_exists = User.objects.filter(username=username).exists() or User.objects.filter(email=username).exists()
                    
                    if user_exists:
                        # El usuario existe, entonces la contraseña está mal
                        error_response["password"] = ["Contraseña incorrecta"]
                    else:
                        # El usuario no existe, entonces el email/username está mal
                        error_response["username"] = ["Este correo no está registrado"]
                except Exception:
                    # Si hay error en la consulta, devolver error genérico por ambos campos
                    error_response = {
                        "username": ["Revisa tu correo"],
                        "password": ["Revisa tu contraseña"]
                    }
                
                return Response(error_response, status=400)
        except json.JSONDecodeError:
            # Maneja el error si el formato JSON es incorrecto
            return Response({"error": "Formato de solicitud inválido"}, status=400)
        except Exception as e:
            # Captura cualquier otro error inesperado
            return Response({"error": str(e)}, status=500)


class MeAPIView(APIView):
    """Retorna datos básicos del usuario autenticado (JWT)."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        u = request.user
        # Cargar estado de servicio desde Profile
        from .models import Profile, ServiceStatus
        try:
            p = u.profile
            service_status = p.service_status
        except Profile.DoesNotExist:
            service_status = ServiceStatus.NO_PURCHASED
        data = {
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "is_staff": u.is_staff,
            "is_superuser": u.is_superuser,
            "user_type": "admin" if u.is_staff else "user",
            "service_status": service_status,
            "can_view_results": service_status == ServiceStatus.COMPLETED,
        }
        # Evitar cacheo del perfil actual
        resp = Response({"user": data})
        resp["Cache-Control"] = "no-store"
        return resp


@method_decorator(csrf_exempt, name='dispatch')
class ChangePasswordAPIView(APIView):
    """Permite a un usuario autenticado cambiar su contraseña."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            data = json.loads(request.body or '{}')
            current_password = data.get('current_password', '')
            new_password = data.get('new_password', '')
            confirm_password = data.get('confirm_password', '')

            # Validaciones básicas
            if not all([current_password, new_password, confirm_password]):
                return Response(
                    {"error": "Todos los campos son obligatorios"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verificar que las contraseñas nuevas coincidan
            if new_password != confirm_password:
                return Response(
                    {"error": "Las contraseñas nuevas no coinciden"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verificar que la contraseña actual sea correcta
            user = request.user
            if not user.check_password(current_password):
                return Response(
                    {"error": "La contraseña actual es incorrecta"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validar la nueva contraseña con las mismas reglas del registro
            password_errors = RegisterAPIView().validate_password(new_password)
            if password_errors:
                return Response(
                    {"error": password_errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verificar que la nueva contraseña no sea igual a la actual
            if current_password == new_password:
                return Response(
                    {"error": "La nueva contraseña debe ser diferente a la actual"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Cambiar la contraseña
            user.set_password(new_password)
            user.save()

            return Response(
                {"success": True, "message": "Contraseña actualizada exitosamente"},
                status=status.HTTP_200_OK
            )

        except json.JSONDecodeError:
            return Response(
                {"error": "Formato de solicitud inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Error interno del servidor: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@method_decorator(csrf_exempt, name='dispatch')
class DeleteAccountAPIView(APIView):
    """Permite a un usuario eliminar su cuenta tras confirmarlo."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            data = json.loads(request.body or '{}')
        except json.JSONDecodeError:
            return Response(
                {"error": "Formato de solicitud invalido"},
                status=status.HTTP_400_BAD_REQUEST
            )

        password = data.get('password', '')
        confirmation = (data.get('confirmation') or '').strip().lower()

        if not password:
            return Response(
                {"error": "Debes ingresar tu contrasena actual"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if confirmation != 'eliminar':
            return Response(
                {"error": 'Debes escribir "ELIMINAR" para confirmar'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = request.user
        if not user.check_password(password):
            return Response(
                {"error": "Contrasena incorrecta"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user.delete()
        except Exception:
            return Response(
                {"error": "No se pudo eliminar la cuenta"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response(
            {"success": True, "message": "Cuenta eliminada correctamente"},
            status=status.HTTP_200_OK
        )


@method_decorator(csrf_exempt, name='dispatch')
class LogoutAPIView(APIView):
    """Logout stateless: el cliente elimina su token."""
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        resp = Response({"success": True})
        resp["Cache-Control"] = "no-store"
        return resp


class DashboardAPIView(APIView):
    """Ejemplo de endpoint de dashboard por usuario (JWT)."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .models import Profile, ServiceStatus
        u = request.user
        profile = getattr(u, 'profile', None)
        service_status = getattr(profile, 'service_status', ServiceStatus.NO_PURCHASED)
        payload = {
            "user": {
                "id": u.id,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
            },
            "profile": {
                "phone": getattr(profile, 'phone', None),
                "service_status": service_status,
                "can_view_results": service_status == ServiceStatus.COMPLETED,
            },
            # Estadísticas para el dashboard de admin
            "total_users": User.objects.filter(is_active=True).count(),
            "processed_reports": UserSNP.objects.values('user').distinct().count() if UserSNP.objects.exists() else 0,
            "variants_count": SNP.objects.count() if SNP.objects.exists() else 0,
            "analysis_count": User.objects.filter(profile__service_status=ServiceStatus.COMPLETED).count(),
            "user_growth": "+12%",
            "report_growth": "+8%",
            "analysis_growth": "+18%",
            "last_update": timezone.now().strftime("%d/%m/%Y")  # Formato más legible
        }
        resp = Response(payload)
        resp["Cache-Control"] = "no-store"
        return resp


@method_decorator(csrf_exempt, name='dispatch')
class ContactAPIView(APIView):
    """Recibe mensajes del formulario de contacto y los envía por correo."""
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        # Intentar leer JSON, si falla, usar form-encoded
        try:
            data = json.loads(request.body or '{}')
        except json.JSONDecodeError:
            data = request.POST or {}

        nombre = (data.get('nombre') or '').strip()
        email = (data.get('email') or '').strip().lower()
        mensaje = (data.get('mensaje') or '').strip()

        # Validaciones básicas
        errors = {}
        if not nombre:
            errors['nombre'] = 'El nombre es obligatorio.'
        if not email or not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            errors['email'] = 'El correo electrónico no es válido.'
        if not mensaje or len(mensaje) < 5:
            errors['mensaje'] = 'El mensaje es demasiado corto.'

        if errors:
            return Response({"ok": False, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)

        # Construir contenidos
        subject = f"Nuevo mensaje de contacto de {nombre}"
        text_body = (
            f"Nombre: {nombre}\n"
            f"Email: {email}\n\n"
            f"Mensaje:\n{mensaje}\n"
        )

        inner_html = f"""
          <p><strong>Nombre:</strong> {nombre}</p>
          <p><strong>Email:</strong> {email}</p>
          <div style=\"margin-top:16px; padding:12px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;\">
            <div style=\"font-weight:600; color:#374151; margin-bottom:8px;\">Mensaje</div>
            <div style=\"white-space:pre-wrap; color:#111827;\">{mensaje}</div>
          </div>
        """
        html_body = build_branded_html(inner_html=inner_html, title_text="Nuevo mensaje de contacto")

        # Enviar el correo al buzón de GenomIA
        recipient = 'proyectogenomia@gmail.com'
        ok = False
        try:
            ok = send_email(to_email=recipient, subject=subject, html_body=html_body, text_body=text_body)
        except Exception as e:
            ok = False

        if not ok:
            return Response({"ok": False, "error": "No se pudo enviar el mensaje en este momento."}, status=status.HTTP_502_BAD_GATEWAY)

        return Response({"ok": True, "message": "Mensaje enviado correctamente."}, status=status.HTTP_200_OK)


@method_decorator(csrf_exempt, name='dispatch')
class RegisterAPIView(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body)
            nombre = data.get('nombre', '').strip()
            apellido = data.get('apellido', '').strip()
            correo = data.get('correo', '').strip().lower()
            telefono = data.get('telefono', '').strip()
            rut = data.get('rut', '').strip().upper()  # Normalizar a mayúsculas para la K
            contraseña = data.get('contraseña', '')
            repetir_contraseña = data.get('repetirContraseña', '')
            terminos = data.get('terminos', False)
            
            # Validaciones básicas
            if not all([nombre, apellido, correo, telefono, rut, contraseña, repetir_contraseña]):
                return Response({"error": "Todos los campos son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not terminos:
                return Response({"error": "Debes aceptar los términos y condiciones"}, status=status.HTTP_400_BAD_REQUEST)
            
            if contraseña != repetir_contraseña:
                return Response({"error": "Las contraseñas no coinciden"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validación de contraseña
            password_errors = self.validate_password(contraseña)
            if password_errors:
                return Response({"error": password_errors}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validación/normalización de teléfono (Chile: +569XXXXXXXX)
            telefono_norm = normalize_cl_phone(telefono)
            if not telefono_norm:
                return Response({"error": "El teléfono debe tener formato +569XXXXXXXX"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validación de email
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', correo):
                return Response({"error": "El formato del correo electrónico no es válido"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validación de RUT
            rut_pattern = r'^\d{7,8}-[0-9K]$'
            if not re.match(rut_pattern, rut):
                return Response({"error": "El RUT debe tener el formato XXXXXXX-R (ejemplo: 12345678-9 o 1234567-K)"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verificar si el RUT ya existe
            from .models import Profile
            if Profile.objects.filter(rut=rut).exists():
                return Response({
                    "error": "Este RUT ya está registrado",
                    "rut_exists": True
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verificar si el usuario ya existe
            if User.objects.filter(username=correo).exists() or User.objects.filter(email=correo).exists():
                return Response({
                    "error": "Este correo ya está registrado",
                    "email_exists": True
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear el usuario
            user = User.objects.create_user(
                username=correo,  # Usamos el correo como username
                email=correo,
                password=contraseña,
                first_name=nombre,
                last_name=apellido,
            )
            
            # Guardamos el teléfono y RUT en Profile
            from .models import Profile
            profile, _ = Profile.objects.get_or_create(user=user)
            profile.phone = telefono_norm
            profile.rut = rut
            # El estado por defecto queda en NO_PURCHASED
            profile.save()

            # Enviar confirmación de email via allauth (usa nuestro adapter Gmail API)
            if getattr(settings, 'REQUIRE_EMAIL_VERIFICATION', False):
                # Crea EmailAddress (si no existe) y envía email de confirmación
                EmailAddress.objects.add_email(
                    request,
                    user,
                    user.email,
                    confirm=True,
                    signup=True,
                )
            else:
                try:
                    send_welcome_email(user_email=user.email, user_name=user.first_name)
                except Exception as e:
                    print(f"Error enviando email de bienvenida: {e}")

            requires_verif = bool(getattr(settings, 'REQUIRE_EMAIL_VERIFICATION', False))
            mensaje = "Usuario registrado exitosamente"
            if requires_verif:
                mensaje = "Usuario registrado exitosamente. Debes verificar tu cuenta desde tu correo para poder continuar."

            return Response({
                "mensaje": mensaje, 
                "success": True,
                "user_id": user.id,
                "requires_verification": requires_verif
            }, status=status.HTTP_201_CREATED)
            
        except json.JSONDecodeError:
            return Response({"error": "Formato de solicitud inválido"}, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            return Response({
                "error": "Este correo ya está registrado",
                "email_exists": True
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": f"Error interno del servidor: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def validate_password(self, password):
        """Valida que la contraseña cumpla con los requisitos"""
        errors = []
        
        if len(password) < 10:
            errors.append("La contraseña debe tener al menos 10 caracteres")
        
        if not re.search(r'[A-Z]', password):
            errors.append("La contraseña debe contener al menos una letra mayúscula")
        
        if not re.search(r'[0-9]', password):
            errors.append("La contraseña debe contener al menos un número")
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("La contraseña debe contener al menos un símbolo especial")
        
        return ". ".join(errors) if errors else None


@method_decorator(csrf_exempt, name='dispatch')
class ResendVerificationAPIView(APIView):
    """Reenvía el correo de verificación usando allauth. Responde éxito sin filtrar información."""
    def post(self, request):
        try:
            try:
                data = json.loads(request.body or '{}')
            except Exception:
                data = getattr(request, 'data', {}) or {}
            email = (data.get('email') or '').strip().lower()
            if not email:
                return Response({"error": "Email es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)

            # Buscar usuario
            user = User.objects.filter(email=email).first()
            if not user:
                # No revelar si existe o no
                return Response({"success": True})

            # Si ya está verificado, responder éxito
            if EmailAddress.objects.filter(user=user, email=email, verified=True).exists():
                return Response({"success": True})

            # Reenviar confirmación
            EmailAddress.objects.add_email(
                request,
                user,
                email,
                confirm=True,
                signup=False,
            )
            return Response({"success": True})
        except Exception:
            # Por seguridad, responder éxito igualmente
            return Response({"success": True})


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetRequestAPIView(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body or '{}')
            email = (data.get('email') or '').strip().lower()
            if not email:
                return Response({"error": "Email es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)

            # Mensaje genérico para no revelar existencia del correo
            generic_ok = {"message": "Si el correo está registrado, te enviaremos un enlace para restablecer tu contraseña."}

            user = User.objects.filter(email=email).first()
            if not user:
                return Response(generic_ok)

            # Crear token de restablecimiento
            from .models import PasswordResetToken
            expire_hours = int(getattr(settings, 'PASSWORD_RESET_EXPIRE_HOURS', getattr(settings, 'EMAIL_VERIFICATION_EXPIRE_HOURS', 24)))
            expires_at = timezone.now() + timedelta(hours=expire_hours)
            prt = PasswordResetToken.objects.create(user=user, expires_at=expires_at)

            # Link al frontend que abre el modal de reset
            frontend_base = getattr(settings, 'FRONTEND_DOMAIN', 'http://localhost:5173').rstrip('/')
            reset_url = f"{frontend_base}/login?token={prt.token}"

            # Enviar email
            send_password_reset_email(user_email=user.email, user_name=user.first_name or user.username, reset_url=reset_url)

            return Response(generic_ok)
        except Exception as e:
            return Response({"error": f"Error interno del servidor: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetConfirmAPIView(APIView):
    def post(self, request):
        try:
            data = json.loads(request.body or '{}')
            token = (data.get('token') or '').strip()
            password = data.get('password') or ''
            confirm = data.get('confirmPassword') or ''

            if not token or not password or not confirm:
                return Response({"error": "Datos incompletos"}, status=status.HTTP_400_BAD_REQUEST)
            if password != confirm:
                return Response({"error": "Las contraseñas no coinciden"}, status=status.HTTP_400_BAD_REQUEST)

            # Validar políticas de password similares al registro
            errors = RegisterAPIView().validate_password(password)
            if errors:
                return Response({"error": errors}, status=status.HTTP_400_BAD_REQUEST)

            from .models import PasswordResetToken
            prt = PasswordResetToken.objects.select_related('user').filter(token=token).first()
            if not prt:
                return Response({"error": "Token inválido"}, status=status.HTTP_400_BAD_REQUEST)
            if prt.is_expired:
                return Response({"error": "El enlace ha expirado"}, status=status.HTTP_400_BAD_REQUEST)

            user = prt.user
            user.set_password(password)
            user.save()
            prt.used = True
            prt.save(update_fields=['used'])

            return Response({"success": True})
        except Exception as e:
            return Response({"error": f"Error interno del servidor: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@method_decorator(csrf_exempt, name='dispatch')
class VerifyEmailView(APIView):
    """
    API para confirmar verificación de correo electrónico
    """
    def get(self, request, token):
        try:
            # token llega como UUID por la ruta
            token_uuid = token
            try:
                verification = EmailVerification.objects.select_related('user').get(token=token_uuid)
            except EmailVerification.DoesNotExist:
                return HttpResponse("Token de verificación no encontrado", status=400)

            frontend_base = getattr(settings, 'FRONTEND_DOMAIN', 'http://localhost:5173')
            frontend_login_redirect = getattr(settings, 'FRONTEND_LOGIN_REDIRECT', f"{frontend_base.rstrip('/')}/login?verified=1")

            if verification.is_verified:
                resp = redirect(frontend_login_redirect)
                resp.set_cookie(
                    key='verification_status', value='1', max_age=300, path='/',
                    secure=not settings.DEBUG, samesite='Lax'
                )
                resp.set_cookie(
                    key='verification_message', value=quote('Tu cuenta ya estaba verificada.'), max_age=300, path='/',
                    secure=not settings.DEBUG, samesite='Lax'
                )
                return resp

            if verification.is_expired:
                resp = redirect(f"{frontend_base.rstrip('/')}/login")
                resp.set_cookie(
                    key='verification_status', value='0', max_age=300, path='/',
                    secure=not settings.DEBUG, samesite='Lax'
                )
                resp.set_cookie(
                    key='verification_message', value=quote('El token de verificación ha expirado.'), max_age=300, path='/',
                    secure=not settings.DEBUG, samesite='Lax'
                )
                return resp

            verification.is_verified = True
            verification.verified_at = timezone.now()
            verification.save()

            user = verification.user
            if not user.is_active and getattr(settings, 'REQUIRE_EMAIL_VERIFICATION', False):
                user.is_active = True
                user.save()
                try:
                    send_welcome_email(
                        user_email=user.email,
                        user_name=user.first_name or user.username
                    )
                except Exception:
                    pass

            frontend_login_redirect = getattr(settings, 'FRONTEND_LOGIN_REDIRECT', f"{frontend_base.rstrip('/')}/login?verified=1")
            resp = redirect(frontend_login_redirect)
            resp.set_cookie(
                key='verification_status', value='1', max_age=300, path='/',
                secure=not settings.DEBUG, samesite='Lax'
            )
            resp.set_cookie(
                key='verification_message', value=quote('Tu cuenta fue verificada correctamente.'), max_age=300, path='/',
                secure=not settings.DEBUG, samesite='Lax'
            )
            return resp
        except Exception as e:
            frontend_base = getattr(settings, 'FRONTEND_DOMAIN', 'http://localhost:5173')
            resp = redirect(f"{frontend_base}/login")
            resp.set_cookie(
                key='verification_status', value='0', max_age=300, path='/',
                secure=not settings.DEBUG, samesite='Lax'
            )
            resp.set_cookie(
                key='verification_message', value=quote('Ocurrió un error al verificar la cuenta.'), max_age=300, path='/',
                secure=not settings.DEBUG, samesite='Lax'
            )
            return resp


class GetUsersAPIView(APIView):
    """Endpoint para obtener lista de usuarios (solo staff)."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Verificar que sea staff
        if not request.user.is_staff:
            return Response({"error": "No tienes permisos"}, status=status.HTTP_403_FORBIDDEN)
        
        users = User.objects.filter(is_active=True).values(
            'id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser'
        )
        
        # Agregar campo rut si existe en el profile
        from .models import Profile
        users_list = []
        for user in users:
            user_dict = dict(user)
            try:
                profile = Profile.objects.get(user_id=user['id'])
                user_dict['rut'] = getattr(profile, 'rut', None)
            except Profile.DoesNotExist:
                user_dict['rut'] = None
            users_list.append(user_dict)
        
        return Response(users_list)


class AdminStatsAPIView(APIView):
    """Endpoint para obtener estadísticas del sistema (solo staff)."""
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Verificar que sea staff
        if not request.user.is_staff:
            return Response({"error": "No tienes permisos"}, status=status.HTTP_403_FORBIDDEN)
        
        from django.db import connection
        from .models import Profile, ServiceStatus
        
        try:
            # Contar usuarios activos (excluyendo staff y superusers)
            total_users = User.objects.filter(is_active=True, is_staff=False, is_superuser=False).count()
            
            # Análisis completados (solo usuarios regulares)
            analysis_count = User.objects.filter(
                is_active=True,
                is_staff=False,
                is_superuser=False,
                profile__service_status=ServiceStatus.COMPLETED
            ).count()
            
            # Contar reportes pendientes
            pending_reports = Profile.objects.filter(service_status=ServiceStatus.PENDING).count()
            
            # Contar variantes en la BD
            variants_count = SNP.objects.count()
            
            payload = {
                "total_users": total_users,
                "pending_reports": pending_reports,
                "variants_count": variants_count,
                "analysis_count": analysis_count,
                "user_growth": "+12%",
                "report_growth": "+8%",
                "analysis_growth": "+18%",
                "last_update": timezone.now().strftime("%d/%m/%Y"),
            }
            resp = Response(payload)
            resp["Cache-Control"] = "no-store"
            return resp
        except Exception as e:
            print(f"Error en AdminStatsAPIView: {e}")
            # Devolver al menos los usuarios que podemos contar
            return Response({
                "total_users": User.objects.filter(is_active=True, is_staff=False, is_superuser=False).count(),
                "processed_reports": 0,
                "variants_count": 0,
                "analysis_count": 0,
                "user_growth": "+0%",
                "report_growth": "+0%",
                "analysis_growth": "+0%",
                "last_update": timezone.now().strftime("%d/%m/%Y"),
            })


@method_decorator(csrf_exempt, name='dispatch')
class ContactFormAPIView(APIView):
    """Vista pública para recibir mensajes del formulario de contacto."""
    
    def post(self, request):
        try:
            data = json.loads(request.body)
            nombre = data.get('nombre', '').strip()
            email = data.get('email', '').strip()
            mensaje = data.get('mensaje', '').strip()
            
            # Validaciones
            if not nombre or not email or not mensaje:
                return Response(
                    {"error": "Todos los campos son obligatorios"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar formato de email
            email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            if not re.match(email_regex, email):
                return Response(
                    {"error": "El formato del email no es válido"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validar longitud mínima del mensaje
            if len(mensaje) < 10:
                return Response(
                    {"error": "El mensaje debe tener al menos 10 caracteres"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Enviar email
            success = send_contact_form_email(nombre, email, mensaje)
            
            if success:
                return Response({
                    "success": True,
                    "message": "Tu mensaje ha sido enviado correctamente. Te responderemos pronto."
                }, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": "Hubo un problema al enviar tu mensaje. Por favor, intenta nuevamente."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
        except json.JSONDecodeError:
            return Response(
                {"error": "Formato de solicitud inválido"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"Error interno del servidor: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
