"use client";

import { useSyncExternalStore } from "react";
import { master, resumes as seed, type Saved } from "./data";

// The resume list as this browser has it: the demo resumes, plus what's been created, duplicated, renamed
// or deleted here. The server and the first render see the demo list; the browser's copy takes over right
// after, and every page using it updates when another changes it (or another tab does, through "storage").
// shortcut: localStorage until the API serves GET/POST/PATCH/DELETE /resumes; swap list() and save() for it.
const KEY = "rayume:resumes";
let raw: string | null = null;
let cached: Saved[] = seed;

const read = () => {
  let now: string | null = null;
  try {
    now = localStorage.getItem(KEY);
  } catch {}
  if (now !== raw) {
    raw = now;
    try {
      const list = now ? (JSON.parse(now) as Saved[]) : seed;
      // a list kept before the master resume existed had a "main" resume (r3) in its place
      cached = list.some((r) => r.id === master.id) ? list : [master, ...list.filter((r) => r.id !== "r3")];
    } catch {
      cached = seed;
    }
  }
  return cached;
};

const subscribe = (on: () => void) => {
  window.addEventListener("storage", on);
  window.addEventListener(KEY, on);
  return () => {
    window.removeEventListener("storage", on);
    window.removeEventListener(KEY, on);
  };
};

export const useResumes = () => useSyncExternalStore(subscribe, read, () => seed);

export function save(list: Saved[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new Event(KEY));
}

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

// an edited resume moves to the top of "Last edited"
export const touch = (id: string) => save(read().map((r) => (r.id === id ? { ...r, updated: today() } : r)));
