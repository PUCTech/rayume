"""Pydantic shapes for the jsonb columns and the HTTP bodies, from docs/backend/endpoints/."""

from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, EmailStr, field_validator

from .models import ExperienceType

# "2024-03"
YearMonth = Annotated[str, Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")]
RESERVED_USERNAMES = frozenset({"admin", "api", "login", "settings"})


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

# Class for a existing user to Login
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(max_length=128)

# Class for a non-existing user to register
class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    username: str = Field(min_length=3, max_length=30, pattern=r"^[a-z0-9_-]+$")
    password: str = Field(min_length=8, max_length=128)
    language: Literal["en", "pt-BR"] = "en"

    @field_validator("username", mode="before")
    @classmethod
    def lower_username(cls, v: object) -> object:
        return v.lower() if isinstance(v, str) else v  # non-str falls through to string_type → 422

    @field_validator("username")
    @classmethod
    def username_not_reserved(cls, v: str) -> str:
        if v in RESERVED_USERNAMES:
            raise ValueError("username_reserved")
        return v

    @field_validator("email")  # after: lowercase only once EmailStr has validated it
    @classmethod
    def lower_email(cls, v: str) -> str:
        return v.lower()

    @field_validator("links", mode="before")
    @classmethod
    def normalize_links(cls, v: object) -> object:
        return [] if v is None else v

# Class for the backend  to return to the frontend (user information)
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    public_id: str
    name: str
    email: EmailStr
    username: str
    language: str

    profession: str | None
    summary: str | None
    phone: str | None
    address: str | None
    picture_url: str | None
    links: list[Link]

    has_password: bool
    github_connected: bool
    google_connected: bool

    created_at: datetime
    updated_at: datetime

# Class for the backend to return to the frontend (containg acess token and user information)
class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"]
    expires_in: int
    user: UserOut