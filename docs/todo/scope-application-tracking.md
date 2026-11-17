# Application tracking (/jobs) and the tailoring review are not in the MVP list

> Kind: `scope`. Found: 2026-11-16 by hand while building `/jobs` on `feat/resume-editor-ux` (`3c5c6e2`).
> Blocks: building the backend for it. The team should confirm it as part of the MVP or cut it.

## What the code does

`frontend/app/jobs/`: a signed-in page listing the user's own saved jobs and the ones they applied to, with the resume tailored to or sent with each, the dates, and four counts (Saved, Applied, This week, Tailored). A job opens in a dialog with its description beside its resume. A localStorage demo.

## What the docs say

[`docs/PROJECT.md#mvp-features-in-scope`](../PROJECT.md#mvp-features-in-scope): job tailoring captures a job description and generates a tailored resume. Tracking applications isn't on the MVP list. It isn't on the out-of-scope list either (job board, recruiter tools, ATS scoring, scrapers and alerts, auto-apply).

## Proposed change

Decide one of:

A) Add it to the MVP list as part of feature 3 ("Job tailoring"): the saved jobs are already rows in `job_postings`, so listing them is free; recording the application needs the columns in [`missing-schema-job-applications.md`](missing-schema-job-applications.md).

B) Cut it back to a plain list of saved jobs (no applied state, no counts), which the current schema can serve.

Either way the page stays a notebook of the user's own jobs: it never lists a job they didn't save, never fetches the posting's link, never scores a resume against a job (the job dialog shows the requirements as plain chips, with no coverage figure), never applies. Things not built and to stay out unless the team decides otherwise: an interview and offer pipeline, reminders, a match score, importing from job sites.

## The tailoring review

The planned "Tailor a resume" flow (a loading screen, then Rayume's chat proposing changes one bullet at a time to accept or skip) is a demo of `POST /resumes` with `job_posting_id`. As written, [`docs/backend/endpoints/resumes.md#post-resumes`](../backend/endpoints/resumes.md#post-resumes) returns a finished resume (version 1) and has no review step. A review needs the API to return per-bullet proposals, each with the id of the bullet it rewrites, its before and after text and the keywords it uses, before anything is saved; accepting them then saves a version. That's a real mismatch for the team to decide: keep the endpoint as is (no review, the user edits afterwards) or add a proposals response (and say what is saved, and when).
