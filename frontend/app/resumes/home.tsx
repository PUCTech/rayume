"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { Mark } from "../logo";
import { templates } from "../templates/data";
import { postings, profile, type Posting } from "../app/data";
import { copyEdits, newId, save, today, useResumes } from "./store";
import { master, type Saved } from "./data";

const serif = GeistSerifRegular.className;
const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const templateName = (slug: string) => templates.find((t) => t.file === slug)?.name ?? slug;
const tabs = { all: "All", tailored: "Tailored", general: "General" } as const;
const sorts = { edited: "Last edited", name: "Name" } as const;
const initials = profile.name
  .split(" ")
  .map((w) => w[0])
  .join("");

const primary =
  "inline-flex items-center gap-1.5 rounded-full bg-accent-deep px-4 py-2 text-sm font-medium text-white shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--color-accent)_70%,transparent),inset_0_1px_0_rgb(255_255_255/0.25)] transition hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))] active:scale-[0.97]";
const item = "block w-full rounded-lg px-3 py-2 text-left text-sm text-ink/80 transition hover:bg-ink/5 hover:text-ink";

// The signed-in home: an app bar (no marketing nav), the saved jobs that have no resume yet, then every resume
// as a small card, the Master Resume first: it holds everything you've done, and every new resume starts from
// it. A card opens its editor (/resumes/[id]); its menu downloads, duplicates or deletes it (not the master).
// New resume starts from the master, as it is or tailored to a saved job, and opens it.
// shortcut: tailoring copies the master and links the job; the AI tailoring (POST /resumes with
// job_posting_id) replaces the copy once the API has it.
export function Home() {
  const list = useResumes();
  const router = useRouter();
  const [tab, setTab] = useState<keyof typeof tabs>("all");
  const [sort, setSort] = useState<keyof typeof sorts>("edited");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useState<string | null>(null);

  // an open card menu closes on Escape or a click anywhere else
  useEffect(() => {
    if (!menu) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !(e.target as Element).closest("[data-menu]")) setMenu(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menu]);

  const q = query.trim().toLowerCase();
  const shown = list
    // the master shows on every tab: everything else comes from it
    .filter((r) => (tab === "all" || r.id === master.id || (tab === "tailored") === !!r.job) && r.title.toLowerCase().includes(q))
    .sort((a, b) => Number(b.id === master.id) - Number(a.id === master.id) || (sort === "name" ? a.title.localeCompare(b.title) : b.updated.localeCompare(a.updated)));
  // saved jobs nothing has been tailored to yet
  const waiting = postings.filter((p) => !list.some((r) => r.job === p.id));

  // a copy of a resume, its edits included
  const copy = (from: Saved, extra: Partial<Saved>): Saved => {
    const fresh = { ...from, id: newId(), updated: today(), ...extra };
    copyEdits(from.id, fresh.id);
    return fresh;
  };
  const create = (job?: Posting) => {
    setMenu(null);
    const from = list.find((r) => r.id === master.id) ?? master;
    const fresh = job
      ? copy(from, { title: `${job.company}, ${job.title}`, job: job.id, company: job.logo ? { name: job.company, logo: job.logo } : undefined })
      : copy(from, { title: "Untitled resume" });
    save([...list, fresh]);
    router.push(`/resumes/${fresh.id}`);
  };
  const act = (r: Saved, what: "duplicate" | "delete") => {
    setMenu(null);
    if (what === "duplicate") save([...list, copy(r, { title: `${r.title} (copy)` })]);
    if (what === "delete" && confirm(`Delete "${r.title}"?`)) save(list.filter((x) => x.id !== r.id));
  };
  const logo = (p: Posting, size: string) =>
    p.logo ? (
      <Image src={`/logos/${p.logo}.svg`} alt="" width={24} height={24} unoptimized className={`${size} shrink-0 rounded-md`} />
    ) : (
      <span aria-hidden className={`${size} grid shrink-0 place-items-center rounded-md bg-ink/10 text-[11px] font-medium text-ink/70`}>
        {p.company[0]}
      </span>
    );

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="inline-flex shrink-0 items-center gap-2" aria-label="Rayume home">
            <Mark className="h-6 w-auto" />
            <span className={`${serif} hidden text-[22px] leading-none sm:inline`}>Rayume</span>
          </Link>
          <div role="search" className="mx-auto flex w-full max-w-md items-center gap-2.5 rounded-full bg-white px-4 ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-accent-text">
            <svg aria-hidden viewBox="0 0 20 20" className="size-4 shrink-0 text-ink/45" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m13 13 4 4" />
            </svg>
            <label htmlFor="resume-search" className="sr-only">Search resumes</label>
            <input
              id="resume-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search resumes"
              className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-ink/45 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
            />
          </div>
          <div data-menu className="relative shrink-0">
            <button type="button" aria-expanded={menu === "new"} onClick={() => setMenu(menu === "new" ? null : "new")} className={primary}>
              <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M10 4.5v11M4.5 10h11" />
              </svg>
              <span className="max-sm:sr-only">New resume</span>
            </button>
            {menu === "new" && (
              <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl bg-white p-1.5 shadow-[0_16px_40px_-14px_rgb(22_27_34/0.4)] ring-1 ring-ink/10 transition duration-200 ease-out starting:-translate-y-1 starting:opacity-0">
                <button type="button" onClick={() => create()} className={item}>
                  <span className="block font-medium text-ink">From your master resume</span>
                  <span className="block text-xs text-ink/55">Everything you&apos;ve done, to trim to the job</span>
                </button>
                <p className="px-3 pb-1 pt-3 text-xs font-medium text-ink/50">Tailor to a saved job</p>
                {postings.map((p) => (
                  <button key={p.id} type="button" onClick={() => create(p)} className={`${item} flex items-center gap-2.5`}>
                    {logo(p, "size-5")}
                    <span className="min-w-0 truncate">
                      {p.company} · {p.title}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* your account: for now, the experiences every resume is made from */}
          <Link href="/settings/experience" aria-label={`${profile.name}: your experience`} title="Your experience" className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-xs font-medium text-white transition hover:bg-ink/85">
            {initials}
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
        {waiting.length > 0 && !q && (
          <section aria-labelledby="jobs-h" className="mb-10">
            <h2 id="jobs-h" className="text-sm font-medium text-ink/60">
              Saved jobs, no resume yet
            </h2>
            <ul className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
              {waiting.map((p) => (
                <li key={p.id} className="flex shrink-0 items-center gap-3 rounded-2xl bg-white py-2.5 pl-3 pr-2.5 ring-1 ring-ink/10">
                  {logo(p, "size-7")}
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{p.company}</p>
                    <p className="text-xs text-ink/55">{p.title}</p>
                  </div>
                  <button type="button" onClick={() => create(p)} className="ml-2 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-white transition hover:bg-ink/85">
                    Tailor
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className={`${serif} text-[2rem] leading-none tracking-[-0.02em]`}>Resumes</h1>
          <div className="flex items-center gap-3">
            <div role="group" aria-label="Show" className="flex rounded-full bg-ink/5 p-1">
              {Object.entries(tabs).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={tab === k}
                  onClick={() => setTab(k as keyof typeof tabs)}
                  className={`rounded-full px-3.5 py-1.5 text-sm transition pointer-coarse:py-2.5 ${tab === k ? "bg-white font-medium text-ink shadow-sm" : "text-ink/60 hover:text-ink"}`}
                >
                  {v}
                </button>
              ))}
            </div>
            <label htmlFor="resume-sort" className="sr-only">Sort by</label>
            <select id="resume-sort" value={sort} onChange={(e) => setSort(e.target.value as keyof typeof sorts)} className="rounded-full bg-white py-1.5 pl-3 pr-2 text-sm text-ink/75 ring-1 ring-ink/10 outline-none focus-visible:ring-2 focus-visible:ring-accent-text">
              {Object.entries(sorts).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {shown.length ? (
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
            {shown.map((r) => (
              <li key={r.id} className="group relative">
                <Link href={`/resumes/${r.id}`} className="block rounded-xl" aria-label={`Open ${r.title}`}>
                  <div className="relative aspect-[8.5/11] overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgb(22_27_34/0.08),0_12px_32px_-16px_rgb(22_27_34/0.3)] ring-1 ring-ink/10 transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_2px_4px_rgb(22_27_34/0.08),0_24px_48px_-20px_rgb(22_27_34/0.4)] motion-reduce:group-hover:translate-y-0">
                    <Image src={`/resumes/${r.template}.png`} alt="" fill draggable={false} sizes="(min-width: 1280px) 230px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover" />
                    {r.id === master.id && (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-white">
                        <svg aria-hidden viewBox="0 0 16 16" className="size-3" fill="currentColor">
                          <path d="M10.5 1.5 14.5 5.5 12 6.5 9.5 9l.5 3.5-1 1-3-3L2.5 14 2 13.5l3.5-3.5-3-3 1-1L7 6.5 9.5 4z" />
                        </svg>
                        Master
                      </span>
                    )}
                  </div>
                </Link>
                <div className="mt-3 flex items-start gap-2.5 px-0.5">
                  {r.company && <Image src={`/logos/${r.company.logo}.svg`} alt={`${r.company.name} logo`} width={24} height={24} unoptimized className="mt-0.5 size-6 shrink-0 rounded-md" />}
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[15px] font-medium" title={r.title}>
                      {r.title}
                    </h2>
                    <p className="mt-0.5 truncate text-[13px] text-ink/55">
                      {r.id === master.id ? "Everything you've done" : `Edited ${date.format(new Date(r.updated))}`} · {templateName(r.template)}
                    </p>
                  </div>
                  <div data-menu className="relative shrink-0">
                    <button
                      type="button"
                      aria-label={`More for ${r.title}`}
                      aria-expanded={menu === r.id}
                      onClick={() => setMenu(menu === r.id ? null : r.id)}
                      className="-mr-1 grid size-8 place-items-center rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink pointer-coarse:size-10"
                    >
                      <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="currentColor">
                        <circle cx="4.5" cy="10" r="1.5" />
                        <circle cx="10" cy="10" r="1.5" />
                        <circle cx="15.5" cy="10" r="1.5" />
                      </svg>
                    </button>
                    {menu === r.id && (
                      <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl bg-white p-1 shadow-[0_12px_32px_-12px_rgb(22_27_34/0.35)] ring-1 ring-ink/10 transition duration-200 ease-out starting:-translate-y-1 starting:opacity-0">
                        <Link href={`/resumes/${r.id}`} className={item}>
                          Open
                        </Link>
                        <a href={`/resumes/${r.template}.pdf`} download={`${r.title}.pdf`} onClick={() => setMenu(null)} className={item}>
                          Download PDF
                        </a>
                        {r.id !== master.id && (
                          <>
                            <button type="button" onClick={() => act(r, "duplicate")} className={item}>
                              Duplicate
                            </button>
                            <button type="button" onClick={() => act(r, "delete")} className={`${item} text-error-text hover:text-error-text`}>
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-8 rounded-[28px] bg-mist px-6 py-20 text-center">
            <p className="font-medium">{q ? "No resumes match." : "No resumes here yet."}</p>
            <button type="button" onClick={() => create()} className="mt-3 text-sm font-medium text-accent-text">
              Start a new resume
            </button>
          </div>
        )}
      </div>
    </>
  );
}
