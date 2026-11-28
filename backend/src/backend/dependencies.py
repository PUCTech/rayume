from typing import Annotated

from fastapi import HTTPException, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import get_db
from .models import User
from .security import decode_access_token

bearer = HTTPBearer(auto_error=False)

def get_current_user(authorization: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)], db: Annotated[Session, Depends(get_db)],) -> User:

    unauthorized_user = HTTPException(status_code=401, detail="Unauthorized", headers={"WWW-Authenticate": "Bearer"},)

    if authorization is None:
        raise unauthorized_user

    token = authorization.credentials
    loaded_token= decode_access_token(token)

    if loaded_token is None:
        raise unauthorized_user

    user = db.scalar(
        select(User).where(
            User.public_id == loaded_token["sub"],
            User.disabled_at.is_(None),
        )
    )

    if user is None:
        raise unauthorized_user

    return user