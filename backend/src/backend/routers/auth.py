import secrets

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.orm import Session
from websockets.version import commit

from ..config import settings
from ..db import get_db
from ..models import User
from ..schemas import LoginRequest, TokenResponse, UserOut
from ..security import create_access_token, hash_password, verify_password
from ..auth_session import start_session

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


#CONFIRM THE IMPLEMENTATION THIERRY
