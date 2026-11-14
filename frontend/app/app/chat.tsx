"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  getExternalStoreMessages,
  MessagePrimitive,
  ThreadPrimitive,
  useAui,
  useAuiState,
  useExternalStoreRuntime,
} from "@assistant-ui/react";
import { ArrowDown } from "lucide-react";
import { motion } from "motion/react";
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

// a message comes in from just below where it lands
const enter = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } };

// what a message's buttons do, for the messages assistant-ui renders
type Actions = { apply: (m: Message) => void; addEntry: (m: Message) => void; tailor: (m: Message) => void; pickPosting: (p: Posting) => void; addedTo: string };
const On = createContext<Actions>(null!);

// the message assistant-ui is rendering, as ours: its cards need more than its text
const useOurs = () => useAuiState((s) => getExternalStoreMessages<Message>(s.message)[0]);

function Yours() {
  const m = useOurs();
  return (
    <MessagePrimitive.Root>
      <motion.div {...enter} className="ml-8 flex justify-end">
        <div className="rounded-2xl rounded-tr-md bg-accent-deep px-3.5 py-2.5 text-[14px] leading-relaxed text-white">
          {m.quotes?.map((q, i) => (
            <p key={i} className="mb-1.5 border-l-2 border-white/40 pl-2 text-[13px] italic text-white/80">“{q.text}”</p>
          ))}
          {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
        </div>
      </motion.div>
    </MessagePrimitive.Root>
  );
}

function Avatar() {
  return (
    <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-accent-deep text-white">
      <Mark className="h-4 w-auto" />
    </span>
  );
}

function Rayumes() {
  const m = useOurs();
  const on = useContext(On);
  return (
    <MessagePrimitive.Root>
      <motion.div {...enter} className="mr-6 flex gap-2.5">
        <Avatar />
        <div className="min-w-0 space-y-2.5">
          <p className="rounded-2xl rounded-tl-md bg-mist px-3.5 py-2.5 text-[14px] leading-relaxed">{m.text}</p>

            {m.suggestion && (
              <div className="rounded-2xl bg-white p-3.5 text-[14px] leading-relaxed ring-1 ring-accent/25">
                <p>{m.suggestion.text}</p>
                <div className="mt-3">
                  {m.suggestion.applied ? (
                    <Done>Replaced in your resume</Done>
                  ) : (
                    <button type="button" onClick={() => on.apply(m)} className={primary}>
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
                    <Done>Added to {on.addedTo}</Done>
                  ) : (
                    <button type="button" onClick={() => on.addEntry(m)} className={primary}>
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
                  <button key={p.id} type="button" onClick={() => on.pickPosting(p)} className={`${small} bg-white ring-1 ring-ink/10 hover:ring-ink/25`}>
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
                  <button type="button" onClick={() => on.tailor(m)} className={primary}>
                    Create tailored resume
                  </button>
                )}
              </div>
            )}
        </div>
      </motion.div>
    </MessagePrimitive.Root>
  );
}
const components = { UserMessage: Yours, AssistantMessage: Rayumes };

// The assistant beside the resume: messages, the four modes, the pasted quotes, and the composer, on
// assistant-ui's primitives (thread, viewport that follows the newest message, composer). The messages stay
// ours, held by the page: assistant-ui reads them through an external store and hands what's typed to send.
// shortcut: no isRunning, the typing dots are ours; with a streaming API, pass isRunning and let it show the run
export function Chat({
  messages,
  typing,
  mode,
  setMode,
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
  quotes: Quote[];
  removeQuote: (i: number) => void;
  // what was typed (empty when only quotes go)
  send: (text: string) => void;
  apply: (m: Message) => void;
  addEntry: (m: Message) => void;
  tailor: (m: Message) => void;
  pickPosting: (p: Posting) => void;
  // the modes to offer; all of them when unset
  only?: Mode[];
  // where an added experience went, for its confirmation
  addedTo?: string;
}) {
  const runtime = useExternalStoreRuntime<Message>({
    messages,
    convertMessage: (m) => ({ id: String(m.id), role: m.from === "you" ? "user" : "assistant", content: [{ type: "text", text: m.text }] }),
    onNew: async (m) => send(m.content.flatMap((p) => (p.type === "text" ? [p.text] : [])).join("")),
  });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <On.Provider value={{ apply, addEntry, tailor, pickPosting, addedTo }}>
        <Thread typing={typing} mode={mode} setMode={setMode} quotes={quotes} removeQuote={removeQuote} send={send} only={only} />
      </On.Provider>
    </AssistantRuntimeProvider>
  );
}

