// Lucas Mendes's resumes, shaped like the API's Resume objects (docs/backend/endpoints/resumes.md).
// template is the slug, which is also the basename of its render in public/resumes/. job is the posting a
// resume was tailored to (job_posting_id, see app/data.ts postings); company is its name and logo, for the card.
// The Master Resume is the experiences table rendered whole (docs/backend/endpoints/experiences.md), not a
// row in resumes; it sits in this list with id "master" so the pages can treat it like the others.
// shortcut: static, and every card shows its template's demo render; swap for GET /experiences, GET /resumes
// and each resume's own PDF once the API serves them.
export type Saved = {
  id: string;
  title: string;
  template: string;
  job?: string;
  company?: { name: string; logo: string };
  updated: string;
};

// Classic for everyone: the schema has no preferred template for the master
// dated before every demo resume, so none starts out of date with it
export const master: Saved = { id: "master", title: "Master resume", template: "classic", updated: "2026-10-01" };

export const resumes: Saved[] = [
  master,
  { id: "r1", title: "Orbita, Full Stack Engineer", template: "jake", job: "orbita", company: { name: "Orbita", logo: "orbita" }, updated: "2026-11-09" },
  { id: "r2", title: "Vela Pay, Backend Engineer", template: "moderncv", job: "vela", company: { name: "Vela Pay", logo: "vela" }, updated: "2026-11-04" },
  { id: "r4", title: "Nimbo, Frontend Developer", template: "modern", job: "nimbo", company: { name: "Nimbo", logo: "nimbo" }, updated: "2026-11-01" },
  { id: "r5", title: "Pacto, Software Engineer", template: "awesome", job: "pacto", company: { name: "Pacto", logo: "pacto" }, updated: "2026-10-24" },
  { id: "r6", title: "Two columns, design-heavy roles", template: "altacv", updated: "2026-10-15" },
];
