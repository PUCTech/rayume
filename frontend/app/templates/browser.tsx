"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer } from "./drawer";
import { Detail } from "./panel";
import { transition } from "../gallery";
import { templates, type Template } from "./data";

// each group lists the values present in the data; nothing ticked in a group means it doesn't filter
const groups = [
  { key: "layout", label: "Layout" },
  { key: "source", label: "From" },
] as const;
type Key = (typeof groups)[number]["key"];
const values = (k: Key) => [...new Set(templates.map((t) => t[k]))];
const none: Record<Key, string[]> = { layout: [], source: [] };

const noop = () => () => {};

// Opening a card pushes /templates/{id} onto the history and shows it in a drawer over the grid; Back
// or closing pops it. A direct visit or refresh renders [id]/page.tsx. This replaced an intercepting
// route, because next dev 16.4 re-adds interception rewrites on every rebuild until the click 404s.
// The heading comes in as children; the search bar sits on its own row under it.
export function Browser({ tex, children }: { tex: Record<string, string>; children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(none);
  const bar = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const open = templates.find((t) => pathname === `/templates/${t.file}`);
  // the server renders the Mac hint; other platforms swap to Ctrl after hydration
  const mod = useSyncExternalStore(noop, () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl "), () => "⌘");

  // Cmd/Ctrl+K jumps to the search bar from anywhere on the page; an open template drawer owns the keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && !document.querySelector("[aria-modal=true]")) {
        e.preventDefault();
        bar.current?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "center" });
        input.current?.focus({ preventScroll: true });
        input.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const q = query.trim().toLowerCase();
  const matches = (t: Template) =>
    t.name.toLowerCase().includes(q) && groups.every(({ key }) => !picked[key].length || picked[key].includes(t[key]));
  const shown = templates.filter(matches);
  const filtered = q || groups.some(({ key }) => picked[key].length);

  const toggle = (k: Key, v: string) =>
    transition(() => setPicked((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] })));
  const clear = () =>
    transition(() => {
      setQuery("");
      setPicked(none);
    });

  return (
    <>
      {children}
      <div ref={bar} role="search" className="glass mt-8 flex max-w-xl items-center gap-3 rounded-full px-5 focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-verm-text">
        <svg aria-hidden viewBox="0 0 20 20" className="size-5 shrink-0 text-ink/45" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="8.5" cy="8.5" r="5.5" />
          <path d="m13 13 4 4" />
        </svg>
        <label htmlFor="tpl-search" className="sr-only">Search templates</label>
        <input
          ref={input}
          id="tpl-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && !query && e.currentTarget.blur()}
          placeholder="Search templates"
          className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-ink/45 [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd aria-hidden className="hidden shrink-0 rounded-md border border-ink/10 bg-white/60 px-2 py-0.5 font-sans text-xs text-ink/55 sm:block">
          {mod}K
        </kbd>
      </div>

      {/* filters on the left, the count on the right: one row, so the cards start high on the page */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-ink/10 pb-4">
        <div role="group" aria-label="Filter templates" className="flex flex-wrap items-center gap-2">
          {groups.map(({ key, label }, g) => (
            <fieldset key={key} className="contents">
              <legend className="sr-only">{label}</legend>
              {g > 0 && <span aria-hidden className="mx-2 h-5 w-px bg-ink/15" />}
              {values(key).map((v) => {
                const on = picked[key].includes(v);
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(key, v)}
                    className={`rounded-full px-3.5 py-1.5 text-sm transition ${on ? "bg-ink text-white" : "bg-white/50 text-ink/70 hover:bg-white/80 hover:text-ink"}`}
                  >
                    {v}
                  </button>
                );
              })}
            </fieldset>
          ))}
        </div>
        <div className="flex items-baseline gap-4 text-sm">
          <p aria-live="polite" className="text-ink/60">
            {filtered ? `${shown.length} of ${templates.length} templates` : `${templates.length} templates`}
          </p>
          {filtered && (
            <button type="button" onClick={clear} className="font-medium text-verm-text">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* no scroll anchoring: when the card in view disappears Chrome would scroll to keep another in place */}
      <div className="[overflow-anchor:none]">
        {shown.length ? (
          <ul className="mt-8 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((t, i) => (
              <li key={t.file} style={{ viewTransitionName: `tpl-${t.file}` }}>
                {/* a plain click opens the drawer; modifier clicks still open the full page in a new tab */}
                <Link
                  href={`/templates/${t.file}`}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                    e.preventDefault();
                    history.pushState(null, "", `/templates/${t.file}`);
                  }}
                  className="group block rounded-[26px]"
                >
                  {/* name and details first, so they stay readable when the preview runs off screen */}
                  <div className="mb-3 flex items-baseline justify-between gap-3 px-2">
                    <h2 className="font-medium">{t.name}</h2>
                    <p className="text-sm text-ink/50">
                      {t.layout} · {t.source}
                    </p>
                  </div>
                  <div className="glass rounded-[26px] p-3 transition duration-300 group-hover:-translate-y-1 motion-reduce:group-hover:translate-y-0">
                    <div className="relative aspect-[8.5/11] overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgb(22_27_34/0.08),0_12px_32px_-16px_rgb(22_27_34/0.3)]">
                      <Image
                        src={`/resumes/${t.file}.png`}
                        alt={`Lucas Mendes's resume in the ${t.name} template`}
                        fill
                        draggable={false}
                        loading={i < 3 ? "eager" : undefined}
                        sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover transition duration-500 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
                      />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-[28px] bg-mist px-6 py-20 text-center">
            <p className="font-medium">No templates match.</p>
            <button type="button" onClick={clear} className="mt-3 text-sm font-medium text-verm-text">
              Clear search and filters
            </button>
          </div>
        )}
      </div>

      {open && (
        <Drawer key={open.file}>
          <Detail t={open} tex={tex[open.file]} />
        </Drawer>
      )}
    </>
  );
}
