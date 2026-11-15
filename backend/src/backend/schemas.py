"""Pydantic shapes for the jsonb columns and the HTTP bodies, from docs/backend/endpoints/."""

from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, EmailStr, field_validator

from .models import ExperienceType

# "2024-03"
YearMonth = Annotated[str, Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")]


class Link(BaseModel):
    label: Annotated[str, Field(min_length=1, max_length=40)]
    url: HttpUrl


class ExperienceData(BaseModel):
    """experiences.data: the AI's structured output for one entry."""

    title: str
    organization: str | None = None
    start: YearMonth | None = None
    end: YearMonth | None = None  # null means current
    location: str | None = None
    bullets: list[str] = []
    hard_skills: list[str] = []
    soft_skills: list[str] = []


class ResumeEntry(ExperienceData):
    type: ExperienceType


class ResumeProfile(BaseModel):
    name: str
    profession: str | None = None
    summary: str | None = None
    email: str
    phone: str | None = None
    address: str | None = None
    links: list[Link] = []


class ResumeContent(BaseModel):
    """resumes.content: a full snapshot, so rendering never reads users or experiences."""

    profile: ResumeProfile
    entries: list[ResumeEntry]


class TemplateOut(BaseModel):
    """A gallery card in GET /templates. The spec's author and license have no column yet (open team question)."""

    model_config = ConfigDict(from_attributes=True)

    slug: str
    name: str
    preview_url: str | None
    tags: list[str]
    created_at: datetime
    updated_at: datetime


class TemplateDetail(TemplateOut):
    """GET /templates/{slug}: the card plus the LaTeX, which the template page shows and lets people edit."""

    tex_source: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-z0-9_-]+$")
    password: str = Field(min_length=8, max_length=128)
    language: Literal["en", "pt-BR"] = "en"

    @field_validator("email", mode='before')
    @classmethod
    def validate_email(cls, v: EmailStr) -> EmailStr:
        email = v.lower()
        return email

    @field_validator("username", mode='before')
    @classmethod
    def username_validator(cls, v: str) -> str:
        username = v.lower()

        if username in ("admin", "api", "login", "settings"):
            raise ValueError("username cannot be this")

        return username

# UserOut
# TokenResponse