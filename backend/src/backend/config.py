from pathlib import Path
from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # backend/.env, found from this file so it works whatever folder you run from
    model_config = SettingsConfigDict(env_file=Path(__file__).parents[2] / ".env")

    database_url: str
    # frontend origins allowed by CORS; in env as JSON: CORS_ORIGINS='["https://rayume.app"]'
    cors_origins: list[str] = ["http://localhost:3000"]
    jwt_secret: str = Field(min_length=32)
    access_token_ttl_seconds: int = 900 # 15 minutes
    refresh_token_ttl_days: int = 30
    # signing algorithm; the decoder only accepts this one, never the token's own `alg`
    jwt_algorithm: Literal["HS256", "HS384", "HS512"] = "HS256"
    # `iss` claim: who issued the token
    jwt_issuer: str = "rayume"
    # `aud` claim: which API the token is for
    jwt_audience: str = "rayume-api"
    # GitHub OAuth app (docs/backend/endpoints/auth.md); empty until set in backend/.env
    github_client_id: str = ""
    github_client_secret: str = ""


settings = Settings()

