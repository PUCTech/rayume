"""The tables from docs/database/README.md, one class each."""

import enum
import secrets
import uuid
from datetime import datetime

from sqlalchemy import Enum, ForeignKey, Index, String, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import ARRAY, INET, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def new_public_id() -> str:
    return secrets.token_urlsafe(9)  # 12 url-safe characters


class ExperienceType(enum.StrEnum):
    professional = "professional"
    education = "education"
    project = "project"
    certification = "certification"
    volunteering = "volunteering"


class RenderKind(enum.StrEnum):
    pdf = "pdf"
    preview = "preview"


class RenderStatus(enum.StrEnum):
    queued = "queued"
    running = "running"
    ok = "ok"
    failed = "failed"


class LogLevel(enum.StrEnum):
    info = "info"
    warning = "warning"
    error = "error"


class Id:
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)


class Created(Id):
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())


class Timestamps(Created):
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())


class User(Timestamps, Base):
    __tablename__ = "users"
    __table_args__ = (Index("uq_users_username_lower", text("lower(username)"), unique=True),)

    public_id: Mapped[str] = mapped_column(unique=True, default=new_public_id)
    username: Mapped[str]
    email: Mapped[str] = mapped_column(unique=True)
    password_hash: Mapped[str | None]
    github_id: Mapped[str | None] = mapped_column(unique=True)
    google_id: Mapped[str | None] = mapped_column(unique=True)
    name: Mapped[str]
    profession: Mapped[str | None]
    summary: Mapped[str | None]
    phone: Mapped[str | None]
    address: Mapped[str | None]
    picture_url: Mapped[str | None]
    language: Mapped[str] = mapped_column(server_default="en")
    links: Mapped[list | None] = mapped_column(JSONB)
    disabled_at: Mapped[datetime | None]


class Experience(Timestamps, Base):
    __tablename__ = "experiences"

    public_id: Mapped[str] = mapped_column(unique=True, default=new_public_id)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[ExperienceType] = mapped_column(Enum(ExperienceType, name="experience_type"))
    raw_text: Mapped[str]
    data: Mapped[dict] = mapped_column(JSONB)
    position: Mapped[int]


class JobPosting(Timestamps, Base):
    __tablename__ = "job_postings"

    public_id: Mapped[str] = mapped_column(unique=True, default=new_public_id)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str]
    company: Mapped[str]
    url: Mapped[str | None]
    description: Mapped[str]
    keywords: Mapped[list] = mapped_column(JSONB)


class Template(Timestamps, Base):
    __tablename__ = "templates"

    slug: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str]
    tex_source: Mapped[str]
    preview_url: Mapped[str | None]
    tags: Mapped[list[str]] = mapped_column(ARRAY(String), server_default="{}")


class Resume(Timestamps, Base):
    __tablename__ = "resumes"
    # public_id is shared by every version of one resume
    __table_args__ = (UniqueConstraint("public_id", "version"),)

    public_id: Mapped[str] = mapped_column(default=new_public_id)
    version: Mapped[int] = mapped_column(default=1)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    template_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("templates.id", ondelete="RESTRICT"), index=True)
    job_posting_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("job_postings.id", ondelete="SET NULL"), index=True
    )
    title: Mapped[str]
    content: Mapped[dict] = mapped_column(JSONB)


class ResumeRender(Timestamps, Base):
    __tablename__ = "resume_renders"
    __table_args__ = (
        UniqueConstraint("resume_id", "kind", "content_hash"),
        Index("ix_resume_renders_queue", "status", "created_at"),
    )

    resume_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("resumes.id", ondelete="CASCADE"), index=True)
    kind: Mapped[RenderKind] = mapped_column(Enum(RenderKind, name="render_kind"))
    status: Mapped[RenderStatus] = mapped_column(
        Enum(RenderStatus, name="render_status"), default=RenderStatus.queued
    )
    content_hash: Mapped[str]
    file_url: Mapped[str | None]
    error: Mapped[str | None]


class RefreshToken(Created, Base):
    __tablename__ = "refresh_tokens"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    family_id: Mapped[uuid.UUID] = mapped_column(index=True)
    token_hash: Mapped[str] = mapped_column(unique=True)
    expires_at: Mapped[datetime]
    revoked_at: Mapped[datetime | None]


class Log(Created, Base):
    __tablename__ = "logs"
    __table_args__ = (
        Index("ix_logs_user_created", "user_id", "created_at"),
        Index("ix_logs_event_created", "event", "created_at"),
        Index("ix_logs_created", "created_at"),
    )

    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    level: Mapped[LogLevel] = mapped_column(Enum(LogLevel, name="log_level"))
    event: Mapped[str]
    entity_type: Mapped[str | None]
    entity_id: Mapped[uuid.UUID | None]  # no FK: may point at any table and outlive the row
    data: Mapped[dict | None] = mapped_column(JSONB)
    ip: Mapped[str | None] = mapped_column(INET)
