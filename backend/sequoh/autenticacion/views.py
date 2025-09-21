from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate, login
import json

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