from typing import Tuple, Optional, Any
from django.core import signing
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions
from .models import Staff

SALT = "staff-auth"
TOKEN_MAX_AGE = 60 * 60 * 24


def create_token(staff: Staff) -> str:
    payload = {"id": staff.pk, "email": staff.email}
    return signing.dumps(payload, salt=SALT)


def verify_token(token: str) -> dict:
    try:
        return signing.loads(token, salt=SALT, max_age=TOKEN_MAX_AGE)
    except signing.SignatureExpired:
        raise exceptions.AuthenticationFailed("Token expired")
    except signing.BadSignature:
        raise exceptions.AuthenticationFailed("Invalid token")


class StaffTokenAuthentication(BaseAuthentication):
    def authenticate(self, request) -> Optional[Tuple[Staff, dict]]:
        auth = request.headers.get("Authorization")
        if not auth:
            return None
        parts = auth.split()
        if len(parts) != 2 or parts[0].lower() != "token":
            raise exceptions.AuthenticationFailed("Invalid authorization header")
        payload: dict[str, Any] = verify_token(parts[1])
        try:
            staff = Staff.objects.get(pk=payload.get("id"))
        except Staff.DoesNotExist:
            raise exceptions.AuthenticationFailed("Staff not found")
        return staff, payload


#
