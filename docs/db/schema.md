# Database Schema

> AI-oriented. PostgreSQL via SQLAlchemy 2 + psycopg 3. Status: **proposed**, not yet implemented.
> Product context: [`../PROJECT.md`](../PROJECT.md).

## Diagram

```mermaid
erDiagram
  USERS ||--o{ EXPERIENCES : has
  USERS ||--o{ RESUMES : owns
  TEMPLATES ||--o{ RESUMES : renders

  USERS {
    uuid id PK
    text email UK
    text name
    text profession
    text summary
    text phone
    text address
    text picture_url
    text language
    jsonb links
    timestamptz created_at
  }

  EXPERIENCES {
    uuid id PK
    uuid user_id FK
    experience_type type
    text raw_text
    jsonb data
    int position
    timestamptz created_at
  }

  RESUMES {
    uuid id PK
    uuid user_id FK
    uuid template_id FK
    text title
    text job_description
    jsonb content
    text pdf_url
    timestamptz created_at
  }

  TEMPLATES {
    uuid id PK
    text name
    text tex_source
    text preview_url
    text[] tags
  }
```

`experience_type` enum: `professional | education | project | certification | volunteering`

## Tables

### users
The Master Resume owner. One row per person.
- `email` is unique.
- `phone` is **text**, not int, so it keeps the leading `+` and zeros.
- `summary` holds the "about me" text. It is **not** an experience.
- `language` is the UI preference: `en` | `pt-BR`.
- `links` is a JSON array: `[{ "label": "GitHub", "url": "https://..." }]`. This replaces a separate socials table.
- `picture_url` points to object storage; the file is never stored in the DB.
- No `age` column, on purpose: resumes shouldn't carry it (risk of age discrimination).

### experiences
Every entry of the Master Resume: jobs, education, projects, certifications, volunteering.
- `raw_text` is what the user typed, kept as is.
- `data` is the AI's **structured output**, validated by a Pydantic schema in the backend (title, organization, start/end, location, bullets, hard_skills, soft_skills). Templates render from `data`, never from `raw_text`.
- `position` sets the order within a user's list.

### resumes
A generated resume: the Master Resume tailored to one job and rendered with one template.
- `job_description` is the tailoring input (pasted in the app or captured by the extension). It can be null for a generic resume.
- `content` is the final template-ready JSON produced by the AI. Rendering it with a different template doesn't need a new AI call.
- `pdf_url` points to the compiled PDF in object storage.

### templates
The LaTeX template gallery. Templates are written by the team, not uploaded by users.
- `tags` power the gallery search.
- Alternative under consideration: keep templates as files in the repo with a manifest, and store a `template` slug on `resumes` instead of a foreign key.

## Not in this schema
- **Auth tables** (`accounts`, `sessions`, for the GitHub/Google OAuth providers) come from the auth library we pick. Don't design them by hand.
- **Logs**: they go to application logging, not the DB.
- Future (non-MVP) features such as scoring, jobs or billing get no tables until they're in scope.
