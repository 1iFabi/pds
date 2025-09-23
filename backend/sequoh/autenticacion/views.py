from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
import re

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
                # Si el usuario es válido, inicia la sesión en Django
                login(request, user)
                return Response({"mensaje": "Inicio de sesión exitoso", "success": True})
            else:
                # Si las credenciales son incorrectas, devuelve un error
                return Response({"error": "Credenciales inválidas"}, status=400)
        except json.JSONDecodeError:
            # Maneja el error si el formato JSON es incorrecto
            return Response({"error": "Formato de solicitud inválido"}, status=400)
        except Exception as e:
            # Captura cualquier otro error inesperado
            return Response({"error": str(e)}, status=500)


@method_decorator(csrf_exempt, name='dispatch')
class RegisterAPIView(APIView):
    def post(self, request):
        try:
            # Obtiene el cuerpo de la petición y lo decodifica de JSON
            data = json.loads(request.body)
            
            nombre = data.get('nombre', '').strip()
            correo = data.get('correo', '').strip()
            telefono = data.get('telefono', '').strip()
            contraseña = data.get('contraseña', '')
            repetir_contraseña = data.get('repetirContraseña', '')
            terminos = data.get('terminos', False)
            
            # Validaciones básicas
            if not all([nombre, correo, telefono, contraseña, repetir_contraseña]):
                return Response({"error": "Todos los campos son obligatorios"}, status=status.HTTP_400_BAD_REQUEST)
            
            if not terminos:
                return Response({"error": "Debes aceptar los términos y condiciones"}, status=status.HTTP_400_BAD_REQUEST)
            
            if contraseña != repetir_contraseña:
                return Response({"error": "Las contraseñas no coinciden"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validación de contraseña
            password_errors = self.validate_password(contraseña)
            if password_errors:
                return Response({"error": password_errors}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validación de teléfono
            if not re.match(r'^\d{1,11}$', telefono):
                return Response({"error": "El teléfono debe contener solo números y máximo 11 dígitos"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Validación de email
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', correo):
                return Response({"error": "El formato del correo electrónico no es válido"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Verificar si el usuario ya existe
            if User.objects.filter(username=correo).exists():
                return Response({"error": "Ya existe un usuario con este correo electrónico"}, status=status.HTTP_400_BAD_REQUEST)
            
            if User.objects.filter(email=correo).exists():
                return Response({"error": "Ya existe un usuario con este correo electrónico"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Crear el usuario
            user = User.objects.create_user(
                username=correo,  # Usamos el correo como username
                email=correo,
                password=contraseña,
                first_name=nombre
            )
            
            # Guardamos el teléfono en el perfil del usuario (podrías crear un modelo Profile si necesitas más campos)
            # Por ahora lo guardamos en last_name como campo temporal
            user.last_name = telefono
            user.save()
            
            return Response({
                "mensaje": "Usuario registrado exitosamente", 
                "success": True,
                "user_id": user.id
            }, status=status.HTTP_201_CREATED)
            
        except json.JSONDecodeError:
            return Response({"error": "Formato de solicitud inválido"}, status=status.HTTP_400_BAD_REQUEST)
        except IntegrityError:
            return Response({"error": "Error al crear el usuario, el correo ya existe"}, status=status.HTTP_400_BAD_REQUEST)
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
