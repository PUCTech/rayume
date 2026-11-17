"use client";

import { useState } from "react";
import type { Posting } from "../app/data";
import type { Saved } from "../resumes/data";
import { day, localDay } from "../resumes/shared";

const WEEKS = 26;
const BAR_WEEKS = 8;
// a day as YYYY-MM-DD in the person's own time zone
const iso = (d: Date) => d.toLocaleDateString("en-CA");
const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;
// one hue, light to dark, by how much happened that day (tints by opacity, as the design system does)
const shade = (n: number) => (n === 0 ? "bg-ink/[0.07]" : n === 1 ? "bg-accent/30" : n === 2 ? "bg-accent/55" : n === 3 ? "bg-accent/80" : "bg-accent");
const card = "rounded-[28px] bg-mist p-5 sm:p-6";

// Two charts from the list itself, nothing stored or scored: a GitHub-style grid of what you did each day for
// the last six months (a job saved, an application, a resume tailored), and how many applications went out
// each of the last eight weeks. Hovering or focusing a cell or bar says its number in the line under it.
export function Activity({ jobs, list }: { jobs: Posting[]; list: Saved[] }) {
  const [hover, setHover] = useState<string>();
  const [barHover, setBarHover] = useState<string>();

  const counts = new Map<string, number>();
  const add = (d?: string) => d && counts.set(localDay(d), (counts.get(localDay(d)) ?? 0) + 1);
  jobs.forEach((j) => (add(j.saved), add(j.applied)));
  list.forEach((r) => r.job && add(r.updated));

  // columns are weeks, Sunday on top, the last one this week, ending today
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() - (WEEKS - 1) * 7);
  const days = Array.from({ length: WEEKS * 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return iso(d);
  });
  const end = iso(today);
  const total = days.reduce((s, d) => s + (counts.get(d) ?? 0), 0);
  // a month's name over the week it starts in
  const months = Array.from({ length: WEEKS }, (_, w) => {
    const first = days[w * 7];
    const prev = w ? days[(w - 1) * 7] : "";
    return first.slice(5, 7) !== prev.slice(5, 7) ? new Date(first + "T12:00").toLocaleDateString("en-US", { month: "short" }) : "";
  });

  // applications per week, the last bar this week
  const weeks = Array.from({ length: BAR_WEEKS }, (_, i) => {
    const from = days[(WEEKS - BAR_WEEKS + i) * 7];
    const to = days[(WEEKS - BAR_WEEKS + i) * 7 + 6];
    return { from, n: jobs.filter((j) => j.applied && localDay(j.applied) >= from && localDay(j.applied) <= to).length };
  });
  // the scale tops out at 3 at least, so one application isn't a bar to the ceiling
  const top = Math.max(3, ...weeks.map((w) => w.n));

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <figure className={card}>
        <figcaption className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium">Activity</span>
          <span className="text-ink/60">{plural(total, "thing")} done in 6 months</span>
        </figcaption>
        <div className="mt-4">
          <div>
            <div aria-hidden className="grid gap-[3px] text-[11px] text-ink/50" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }}>
              {months.map((m, i) => (
                <span key={i} className="h-4 overflow-visible whitespace-nowrap">
                  {m}
                </span>
              ))}
            </div>
            <div role="img" aria-label={`${plural(total, "thing")} done in the last 6 months`} className="grid grid-flow-col grid-rows-7 gap-[3px]" style={{ gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))` }} onMouseLeave={() => setHover(undefined)}>
              {days.map((d) =>
                d > end ? (
                  <span key={d} />
                ) : (
                  <span
                    key={d}
                    onMouseEnter={() => setHover(`${plural(counts.get(d) ?? 0, "thing")} on ${day(d)}`)}
                    className={`aspect-square rounded-[3px] transition hover:ring-2 hover:ring-ink/40 ${shade(counts.get(d) ?? 0)}`}
                  />
                ),
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-[12px] text-ink/60">
          <span aria-live="polite" className="min-h-4">{hover ?? "Saved, applied and tailored, by day"}</span>
          <span aria-hidden className="flex shrink-0 items-center gap-[3px]">
            Less
            {[0, 1, 2, 3, 4].map((n) => (
              <span key={n} className={`size-3 rounded-[3px] ${shade(n)}`} />
            ))}
            More
          </span>
        </div>
      </figure>

      <figure className={card}>
        <figcaption className="flex items-baseline justify-between gap-3 text-sm">
          <span className="font-medium">Applications per week</span>
          <span className="text-ink/60">last 8 weeks</span>
        </figcaption>
        <div className="relative mt-4">
          {/* recessive gridlines at the top and middle of the scale, numbered */}
          {[top, top / 2].map((v) => (
            <span key={v} aria-hidden className="absolute inset-x-0 border-t border-dashed border-ink/10 text-[11px] text-ink/45" style={{ bottom: `${(v / top) * 100}%` }}>
              <span className="absolute -top-2 right-0 bg-mist pl-1 leading-none">{Number.isInteger(v) ? v : ""}</span>
            </span>
          ))}
        <ul className="relative flex h-40 items-end gap-3 border-b border-ink/15 pr-5" onMouseLeave={() => setBarHover(undefined)}>
          {weeks.map((w) => (
            <li
              key={w.from}
              tabIndex={0}
              aria-label={`${plural(w.n, "application")} the week of ${day(w.from)}`}
              onMouseEnter={() => setBarHover(`${plural(w.n, "application")} the week of ${day(w.from)}`)}
              onFocus={() => setBarHover(`${plural(w.n, "application")} the week of ${day(w.from)}`)}
              className="group flex h-full flex-1 items-end justify-center rounded-t-[4px] outline-none focus-visible:ring-2 focus-visible:ring-accent-text"
            >
              <span className="block w-full max-w-7 rounded-t-[4px] bg-accent-deep transition group-hover:bg-accent" style={{ height: w.n ? `${(w.n / top) * 100}%` : "2px", opacity: w.n ? 1 : 0.25 }} />
            </li>
          ))}
        </ul>
        </div>
        <div aria-hidden className="mt-1.5 flex gap-3 pr-5 text-[11px] text-ink/45">
          {weeks.map((w, i) => (
            <span key={w.from} className="flex-1 whitespace-nowrap text-center">
              {i === weeks.length - 1 ? "Now" : i % 2 ? "" : day(w.from)}
            </span>
          ))}
        </div>
        <p aria-live="polite" className="mt-3 min-h-4 text-[12px] text-ink/60">
          {barHover ?? `Most in a week: ${plural(Math.max(...weeks.map((w) => w.n)), "application")}`}
        </p>
      </figure>
    </div>
  );
}
