# Data layer

> Status: **draft**. Code: [`db.py`](../../../backend/src/backend/db.py), [`models.py`](../../../backend/src/backend/models.py), [`schemas.py`](../../../backend/src/backend/schemas.py).
> The tables themselves are specified in [`../../database/README.md`](../../database/README.md); this page explains how the code implements them.

## Contents

1. [Two meanings of "schema"](#two-meanings-of-schema)
2. [`db.py`: connection and Base](#dbpy-connection-and-base)
3. [`models.py`: the tables](#modelspy-the-tables)
4. [`schemas.py`: shapes at the boundaries](#schemaspy-shapes-at-the-boundaries)
5. [Recipes](#recipes)

## Two meanings of "schema"

The word is used for two different things, and the file names follow the FastAPI community habit rather than the database meaning:

| | Database schema | Pydantic "schemas" |
|---|---|---|
| Describes | Tables, columns, types, constraints | The shape of data crossing a boundary |
| Enforced by | Postgres | Python, before data is stored or sent |
| Lives in | **`models.py`** | **`schemas.py`** |

So the database schema is `models.py`. `schemas.py` exists for two boundaries Postgres can't guard:

**1. Inside jsonb columns.** To Postgres, a `jsonb` column is "some JSON". This is stored without complaint:

```python
Experience(..., data={"titel": "Dev", "start": "last year", "bullets": 42})
```

`models.py` only says `data: Mapped[dict]`. The Pydantic class says what must be inside:

```python
data = ExperienceData.model_validate(ai_output)  # raises on a bad shape
experience.data = data.model_dump()              # only valid data is stored
```

This matters most for AI output, which is sometimes malformed: the database docs require it to be validated before saving, and the [threat model](../../security/README.md) requires a `502` with nothing saved when it isn't.

| Column | Validated by |
|--------|--------------|
| `experiences.data` | `ExperienceData` |
| `resumes.content` | `ResumeContent` (`ResumeProfile` + a list of `ResumeEntry`) |
| `users.links` | `list[Link]` |
| `job_postings.keywords` | `list[str]` (inline, no class needed) |

**2. HTTP bodies.** What a route accepts and returns is never the raw table. `UserOut` will drop `id` and `password_hash`; `ExperienceCreate` will cap `raw_text` at 5000 characters. These classes are added to `schemas.py` in the PR that adds their route.

```
models.py   the column "data" exists and is jsonb           outer shape, enforced by Postgres
schemas.py  "data" holds title, start=YYYY-MM, bullets[]    inner shape, enforced by Pydantic
```

## `db.py`: connection and Base

| Name | What it is |
|------|------------|
| `settings` | Configuration read from the environment and `backend/.env`. See [`configuration.md`](configuration.md) |
| `engine` | The connection pool to Postgres. Created once; connects lazily on the first query |
| `Base` | Every model inherits from it. `Base.metadata` is the collection of all tables |
| `get_db` | A FastAPI dependency: one `Session` per request, closed when the request ends |

`Base.type_annotation_map` applies the team's column conventions in one place: every `str` becomes `text` and every `datetime` becomes `timestamptz`.

Routes get a session like this:

```python
@app.get("/experiences")
def list_experiences(db: Annotated[Session, Depends(get_db)]):
    return db.scalars(select(Experience).order_by(Experience.position)).all()
```

## `models.py`: the tables

One class per table, in the order of the database docs.

**Annotations are columns.** The type decides the SQL type and whether it's nullable:

```python
name: Mapped[str]               # text NOT NULL
profession: Mapped[str | None]  # text, nullable
```

`mapped_column(...)` adds everything else: `primary_key`, `unique`, `index`, `ForeignKey`, defaults, and types the annotation can't express (`JSONB`, `ARRAY`, `INET`, named enums).

**`default` vs `server_default`:**

| | Runs in | Used for |
|---|---|---|
| `default=new_public_id` | Python, when SQLAlchemy inserts | `id`, `public_id`, `version`, render `status` |
| `server_default=func.now()` | Postgres, on any insert (also raw SQL) | timestamps, `language`, `tags` |

**Mixins** hold the columns every table repeats:

| Mixin | Adds | Used by |
|-------|------|---------|
| `Id` | `id uuid` primary key | (base of the others) |
| `Created` | + `created_at` | `refresh_tokens`, `logs` (append-only) |
| `Timestamps` | + `updated_at`, refreshed on every update | every other table |

**Enums** are Python `StrEnum`s mapped to named Postgres enum types (`experience_type`, `render_kind`, `render_status`, `log_level`), so an invalid value fails in the database too.

**Multi-column rules** go in `__table_args__`: `unique (public_id, version)` on `resumes`, the render queue index, the `logs` indexes, and the case-insensitive username index.

> Use `text("lower(username)")` for expression indexes. `func.lower("username")` looks the same but lowercases the *string* `'username'`, giving every row the same value.

**`public_id`** is `secrets.token_urlsafe(9)`: 12 URL-safe random characters from the standard library. The uuid `id` never leaves the backend.

**Not modelled yet:** `relationship()` attributes (`user.experiences`, `resume.template`). Foreign key columns are enough to query; add a relationship when a route needs to navigate between objects.

## `schemas.py`: shapes at the boundaries

Validation rules come from the endpoint docs:

| Rule | Where |
|------|-------|
| `start` / `end` are `YYYY-MM`; `end: null` means current | `YearMonth` |
| link `label` 1 to 40 characters, `url` a real http(s) URL | `Link` |
| a resume entry is an experience plus its `type` | `ResumeEntry(ExperienceData)` |

When a Pydantic class is built from an ORM object (response bodies), it needs `model_config = ConfigDict(from_attributes=True)` so it reads attributes instead of dict keys.

## Recipes

**Add a column:** add the annotated attribute to the model, update [`../../database/README.md`](../../database/README.md) in the same PR, and add it to the response schema if the API returns it.

**Add a table:** a new class inheriting `Timestamps` (or `Created` if rows never change) and `Base`, with `__tablename__` in plural snake_case and `index=True` on every foreign key.

**Create the tables:** there are no migrations yet. Until Alembic is added, `Base.metadata.create_all(engine)` creates missing tables (it never alters existing ones). Don't rely on it once real data exists.
