"""Loads the frontend's template gallery into the templates table. Safe to re-run.

Run from backend/: uv run python -m backend.seed
"""

from pathlib import Path

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from .db import engine
from .models import Template

RESUMES = Path(__file__).parents[3] / "frontend" / "resumes"

# mirrors frontend/app/templates/data.ts; its author, license and abstract have no column yet (open team question)
TEMPLATES = [
    ("classic", "Classic", ["one-column", "rayume"]),
    ("jake", "Jake's Resume", ["one-column", "overleaf"]),
    ("awesome", "Awesome CV", ["one-column", "overleaf"]),
    ("altacv", "AltaCV", ["two-column", "overleaf"]),
    ("moderncv", "moderncv", ["one-column", "overleaf"]),
    ("modern", "Modern", ["one-column", "rayume"]),
]


def main():
    rows = [
        {
            "slug": slug,
            "name": name,
            "tags": tags,
            # shortcut: stored as-is, so its \input{common} / \input{body} still need frontend/resumes/ to compile
            "tex_source": (RESUMES / f"{slug}.tex").read_text(),
            # shortcut: served by the Next.js app from public/, move to object storage once renders exist
            "preview_url": f"/resumes/{slug}.png",
        }
        for slug, name, tags in TEMPLATES
    ]
    stmt = insert(Template)
    stmt = stmt.on_conflict_do_update(
        index_elements=["slug"],
        set_={c: stmt.excluded[c] for c in ("name", "tags", "tex_source", "preview_url")} | {"updated_at": func.now()},
    )
    with Session(engine) as db, db.begin():
        db.execute(stmt, rows)
    print(f"seeded {len(rows)} templates")


if __name__ == "__main__":
    main()
