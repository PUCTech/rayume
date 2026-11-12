from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import settings

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
