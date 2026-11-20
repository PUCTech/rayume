"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { Sparks } from "./motion-article/sparks";

// Ticks live in localStorage as the ticked indices ("0,3,4"), one key per checklist id. Storage can be
// missing or throw (private mode, blocked cookies), so a copy in memory keeps ticking working for the visit.
const key = (id: string) => `rayume:checklist:${id}`;
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function read(id: string) {
  try {
    return localStorage.getItem(key(id)) ?? memory.get(id) ?? "";
  } catch {
    return memory.get(id) ?? "";
  }
}

function write(id: string, value: string) {
  memory.set(id, value);
  try {
    localStorage.setItem(key(id), value);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb); // another tab ticked something
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function Ticks({ id, items }: { id: string; items: { label: ReactNode; detail?: ReactNode }[] }) {
  // the server and the first client render show nothing ticked; the stored ticks arrive right after hydration
  const raw = useSyncExternalStore(subscribe, () => read(id), () => "");
  const done = new Set(raw.split(",").filter(Boolean).map(Number));
  const count = items.filter((_, i) => done.has(i)).length;

  const all = count === items.length && count > 0;
  // the burst answers the tick that finished the list, so it's a counter bumped by that click, not derived from `all`:
  // a list that loads already done, or another tab finishing it, stays still
  const [burst, setBurst] = useState(0);

  const toggle = (i: number) => {
    const next = new Set(done);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    write(id, [...next].sort((a, b) => a - b).join(","));
    if (items.every((_, j) => next.has(j))) setBurst((b) => b + 1);
  };

  return (
    <div className="mt-6">
      <div className="flex min-h-11 items-center gap-4 text-sm">
        {/* words carry the state; the bar only shows it at a glance */}
        <p aria-live="polite" className={`relative mt-0! flex shrink-0 items-center gap-1.5 tabular-nums ${all ? "font-medium text-success-text" : "text-ink/60"}`}>
          {burst > 0 && all && <Sparks key={burst} />}
          {all && (
            <svg viewBox="0 0 16 16" aria-hidden className="size-3.5 text-success" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
            </svg>
          )}
          {all ? `All ${items.length} done` : `${count} of ${items.length} done`}
        </p>
        <div aria-hidden className="h-1 min-w-8 flex-1 overflow-hidden rounded-full bg-ink/10">
          <div
            // a slight overshoot, so each tick springs the bar forward
            className={`h-full rounded-full transition-[width,background-color] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none ${all ? "bg-success" : "bg-accent"}`}
            style={{ width: `${(count / items.length) * 100}%` }}
          />
        </div>
        <button
          type="button"
          onClick={() => write(id, "")}
          // kept in the layout when there's nothing to clear, so the bar doesn't jump when the first tick lands
          className={`-mr-4 shrink-0 rounded-full px-4 py-2 font-medium text-ink/70 transition hover:bg-mist hover:text-ink pointer-coarse:min-h-11 ${count ? "" : "invisible"}`}
        >
          Start over
        </button>
      </div>
      <ul className="mt-2! list-none! divide-y divide-ink/10 border-y border-ink/10 pl-0!">
        {items.map((it, i) => {
          const on = done.has(i);
          return (
            <li key={i} className="mt-0!">
              <label className="-mx-3 flex min-h-11 cursor-pointer gap-4 rounded-2xl px-3 py-4 transition hover:bg-mist/50">
                <span className="relative mt-0.5 grid size-6 shrink-0 place-items-center">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggle(i)}
                    className="peer absolute inset-0 cursor-pointer appearance-none rounded-full bg-surface ring-1 ring-ink/25 transition active:scale-90 checked:bg-accent-deep checked:ring-accent-deep"
                  />
                  {/* the tick draws itself in (dash offset, inherited by the path) and pops a little past full size */}
                  <svg
                    viewBox="0 0 16 16"
                    aria-hidden
                    className="pointer-events-none relative size-3.5 scale-50 text-white opacity-0 transition-[opacity,scale,stroke-dashoffset] delay-75 duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] [stroke-dasharray:1] [stroke-dashoffset:1] peer-checked:scale-100 peer-checked:opacity-100 peer-checked:[stroke-dashoffset:0] motion-reduce:transition-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path pathLength={1} d="M3.5 8.5 6.5 11.5 12.5 4.5" />
                  </svg>
                </span>
                <span className="min-w-0">
                  {/* the strike is a 1px background that sweeps along the label's lines as it greys */}
                  <span className={`block font-medium transition-colors duration-300 ${on ? "text-ink/50" : "text-ink"}`}>
                    <span
                      className={`bg-[linear-gradient(color-mix(in_oklab,var(--color-ink)_30%,transparent),color-mix(in_oklab,var(--color-ink)_30%,transparent))] bg-position-[0_60%] bg-no-repeat transition-[background-size] duration-300 ease-out motion-reduce:transition-none ${on ? "bg-size-[100%_1px]" : "bg-size-[0%_1px]"}`}
                    >
                      {it.label}
                    </span>
                  </span>
                  {it.detail && <span className="mt-1 block text-[15px] leading-relaxed text-ink/65">{it.detail}</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
