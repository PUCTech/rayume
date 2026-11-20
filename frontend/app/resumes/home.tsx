"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sheetSizes } from "../precache";
import { templates } from "../templates/data";
import { save, useJobs, useResumes } from "./store";
import { master, type Saved } from "./data";
import { AppBar, Logo, More, copy, date, item, menuPanel, primary, serif, tabButton, tabTrack, useMenu, useTailor } from "./shared";

const templateName = (slug: string) => templates.find((t) => t.file === slug)?.name ?? slug;
const tabs = { all: "All", tailored: "Tailored", general: "General" } as const;
const sorts = { edited: "Last edited", name: "Name" } as const;

// The signed-in home: an app bar (no marketing nav), the saved jobs that have no resume yet, then every resume
// as a small card, the Master Resume first: it holds everything you've done, and every new resume starts from
// it. A card opens its editor (/resumes/[id]); its menu downloads, duplicates or deletes it (not the master).
// New resume starts from the master, as it is or tailored to a saved job, and opens it (shared.tsx's useTailor).
export function Home() {
  const list = useResumes();
  const postings = useJobs();
  const tailor = useTailor();
  const [tab, setTab] = useState<keyof typeof tabs>("all");
  const [sort, setSort] = useState<keyof typeof sorts>("edited");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useMenu();

  const q = query.trim().toLowerCase();
  const shown = list
    // the master shows on every tab: everything else comes from it
    .filter((r) => (tab === "all" || r.id === master.id || (tab === "tailored") === !!r.job) && r.title.toLowerCase().includes(q))
    .sort((a, b) => Number(b.id === master.id) - Number(a.id === master.id) || (sort === "name" ? a.title.localeCompare(b.title) : b.updated.localeCompare(a.updated)));
  // saved jobs nothing has been tailored to yet
  const waiting = postings.filter((p) => !list.some((r) => r.job === p.id));

  const create: typeof tailor = (job) => {
    setMenu(null);
    tailor(job);
  };
  const act = (r: Saved, what: "duplicate" | "delete") => {
    setMenu(null);
    if (what === "duplicate") save([...list, copy(r, { title: `${r.title} (copy)` })]);
    if (what === "delete" && confirm(`Delete "${r.title}"?`)) save(list.filter((x) => x.id !== r.id));
  };
  return (
    <>
      <AppBar current="/resumes" label="Search resumes" query={query} onQuery={setQuery}>
        <div data-menu className="relative shrink-0">
          <button type="button" aria-expanded={menu === "new"} onClick={() => setMenu(menu === "new" ? null : "new")} className={primary}>
            <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M10 4.5v11M4.5 10h11" />
            </svg>
            <span className="max-sm:sr-only">New resume</span>
          </button>
          {menu === "new" && (
            <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl bg-surface p-1.5 shadow-[0_16px_40px_-14px_rgb(22_27_34/0.4)] ring-1 ring-ink/10 transition duration-200 ease-out starting:-translate-y-1 starting:opacity-0">
              <button type="button" onClick={() => create()} className={item}>
                <span className="block font-medium text-ink">From your master resume</span>
                <span className="block text-xs text-ink/55">Everything you&apos;ve done, to trim to the job</span>
              </button>
              <p className="px-3 pb-1 pt-3 text-xs font-medium text-ink/50">Tailor to a saved job</p>
              {postings.map((p) => (
                <button key={p.id} type="button" onClick={() => create(p)} className={`${item} flex items-center gap-2.5`}>
                  <Logo p={p} className="size-5" />
                  <span className="min-w-0 truncate">
                    {p.company} · {p.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </AppBar>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
        {waiting.length > 0 && !q && (
          <section aria-labelledby="jobs-h" className="mb-12">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="jobs-h" className="text-sm font-medium text-ink/60">
                {waiting.length === 1 ? "1 saved job" : `${waiting.length} saved jobs`} without a resume
              </h2>
              <Link href="/jobs" className="shrink-0 text-sm text-ink/60 transition hover:text-ink">
                See all jobs
              </Link>
            </div>
            {/* the newest three; the rest are a click away on /jobs */}
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[...waiting]
                .sort((a, b) => b.saved.localeCompare(a.saved))
                .slice(0, 3)
                .map((p, i) => (
                  <li key={p.id} className={`flex flex-col rounded-[24px] bg-surface p-4 ring-1 ring-ink/10 ${i === 2 ? "sm:max-lg:hidden" : ""}`}>
                    <div className="flex min-w-0 items-center gap-3">
                      <Logo p={p} className="size-9" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium" title={p.title}>
                          {p.title}
                        </p>
                        <p className="truncate text-[13px] text-ink/60">
                          {p.company} · saved <time dateTime={p.saved}>{date.format(new Date(p.saved))}</time>
                        </p>
                      </div>
                    </div>
                    {p.keywords.length > 0 && (
                      <ul aria-label="Asks for" className="mt-3 flex flex-wrap gap-1.5">
                        {p.keywords.slice(0, 4).map((k) => (
                          <li key={k} className="rounded-full bg-mist px-2.5 py-0.5 text-[12px] text-ink/75">
                            {k}
                          </li>
                        ))}
                        {p.keywords.length > 4 && <li className="px-1 py-0.5 text-[12px] text-ink/50">+{p.keywords.length - 4}</li>}
                      </ul>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <Link href={`/jobs?job=${p.id}`} className="-mx-1 rounded-full px-1 py-1 text-[13px] text-ink/60 transition hover:text-ink pointer-coarse:py-3">
                        Read the job
                      </Link>
                      <button type="button" onClick={() => create(p)} className={`${primary} pointer-coarse:py-3`}>
                        Tailor a resume
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </section>
        )}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className={`${serif} text-[2rem] leading-none tracking-[-0.02em]`}>Resumes</h1>
          <div className="flex flex-wrap items-center gap-3">
            <div role="group" aria-label="Show" className={tabTrack}>
              {Object.entries(tabs).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={tab === k}
                  onClick={() => setTab(k as keyof typeof tabs)}
                  className={tabButton(tab === k)}
                >
                  {v}
                </button>
              ))}
            </div>
            <label htmlFor="resume-sort" className="sr-only">Sort by</label>
            <select id="resume-sort" value={sort} onChange={(e) => setSort(e.target.value as keyof typeof sorts)} className="rounded-full bg-surface py-1.5 pl-3 pr-2 text-sm text-ink/75 ring-1 ring-ink/10 outline-none focus-visible:ring-2 focus-visible:ring-accent-text">
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
                    <Image src={`/resumes/${r.template}.png`} alt="" fill draggable={false} sizes={sheetSizes.card} className="object-cover" />
                    {r.id === master.id && (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-on-ink">
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
                    <More label={`More for ${r.title}`} open={menu === r.id} onClick={() => setMenu(menu === r.id ? null : r.id)} />
                    {menu === r.id && (
                      <div className={menuPanel}>
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
