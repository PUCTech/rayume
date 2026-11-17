"use client";

import { useSyncExternalStore } from "react";
import { master, resumes as seed, type Saved } from "./data";
import { postings, profile, type Posting } from "../app/data";
import { blank, type Doc } from "./tex";
import type { Reply } from "../app/chat";

// A list as this browser has it: the demo list, plus what's been changed here. The server and the first
// render see the demo list; the browser's copy takes over right after, and every page using it updates when
// another changes it (or another tab does, through "storage"). fix() checks what was kept and fixes it up;
// it throws on garbage, and then the demo list stands in.
function stored<T>(key: string, seed: T, fix: (kept: T) => T) {
  let raw: string | null = null;
  let cached = seed;
  const read = () => {
    let now: string | null = null;
    try {
      now = localStorage.getItem(key);
    } catch {}
    if (now !== raw) {
      raw = now;
      try {
        cached = now ? fix(JSON.parse(now) as T) : seed;
      } catch {
        cached = seed;
      }
    }
    return cached;
  };
  const subscribe = (on: () => void) => {
    window.addEventListener("storage", on);
    window.addEventListener(key, on);
    return () => {
      window.removeEventListener("storage", on);
      window.removeEventListener(key, on);
    };
  };
  const save = (value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
    window.dispatchEvent(new Event(key));
  };
  return { read, save, use: () => useSyncExternalStore(subscribe, read, () => seed) };
}

// The resumes: the demo ones plus what's been created, duplicated, renamed or deleted here.
// shortcut: localStorage until the API serves GET/POST/PATCH/DELETE /resumes; swap list() and save() for it.
// A list kept before the demo jobs became real companies names logos that are gone: those resumes keep
// their title and lose the logo.
const logos = new Set(postings.map((p) => p.logo));
const resumes = stored<Saved[]>("rayume:resumes", seed, (kept) => {
  const list = kept.map(({ company, ...r }) => (company && !logos.has(company.logo) ? r : { ...r, company }));
  // a list kept before the master resume existed had a "main" resume (r3) in its place
  return list.some((r) => r.id === master.id) ? list : [master, ...list.filter((r) => r.id !== "r3")];
});
const read = resumes.read;
export const useResumes = resumes.use;
export const save = resumes.save;

// The jobs: the demo postings plus what's been saved, edited, applied to or removed on /jobs.
// shortcut: localStorage until the API serves GET/POST/PATCH/DELETE /job-postings, and the applied date and
// the resume sent, which the schema can't hold yet (docs/todo/missing-schema-job-applications.md).
const jobs = stored<Posting[]>("rayume:jobs", postings, (list) => {
  if (!list.every((p) => typeof p.id === "string" && typeof p.title === "string" && typeof p.company === "string" && typeof p.saved === "string")) throw list;
  // a job kept without keywords is still a posting the editor and the chat can read
  return list.map((p) => ({ ...p, keywords: p.keywords ?? [], missing: p.missing ?? [] }));
});
export const useJobs = jobs.use;
export const saveJobs = jobs.save;
export const readJobs = jobs.read;

// You, as GET /me returns you: what Personal information edits. It's yours, not a resume's: a resume keeps the
// contact details it was made with (each version is a snapshot), as PATCH /me leaves saved resumes alone.
// shortcut: localStorage until the API serves GET/PATCH /me; the email changes nowhere (the API can't yet).
export type Me = { name: string; username: string; email: string; profession: string; phone: string; address: string; language: "en" | "pt-BR" };
const me = stored<Me>("rayume:me", { name: profile.name, username: "lucasmendes", email: profile.email, profession: profile.profession, phone: profile.phone, address: profile.address, language: "en" }, (kept) => {
  if (typeof kept.name !== "string" || typeof kept.username !== "string") throw kept;
  return kept;
});
export const useMe = me.use;
export const saveMe = me.save;

// the full time, not just the day: "changed since" compares two edits that can fall on the same day
export const today = () => new Date().toISOString();
export const newId = () => `r${Date.now()}`;

// each resume's changes, kept by the editor; a new resume starts from a copy of the master's
export const editsOf = (id: string) => `rayume:edits:${id}`;
export const copyEdits = (from: string, to: string) => {
  try {
    const d = localStorage.getItem(editsOf(from));
    if (d) localStorage.setItem(editsOf(to), d);
  } catch {}
};

// the changes this browser kept for a resume, or none; only read in the browser (see Open), and kept again
// by whichever page changes them: the master's editor and the experience settings write the same ones
// shortcut: two tabs open on the master overwrite each other's changes; the API's PATCH /experiences ends that.
export const kept = (id: string): Doc => {
  try {
    const d = JSON.parse(localStorage.getItem(editsOf(id)) ?? "null") as Doc | null;
    const some = (o?: object) => !!o && Object.values(o).some(Boolean);
    if (d && (some(d.bullets) || some(d.runs) || d.added.length || d.projects?.length || d.jobs?.length || some(d.links) || some(d.setup))) return d;
  } catch {}
  return blank;
};
export const keep = (id: string, d: Doc) => {
  try {
    localStorage.setItem(editsOf(id), JSON.stringify(d));
  } catch {}
};

// A tailoring's review, per resume: Rayume's opening (its summary and proposals, kept as the API would return
// them, so a reload shows the same ones) and what was done with each. No opening means it hasn't run, and
// coming back shows the loading screen; with one, it shows the chat.
// shortcut: localStorage until POST /resumes with job_posting_id returns the proposals.
export type Review = { opening?: Reply; decided: Record<string, "accepted" | "skipped"> };
const reviewOf = (id: string) => `rayume:tailor:${id}`;
export const review = (id: string): Review => {
  try {
    const r = JSON.parse(localStorage.getItem(reviewOf(id)) ?? "null") as Review | null;
    if (r && typeof r.decided === "object" && r.decided && (!r.opening || typeof r.opening.text === "string")) return r;
  } catch {}
  return { decided: {} };
};
export const keepReview = (id: string, r: Review) => {
  try {
    localStorage.setItem(reviewOf(id), JSON.stringify(r));
  } catch {}
};

// an edited resume moves to the top of "Last edited"
export const touch = (id: string) => save(read().map((r) => (r.id === id ? { ...r, updated: today() } : r)));
// a renamed resume moves to the top of "Last edited" too
export const rename = (id: string, title: string) => save(read().map((r) => (r.id === id ? { ...r, title, updated: today() } : r)));
