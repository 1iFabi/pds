import base64
import hashlib
import hmac
import json
import time
from typing import Dict, Any
from django.conf import settings


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def encode_jwt(payload: Dict[str, Any], ttl_seconds: int = 60 * 60 * 24 * 7) -> str:
    """
    Minimal HS256 JWT encoder. Adds iat and exp if not present.
    Not a full-featured implementation, but sufficient for stateless auth.
    """
    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    if "iat" not in payload:
        payload["iat"] = now
    if "exp" not in payload:
        payload["exp"] = now + ttl_seconds

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    secret = settings.SECRET_KEY.encode("utf-8")
    signature = hmac.new(secret, signing_input, hashlib.sha256).digest()
    signature_b64 = _b64url_encode(signature)
    return f"{header_b64}.{payload_b64}.{signature_b64}"


def decode_jwt(token: str) -> Dict[str, Any]:
    """
    Minimal HS256 JWT decoder/validator.
    Validates signature and exp.
    """
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
    except ValueError:
        raise ValueError("Invalid token format")

    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    secret = settings.SECRET_KEY.encode("utf-8")
    expected_sig = hmac.new(secret, signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(expected_sig, _b64url_decode(signature_b64)):
        raise ValueError("Invalid token signature")

    payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
    now = int(time.time())
    if "exp" in payload and now > int(payload["exp"]):
        raise ValueError("Token expired")
    return payload
