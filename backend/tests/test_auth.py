from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from backend.db import engine, get_db
from backend.main import app
from backend.models import Log, RefreshToken, User
from backend.security import decode_access_token

EMAIL = "zz-auth@example.com"
PASSWORD = "hunter2hunter2"


@pytest.fixture
def db():
    # everything runs in one transaction that's rolled back; the routes' commits only release savepoints
    with engine.connect() as conn, conn.begin() as trans:
        db = Session(bind=conn, join_transaction_mode="create_savepoint")
        app.dependency_overrides[get_db] = lambda: db
        yield db
        app.dependency_overrides.clear()
        trans.rollback()


@pytest.fixture
def client(db):
    # https, or the client won't keep the Secure refresh cookie; a real IP, since logs.ip is inet
    return TestClient(app, base_url="https://testserver", client=("127.0.0.1", 50000))


def register(client, **overrides):
    body = {"email": EMAIL, "password": PASSWORD, "username": "zz_auth", "name": "Zz Auth"} | overrides
    return client.post("/auth/register", json=body)


def login(client, email=EMAIL, password=PASSWORD):
    return client.post("/auth/login", json={"email": email, "password": password})


def refresh(client, token):
    client.cookies.clear()  # send exactly this token, not whatever the jar holds
    return client.post("/auth/refresh", headers={"Cookie": f"refresh_token={token}"})


def events(db, event):
    return db.scalars(select(Log).where(Log.event == event)).all()


def cleared(res):
    return 'refresh_token=""' in res.headers["set-cookie"] and "Max-Age=0" in res.headers["set-cookie"]


def test_register_logs_in_and_lowercases(client, db):
    res = register(client, email="ZZ-Auth@Example.com", username="Zz_Auth")
    assert res.status_code == 201
    body = res.json()
    assert body["token_type"] == "bearer"
    assert body["user"]["username"] == "zz_auth"
    assert decode_access_token(body["access_token"])["sub"] == body["user"]["public_id"]
    assert db.scalar(select(User.email).where(User.username == "zz_auth")) == EMAIL
    assert res.cookies["refresh_token"]
    assert len(events(db, "auth.login")) == 1


def test_register_rejects_taken_email_and_username(client):
    assert register(client).status_code == 201
    assert register(client, username="zz_other").json() == {"detail": "email_taken"}
    res = register(client, email="zz-other@example.com", username="ZZ_AUTH")
    assert res.status_code == 409
    assert res.json() == {"detail": "username_taken"}


def test_register_validates_body(client):
    assert register(client, password="short").status_code == 422
    assert register(client, username="no spaces").status_code == 422


def test_login_sets_refresh_cookie(client, db):
    register(client)
    res = login(client, email=EMAIL.upper())
    assert res.status_code == 200
    cookie = res.headers["set-cookie"]
    for attr in ("HttpOnly", "Secure", "Path=/auth", "SameSite=lax"):
        assert attr in cookie
    assert len(events(db, "auth.login")) == 2  # register + login


@pytest.mark.parametrize("email, password", [(EMAIL, "wrong-password"), ("zz-nobody@example.com", PASSWORD)])
def test_login_failures_look_the_same(client, db, email, password):
    register(client)
    res = login(client, email, password)
    assert res.status_code == 401
    assert res.json() == {"detail": "invalid_credentials"}
    assert "set-cookie" not in res.headers
    [log] = events(db, "auth.login_failed")
    assert (log.user_id is None) == (email != EMAIL)


def test_login_rejects_disabled_user(client, db):
    register(client)
    db.execute(update(User).where(User.email == EMAIL).values(disabled_at=datetime.now(timezone.utc)))
    assert login(client).status_code == 401


def test_refresh_rotates_the_token(client, db):
    r1 = register(client).cookies["refresh_token"]
    res = refresh(client, r1)
    assert res.status_code == 200
    r2 = res.cookies["refresh_token"]
    assert r2 != r1
    assert refresh(client, r2).status_code == 200
    # the whole chain is one family with one deadline
    tokens = db.scalars(select(RefreshToken)).all()
    assert len({t.family_id for t in tokens}) == 1
    assert len({t.expires_at for t in tokens}) == 1


def test_reusing_a_rotated_token_revokes_the_family(client, db):
    r1 = register(client).cookies["refresh_token"]
    r2 = refresh(client, r1).cookies["refresh_token"]
    res = refresh(client, r1)
    assert res.status_code == 401
    assert cleared(res)
    assert len(events(db, "auth.refresh_reuse_detected")) == 1
    assert refresh(client, r2).status_code == 401  # the legit holder is logged out too


def test_refresh_rejects_missing_unknown_and_expired(client, db):
    client.cookies.clear()
    assert client.post("/auth/refresh").status_code == 401
    assert cleared(refresh(client, "not-a-real-token"))

    r1 = register(client).cookies["refresh_token"]
    db.execute(update(RefreshToken).values(expires_at=datetime.now(timezone.utc) - timedelta(seconds=1)))
    assert refresh(client, r1).status_code == 401


def test_refresh_rejects_disabled_user(client, db):
    r1 = register(client).cookies["refresh_token"]
    db.execute(update(User).where(User.email == EMAIL).values(disabled_at=datetime.now(timezone.utc)))
    assert refresh(client, r1).status_code == 401


def test_logout_revokes_only_its_family(client, db):
    r1 = register(client).cookies["refresh_token"]
    other_device = login(client).cookies["refresh_token"]
    client.cookies.clear()
    res = client.post("/auth/logout", headers={"Cookie": f"refresh_token={r1}"})
    assert res.status_code == 204
    assert cleared(res)
    assert len(events(db, "auth.logout")) == 1
    assert refresh(client, r1).status_code == 401
    assert refresh(client, other_device).status_code == 200


def test_logout_without_cookie_is_204(client):
    client.cookies.clear()
    assert client.post("/auth/logout").status_code == 204
