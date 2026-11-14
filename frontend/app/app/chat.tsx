"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Mark } from "../logo";
import type { Entry, Posting } from "./data";
import type { Quote } from "./resume";

export const modes = [
  { id: "refine", label: "Refine", hint: "Paste a line from your resume, or say what to change" },
  { id: "add", label: "Add experience", hint: "Tell me about it in your own words" },
  { id: "tailor", label: "Tailor to a job", hint: "Paste a job posting, or pick a saved one" },
  { id: "skills", label: "Find skills", hint: "Ask what skills your resume shows" },
] as const;
export type Mode = (typeof modes)[number]["id"];

export type Message = {
  id: number;
  from: "rayume" | "you";
  text: string;
  quotes?: Quote[];
  suggestion?: { bulletId: string; text: string; applied?: boolean };
  draft?: { entry: Entry; added?: boolean };
  skills?: { hard: [string, number][]; soft: string[] };
  postings?: Posting[];
  tailored?: { posting: Posting; created?: boolean };
};

const small = "rounded-full px-3 py-1.5 text-[13px] font-medium transition pointer-coarse:py-2.5";
const primary = `${small} bg-accent-deep text-white hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))]`;

function Done({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-text">
      <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 10.5 3.2 3L15 7" />
      </svg>
      {children}
    </span>
  );
}

