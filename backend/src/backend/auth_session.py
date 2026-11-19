import secrets
from datetime import datetime, timedelta, timezone
from hashlib import sha256
from uuid import uuid4, UUID

from fastapi import Response
from sqlalchemy import select, update, text
from sqlalchemy.orm import Session

from .config import settings
from .models import RefreshToken, User
from .schemas import TokenResponse, UserOut
from .security import create_access_token

def start_session(db: Session, user: User, https_response: Response) -> TokenResponse:
    refresh_token = secrets.token_urlsafe(32)
    token_hash = sha256(refresh_token.encode("utf-8")).hexdigest()

    lifetime = timedelta(days=settings.refresh_token_ttl_days)
    expires_at = datetime.now(timezone.utc) + lifetime

    db.add(
        RefreshToken(
            user_id=user.id,
            family_id=uuid4(),
            token_hash=token_hash,
            expires_at=expires_at,
        )
    )

    https_response.set_cookie(
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
        expires_in=settings.access_token_ttl_seconds,
        user=UserOut.model_validate(user),
    )


def revoke_token_family(db: Session, family_id: UUID, revoked_at: datetime) -> None:
    statement = (
        update(RefreshToken)
        .where(
            RefreshToken.family_id == family_id,
            RefreshToken.revoked_at.is_(None),
        )
        .values(revoked_at=revoked_at)
    )
    db.execute(statement)


def find_and_lock_refresh_token(db: Session, token_hash: str) -> RefreshToken | None:
    token_matches = RefreshToken.token_hash == token_hash
    family_id = db.scalar(select(RefreshToken.family_id).where(token_matches))
    stored_token = None

    if family_id is not None:
        if db.get_bind().dialect.name == "postgresql":
            lock_key = int.from_bytes(family_id.bytes[:8], "big", signed=True)
            db.execute(text("SELECT pg_advisory_xact_lock(CAST(:lock_key AS bigint))"),{"lock_key": lock_key},)

        stored_token = db.scalar(
            select(RefreshToken).where(token_matches).with_for_update()
        )

    return stored_token