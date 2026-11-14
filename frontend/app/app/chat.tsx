"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Popover } from "@base-ui/react/popover";
import {
  AssistantRuntimeProvider,
  AuiConfig,
  CompositeAttachmentAdapter,
  InMemoryThreadListAdapter,
  SimpleImageAttachmentAdapter,
  SimpleTextAttachmentAdapter,
  Suggestions,
  WebSpeechDictationAdapter,
  WebSpeechSynthesisAdapter,
  defineToolkit,
  Tools,
  useAui,
  useAuiState,
  useLocalRuntime,
  useRemoteThreadListRuntime,
  type ChatModelAdapter,
  type FeedbackAdapter,
  type SuggestionAdapter,
  type ThreadAssistantMessagePart,
  type ThreadMessage,
  type ToolCallMessagePartComponent,
} from "@assistant-ui/react";
import { createAssistantStream } from "assistant-stream";
import { ChevronDown, MessagesSquare, SquarePen } from "lucide-react";
import { Thread } from "@/components/assistant-ui/elements/thread.aui";
import { ThreadList } from "@/components/assistant-ui/elements/thread-list.aui";
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

// a reply as the scripted Rayume writes it (app/workspace.tsx's answer): its text and what it offers
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
export type Reply = Omit<Message, "id" | "from">;

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

// a quote rides as a composer attachment: its text is the name and the content, and its bullet (when the
// page knows it) leads the id
const quoteId = (q: Quote) => `${q.bulletId ?? ""}|${Math.random().toString(36).slice(2)}`;
const asQuote = (a: { id: string; name: string }): Quote => {
  const bulletId = a.id.slice(0, a.id.indexOf("|"));
  return bulletId ? { text: a.name, bulletId } : { text: a.name };
};
const textOf = (m: ThreadMessage) => m.content.flatMap((p) => (p.type === "text" ? [p.text] : [])).join("");

// Rayume's replies as message parts: the text, a short note of what it looked at, and its offers as tool
// calls (a rewrite to apply, a drafted entry to add), which the tool UIs below render with their buttons
// shortcut: the reasoning is canned with the scripted answers; a real model streams its own
function partsOf(replies: Reply[], quotes: Quote[]): ThreadAssistantMessagePart[] {
  const id = () => `call-${Math.random().toString(36).slice(2)}`;
  return [
    ...(quotes.length ? [{ type: "reasoning" as const, text: `Reading ${quotes.length === 1 ? "the line" : `the ${quotes.length} lines`} for what changed because of ${quotes.length === 1 ? "it" : "them"}, to lead with that.` }] : []),
    ...replies.flatMap((r): ThreadAssistantMessagePart[] => [
      { type: "text", text: r.text },
      ...(r.suggestion
        ? [{ type: "tool-call" as const, toolCallId: id(), toolName: "rewrite_bullet", args: { bulletId: r.suggestion.bulletId, text: r.suggestion.text }, argsText: JSON.stringify(r.suggestion) }]
        : []),
      ...(r.draft
        ? [{ type: "tool-call" as const, toolCallId: id(), toolName: "add_experience", args: { title: r.draft.entry.title, bullets: r.draft.entry.bullets.map((b) => b.text) }, argsText: JSON.stringify(r.draft.entry) }]
        : []),
    ]),
  ];
}
// the parts as they'd stream in: the reasoning, then the text a few words at a time, then the tool calls
function* frames(parts: ThreadAssistantMessagePart[]) {
  const done: ThreadAssistantMessagePart[] = [];
  for (const p of parts) {
    if (p.type === "text" || p.type === "reasoning") {
      const words = p.text.split(/(?<= )/);
      for (let i = 3; i < words.length; i += 3) yield [...done, { ...p, text: words.slice(0, i).join("") }];
    }
    done.push(p);
    yield [...done];
  }
}
const wait = (ms: number, signal: AbortSignal) => new Promise<void>((ok) => (signal.aborted ? ok() : (setTimeout(ok, ms), signal.addEventListener("abort", () => ok(), { once: true }))));

