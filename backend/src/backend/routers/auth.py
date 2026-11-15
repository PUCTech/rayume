from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..security import verify_password, create_access_token
from ..models import User
from ..db import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
def login(db: Session = Depends(get_db)):
    return {"message": "Rota de login funcionando"}
