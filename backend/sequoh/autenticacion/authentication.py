from typing import Optional, Tuple
from django.contrib.auth.models import User
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework import exceptions
from .jwt_utils import decode_jwt


class JWTAuthentication(BaseAuthentication):
    """Simple DRF authentication class that reads a Bearer JWT from Authorization header.
    """

    def authenticate(self, request) -> Optional[Tuple[User, str]]:
        auth = get_authorization_header(request).decode("utf-8")
        if not auth:
            return None
        if not auth.lower().startswith("bearer "):
            return None
        token = auth[7:].strip()
        if not token:
            return None
        try:
            payload = decode_jwt(token)
        except Exception as e:
            raise exceptions.AuthenticationFailed("Invalid token")

        user_id = payload.get("sub")
        if not user_id:
            raise exceptions.AuthenticationFailed("Invalid token payload")
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed("User not found")
        return (user, token)
