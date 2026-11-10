"use client";

import { useSyncExternalStore } from "react";

// The page search shared by the nav and the page that owns it (the templates grid). A page enables it
// while mounted; then Cmd/Ctrl+K turns the nav into a search field bound to the same query, unless
// the page's own search bar is in view (barVisible), which takes the shortcut instead.
type Search = { enabled: boolean; open: boolean; query: string; barVisible: boolean };

const closed: Search = { enabled: false, open: false, query: "", barVisible: false };
let state = closed;
const listeners = new Set<() => void>();

export function setSearch(patch: Partial<Search>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

// for key handlers, which need the state at the moment of the keypress
export const getSearch = () => state;

export function resetSearch() {
  setSearch(closed);
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export const useSearch = () => useSyncExternalStore(subscribe, () => state, () => closed);
