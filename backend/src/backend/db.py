from datetime import datetime
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import DateTime, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Session


class Settings(BaseSettings):
    # backend/.env, found from this file so it works whatever folder you run from
    model_config = SettingsConfigDict(env_file=Path(__file__).parents[2] / ".env")

    database_url: str
    # frontend origins allowed by CORS; in env as JSON: CORS_ORIGINS='["https://rayume.app"]'
    cors_origins: list[str] = ["http://localhost:3000"]


settings = Settings()
engine = create_engine(settings.database_url)


class Base(DeclarativeBase):
    # team convention: every str is `text`, every timestamp is `timestamptz`
    type_annotation_map = {str: Text, datetime: DateTime(timezone=True)}


def get_db():
    with Session(engine) as session:
        yield session