// The resume's actions, as assistant-ui tool UIs (a toolkit of render-only "backend" tools: Rayume, not
// the browser, makes the calls). A press applies it to the resume and stores that as the tool's result, so
// the card says it's done even after switching chats and back.
type Actions = { apply: (bulletId: string, text: string) => void; addEntry: (title: string, bullets: string[]) => void; addedTo: string };
const On = createContext<Actions>(null!);
const Rewrite: ToolCallMessagePartComponent<{ bulletId: string; text: string }, { applied: boolean }> = ({ args, result, addResult }) => {
  const on = useContext(On);
  return (
    <div className="my-2 rounded-2xl bg-white p-3.5 text-[14px] leading-relaxed ring-1 ring-accent/25">
      <p>{args.text}</p>
      <div className="mt-3">
        {result?.applied ? (
          <Done>Replaced in your resume</Done>
        ) : (
          <button type="button" onClick={() => (on.apply(args.bulletId, args.text), addResult({ applied: true }))} className={primary}>
            Replace in resume
          </button>
        )}
      </div>
    </div>
  );
};
const Draft: ToolCallMessagePartComponent<{ title: string; bullets: string[] }, { added: boolean }> = ({ args, result, addResult }) => {
  const on = useContext(On);
  return (
    <div className="my-2 rounded-2xl bg-white p-3.5 text-[14px] ring-1 ring-accent/25">
      <p className="font-medium">{args.title}</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-5 text-ink/80">
        {args.bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
      <div className="mt-3">
        {result?.added ? (
          <Done>Added to {on.addedTo}</Done>
        ) : (
          <button type="button" onClick={() => (on.addEntry(args.title, args.bullets), addResult({ added: true }))} className={primary}>
            Add to resume
          </button>
        )}
      </div>
    </div>
  );
};
// standalone: each asks for a press, so it shows on its own rather than folded into the trace of tool calls
const toolkit = defineToolkit({
  rewrite_bullet: { type: "backend", display: "standalone", render: Rewrite },
  add_experience: { type: "backend", display: "standalone", render: Draft },
});

// the modes, in the composer's action row
function Modes({ mode, setMode, only }: { mode: Mode; setMode: (m: Mode) => void; only?: Mode[] }) {
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

// Quotes the page sends (a selection) go into the composer of the open thread, once each
function Inbox({ quotes, taken }: { quotes: Quote[]; taken: () => void }) {
  const aui = useAui();
  useEffect(() => {
    if (!quotes.length) return;
    const composer = aui.composer;
    const there = composer.getState().attachments.map((a) => a.name);
    quotes
      .filter((q) => !there.includes(q.text))
      .forEach((q) => composer.addAttachment({ id: quoteId(q), type: "quote", name: q.text, contentType: "text/plain", content: [{ type: "text", text: q.text }] }));
    taken();
    document.querySelector<HTMLTextAreaElement>(".aui-composer-input")?.focus();
  }, [quotes, aui, taken]);
  return null;
}

// The chats above the thread: which one is open, the others (assistant-ui's ThreadList: switch, rename,
// archive, delete, search) in a popover, and a new one
function Header() {
  const title = useAuiState((s) => s.threadListItem.title) || "New chat";
  const aui = useAui();
  return (
    <div className="flex h-11 shrink-0 items-center gap-1 border-b border-ink/10 px-2">
      <Popover.Root>
        <Popover.Trigger aria-label={`Your chats: ${title}`} className="flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] font-medium text-ink/80 transition hover:bg-ink/5 hover:text-ink data-popup-open:bg-ink/5">
          <MessagesSquare aria-hidden className="size-4 shrink-0 text-ink/50" />
          <span className="truncate">{title}</span>
          <ChevronDown aria-hidden className="size-3.5 shrink-0 text-ink/40" />
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner sideOffset={6} align="start" className="z-[70] outline-none">
            <Popover.Popup className="max-h-[60vh] w-72 origin-(--transform-origin) overflow-y-auto rounded-xl bg-white p-2 shadow-[0_16px_40px_-14px_rgb(22_27_34/0.4)] ring-1 ring-ink/10 outline-none transition-[scale,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
              <ThreadList />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>
      <button type="button" aria-label="New chat" title="New chat" onClick={() => aui.threads.switchToNewThread()} className="ml-auto grid size-8 place-items-center rounded-lg text-ink/60 transition hover:bg-ink/5 hover:text-ink">
        <SquarePen aria-hidden className="size-4" />
      </button>
    </div>
  );
}

// the chats, in memory, each titled by the first thing said in it
// shortcut: lost on reload; with the API this is a RemoteThreadListAdapter on /chats
class Chats extends InMemoryThreadListAdapter {
  override async generateTitle(_id?: string, messages?: readonly ThreadMessage[]) {
    const first = messages?.find((m) => m.role === "user");
    const said = (first && (textOf(first) || first.attachments?.[0]?.name)) || "New chat";
    return createAssistantStream((c) => c.appendText(said.length > 40 ? `${said.slice(0, 40).trimEnd()}…` : said));
  }
}

// what Rayume opens with, in an empty chat
function Welcome({ name }: { name: string }) {
  return (
    <div className="mb-6 flex flex-col gap-1.5 px-2">
      <p className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both text-xl font-medium tracking-tight duration-200">Hi {name}.</p>
      <p className="text-[14px] leading-relaxed text-ink/60">Select any text on your resume and send it here, and I&apos;ll rewrite it around its impact. Or tell me about something you did and I&apos;ll draft it.</p>
    </div>
  );
}

// The assistant beside the resume: assistant-ui's Thread and ThreadList (components/assistant-ui, copied in
// from its registry and ours to change), on a local runtime per chat under a thread list. Rayume is a model
// adapter: it streams a reply (reasoning, text, then its offers as tool calls) that reply writes from what was
// sent, the mode and the quotes attached. Branches, edit and resend, regenerate, stop, copy, read aloud,
// dictation, feedback, files and follow-ups come from assistant-ui's runtime and adapters.
// shortcut: chats live in memory (InMemoryThreadListAdapter) and Rayume is scripted (app/workspace.tsx); with
// the API the list becomes a RemoteThreadListAdapter on /chats and run a call to the model; feedback goes nowhere yet
export function Chat({
  reply,
  mode,
  setMode,
  quotes,
  takeQuotes,
  apply,
  addEntry,
  only,
  name,
  addedTo = "your Master Resume",
}: {
  // Rayume's answer to what was sent: the text typed (with any text files attached) and the quotes
  reply: (text: string, quotes: Quote[]) => Reply[];
  mode: Mode;
  setMode: (m: Mode) => void;
  // quotes the page wants in the composer; takeQuotes empties the list once they're in
  quotes: Quote[];
  takeQuotes: () => void;
  apply: (bulletId: string, text: string) => void;
  addEntry: (title: string, bullets: string[]) => void;
  // the modes to offer; all of them when unset
  only?: Mode[];
  // who Rayume greets
  name: string;
  // where an added experience went, for its confirmation
  addedTo?: string;
}) {
  // the adapters are made once; what they call is read fresh each run
  const latest = useRef(reply);
  useEffect(() => {
    latest.current = reply;
  });
  const [adapters] = useState(() => {
    const model: ChatModelAdapter = {
      async *run({ messages, abortSignal }) {
        const last = messages.at(-1)!;
        // a run after a card was pressed (its result came in): nothing more to say
        if (last.role !== "user") return;
        const quotes = (last.attachments ?? []).filter((a) => a.type === "quote").map(asQuote);
        const files = (last.attachments ?? []).filter((a) => a.type !== "quote").flatMap((a) => a.content?.flatMap((p) => (p.type === "text" ? [p.text] : [])) ?? []);
        const parts = partsOf(latest.current([textOf(last), ...files].join("\n").trim(), quotes), quotes);
        await wait(350, abortSignal);
        for (const content of frames(parts)) {
          if (abortSignal.aborted) return;
          yield { content };
          await wait(30, abortSignal);
        }
      },
    };
    // follow-ups under the newest reply, by what it offered
    const suggestion: SuggestionAdapter = {
      async generate({ messages }) {
        const last = messages.at(-1);
        const offered = last?.content.some((p) => p.type === "tool-call" && p.toolName === "rewrite_bullet");
        return offered ? [{ prompt: "How do I rewrite another line?" }] : [{ prompt: "What makes a strong bullet?" }];
      },
    };
    const feedback: FeedbackAdapter = { submit: () => {} };
    return {
      model,
      local: {
        attachments: new CompositeAttachmentAdapter([new SimpleImageAttachmentAdapter(), new SimpleTextAttachmentAdapter()]),
        speech: new WebSpeechSynthesisAdapter(),
        dictation: WebSpeechDictationAdapter.isSupported() ? new WebSpeechDictationAdapter() : undefined,
        feedback,
        suggestion,
      },
      list: new Chats(),
    };
  });
  const runtime = useRemoteThreadListRuntime({
    // eslint-disable-next-line react-hooks/rules-of-hooks -- assistant-ui calls the hook once per chat
    runtimeHook: () => useLocalRuntime(adapters.model, { adapters: adapters.local }),
    adapter: adapters.list,
  });
  const config = useMemo(() => AuiConfig({ tools: Tools({ toolkit }), suggestions: Suggestions(["What makes a strong bullet?", "How do I rewrite a line?"]) }), []);
  return (
    <AssistantRuntimeProvider runtime={runtime} config={config}>
      <TooltipProvider>
        <On.Provider value={{ apply, addEntry, addedTo }}>
          <Inbox quotes={quotes} taken={takeQuotes} />
          <div className="flex h-full flex-col">
            <Header />
            <div className="min-h-0 flex-1">
              <Thread
                autoFocus={false}
                components={{
                  Welcome: () => <Welcome name={name} />,
                  ComposerExtra: () => <Modes mode={mode} setMode={setMode} only={only} />,
                  placeholder: modes.find((m) => m.id === mode)!.hint,
                }}
              />
            </div>
          </div>
        </On.Provider>
      </TooltipProvider>
    </AssistantRuntimeProvider>
  );
}
