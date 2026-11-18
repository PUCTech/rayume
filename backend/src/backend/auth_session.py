import secrets
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from uuid import uuid4

from fastapi import Response
from sqlalchemy.orm import Session

from .config import settings
from .models import RefreshToken, User
from .schemas import TokenResponse, UserOut
from .security import create_access_token

def start_session(db: Session, user: User, route: Response) -> TokenResponse:
    refresh_token = secrets.token_urlsafe(32)
    token_hash = sha256(refresh_token.encode("utf-8")).hexdigest()

    lifetime = timedelta(days=settings.refresh_token_lifetime)
    expires_at = datetime.now(timezone.utc) + lifetime

    db.add(
        RefreshToken(
            user_id=user.id,
            family_id=uuid4(),
            token_hash=token_hash,
            expires_at=expires_at,
        )
    )

    route.set_cookie(
        key="refresh_token",
        value=refresh_token,
        max_age=int(lifetime.total_seconds()),
        httponly=True,
        secure=True,
        samesite="lax",
        path="/auth",
    )

    return TokenResponse(
        access_token=create_access_token(user.public_id),
        token_type="bearer",
        expires_in=settings.acess_token_ttl_seconds,
        user=UserOut.model_validate(user),
    )