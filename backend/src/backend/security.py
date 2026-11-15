from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError
import jwt
from datetime import datetime, timedelta, timezone
from backend.config import settings

hasher = PasswordHasher()


def hash_password(plain: str) -> str:
    return hasher.hash(plain)


def verify_password(plain: str, hashed: str | None) -> bool:
    if not hashed:
        return False
    try:
        return hasher.verify(hashed, plain)
    except (VerifyMismatchError, InvalidHashError, VerificationError):
        return False


def create_access_token(public_id: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": public_id,
        "iss": settings.jwt_issuer,
        "aud": settings.jwt_audience,
        "iat": now,
        "exp": now + timedelta(seconds=settings.access_token_ttl_seconds),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> dict | None:
    try:
        return jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
            options={"require": ["exp", "iss", "aud", "sub"]},
        )
    except jwt.InvalidTokenError:
        return None