function Thread({
  typing,
  mode,
  setMode,
  quotes,
  removeQuote,
  send,
  only,
}: {
  typing: boolean;
  mode: Mode;
  setMode: (m: Mode) => void;
  quotes: Quote[];
  removeQuote: (i: number) => void;
  send: (text: string) => void;
  only?: Mode[];
}) {
  const aui = useAui();
  const text = useAuiState((s) => s.composer.text);
  const box = useRef<HTMLTextAreaElement>(null);
  // quotes go on their own: the composer won't send empty text, so they skip it
  const go = () => (text.trim() ? aui.composer().send() : quotes.length && send(""));

  // a paste or a mode change puts the cursor in the composer
  useEffect(() => {
    box.current?.focus();
  }, [quotes.length, mode]);

  return (
    <ThreadPrimitive.Root className="flex h-full min-h-0 flex-col">
      {/* the newest message stays in view as the list grows, unless you've scrolled up to read */}
      <div className="relative min-h-0 flex-1">
        <ThreadPrimitive.Viewport aria-live="polite" className="h-full space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
          <ThreadPrimitive.Messages components={components} />
          {typing && (
            <motion.div {...enter} className="flex items-center gap-2.5" aria-label="Rayume is typing">
              <Avatar />
              <span className="flex gap-1 rounded-2xl rounded-tl-md bg-mist px-3.5 py-3.5">
                {[0, 1, 2].map((d) => (
                  <motion.span key={d} animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }} className="size-1.5 rounded-full bg-ink/50" />
                ))}
              </span>
            </motion.div>
          )}
        </ThreadPrimitive.Viewport>
        {/* the way back down, once you've scrolled up from the newest message */}
        <ThreadPrimitive.ScrollToBottom
          aria-label="Scroll to the newest message"
          className="absolute bottom-3 left-1/2 grid size-8 -translate-x-1/2 place-items-center rounded-full bg-white text-ink/70 shadow-[0_8px_20px_-8px_rgb(22_27_34/0.4)] ring-1 ring-ink/10 transition duration-200 hover:text-ink disabled:pointer-events-none disabled:translate-y-2 disabled:opacity-0"
        >
          <ArrowDown aria-hidden className="size-4" />
        </ThreadPrimitive.ScrollToBottom>
      </div>

      <ComposerPrimitive.Root
        onSubmit={(e) => {
          // the composer sends text itself; this catches quotes going on their own
          if (!text.trim()) {
            e.preventDefault();
            go();
          }
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
            <ComposerPrimitive.Input
              ref={box}
              aria-label="Message Rayume"
              submitMode="enter"
              maxRows={6}
              onKeyDown={(e) => {
                // Enter with only quotes: the composer ignores empty text, so they're sent here
                if (e.key === "Enter" && !e.shiftKey && !text.trim()) {
                  e.preventDefault();
                  go();
                }
              }}
              placeholder={modes.find((m) => m.id === mode)!.hint}
              className="min-h-10 flex-1 resize-none bg-transparent px-1.5 py-2 text-base leading-[22px] outline-none placeholder:text-ink/40 sm:text-[14px]"
            />
            <button
              type="button"
              onClick={go}
              disabled={!text.trim() && !quotes.length}
              aria-label="Send"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-deep text-white transition hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))] disabled:bg-ink/15"
            >
              <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 15V5m-4.5 4.5L10 5l4.5 4.5" />
              </svg>
            </button>
          </div>
        </div>
      </ComposerPrimitive.Root>
    </ThreadPrimitive.Root>
  );
}
