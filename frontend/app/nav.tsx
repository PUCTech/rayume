"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mark } from "./logo";
import { setSearch, useSearch } from "./search";

const links = [
  ["How it works", "/#how"],
  ["Templates", "/templates"],
  ["Why Rayume", "/#why"],
];

const ease = "duration-300 ease-out";

// Floating glass nav. A sustained scroll down shrinks it to the mark, the links and "Start free";
// a deliberate scroll back up (or reaching the top) brings back the wordmark and "Sign in".
// On a page with a search (the templates grid), Cmd/Ctrl+K turns the pill, at its current size, into that search.
export function Nav({ serif }: { serif: string }) {
  const [compact, setCompact] = useState(false);
  const search = useSearch();
  const searching = search.enabled && search.open;
  const close = () => setSearch({ open: false });
  // the nav's own content fades out under the search; inert so Tab can't reach it meanwhile
  const hide = searching ? "pointer-events-none opacity-0" : "opacity-100";

  useEffect(() => {
    if (!search.enabled) return;
    const onKey = (e: KeyboardEvent) => {
      // an open template drawer owns the keyboard
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !document.querySelector("[aria-modal=true]")) {
        e.preventDefault();
        setSearch({ open: true });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [search.enabled]);

  useEffect(() => {
    let compacted = false;
    let anchor = window.scrollY; // where the current scroll direction started
    let last = anchor;
    const onScroll = () => {
      const y = window.scrollY;
      if (y === last) return;
      if ((y > last) !== (last > anchor)) anchor = last; // direction flipped
      last = y;
      // hysteresis: small flicks either way don't toggle it
      if (!compacted && y > 160 && y - anchor > 32) compacted = true;
      else if (compacted && (y < 80 || anchor - y > 120)) compacted = false;
      setCompact(compacted);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-3 z-40 px-4">
      <nav
        aria-label="Main"
        className={`glass mx-auto flex items-center justify-between rounded-full py-2 pr-2 transition-[max-width,padding,background-color] ${ease} ${
          compact ? "max-w-44 bg-paper/75! pl-4 md:max-w-[33rem]" : "max-w-6xl pl-5"
        }`}
      >
        <Link href="/" inert={searching} className={`inline-flex items-center transition-opacity ${ease} ${hide}`} aria-label="Rayume home">
          <Mark className="h-6 w-auto" />
          <span
            className={`${serif} overflow-hidden whitespace-nowrap text-[22px] leading-none transition-all ${ease} ${
              compact ? "ml-0 max-w-0 opacity-0" : "ml-2 max-w-28 opacity-100"
            }`}
          >
            Rayume
          </span>
        </Link>
        <div inert={searching} className={`hidden items-center text-sm transition-opacity md:flex ${ease} ${hide}`}>
          {links.map(([label, href]) => (
            <a key={label} href={href} className="rounded-full px-4 py-2 text-ink/70 transition hover:bg-white/50 hover:text-ink">
              {label}
            </a>
          ))}
        </div>
        <div inert={searching} className={`flex items-center text-sm transition-opacity ${ease} ${hide}`}>
          <Link
            href="/login"
            tabIndex={compact ? -1 : undefined}
            className={`hidden overflow-hidden whitespace-nowrap rounded-full py-2 transition-all hover:bg-white/50 sm:inline-block ${ease} ${
              compact ? "max-w-0 px-0 opacity-0" : "mr-1 max-w-24 px-4 opacity-100"
            }`}
          >
            Sign in
          </Link>
          <Link href="/signup" className="whitespace-nowrap rounded-full bg-ink px-4 py-2 font-medium text-white transition hover:bg-ink/85">
            Start free
          </Link>
        </div>

        {searching && (
          <div role="search" className="absolute inset-0 flex items-center gap-3 rounded-full pl-5 pr-2 transition-opacity duration-300 ease-out starting:opacity-0">
            <svg aria-hidden viewBox="0 0 20 20" className="size-5 shrink-0 text-ink/45" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m13 13 4 4" />
            </svg>
            <label htmlFor="nav-search" className="sr-only">
              Search templates
            </label>
            <input
              id="nav-search"
              type="search"
              autoFocus
              value={search.query}
              onChange={(e) => setSearch({ query: e.target.value })}
              onKeyDown={(e) => e.key === "Escape" && close()}
              // clicking away with nothing typed gives the nav back
              onBlur={() => !search.query && close()}
              placeholder="Search templates"
              className="min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none placeholder:text-ink/45 [&::-webkit-search-cancel-button]:hidden"
            />
            <button
              type="button"
              onClick={close}
              aria-label="Close search"
              className="shrink-0 rounded-full px-3 py-2 text-xs font-medium text-ink/55 transition hover:bg-white/50 hover:text-ink"
            >
              Esc
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
