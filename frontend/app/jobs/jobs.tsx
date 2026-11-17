"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Posting } from "../app/data";
import { master, type Saved } from "../resumes/data";
import { readJobs, save, saveJobs, today, useJobs, useResumes } from "../resumes/store";
import { AppBar, Logo, More, day, item, localDay, menuPanel, primary, serif, tabButton, tabTrack, useMenu, useTailor } from "../resumes/shared";
import { sheetSizes } from "../precache";
import { templates } from "../templates/data";
import { Activity } from "./charts";
import { JobDialog, safeUrl, type JobFields } from "./dialog";

// a day as YYYY-MM-DD in the person's own time zone, n days from today
const fromToday = (n = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA");
};
const tabs = { saved: "Saved", applied: "Applied" } as const;
const templateName = (slug: string) => templates.find((t) => t.file === slug)?.name ?? slug;
// most recently edited first, the master last: a tailored resume is the likelier one to have been sent
const byEdited = (a: Saved, b: Saved) => Number(a.id === master.id) - Number(b.id === master.id) || b.updated.localeCompare(a.updated);

// The candidate's own list of jobs: the ones they saved, the ones they applied to, the resume attached to each
// and when. It never lists a job they didn't put here, opens a link, scores a resume or applies for them.
// Four counts on top, all worked out from the list. Saved and Applied are tabs, kept in the URL (?tab=applied).
// A job's title opens it in a dialog to read (?job=<id>, so it can be linked and Back closes it); its hit area
// covers the row, under the row's own controls.
// A resume is attached to a job when it was tailored to it (Saved.job); an applied job shows the one that was
// sent, recorded when it was marked, which may since have been deleted.
// shortcut: a job saved here has no keywords: the API extracts them with AI (POST /job-postings), so none are
// made up; the editor's job chip only knows the demo postings until it reads this list.
export function Jobs() {
  const jobs = useJobs();
  const list = useResumes();
  const tailor = useTailor();
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const tab: keyof typeof tabs = params.get("tab") === "applied" ? "applied" : "saved";
  const jobId = params.get("job");
  const [query, setQuery] = useState("");
  const [menu, setMenu] = useMenu();
  // the save dialog: open, and the job it edits (none for a new one); n remounts it with fresh fields
  const [dialog, setDialog] = useState<{ open: boolean; job?: Posting; n: number }>({ open: false, n: 0 });
  const back = useRef<HTMLElement | null>(null);
  const [undo, setUndo] = useState<Posting | null>(null);

  // the undo line goes after a few seconds
  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 6000);
    return () => clearTimeout(t);
  }, [undo]);

  // the URL for a tab, and a job open over it
  const href = (t: keyof typeof tabs, job?: string) => {
    const p = new URLSearchParams();
    if (t === "applied") p.set("tab", "applied");
    if (job) p.set("job", job);
    return p.size ? `${path}?${p}` : path;
  };
  // a job that isn't here (removed, or a bad link) opens nothing and leaves the URL. Read from the browser's
  // own list: during hydration useJobs still gives the demo one, without the jobs saved here
  useEffect(() => {
    if (jobId && !readJobs().some((j) => j.id === jobId)) router.replace(path + (tab === "applied" ? "?tab=applied" : ""), { scroll: false });
  }, [jobId, tab, path, router]);
  const detail = jobId ? jobs.find((j) => j.id === jobId) : undefined;
  // the job stays in the dialog while it closes
  const [last, setLast] = useState(detail);
  if (detail && detail !== last) setLast(detail);
  // opened here: closing goes Back, so the history has no extra entry; opened from a link: closing drops ?job
  const pushed = useRef(false);
  const view = (j: Posting) => {
    pushed.current = true;
    router.push(href(tab, j.id), { scroll: false });
  };
  const unview = () => {
    if (pushed.current) router.back();
    else router.replace(href(tab), { scroll: false });
    pushed.current = false;
  };

  const weekAgo = fromToday(-6);
  const counts = [
    ["Saved", jobs.filter((j) => !j.applied).length],
    ["Applied", jobs.filter((j) => j.applied).length],
    ["Applied this week", jobs.filter((j) => j.applied && j.applied >= weekAgo).length],
    ["Tailored", jobs.filter((j) => list.some((r) => r.job === j.id)).length],
  ] as const;

  const q = query.trim().toLowerCase();
  const inTab = jobs.filter((j) => (tab === "applied") === !!j.applied);
  const shown = inTab
    .filter((j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q))
    .sort((a, b) => (tab === "applied" ? b.applied!.localeCompare(a.applied!) : 0) || b.saved.localeCompare(a.saved));

  const setTab = (t: keyof typeof tabs) => router.replace(href(t), { scroll: false });
  const change = (id: string, to: (j: Posting) => Posting) => saveJobs(jobs.map((j) => (j.id === id ? to(j) : j)));
  const open = (job: Posting | undefined, from: Element | null) => {
    // focus goes back to what opened it: the ••• button of a row's menu, Save a job, or the job's title
    back.current = (from?.closest("[data-menu]")?.querySelector("button") ?? from) as HTMLElement | null;
    setMenu(null);
    setDialog((d) => ({ open: true, job, n: d.n + 1 }));
  };
  const store = (v: JobFields) => {
    const job = dialog.job;
    if (job) change(job.id, (j) => ({ ...j, ...v }));
    else saveJobs([{ id: `j${Date.now()}`, ...v, keywords: [], missing: [], saved: today() }, ...jobs]);
    setDialog((d) => ({ ...d, open: false }));
  };
  const apply = (j: Posting, applied: string, sent: string) => {
    setMenu(null);
    change(j.id, (x) => ({ ...x, applied, sent }));
    if (!j.applied) setUndo(j);
  };
  const unapply = (j: Posting) => {
    setMenu(null);
    change(j.id, (x) => ({ ...x, applied: undefined, sent: undefined }));
  };
  const remove = (j: Posting) => {
    setMenu(null);
    if (!confirm(`Remove "${j.company}, ${j.title}"? Resumes tailored to it stay.`)) return;
    saveJobs(jobs.filter((x) => x.id !== j.id));
    // as the API does (on delete set null): the resumes stay, no longer tailored to anything
    if (list.some((r) => r.job === j.id)) save(list.map(({ job, ...r }) => (job === j.id ? r : { ...r, job })));
  };
  const saveButton = (label: string) => (
    <button type="button" onClick={(e) => open(undefined, e.currentTarget)} className={`${primary} shrink-0 pointer-coarse:py-3`}>
      <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10 4.5v11M4.5 10h11" />
      </svg>
      <span className={label === "bar" ? "max-sm:sr-only" : ""}>Save a job</span>
    </button>
  );

  return (
    <>
      <AppBar current="/jobs" label="Search jobs" query={query} onQuery={setQuery}>
        {saveButton("bar")}
      </AppBar>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6">
        <h1 className={`${serif} text-[2rem] leading-none tracking-[-0.02em]`}>Jobs</h1>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {counts.map(([label, n]) => (
            <div key={label} className="flex items-baseline justify-between gap-3 rounded-[22px] bg-mist px-5 py-4">
              <dt className="text-sm text-ink/65">{label}</dt>
              <dd className={`${serif} text-[1.75rem] leading-none tracking-[-0.02em]`}>{n}</dd>
            </div>
          ))}
        </dl>
        {jobs.length > 0 && <Activity jobs={jobs} list={list} />}

        {jobs.length === 0 ? (
          <div className="mt-10 rounded-[28px] bg-mist px-6 py-16 text-center">
            <p className="mx-auto max-w-md text-ink/70">Save the jobs you&apos;re going for, tailor a resume to each, and keep track of which one went where.</p>
            <div className="mt-5 flex justify-center">{saveButton("empty")}</div>
          </div>
        ) : (
          <section aria-label={tabs[tab]} className="mt-10">
            <div role="group" aria-label="Show" className={`${tabTrack} w-fit`}>
              {Object.entries(tabs).map(([k, v]) => (
                <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k as keyof typeof tabs)} className={tabButton(tab === k)}>
                  {v} <span className="text-ink/50">{jobs.filter((j) => (k === "applied") === !!j.applied).length}</span>
                </button>
              ))}
            </div>

            {shown.length ? (
              <ul className="mt-5 grid gap-3 lg:gap-0 lg:divide-y lg:divide-ink/10 lg:border-y lg:border-ink/10">
                {shown.map((j) => {
                  const mine = tailored(list, j);
                  const sent = list.find((r) => r.id === j.sent);
                  const url = safeUrl(j.url);
                  return (
                    <li
                      key={j.id}
                      // a row with its menu or popover open sits over the rows below it
                      className={`relative flex flex-col gap-3 rounded-[26px] bg-white p-4 ring-1 ring-ink/10 transition duration-300 hover:shadow-[0_2px_4px_rgb(22_27_34/0.08),0_24px_48px_-20px_rgb(22_27_34/0.4)] lg:hover:bg-white lg:hover:shadow-none lg:grid lg:grid-cols-[minmax(0,1fr)_7.5rem_12rem_10rem] lg:items-center lg:gap-6 lg:rounded-none lg:bg-transparent lg:px-2 lg:py-3.5 lg:ring-0 ${menu?.split(":").pop() === j.id ? "z-20" : ""}`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Logo p={j} className="size-9" />
                        <div className="min-w-0">
                          {/* the row's link to the job: its ::after covers the row, under the row's controls */}
                          <button
                            id={`job-${j.id}`}
                            type="button"
                            onClick={() => view(j)}
                            title={j.title}
                            className="block max-w-full truncate text-left text-[15px] font-medium after:absolute after:inset-0 after:rounded-[inherit] after:content-['']"
                          >
                            {j.title}
                          </button>
                          <p className="truncate text-[13px] text-ink/60" title={j.company}>
                            {j.company}
                          </p>
                        </div>
                        {/* what the job asks for, in the row's spare width */}
                        {j.keywords.length > 0 && (
                          <ul aria-label="Asks for" className="ml-auto hidden shrink-0 gap-1.5 pl-4 xl:flex">
                            {j.keywords.slice(0, 3).map((k) => (
                              <li key={k} className="rounded-full bg-mist px-2.5 py-0.5 text-[12px] text-ink/70">
                                {k}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <p className="text-[13px] text-ink/70">
                        {j.applied ? (
                          <>
                            Applied <time dateTime={j.applied}>{day(j.applied)}</time>
                            <span className="text-ink/45 max-lg:ml-2 lg:block">
                              saved <time dateTime={j.saved}>{day(j.saved)}</time>
                            </span>
                          </>
                        ) : (
                          <>
                            Saved <time dateTime={j.saved}>{day(j.saved)}</time>
                          </>
                        )}
                      </p>

                      <div className="flex min-w-0">
                        <ResumeNote j={j} list={list} onTailor={() => tailor(j)} />
                      </div>

                      <div className="relative z-10 flex items-center justify-end gap-1 max-lg:-mb-1 max-lg:border-t max-lg:border-ink/10 max-lg:pt-2">
                        {!j.applied && (
                          <div data-menu className="relative max-lg:mr-auto">
                            <button
                              type="button"
                              aria-expanded={menu === `apply:${j.id}`}
                              onClick={() => setMenu(menu === `apply:${j.id}` ? null : `apply:${j.id}`)}
                              className="rounded-full bg-ink px-3.5 py-1.5 text-[13px] font-medium text-white transition hover:bg-ink/85 pointer-coarse:py-3"
                            >
                              Mark as applied
                            </button>
                            {menu === `apply:${j.id}` && <Apply j={j} list={list} preset={(mine[0] ?? master).id} onDone={(d, r) => apply(j, d, r)} />}
                          </div>
                        )}
                        <div data-menu className="relative">
                          <More label={`More for ${j.company}, ${j.title}`} open={menu === j.id} onClick={() => setMenu(menu === j.id ? null : j.id)} />
                          {menu === j.id && (
                            <div className={menuPanel}>
                              {url && (
                                <a href={url} target="_blank" rel="noreferrer noopener" onClick={() => setMenu(null)} className={item}>
                                  Open posting
                                </a>
                              )}
                              {mine[0] && (
                                <Link href={`/resumes/${mine[0].id}/tailor`} className={item}>
                                  Review tailoring
                                </Link>
                              )}
                              {j.applied ? (
                                <>
                                  <button type="button" onClick={() => setMenu(`details:${j.id}`)} className={item}>
                                    Change details
                                  </button>
                                  <button type="button" onClick={() => unapply(j)} className={item}>
                                    Move back to saved
                                  </button>
                                </>
                              ) : (
                                <button type="button" onClick={(e) => open(j, e.currentTarget)} className={item}>
                                  Edit
                                </button>
                              )}
                              <button type="button" onClick={() => remove(j)} className={`${item} text-error-text hover:text-error-text`}>
                                Remove
                              </button>
                            </div>
                          )}
                          {menu === `details:${j.id}` && <Apply j={j} list={list} preset={sent?.id ?? (mine[0] ?? master).id} onDone={(d, r) => apply(j, d, r)} />}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-6 text-sm text-ink/55">
                {q ? (
                  <>
                    No jobs match <q>{query.trim()}</q>
                  </>
                ) : tab === "applied" ? (
                  "Nothing applied to yet"
                ) : (
                  "No saved jobs. Save one to tailor a resume to it"
                )}
              </p>
            )}
          </section>
        )}
      </div>

      {last && (
        <JobView
          open={!!detail}
          j={last}
          list={list}
          onClose={unview}
          onTailor={() => tailor(last)}
          onApply={(d, r) => apply(last, d, r)}
          onUnapply={() => unapply(last)}
          onEdit={() => {
            unview();
            open(last, document.getElementById(`job-${last.id}`));
          }}
        />
      )}

      <JobDialog key={dialog.n} open={dialog.open} job={dialog.job} back={back} onClose={() => setDialog((d) => ({ ...d, open: false }))} onSave={store} />

      {/* mounted all along, so a screen reader hears it when the text arrives */}
      <div role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4">
        {undo && (
          <p className="pointer-events-auto flex items-center gap-3 rounded-full bg-white py-1.5 pl-4 pr-1.5 text-sm text-ink/70 shadow-[0_12px_32px_-12px_rgb(22_27_34/0.35)] ring-1 ring-ink/10 transition duration-200 starting:translate-y-1 starting:opacity-0">
            Marked as applied
            <button
              type="button"
              onClick={() => {
                change(undo.id, () => undo);
                setUndo(null);
              }}
              className="rounded-full px-3 py-1 font-medium text-accent-text transition hover:bg-ink/5 pointer-coarse:py-2.5"
            >
              Undo
            </button>
          </p>
        )}
      </div>
    </>
  );
}

// resumes tailored to a job, the one most likely sent first
const tailored = (list: Saved[], j: Posting) => list.filter((r) => r.job === j.id).sort(byEdited);

// The row's word on its resume: the one sent or tailored, by name, opening the editor (above the row's link);
// a sent one since deleted says so; a job with none gets a way to tailor one.
function ResumeNote({ j, list, onTailor }: { j: Posting; list: Saved[]; onTailor: () => void }) {
  const r = j.applied ? list.find((x) => x.id === j.sent) : tailored(list, j)[0];
  if (r)
    return (
      <Link href={`/resumes/${r.id}`} title={r.title} className="relative z-10 min-w-0 text-[13px] leading-snug text-ink/55 transition hover:text-ink">
        {j.applied ? "Sent" : "Tailored"}
        <span className="block truncate text-ink/80 hover:underline">{r.title}</span>
      </Link>
    );
  if (j.applied) return <span className="text-[13px] text-ink/55">Resume deleted</span>;
  return (
    <button type="button" onClick={onTailor} className="relative z-10 -mx-1 rounded-full px-1 py-1 text-[13px] font-medium text-accent-text transition hover:underline pointer-coarse:py-3">
      Tailor a resume
    </button>
  );
}

// Marking a job as applied, or correcting it: the day (today unless said otherwise, never in the future or
// before it was saved) and the resume that was sent. A popover on the row; Escape or a click outside closes it.
function Apply({ j, list, preset, onDone, inline }: { j: Posting; list: Saved[]; preset: string; onDone: (day: string, resume: string) => void; inline?: boolean }) {
  const max = fromToday();
  const min = localDay(j.saved) < max ? localDay(j.saved) : max;
  const [when, setWhen] = useState(j.applied ?? max);
  const [resume, setResume] = useState(preset);
  const [error, setError] = useState("");
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!when || when > max) setError("Pick a day up to today.");
        else if (when < min) setError(`Pick a day from ${day(min)}, when you saved it.`);
        else onDone(when, resume);
      }}
      className={`grid gap-3 rounded-2xl bg-white p-4 text-left ring-1 ring-ink/10 ${inline ? "sm:grid-cols-2 sm:items-start" : "absolute right-0 top-full z-30 mt-2 w-[min(20rem,calc(100vw-3rem))] shadow-[0_16px_40px_-14px_rgb(22_27_34/0.4)] transition duration-200 ease-out starting:-translate-y-1 starting:opacity-0"}`}
    >
      <label className="block text-sm font-medium">
        When did you apply
        <input
          type="date"
          autoFocus
          value={when}
          min={min}
          max={max}
          onChange={(e) => {
            setWhen(e.target.value);
            setError("");
          }}
          aria-invalid={!!error}
          className="mt-1.5 block w-full rounded-full bg-white px-3.5 py-2 text-base font-normal ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-accent-text aria-invalid:ring-2 aria-invalid:ring-error sm:text-sm"
        />
        {error && <span role="alert" className="mt-1.5 block text-xs font-medium text-error-text">{error}</span>}
      </label>
      <label className="block text-sm font-medium">
        Which resume did you send
        <select value={resume} onChange={(e) => setResume(e.target.value)} className="mt-1.5 block w-full rounded-full bg-white px-3 py-2 text-base font-normal ring-1 ring-ink/10 outline-none focus:ring-2 focus:ring-accent-text sm:text-sm">
          {[...list].sort(byEdited).map((r) => (
            <option key={r.id} value={r.id}>
              {r.title}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className={`rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/85 pointer-coarse:py-3 ${inline ? "sm:col-span-2 sm:justify-self-start" : ""}`}>
        {j.applied ? "Save details" : "Mark as applied"}
      </button>
    </form>
  );
}


// A job to read, beside its resume. On the left what the job asks: the requirements Rayume took from it (none
// for a job saved by hand: they come from the API's AI) and the description as plain text. On the right the
// resume as a page (the one sent, or the latest tailored), which opens the editor, or a blank sheet. Each side
// scrolls on its own; below lg it's one column, the page first. The same actions as the row; marking as
// applied opens the popover's fields here, and the dialog stays on the job.
// shortcut: the page is the template's sample render (public/resumes/), as on /resumes' cards, so edits made in
// the editor don't show in it until the API serves each resume's own render (resume_renders).
function JobView({ open, j, list, onClose, onTailor, onApply, onUnapply, onEdit }: { open: boolean; j: Posting; list: Saved[]; onClose: () => void; onTailor: () => void; onApply: (day: string, resume: string) => void; onUnapply: () => void; onEdit: () => void }) {
  const [applying, setApplying] = useState(false);
  const url = safeUrl(j.url);
  const r = j.applied ? list.find((x) => x.id === j.sent) : tailored(list, j)[0];
  const preset = list.find((x) => x.id === j.sent)?.id ?? (tailored(list, j)[0] ?? master).id;
  const button = "rounded-full px-4 py-2 text-sm font-medium text-ink/75 ring-1 ring-ink/10 transition hover:text-ink hover:ring-ink/25 pointer-coarse:py-3";
  // the sheet: as wide as the column, up to the page's own 816px; on a phone short enough to see what's below
  const sheet = "relative mx-auto block aspect-[8.5/11] w-[min(100%,calc(60dvh*8.5/11))] lg:w-full lg:max-w-[816px]";
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && (setApplying(false), onClose())}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink/30 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup
          finalFocus={() => document.getElementById(`job-${j.id}`)}
          className="fixed z-50 flex flex-col overflow-hidden bg-paper shadow-[0_24px_64px_-24px_rgb(22_27_34/0.5)] outline-none transition duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none max-lg:inset-x-0 max-lg:bottom-0 max-lg:top-3 max-lg:rounded-t-[28px] max-lg:data-[ending-style]:translate-y-8 max-lg:data-[starting-style]:translate-y-8 lg:left-1/2 lg:top-1/2 lg:h-[88dvh] lg:w-[calc(100%-4rem)] lg:max-w-6xl lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[36px]"
        >
          <div className="flex items-start gap-3.5 border-b border-ink/10 p-5 lg:px-8 lg:pt-7">
            <Logo p={j} className="mt-1 size-10" />
            <div className="min-w-0 flex-1">
              <Dialog.Title className={`${serif} break-words text-[1.75rem] leading-tight tracking-[-0.02em]`}>{j.title}</Dialog.Title>
              <p className="mt-0.5 break-words text-[15px] text-ink/65">{j.company}</p>
              <p className="mt-2 text-[13px] text-ink/60">
                Saved <time dateTime={j.saved}>{day(j.saved)}</time>
                {j.applied && (
                  <>
                    <span className="sr-only">,</span>
                    <span className="ml-4">
                      Applied <time dateTime={j.applied}>{day(j.applied)}</time>
                    </span>
                  </>
                )}
              </p>
            </div>
            <Dialog.Close aria-label="Close" className="-mr-2 -mt-1 grid size-10 shrink-0 place-items-center rounded-full text-ink/55 transition hover:bg-ink/5 hover:text-ink max-lg:hidden">
              <X aria-hidden className="size-5" />
            </Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:overflow-hidden">
            <div className="order-2 px-5 py-6 lg:order-1 lg:overflow-y-auto lg:overscroll-contain lg:px-8">
              <JobDetails j={j} />
            </div>

            <div className="order-1 bg-mist px-5 py-6 lg:order-2 lg:overflow-y-auto lg:overscroll-contain lg:px-8">
              {r ? (
                <>
                  <p className="mx-auto mb-3 max-w-[816px] text-[13px] text-ink/60">
                    {j.applied ? "Resume sent" : "Tailored resume"}
                    <span className="block truncate text-[15px] font-medium text-ink" title={r.title}>
                      {r.title}
                    </span>
                    {templateName(r.template)}
                  </p>
                  <Link
                    href={`/resumes/${r.id}`}
                    aria-label={`Open ${r.title} in the editor`}
                    className={`${sheet} overflow-hidden rounded-sm bg-white shadow-[0_1px_2px_rgb(22_27_34/0.08),0_12px_32px_-16px_rgb(22_27_34/0.3)] ring-1 ring-ink/10 transition duration-300 hover:-translate-y-1 hover:shadow-[0_2px_4px_rgb(22_27_34/0.08),0_24px_48px_-20px_rgb(22_27_34/0.4)] motion-reduce:hover:translate-y-0`}
                  >
                    <Image src={`/resumes/${r.template}.png`} alt="" fill sizes={sheetSizes.job} className="object-cover object-top" />
                  </Link>
                </>
              ) : (
                <div className={`${sheet} grid place-content-center justify-items-center gap-2 rounded-sm bg-paper/70 p-6 text-center ring-1 ring-ink/15`}>
                  <p className="text-sm text-ink/60">{j.applied ? "The resume you sent was deleted" : "No resume for this job yet"}</p>
                  {!j.applied && (
                    <button type="button" onClick={onTailor} className="rounded-full px-2 py-1 text-sm font-medium text-accent-text transition hover:underline pointer-coarse:py-3">
                      Tailor a resume
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-ink/10 p-4 lg:px-8">
            {applying && (
              <div className="mb-3">
                <Apply
                  inline
                  j={j}
                  list={list}
                  preset={preset}
                  onDone={(d, x) => {
                    onApply(d, x);
                    setApplying(false);
                  }}
                />
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              {j.applied ? (
                <>
                  <button type="button" aria-expanded={applying} onClick={() => setApplying((a) => !a)} className={button}>
                    Change details
                  </button>
                  <button type="button" onClick={onUnapply} className={button}>
                    Move back to saved
                  </button>
                </>
              ) : (
                <>
                  <button type="button" aria-expanded={applying} onClick={() => setApplying((a) => !a)} className={`${primary} pointer-coarse:py-3`}>
                    Mark as applied
                  </button>
                  <button type="button" onClick={onEdit} className={button}>
                    Edit
                  </button>
                </>
              )}
              {tailored(list, j)[0] && (
                <Link href={`/resumes/${tailored(list, j)[0].id}/tailor`} className={button}>
                  Review tailoring
                </Link>
              )}
              {url && (
                <a href={url} target="_blank" rel="noreferrer noopener" className={button}>
                  Open posting
                </a>
              )}
              {/* on a phone the sheet closes from down here, where the thumb is */}
              <Dialog.Close className={`${button} ml-auto lg:hidden`}>Close</Dialog.Close>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// What a job asks: the requirements Rayume took from it (none for a job saved by hand: they come from the API's
// AI) and the description as plain text. The job's dialog and the tailoring page both show it.
export function JobDetails({ j }: { j: Posting }) {
  const heading = "text-sm font-medium text-ink/60";
  return (
    <>
      {j.keywords.length > 0 && (
        <section className="mb-6">
          <h3 className={heading}>Requirements</h3>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {j.keywords.map((k) => (
              <li key={k} className="rounded-full bg-mist px-2.5 py-1 text-[13px] text-ink/80">
                {k}
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h3 className={heading}>Description</h3>
        <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{j.description}</p>
      </section>
    </>
  );
}
