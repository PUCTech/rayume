"""Pydantic shapes for the jsonb columns, from docs/endpoints/.

Request and response bodies get added next to the routes that use them.
"""

from typing import Annotated

from pydantic import BaseModel, Field, HttpUrl

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
