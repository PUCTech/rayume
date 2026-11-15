from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

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
