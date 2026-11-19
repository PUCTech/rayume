import secrets

from hashlib import sha256

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from fastapi.responses import JSONResponse

from sqlalchemy import select, func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..config import settings
from ..db import get_db
from ..models import User, RefreshToken, Log, LogLevel
from ..schemas import LoginRequest, TokenResponse, UserOut, RegisterRequest
from ..security import create_access_token, hash_password, verify_password
from ..auth_session import start_session, revoke_token_family, find_and_lock_refresh_token

router = APIRouter(prefix="/auth", tags=["auth"])

# Reduces timing differences that could reveal whether an email is registered
DUMMY_PASSWORD_HASH = hash_password(secrets.token_urlsafe(32))

@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, https_response: Response, request: Request, db: Session = Depends(get_db)):
    client_ip = request.client.host if request.client else None

    user = db.scalar(select(User).where(User.email == body.email.lower()))

    password_hash = (
        user.password_hash
        if user is not None and user.disabled_at is None
        else None
    )
    password_valid = verify_password(
        body.password,
        password_hash if password_hash is not None else DUMMY_PASSWORD_HASH,
    )

    if user is None or password_hash is None or not password_valid:
        db.add(
            Log(
                user_id = user.id if user is not None else None,
                level = LogLevel.warning,
                event = "auth.login_failed",
                ip = client_ip,
            )
        )
        db.commit()
        raise HTTPException(status_code=401, detail="invalid_credentials")

    tokens_response = start_session(db, user, https_response)
    db.add(Log(user_id=user.id, level=LogLevel.info, event="auth.login"))
    db.commit()
    return tokens_response


@router.post("/register", status_code=201, response_model=TokenResponse)
def register(body: RegisterRequest, https_response: Response, db: Session = Depends(get_db),) -> TokenResponse:
    email = body.email.lower()
    username = body.username.lower()

    existing_email = db.scalar(select(User.id).where(User.email == email))
    if existing_email is not None:
        raise HTTPException(status_code=409, detail="email_taken")

    existing_username = db.scalar(
        select(User.id).where(func.lower(User.username) == username)
    )
    if existing_username is not None:
        raise HTTPException(status_code=409, detail="username_taken")

    user = User(
        name=body.name,
        email=body.email,
        username=username,
        language=body.language,
        password_hash=hash_password(body.password),
    )

    try:
        db.add(user)
        db.flush()

        token_response = start_session(db, user, https_response)
        db.add(Log(user_id=user.id, level=LogLevel.info, event="auth.login"))
        db.commit()
    except IntegrityError as exc:
        db.rollback()

        constraint_name = getattr(
            getattr(exc.orig, "diag", None), "constraint_name", None
        )

        if constraint_name == "users_email_key":
            raise HTTPException(status_code=409, detail="email_taken") from exc

        if constraint_name == "uq_users_username_lower":
            raise HTTPException(status_code=409, detail="username_taken") from exc

        raise

    return token_response


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
    stored_token = find_and_lock_refresh_token(db, received_hash)

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


@router.post("/logout", status_code=204)
def logout(request: Request, db: Session = Depends(get_db)) -> Response:
    received_token = request.cookies.get("refresh_token")

    if received_token:
        received_token_hash = sha256(received_token.encode("utf-8")).hexdigest()
        stored_token = find_and_lock_refresh_token(db, received_token_hash)

        if stored_token is not None:
            now = datetime.now(timezone.utc)
            revoke_token_family(db, stored_token.family_id, now)

            db.add(
                Log(
                    user_id=stored_token.user_id,
                    level=LogLevel.info,
                    event="auth.logout",
                )
            )
            db.commit()

    response = Response(status_code=204)
    response.delete_cookie("refresh_token", path="/auth")
    return response