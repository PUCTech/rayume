"use client";

import { useEffect, useRef, useState } from "react";
import { profile, skillGroups, span, type Entry } from "./data";

export type Quote = { text: string; bulletId?: string };

const sections: [Entry["type"], string][] = [
  ["professional", "Experience"],
  ["project", "Projects"],
  ["education", "Education"],
  ["certification", "Certifications"],
];

// The Master Resume as a real document, so its text can be selected (a PDF picture can't). Selecting
// text shows a "Paste into chat" button over the selection; it remembers which bullet the text came
// from, so the chat can replace exactly that line. A bullet the chat just changed flashes.
export function Resume({ entries, flash, onQuote }: { entries: Entry[]; flash?: string; onQuote: (q: Quote) => void }) {
  const doc = useRef<HTMLDivElement>(null);
  const [pick, setPick] = useState<(Quote & { x: number; y: number }) | null>(null);

  useEffect(() => {
    const onChange = () => {
      const sel = document.getSelection();
      const text = sel?.toString().replace(/\s+/g, " ").trim() ?? "";
      if (!sel || sel.isCollapsed || text.length < 3 || !doc.current?.contains(sel.anchorNode)) return setPick(null);
      const r = sel.getRangeAt(0).getBoundingClientRect();
      const bullet = (sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode?.parentElement)?.closest<HTMLElement>("[data-bullet]");
      setPick({ text, bulletId: bullet?.dataset.bullet, x: r.left + r.width / 2, y: r.top });
    };
    document.addEventListener("selectionchange", onChange);
    return () => document.removeEventListener("selectionchange", onChange);
  }, []);

  return (
    <>
      <article
        ref={doc}
        aria-label={`${profile.name}'s Master Resume`}
        // a serif like the compiled LaTeX, so the Master Resume reads as the document it becomes
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        className="mx-auto w-full max-w-[52rem] rounded-sm bg-white px-5 py-8 text-[13px] leading-[1.45] text-ink shadow-[0_1px_2px_rgb(22_27_34/0.08),0_24px_60px_-28px_rgb(22_27_34/0.35)] selection:bg-accent/20 sm:px-12 sm:py-12 sm:text-[15px]"
      >
        <header className="text-center">
          <h1 className="text-[1.9em] font-bold uppercase tracking-wide">{profile.name}</h1>
          <p className="mt-1 text-[0.86em]">
            {[profile.address, profile.email, profile.phone, ...profile.links].join("  •  ")}
          </p>
        </header>

        {sections.map(([type, title]) => {
          const list = entries.filter((e) => e.type === type);
          if (!list.length) return null;
          return (
            <section key={type} className="mt-5">
              <h2 className="border-b border-ink pb-0.5 text-[1.15em] font-bold">{title}</h2>
              {list.map((e) => (
                <div key={e.id} className="mt-2.5">
                  <div className="flex flex-wrap justify-between gap-x-4">
                    <p>
                      <b>{e.type === "professional" ? e.organization : e.title}</b>
                      {e.type === "education" || e.type === "certification" ? ` – ${e.organization}` : ""}
                      {e.stack ? ` • ${e.stack}` : ""}
                      {e.note && e.type === "project" ? ` • ${e.note}` : ""}
                    </p>
                    <p>{e.type === "professional" ? e.location : `${span(e)}${e.note && e.type === "education" ? ` (${e.note})` : ""}`}</p>
                  </div>
                  {e.type === "professional" && (
                    <div className="flex flex-wrap justify-between gap-x-4">
                      <p className="italic">{e.title}</p>
                      <p>{span(e)}</p>
                    </div>
                  )}
                  {e.bullets.length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-5">
                      {e.bullets.map((bl) => (
                        <li
                          key={bl.id}
                          data-bullet={bl.id}
                          // on instantly, then fades out over a second when the flash ends
                          className={`rounded-sm transition-colors ${flash === bl.id ? "bg-accent/15 duration-0" : "duration-1000"}`}
                        >
                          {bl.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          );
        })}

        <section className="mt-5">
          <h2 className="border-b border-ink pb-0.5 text-[1.15em] font-bold">Technical Skills</h2>
          <div className="mt-2 space-y-0.5">
            {skillGroups.map(([k, v]) => (
              <p key={k}>
                <b>{k}:</b> {v}
              </p>
            ))}
          </div>
        </section>
      </article>

      {pick && (
        <button
          type="button"
          // keep the selection alive while the button takes the click
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            onQuote({ text: pick.text, bulletId: pick.bulletId });
            document.getSelection()?.removeAllRanges();
            setPick(null);
          }}
          style={{ left: pick.x, top: Math.max(8, pick.y - 48) }}
          className="fixed z-40 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[13px] font-medium text-white shadow-[0_10px_28px_-10px_rgb(22_27_34/0.6)] transition duration-200 ease-out starting:translate-y-1 starting:opacity-0 pointer-coarse:py-2.5"
        >
          <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5h12v8H9l-4 3v-3H4z" />
          </svg>
          Paste into chat
        </button>
      )}
    </>
  );
}