// The assistant beside the resume: messages, the four modes, the pasted quotes, and the composer.
export function Chat({
  messages,
  typing,
  mode,
  setMode,
  draft,
  setDraft,
  quotes,
  removeQuote,
  send,
  apply,
  addEntry,
  tailor,
  pickPosting,
  only,
  addedTo = "your Master Resume",
}: {
  messages: Message[];
  typing: boolean;
  mode: Mode;
  setMode: (m: Mode) => void;
  draft: string;
  setDraft: (s: string) => void;
  quotes: Quote[];
  removeQuote: (i: number) => void;
  send: () => void;
  apply: (m: Message) => void;
  addEntry: (m: Message) => void;
  tailor: (m: Message) => void;
  pickPosting: (p: Posting) => void;
  // the modes to offer; all of them when unset
  only?: Mode[];
  // where an added experience went, for its confirmation
  addedTo?: string;
}) {
  const list = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  // keep the newest message in view
  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, typing]);

  // a paste or a mode change puts the cursor in the composer
  useEffect(() => {
    box.current?.focus();
  }, [quotes.length, mode]);

  // grow the composer with its text, up to six lines
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 6 * 22 + 20)}px`;
  }, [draft]);

  const canSend = draft.trim() || quotes.length;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={list} aria-live="polite" className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
        {messages.map((m) =>
          m.from === "you" ? (
            <div key={m.id} className="ml-8 flex justify-end">
              <div className="rounded-2xl rounded-tr-md bg-accent-deep px-3.5 py-2.5 text-[14px] leading-relaxed text-white">
                {m.quotes?.map((q, i) => (
                  <p key={i} className="mb-1.5 border-l-2 border-white/40 pl-2 text-[13px] italic text-white/80">“{q.text}”</p>
                ))}
                {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
              </div>
            </div>
          ) : (
            <div key={m.id} className="mr-6 flex gap-2.5">
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent-deep text-white">
                <Mark className="h-4 w-auto" />
              </span>
              <div className="min-w-0 space-y-2.5">
                <p className="rounded-2xl rounded-tl-md bg-mist px-3.5 py-2.5 text-[14px] leading-relaxed">{m.text}</p>

                {m.suggestion && (
                  <div className="rounded-2xl bg-white p-3.5 text-[14px] leading-relaxed ring-1 ring-accent/25">
                    <p>{m.suggestion.text}</p>
                    <div className="mt-3">
                      {m.suggestion.applied ? (
                        <Done>Replaced in your resume</Done>
                      ) : (
                        <button type="button" onClick={() => apply(m)} className={primary}>
                          Replace in resume
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {m.draft && (
                  <div className="rounded-2xl bg-white p-3.5 text-[14px] ring-1 ring-accent/25">
                    <p className="font-medium">{m.draft.entry.title}</p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-5 text-ink/80">
                      {m.draft.entry.bullets.map((b) => (
                        <li key={b.id}>{b.text}</li>
                      ))}
                    </ul>
                    <div className="mt-3">
                      {m.draft.added ? (
                        <Done>Added to {addedTo}</Done>
                      ) : (
                        <button type="button" onClick={() => addEntry(m)} className={primary}>
                          Add to resume
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {m.skills && (
                  <div className="space-y-2">
                    <ul aria-label="Hard skills" className="flex flex-wrap gap-1.5">
                      {m.skills.hard.map(([s, n]) => (
                        <li key={s} className="rounded-full bg-ink px-2.5 py-1 text-[12px] font-medium text-white">
                          {s}
                          {n > 1 && <span className="ml-1 text-white/60">×{n}</span>}
                        </li>
                      ))}
                    </ul>
                    <ul aria-label="Soft skills" className="flex flex-wrap gap-1.5">
                      {m.skills.soft.map((s) => (
                        <li key={s} className="rounded-full bg-accent/15 px-2.5 py-1 text-[12px] font-medium text-accent-text">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {m.postings && (
                  <div className="flex flex-wrap gap-2">
                    {m.postings.map((p) => (
                      <button key={p.id} type="button" onClick={() => pickPosting(p)} className={`${small} bg-white ring-1 ring-ink/10 hover:ring-ink/25`}>
                        {p.company}, {p.title}
                      </button>
                    ))}
                  </div>
                )}

                {m.tailored && (
                  <div>
                    {m.tailored.created ? (
                      <Done>Saved to My resumes</Done>
                    ) : (
                      <button type="button" onClick={() => tailor(m)} className={primary}>
                        Create tailored resume
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ),
        )}
        {typing && (
          <div className="flex items-center gap-2.5" aria-label="Rayume is typing">
            <span className="grid size-7 place-items-center rounded-full bg-accent-deep text-white">
              <Mark className="h-4 w-auto" />
            </span>
            <span className="flex gap-1 rounded-2xl rounded-tl-md bg-mist px-3.5 py-3.5">
              {[0, 1, 2].map((d) => (
                <span key={d} style={{ animationDelay: `${d * 150}ms` }} className="size-1.5 animate-pulse rounded-full bg-ink/40" />
              ))}
            </span>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSend) send();
        }}
        className="border-t border-ink/10 p-3 sm:p-4"
      >
        <div role="group" aria-label="Mode" className="flex flex-wrap gap-1.5 pb-3">
          {modes.filter((m) => !only || only.includes(m.id)).map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => setMode(m.id)}
              className={`${small} whitespace-nowrap ${mode === m.id ? "bg-ink text-white" : "bg-mist text-ink/70 hover:text-ink"}`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-accent-text">
          {/* each pasted text as a chip above the input; rows 0fr to 1fr grows the composer to fit as one fades
              up. Past a few the chips scroll, so the input stays on screen */}
          <div className="max-h-44 overflow-y-auto">
            {quotes.map((quote, i) => (
              <div
                key={quote.text}
                className="grid grid-rows-[1fr] transition-[grid-template-rows,opacity,translate] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none starting:translate-y-1 starting:grid-rows-[0fr] starting:opacity-0"
              >
                <div className="min-h-0 overflow-hidden">
                  <div className="mx-2 mt-2 flex items-start gap-2.5 rounded-xl bg-accent/[0.07] py-2 pl-3 pr-1.5">
                    <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 size-3.5 shrink-0 text-accent-text" fill="currentColor">
                      <path d="M3 11.5C3 8 4.8 5.8 7.6 4.6l.6 1.2C6.6 6.7 5.8 8 5.6 9.6H8V15H3zm8.5 0c0-3.5 1.8-5.7 4.6-6.9l.6 1.2c-1.6.9-2.4 2.2-2.6 3.8h2.4V15h-5z" />
                    </svg>
                    <p className="line-clamp-2 flex-1 text-[13px] leading-snug text-ink/75">{quote.text}</p>
                    <button type="button" onClick={() => removeQuote(i)} aria-label="Remove the pasted text" className="-my-0.5 grid size-6 shrink-0 place-items-center rounded-full text-ink/45 transition hover:bg-ink/5 hover:text-ink pointer-coarse:size-9">
                      <svg aria-hidden viewBox="0 0 20 20" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="m6 6 8 8M14 6l-8 8" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-2 p-2">
            <label htmlFor="chat-box" className="sr-only">
              Message Rayume
            </label>
            <textarea
              ref={box}
              id="chat-box"
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canSend) send();
                }
              }}
              placeholder={modes.find((m) => m.id === mode)!.hint}
              className="min-h-10 flex-1 resize-none bg-transparent px-1.5 py-2 text-base leading-[22px] outline-none placeholder:text-ink/40 sm:text-[14px]"
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-deep text-white transition hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))] disabled:bg-ink/15"
            >
              <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 15V5m-4.5 4.5L10 5l4.5 4.5" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
