"use client";

import { useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import Image from "next/image";
import { templates } from "./templates/data";

const filters = ["All", "One column", "Two column"];

// Animate the grid between states where the View Transitions API exists; elsewhere just update.
export function transition(update: () => void) {
  if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) return update();
  document.startViewTransition(() => flushSync(update));
}

// The heading comes in as children so the filter tabs can sit beside it.
export function Gallery({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState("jake");
  const shown = templates.filter((t) => filter === "All" || t.layout === filter);

  return (
    <>
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        {children}
        <div role="tablist" aria-label="Filter templates" className="glass flex max-w-full gap-1 self-start overflow-x-auto rounded-full p-1 text-sm md:self-auto">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={f === filter}
              aria-controls="template-grid"
              onClick={() => transition(() => setFilter(f))}
              className={`shrink-0 rounded-full px-4 py-2 transition ${f === filter ? "bg-ink text-white" : "text-ink/70 hover:bg-white/50"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <ul id="template-grid" className="mt-14 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {shown.map((t) => {
          const on = t.file === selected;
          return (
            <li key={t.file} style={{ viewTransitionName: `tpl-${t.file}` }}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => setSelected(t.file)}
                className={`glass group block w-full rounded-[26px] p-3 text-left transition hover:-translate-y-1 motion-reduce:hover:translate-y-0 ${on ? "ring-2 ring-accent" : ""}`}
              >
                <span className="relative block aspect-[8.5/11] overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgb(22_27_34/0.08),0_12px_32px_-16px_rgb(22_27_34/0.3)]">
                  <Image
                    src={`/resumes/${t.file}.png`}
                    alt={`Lucas Mendes's resume in the ${t.name} template`}
                    fill
                    draggable={false}
                    sizes="(min-width: 1024px) 360px, 45vw"
                    className="object-cover transition duration-500 group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
                  />
                </span>
                <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-1.5 pb-1 pt-3 text-sm font-medium">
                  {t.name}
                  {on ? (
                    <span className="rounded-full bg-accent-deep px-2.5 py-0.5 text-xs text-white">Selected</span>
                  ) : (
                    <span className="text-xs font-normal text-ink/50">{t.layout}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
