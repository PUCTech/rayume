# job_postings can't record that the user applied, when, or with which resume

> Kind: `missing-schema`. Found: 2026-11-16 by hand while building `/jobs` on `feat/resume-editor-ux` (`3c5c6e2`).
> Blocks: moving `/jobs` off localStorage. The page works as a demo; nothing on the backend can serve it.

## What the code does

`frontend/app/app/data.ts` (`Posting`): each job carries `saved` (its `created_at`), plus `applied` (a day, `YYYY-MM-DD`) and `sent` (the id of the resume that went with the application). `frontend/app/jobs/jobs.tsx` marks a job as applied, corrects it, moves it back to saved, counts applications per week, and shows "Resume deleted" when the sent resume is gone. All of it lives in localStorage (`rayume:jobs`, `frontend/app/resumes/store.ts`).

## What the docs say

[`docs/database/README.md#job_postings`](../database/README.md#job_postings): title, company, url, description, keywords, timestamps. Nothing about applying. [`docs/backend/endpoints/job-postings.md`](../backend/endpoints/job-postings.md): the PATCH body takes `title`, `company`, `url`, `description` only.

## Proposed change

Two nullable columns on `job_postings`, in the schema's conventions:

- `applied_at timestamptz null`: when the user says they applied. Null means saved, not applied. The UI picks a day; the API stores it at the start of that day in the user's time zone (or keep it a `date`, if the team prefers: the UI never shows a time). Not in the future, not before `created_at`: checked by the API (`422`).
- `sent_resume_id uuid null references resumes(id) on delete set null`, with an index (every FK is indexed). The resume that went with the application. `resumes` has one row per version, so this points at the exact version that was sent, which is what the user wants to remember. `on delete set null`: deleting the resume keeps the application; the UI says "Resume deleted".
- A check: `sent_resume_id` is null when `applied_at` is null.

Endpoint changes (`docs/backend/endpoints/job-postings.md`):

- The JobPosting object gains `applied_at` (ISO 8601 or null) and `sent_resume` (`{ "public_id", "version", "title" }` or null; the resume's public id, never the uuid).
- `PATCH /job-postings/{public_id}` accepts `applied_at` and `sent_resume_id` (a resume `public_id`, plus optional `version`, default the current one). `404` when the resume isn't the user's; `422` for a date in the future or before `created_at`. Setting `applied_at` to null clears both (Move back to saved). Neither field triggers keyword re-extraction.
- `GET /job-postings` keeps `applied_at` in list items, so the counts (Saved, Applied, This week, Tailored) can be worked out on the client, as the page does now. Tailored needs `GET /resumes`' `job_posting_id`, which already exists.

When this lands, also update `docs/database/README.md` in the same PR, as the backend README asks.
