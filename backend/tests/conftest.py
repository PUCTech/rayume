import os

# Settings require a JWT secret; tests shouldn't depend on one being in backend/.env
os.environ.setdefault("JWT_SECRET", "test-secret-" + "x" * 32)
