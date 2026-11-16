from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .routers import templates, auth

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

app.include_router(templates.router)

app.include_router(auth.router)

@app.get("/health")
def health():
    return {"ok": True}
