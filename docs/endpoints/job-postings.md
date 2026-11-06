# Job postings

Table: `job_postings`. Jobs captured by the browser extension or pasted in the app (job tailoring).

## JobPosting object

```json
{
  "public_id": "Pq8sN2xTb4Ze",
  "title": "Senior Backend Engineer",
  "company": "Acme",
  "url": "https://jobs.acme.com/123",
  "description": "We are looking for...",
  "keywords": ["Python", "Kubernetes", "mentoring"],
  "created_at": "2026-11-06T18:25:00Z",
  "updated_at": "2026-11-06T18:25:00Z"
}
```

`keywords` is AI output, not user-editable.

### GET /job-postings

- `200` `[JobPosting]`, newest first. List items omit `description` to keep the payload small.

### POST /job-postings

Used by both the web app and the extension. Runs the AI keyword extraction (synchronous).

| Body field | Type | Rules |
|------------|------|-------|
| `title` | string | required, 1 to 200 |
| `company` | string | required, 1 to 200 |
| `url` | string \| null | optional, http(s) URL; null for pasted jobs |
| `description` | string | required, 1 to 20000 |

- `201` JobPosting. Logs `job_posting.created` and `ai.call`.
- `422`, `429`.
- `502` AI failed: nothing is saved.

Saving the same `url` twice creates two rows (no unique constraint in the schema).

### GET /job-postings/{public_id}

- `200` JobPosting with `description`. `404`.

### PATCH /job-postings/{public_id}

| Body field | Type | Rules |
|------------|------|-------|
| `title` | string | optional |
| `company` | string | optional |
| `url` | string \| null | optional |
| `description` | string | optional; when it changes, `keywords` are re-extracted |

- `200` JobPosting. `404`, `422`, `502` (on AI failure nothing is changed).

Existing resumes keep the content they were tailored with; only new generations see the edit.

### DELETE /job-postings/{public_id}

- `204`. Resumes tailored to it stay, with `job_posting_id` set to null (`on delete set null`).
- `404`.
