from typing import Annotated

from fastapi import Depends, APIRouter

from ..dependencies import get_current_user
from ..models import User
from ..schemas import UserOut

router = APIRouter(tags=["users"])

@router.get("/me", response_model=UserOut)
def get_me(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    return current_user

