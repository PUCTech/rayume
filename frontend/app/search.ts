"use client";

import { useSyncExternalStore } from "react";

// The page search shared by the nav and the page that owns it (the templates grid). A page enables it
// while mounted; then Cmd/Ctrl+K turns the nav into a search field bound to the same query.
type Search = { enabled: boolean; open: boolean; query: string };

const closed: Search = { enabled: false, open: false, query: "" };
let state = closed;
const listeners = new Set<() => void>();

export function setSearch(patch: Partial<Search>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function resetSearch() {
  setSearch(closed);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const useSearch = () => useSyncExternalStore(subscribe, () => state, () => closed);
