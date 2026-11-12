import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from backend.db import engine, get_db
from backend.main import app
from backend.models import Template


@pytest.fixture
def client():
    # everything runs in one transaction that's rolled back, so the dev database is left as it was
    with engine.connect() as conn, conn.begin() as trans:
        db = Session(bind=conn, join_transaction_mode="create_savepoint")
        db.add_all(
            Template(slug=slug, name=name, tags=tags, tex_source=rf"\documentclass{{article}} % {slug}")
            for slug, name, tags in [
                ("zz-gamma", "Zz Gamma", ["one-column"]),
                ("zz-alpha", "Zz Alpha", ["one-column", "ats"]),
                ("zz-beta", "Zz Beta", ["two-column", "ats"]),
            ]
        )
        db.flush()
        app.dependency_overrides[get_db] = lambda: db
        yield TestClient(app)
        app.dependency_overrides.clear()
        trans.rollback()


def slugs(res):
    assert res.status_code == 200
    return [t["slug"] for t in res.json()]


def test_list_is_ordered_by_name_without_tex_source(client):
    res = client.get("/templates", params={"q": "zz"})
    assert slugs(res) == ["zz-alpha", "zz-beta", "zz-gamma"]
    assert "tex_source" not in res.json()[0]


def test_q_is_case_insensitive(client):
    assert slugs(client.get("/templates", params={"q": "ZZ ALP"})) == ["zz-alpha"]


def test_q_wildcards_match_literally(client):
    assert slugs(client.get("/templates", params={"q": "z%a"})) == []


def test_repeated_tags_must_all_match(client):
    assert slugs(client.get("/templates", params={"q": "zz", "tag": "ats"})) == ["zz-alpha", "zz-beta"]
    assert slugs(client.get("/templates", params={"q": "zz", "tag": ["ats", "one-column"]})) == ["zz-alpha"]


def test_detail_includes_tex_source(client):
    res = client.get("/templates/zz-beta")
    assert res.status_code == 200
    assert res.json()["tex_source"].endswith("zz-beta")
    assert {"slug", "name", "preview_url", "tags", "created_at", "updated_at"} <= res.json().keys()


def test_unknown_slug_is_404(client):
    assert client.get("/templates/nope").status_code == 404
