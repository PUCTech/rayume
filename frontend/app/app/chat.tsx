"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { AssistantRuntimeProvider, useAssistantDataUI, useAui, useExternalStoreRuntime, type DataMessagePartProps } from "@assistant-ui/react";
import { Thread } from "@/components/assistant-ui/elements/thread.aui";
import { TooltipProvider } from "@/components/ui/tooltip";
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

// what the chat's cards do, and the mode, for the parts assistant-ui renders
type Context = {
  apply: (m: Message) => void;
  addEntry: (m: Message) => void;
  tailor: (m: Message) => void;
  pickPosting: (p: Posting) => void;
  addedTo: string;
  mode: Mode;
  setMode: (m: Mode) => void;
  only?: Mode[];
};
const On = createContext<Context>(null!);

// A message's resume actions (a rewrite to apply, a drafted entry, skills, postings, a tailored resume): a
// "data" part after its text, holding the whole message, rendered here
function Cards({ data }: DataMessagePartProps) {
  const m = data as Message;
  const on = useContext(On);
  return (
    <div className="mt-2.5 space-y-2.5">
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
  );
}
const hasCards = (m: Message) => !!(m.suggestion || m.draft || m.skills || m.postings || m.tailored);

// the modes, in the composer's action row
function Modes() {
  const { mode, setMode, only } = useContext(On);
  return (
    <div role="group" aria-label="Mode" className="flex gap-1 overflow-x-auto">
      {modes.filter((m) => !only || only.includes(m.id)).map((m) => (
        <button
          key={m.id}
          type="button"
          aria-pressed={mode === m.id}
          onClick={() => setMode(m.id)}
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition ${mode === m.id ? "bg-ink text-white" : "text-ink/60 hover:bg-mist hover:text-ink"}`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
const components = { ComposerExtra: Modes };

// a quote rides as a composer attachment: its text is the name and the content, and its bullet (when the
// page knows it) leads the id
const quoteId = (q: Quote) => `${q.bulletId ?? ""}|${Math.random().toString(36).slice(2)}`;
const asQuote = (a: { id: string; name: string }): Quote => {
  const bulletId = a.id.slice(0, a.id.indexOf("|"));
  return bulletId ? { text: a.name, bulletId } : { text: a.name };
};

// Quotes the page sends (a selection pasted, an entry focused) go into the composer, once each
function Inbox({ quotes, taken }: { quotes: Quote[]; taken: () => void }) {
  const aui = useAui();
  useEffect(() => {
    if (!quotes.length) return;
    const composer = aui.composer();
    const there = composer.getState().attachments.map((a) => a.name);
    quotes.filter((q) => !there.includes(q.text)).forEach((q) => composer.addAttachment({ id: quoteId(q), type: "quote", name: q.text, content: [{ type: "text", text: q.text }] }));
    taken();
    document.querySelector<HTMLTextAreaElement>(".aui-composer-input")?.focus();
  }, [quotes, aui, taken]);
  return null;
}

function Registered() {
  useAssistantDataUI({ name: "cards", render: Cards });
  return null;
}

// The assistant beside the resume, on assistant-ui's Thread (components/assistant-ui, copied in from its
// registry and ours to change): its message list, markdown, copy, scroll and composer, in Rayume's colors.
// The messages stay the page's: assistant-ui reads them through an external store, shows typing as its
// running indicator, and hands what's sent (the text and the quotes attached) to send.
export function Chat({
  messages,
  typing,
  mode,
  setMode,
  quotes,
  takeQuotes,
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
  // quotes the page wants in the composer; takeQuotes empties the list once they're in
  quotes: Quote[];
  takeQuotes: () => void;
  send: (text: string, quotes: Quote[]) => void;
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
    isRunning: typing,
    convertMessage: (m) => ({
      id: String(m.id),
      role: m.from === "you" ? "user" : "assistant",
      content: [...(m.text ? [{ type: "text" as const, text: m.text }] : []), ...(hasCards(m) ? [{ type: "data" as const, name: "cards", data: m }] : [])],
      attachments: m.quotes?.map((q, i) => ({ id: `${m.id}-${i}`, type: "quote", name: q.text, status: { type: "complete" as const }, content: [{ type: "text" as const, text: q.text }] })),
    }),
    onNew: async (m) =>
      send(
        m.content.flatMap((p) => (p.type === "text" ? [p.text] : [])).join(""),
        (m.attachments ?? []).filter((a) => a.type === "quote").map(asQuote),
      ),
  });
  const box = useRef<HTMLDivElement>(null);
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <TooltipProvider>
        <On.Provider value={{ apply, addEntry, tailor, pickPosting, addedTo, mode, setMode, only }}>
          <Registered />
          <Inbox quotes={quotes} taken={takeQuotes} />
          <div ref={box} className="h-full">
            <Thread autoFocus={false} components={{ ...components, placeholder: modes.find((m) => m.id === mode)!.hint }} />
          </div>
        </On.Provider>
      </TooltipProvider>
    </AssistantRuntimeProvider>
  );
}
