from typing import Annotated

from fastapi import Depends, APIRouter, HTTPException

from sqlalchemy import func, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from ..dependencies import get_current_user
from ..models import User
from ..schemas import UserOut, UserUpdate, PublicUserOut
from ..db import get_db

router = APIRouter(tags=["users"])

@router.get("/me", response_model=UserOut)
def get_me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user

@router.patch("/me", response_model=UserOut)
def update_me(body: UserUpdate, current_user: Annotated[User, Depends(get_current_user)], db: Annotated[Session, Depends(get_db)]) -> User:
    changes = body.model_dump(exclude_unset=True, mode="json")
    if not changes:
        return current_user

    for field, value in changes.items():
        setattr(current_user, field, value)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()

        constraint_name = getattr(getattr(exc.orig, "diag", None), "constraint_name", None)

        if (
                constraint_name == "uq_users_username_lower"
                or str(exc.orig) == "UNIQUE constraint failed: index 'uq_users_username_lower'"
        ):
            raise HTTPException(status_code=409, detail="username_taken") from exc
        raise

    db.refresh(current_user)
    return current_user

@router.get("/users/{username}", response_model=PublicUserOut)
def get_user(username: str, db: Annotated[Session, Depends(get_db)])-> User:
    user = db.scalar(
        select(User).where(
            func.lower(User.username) == username.lower(),
            User.disabled_at.is_(None),
        )
    )

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user

