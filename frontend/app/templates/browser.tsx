"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Drawer } from "./drawer";
import { Detail } from "./panel";
import { templates, type Template } from "./data";

// Each chip group lists the values present in the data; nothing ticked in a group means it doesn't filter.
// ATS-friendly is a toggle of its own: it only ever narrows.
const groups = [
  { key: "layout", label: "Layout" },
  { key: "color", label: "Colour" },
  { key: "density", label: "Density" },
] as const;
type Key = (typeof groups)[number]["key"];
const values = (k: Key) => [...new Set(templates.map((t) => t[k]))];
const none: Record<Key, string[]> = { layout: [], color: [], density: [] };
const sorts = { popular: "Most popular", name: "Name" } as const;
type Sort = keyof typeof sorts;

const chip = "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition pointer-coarse:py-2.5";
const facts = (t: Template) => [t.layout, t.ats && "ATS-friendly", t.color].filter(Boolean).join(" · ");

const noop = () => () => {};

// Animate the grid between states where the View Transitions API exists; elsewhere just update.
function transition(update: () => void) {
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return update();
  document.startViewTransition(() => flushSync(update));
}

// Opening a card pushes /templates/{id} onto the history and shows it in a drawer over the grid; Back
// or closing pops it. A direct visit or refresh renders [id]/page.tsx. This replaced an intercepting
// route, because next dev 16.4 re-adds interception rewrites on every rebuild until the click 404s.
// The heading comes in as children, with the search beside it; the filters stick under the nav as you
// scroll, so a dense grid (four across on wide screens, two on phones) starts high on the page.
export function Browser({ tex, children }: { tex: Record<string, string>; children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState(none);
  const [ats, setAts] = useState(false);
  const [sort, setSort] = useState<Sort>("popular");
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
    t.name.toLowerCase().includes(q) && (!ats || t.ats) && groups.every(({ key }) => !picked[key].length || picked[key].includes(t[key]));
  const shown = templates.filter(matches).sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : a.popular - b.popular));
  const filtered = q || ats || groups.some(({ key }) => picked[key].length);

  const toggle = (k: Key, v: string) =>
    transition(() => setPicked((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] })));
  const clear = () =>
    transition(() => {
      setQuery("");
      setPicked(none);
      setAts(false);
    });
  const preview = (e: MouseEvent, t: Template) => {
    // a plain click opens the drawer; modifier clicks still open the full page in a new tab
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    history.pushState(null, "", `/templates/${t.file}`);
  };

  return (
    <>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        {children}
        <div ref={bar} role="search" className="flex w-full items-center gap-3 rounded-full bg-white px-4 ring-1 ring-ink/10 transition focus-within:ring-2 focus-within:ring-accent-text lg:max-w-sm">
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
            className="min-w-0 flex-1 bg-transparent py-2.5 text-base outline-none placeholder:text-ink/45 sm:text-[15px] [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd aria-hidden className="hidden shrink-0 rounded-md border border-ink/10 bg-paper px-2 py-0.5 font-sans text-xs text-ink/55 sm:block">
            {mod}K
          </kbd>
        </div>
      </div>

      {/* sticks under the floating nav; one row that scrolls sideways on phones instead of wrapping */}
      <div className="sticky top-[4.5rem] z-20 -mx-4 mt-6 border-b border-ink/10 bg-paper/95 px-4 py-3 sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-4">
          <div role="group" aria-label="Filter templates" className="-my-1 flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-1 [scrollbar-width:none]">
            <button type="button" aria-pressed={ats} onClick={() => transition(() => setAts((a) => !a))} className={`${chip} inline-flex items-center gap-1.5 ${ats ? "bg-ink text-white" : "bg-white text-ink/75 ring-1 ring-ink/10 hover:text-ink"}`}>
              <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 10.5 3.2 3L15 7" />
              </svg>
              ATS-friendly
            </button>
            {groups.map(({ key, label }) => (
              <fieldset key={key} className="contents">
                <legend className="sr-only">{label}</legend>
                <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-ink/15" />
                {values(key).map((v) => {
                  const on = picked[key].includes(v);
                  return (
                    <button key={v} type="button" aria-pressed={on} onClick={() => toggle(key, v)} className={`${chip} ${on ? "bg-ink text-white" : "text-ink/70 hover:bg-white hover:text-ink"}`}>
                      {v}
                    </button>
                  );
                })}
              </fieldset>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm">
            <p aria-live="polite" className="hidden text-ink/55 sm:block">
              {filtered ? `${shown.length} of ${templates.length}` : `${templates.length} templates`}
            </p>
            {filtered && (
              <button type="button" onClick={clear} className="font-medium text-accent-text">
                Clear all
              </button>
            )}
            <label className="sr-only" htmlFor="tpl-sort">Sort by</label>
            <select id="tpl-sort" value={sort} onChange={(e) => transition(() => setSort(e.target.value as Sort))} className="rounded-full bg-white py-1.5 pl-3 pr-2 text-sm text-ink/75 ring-1 ring-ink/10 outline-none focus-visible:ring-2 focus-visible:ring-accent-text">
              {Object.entries(sorts).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* no scroll anchoring: when the card in view disappears Chrome would scroll to keep another in place */}
      <div className="[overflow-anchor:none]">
        {shown.length ? (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {shown.map((t, i) => (
              <li key={t.file} style={{ viewTransitionName: `tpl-${t.file}` }} className="group">
                <div className="relative aspect-[8.5/11] overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgb(22_27_34/0.08),0_12px_32px_-16px_rgb(22_27_34/0.3)] ring-1 ring-ink/10 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_2px_4px_rgb(22_27_34/0.08),0_24px_48px_-20px_rgb(22_27_34/0.4)] motion-reduce:group-hover:translate-y-0">
                  <Image
                    src={`/resumes/${t.file}.png`}
                    alt={`Lucas Mendes's resume in the ${t.name} template`}
                    fill
                    draggable={false}
                    loading={i < 4 ? "eager" : undefined}
                    sizes="(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                  {/* the whole preview opens it; the button sits above that link, not inside it */}
                  <Link href={`/templates/${t.file}`} onClick={(e) => preview(e, t)} aria-label={`Preview ${t.name}`} className="absolute inset-0 rounded-xl" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-ink/25 to-transparent p-3 pt-10 opacity-0 transition duration-300 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100">
                    <Link
                      href={`/signup?template=${t.file}`}
                      className="pointer-events-auto rounded-full bg-accent-deep px-4 py-2 text-[13px] font-medium text-white shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--color-accent)_70%,transparent)] transition hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))] active:scale-[0.97]"
                    >
                      Use this template
                    </Link>
                  </div>
                </div>
                <div className="mt-3 px-1">
                  <h2 className="text-[15px] font-medium">{t.name}</h2>
                  <p className="mt-0.5 text-[13px] text-ink/55">{facts(t)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-[28px] bg-mist px-6 py-20 text-center">
            <p className="font-medium">No templates match.</p>
            <button type="button" onClick={clear} className="mt-3 text-sm font-medium text-accent-text">
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
