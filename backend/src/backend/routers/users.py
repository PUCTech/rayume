from typing import Annotated

from fastapi import Depends, APIRouter, HTTPException, UploadFile

from sqlalchemy import func, select
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from io import BytesIO
from PIL import Image

from ..dependencies import get_current_user
from ..models import User
from ..schemas import UserOut, UserUpdate, PublicUserOut
from ..db import get_db

router = APIRouter(tags=["users"])
Max_Picture_Bytes = 2 * 1024 * 1024
Valid_Picture_Format = ("JPEG", "PNG", "WEBP")


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


@router.put("/me/picture", response_model=UserOut)
def update_picture(file: UploadFile, current_user: Annotated[User, Depends(get_current_user)]) -> User:

    contents = file.file.read(Max_Picture_Bytes + 1)

    if len(contents) > Max_Picture_Bytes:
        raise HTTPException(status_code=413, detail="Picture too large")

    try:
        with Image.open(BytesIO(contents), formats=Valid_Picture_Format) as img:
            img.verify()

        with Image.open(BytesIO(contents), formats=Valid_Picture_Format) as img:
            img.load()

    except (OSError, SyntaxError, ValueError, Image.DecompressionBombError) as exc:
        raise HTTPException(status_code=422, detail="Invalid Picture") from exc
    
    #Temp
    raise HTTPException(status_code=501, detail="Picture DB not configured YET")