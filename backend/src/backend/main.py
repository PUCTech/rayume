from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .db import get_db, settings
from .models import Template
from .schemas import TemplateDetail, TemplateOut

app = FastAPI()

# the frontend runs on another origin (:3000 locally), so browser calls here need CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    # the refresh token is a cookie, sent with fetch(..., { credentials: "include" })
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/templates", response_model=list[TemplateOut])
def list_templates(
    db: Annotated[Session, Depends(get_db)],
    q: str | None = None,
    tag: Annotated[list[str], Query()] = [],
):
    stmt = select(Template).order_by(Template.name)
    if q:
        # autoescape so a % or _ typed in the search box matches itself, not everything
        stmt = stmt.where(Template.name.icontains(q, autoescape=True))
    if tag:
        stmt = stmt.where(Template.tags.contains(tag))  # tags @> array: has every one of them
    return db.scalars(stmt).all()


@app.get("/templates/{slug}", response_model=TemplateDetail)
def get_template(slug: str, db: Annotated[Session, Depends(get_db)]):
    template = db.scalar(select(Template).where(Template.slug == slug))
    if template is None:
        raise HTTPException(404, "Template not found")
    return template
