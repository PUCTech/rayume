# Templates

Table: `templates`. Written by the team, read-only through the API (seeded by migrations/scripts, no admin endpoints). No auth: the gallery is browsable before login.

## Template object

```json
{
  "slug": "classic-ats",
  "name": "Classic ATS",
  "preview_url": "https://storage.../signed",
  "tags": ["ats", "one-column", "minimal"],
  "created_at": "2026-11-06T18:25:00Z",
  "updated_at": "2026-11-06T18:25:00Z"
}
```

`tex_source` is never returned: it's our IP and of no use to the client. `preview_url` is the generic sample preview; previews with the user's data come from [`renders.md`](renders.md).

### GET /templates

| Param | In | Type | Rules |
|-------|----|------|-------|
| `q` | query | string | optional, case-insensitive match on `name` |
| `tag` | query | string | optional, repeatable (`?tag=ats&tag=minimal`); a template must have all of them |

- `200` `[Template]` ordered by `name`.

### GET /templates/{slug}

- `200` Template. `404`.
