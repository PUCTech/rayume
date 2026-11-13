# Templates

Table: `templates`. Written by the team, read-only through the API (seeded by migrations/scripts, no admin endpoints). No auth: the gallery is browsable before login.

## Template object

> **Built without `author` and `license`:** the `templates` table has no columns for them yet. Whether to add them is an open team question; until then the API leaves them out.

```json
{
  "slug": "classic-ats",
  "name": "Classic ATS",
  "preview_url": "https://storage.../signed",
  "tags": ["ats", "one-column", "minimal"],
  "author": "Rayume",
  "license": "MIT",
  "created_at": "2026-11-06T18:25:00Z",
  "updated_at": "2026-11-06T18:25:00Z"
}
```

Every template is open source (ours are MIT, the Overleaf ones keep their own licenses), so `GET /templates/{slug}` includes `tex_source`: the template page shows it and lets people edit and re-render it. `preview_url` is the generic sample preview; previews with the user's data come from [`renders.md`](renders.md).

### GET /templates

| Param | In | Type | Rules |
|-------|----|------|-------|
| `q` | query | string | optional, case-insensitive match on `name` |
| `tag` | query | string | optional, repeatable (`?tag=ats&tag=minimal`); a template must have all of them |

- `200` `[Template]` ordered by `name`.

### GET /templates/{slug}

- `200` Template. `404`.
