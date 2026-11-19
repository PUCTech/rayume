import secrets

from hashlib import sha256

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.responses import JSONResponse

from sqlalchemy import select
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import user, now
from websockets.version import commit

from ..config import settings
from ..db import get_db
from ..models import User, RefreshToken, Log, LogLevel
from ..schemas import LoginRequest, TokenResponse, UserOut
from ..security import create_access_token, hash_password, verify_password
from ..auth_session import start_session, revoke_token_family

router = APIRouter(prefix="/auth", tags=["auth"])

# Reduces timing differences that could reveal whether an email is registered
DUMMY_PASSWORD_HASH = hash_password(secrets.token_urlsafe(32))

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, https_response: Response, db: Session = Depends(get_db)):
    user = db.scalar(
        select(User).where(
            User.email == body.email.lower(),
            User.disabled_at.is_(None),
        )
    )

    password_hash = (
        user.password_hash
        if user is not None and user.password_hash is not None
        else DUMMY_PASSWORD_HASH
    )

    password_valid = verify_password(body.password, password_hash)

    if user is None or user.password_hash is None or not password_valid:
        raise HTTPException(status_code=401, detail="invalid_credentials")

    tokens_response = start_session(db, user, https_response)
    db.commit()
    return tokens_response


@router.post("/refresh", response_model=TokenResponse)
def refresh(request: Request, http_response: Response, db: Session = Depends(get_db)):
    received_token = request.cookies.get("refresh_token")

    try:
        if not received_token:
            raise HTTPException(status_code=401, detail="invalid_credentials")

        token_response, new_refresh_token, expires_at = rotate_refresh_token(
            received_token, db
        )
    except HTTPException as exc:
        if exc.status_code != 401:
            raise

        error_response = JSONResponse(
            status_code=401,
            content={"detail": exc.detail},
        )
        error_response.delete_cookie("refresh_token", path="/auth")
        return error_response

    remaining_seconds = int((expires_at - datetime.now(timezone.utc)).total_seconds())
    http_response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        max_age=max(0, remaining_seconds),
        httponly=True,
        secure=True,
        samesite="lax",
        path="/auth",
    )
    return token_response

def rotate_refresh_token(token: str, db: Session = Depends(get_db)):
    received_hash = sha256(token.encode("utf-8")).hexdigest()
    query = select(RefreshToken).where(RefreshToken.token_hash == received_hash).with_for_update()
    stored_token = db.scalar(query)

    if stored_token is None:
        raise HTTPException(status_code=401, detail="invalid_credentials")

    now = datetime.now(timezone.utc)
    expires_at = stored_token.expires_at

    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if expires_at <= now:
        raise HTTPException(status_code=401, detail="invalid_credentials")

    user = db.get(User, stored_token.user_id)
    if user is None or user.disabled_at is not None:
        raise HTTPException(status_code=401, detail="invalid_credentials")

    if stored_token.revoked_at is not None:
        revoke_token_family(db, stored_token.family_id, now)
        db.add(
            Log(
                user_id=stored_token.user_id,
                level=LogLevel.warning,
                event="auth.refresh_reuse_detected",
            )
        )
        db.commit()
        raise HTTPException(status_code=401, detail="invalid_credentials")

    new_refresh_token = secrets.token_urlsafe(32)
    new_token_hash = sha256(new_refresh_token.encode("utf-8")).hexdigest()

    stored_token.revoked_at = now

    db.add(
        RefreshToken(
            user_id=stored_token.user_id,
            family_id=stored_token.family_id,
            token_hash=new_token_hash,
            expires_at=stored_token.expires_at,
        )
    )

    token_response = TokenResponse(
        access_token=create_access_token(user.public_id),
        token_type="bearer",
        expires_in=settings.access_token_ttl_seconds,
        user=UserOut.model_validate(user),
    )

    db.commit()
    return token_response, new_refresh_token, expires_at