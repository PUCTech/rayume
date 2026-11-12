"""Template gallery, docs/backend/endpoints/templates.md. No auth: the gallery is browsable before login."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Template
from ..schemas import TemplateDetail, TemplateOut

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=list[TemplateOut])
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


@router.get("/{slug}", response_model=TemplateDetail)
def get_template(slug: str, db: Annotated[Session, Depends(get_db)]):
    template = db.scalar(select(Template).where(Template.slug == slug))
    if template is None:
        raise HTTPException(404, "Template not found")
    return template
