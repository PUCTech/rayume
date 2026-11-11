"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { Mark } from "../logo";
import { Chat, type Message, type Mode } from "./chat";
import { Resume, type Quote } from "./resume";
import { entries as seed, postings, profile, refined, resumes as seedResumes, span, when, type Entry, type Posting, type Saved } from "./data";

const serif = GeistSerifRegular.className;

type View = "resume" | "resumes" | "jobs" | "experience" | "skills";

const icon = (d: string) => (
  <svg aria-hidden viewBox="0 0 20 20" className="size-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const nav: { id: View; label: string; d: string }[] = [
  { id: "resume", label: "Master resume", d: "M6 3h6l4 4v10H6zM12 3v4h4M8.5 11h5M8.5 14h5" },
  { id: "resumes", label: "My resumes", d: "M4 6h9v11H4zM7 3h9v11" },
  { id: "jobs", label: "Job postings", d: "M3.5 7h13v9h-13zM7.5 7V5h5v2M3.5 11h13" },
  { id: "experience", label: "Experience", d: "M4 5h12M4 10h12M4 15h7" },
  { id: "skills", label: "Skills", d: "m10 3 2 4.5 5 .5-3.8 3.3 1.1 4.9L10 13.8 5.7 16.2l1.1-4.9L3 8l5-.5z" },
];

const hardSkills = (list: Entry[]) => {
  const n = new Map<string, number>();
  list.forEach((e) => e.hard_skills.forEach((s) => n.set(s, (n.get(s) ?? 0) + 1)));
  return [...n].sort((a, b) => b[1] - a[1]);
};
const softSkills = (list: Entry[]) => [...new Set(list.flatMap((e) => e.soft_skills))];

const greeting: Message = {
  id: 0,
  from: "rayume",
  text: "Hi Lucas. This is your Master Resume: everything you've done, in one place. Select any line to paste it here, or pick a mode below.",
};

// What Rayume answers in each mode. shortcut: scripted until the API's AI routes exist
// (POST /experiences and /experiences/{id}/refine, POST /resumes for tailoring); replace with fetches then.
function answer(mode: Mode, text: string, quote: Quote | null, list: Entry[]): Omit<Message, "id" | "from"> {
  if (mode === "refine") {
    if (quote?.bulletId && refined[quote.bulletId])
      return { text: "Here's a sharper version that leads with the result:", suggestion: { bulletId: quote.bulletId, text: refined[quote.bulletId] } };
    if (quote) return { text: "That part isn't one of your bullets. Paste a bullet and I'll rewrite it around its impact." };
    return { text: "Select a line on your resume and paste it here, and I'll rewrite it around its impact." };
  }
  if (mode === "add") {
    const said = [quote?.text, text].filter(Boolean).join(" ").trim();
    if (!said) return { text: "Tell me about it in your own words: where, when, what you did and what changed because of it." };
    const bullets = said
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 3)
      .map((s, i) => ({ id: `new-${Date.now()}-${i}`, text: s[0].toUpperCase() + s.slice(1).replace(/[.!?]?$/, ".") }));
    const today = new Date().toISOString().slice(0, 7);
    return {
      text: "Here's a draft entry. Check it, then add it to your Master Resume.",
      draft: { entry: { id: `new-${Date.now()}`, type: "project", title: "New experience", organization: "", start: today, end: today, bullets, hard_skills: [], soft_skills: [] } },
    };
  }
  if (mode === "tailor") {
    const posting = postings.find((p) => (text + " " + (quote?.text ?? "")).toLowerCase().includes(p.company.toLowerCase())) ?? (text || quote ? postings[0] : undefined);
    if (!posting) return { text: "Which job? Paste the posting, or pick one you saved:", postings };
    const covered = posting.keywords.length - posting.missing.length;
    return {
      text: `${posting.company}'s ${posting.title} posting asks for ${posting.keywords.length} things and your Master Resume covers ${covered}. Missing: ${posting.missing.join(" and ")}. I'd lead with the Lumen Labs billing and dashboard work. Want the tailored version?`,
      tailored: { posting },
    };
  }
  const hard = hardSkills(list);
  return { text: `Across your entries I found ${hard.length} hard skills and ${softSkills(list).length} soft skills. The ones you use most come first.`, skills: { hard, soft: softSkills(list) } };
}

function Panel({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 sm:py-12">
      <h1 className={`${serif} text-[clamp(2rem,4vw,2.8rem)] leading-none tracking-[-0.03em]`}>{title}</h1>
      <p className="mt-3 max-w-xl text-ink/65">{intro}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

// The signed-in home: a sidebar, the Master Resume as the centrepiece and the chat that works on it.
// shortcut: no auth check yet; gate this route on a session once the API has /auth and /me.
export function Workspace() {
  const [view, setView] = useState<View>("resume");
  const [list, setList] = useState(seed);
  const [saved, setSaved] = useState<Saved[]>(seedResumes);
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [mode, setMode] = useState<Mode>("refine");
  const [draft, setDraft] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [typing, setTyping] = useState(false);
  const [flash, setFlash] = useState<string>();
  const [menu, setMenu] = useState(false);
  // phones and tablets show the resume or the chat, not both
  const [pane, setPane] = useState<"resume" | "chat">("resume");
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  const say = (m: Omit<Message, "id">) => setMessages((ms) => [...ms, { ...m, id: nextId.current++ }]);
  const update = (id: number, patch: Partial<Message>) => setMessages((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  const send = () => {
    const text = draft.trim();
    say({ from: "you", text, quote: quote ?? undefined });
    const reply = answer(mode, text, quote, list);
    setDraft("");
    setQuote(null);
    setTyping(true);
    later(900, () => {
      setTyping(false);
      say({ from: "rayume", ...reply });
    });
  };

  const pickMode = (m: Mode) => {
    setMode(m);
    // the modes that can start on their own say what they need straight away
    if (m === "skills" || m === "tailor") {
      setTyping(true);
      later(600, () => {
        setTyping(false);
        say({ from: "rayume", ...answer(m, "", null, list) });
      });
    }
  };

  const apply = (m: Message) => {
    const s = m.suggestion!;
    setList((l) => l.map((e) => ({ ...e, bullets: e.bullets.map((b) => (b.id === s.bulletId ? { ...b, text: s.text } : b)) })));
    update(m.id, { suggestion: { ...s, applied: true } });
    setPane("resume");
    setFlash(s.bulletId);
    later(1200, () => setFlash(undefined));
    document.querySelector(`[data-bullet="${s.bulletId}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const addEntry = (m: Message) => {
    setList((l) => [m.draft!.entry, ...l]);
    update(m.id, { draft: { ...m.draft!, added: true } });
  };

  const tailor = (m: Message) => {
    const p = m.tailored!.posting;
    setSaved((s) => [{ id: `r${Date.now()}`, title: `${p.company}, ${p.title}`, template: "Classic", version: 1, job: p.id, updated: new Date().toISOString().slice(0, 10) }, ...s]);
    update(m.id, { tailored: { ...m.tailored!, created: true } });
  };

  const pickPosting = (p: Posting) => {
    say({ from: "you", text: `${p.company}, ${p.title}` });
    setTyping(true);
    later(900, () => {
      setTyping(false);
      say({ from: "rayume", ...answer("tailor", p.company, null, list) });
    });
  };

  const quoteIt = (q: Quote) => {
    setQuote(q);
    setPane("chat");
  };

  const counts: Partial<Record<View, number>> = { resumes: saved.length, jobs: postings.length, experience: list.length };

  const sidebar = (
    <nav aria-label="Workspace" className="flex h-full flex-col gap-1 p-3">
      <Link href="/" className="mb-4 inline-flex items-center gap-2 px-2 pt-1" aria-label="Rayume home">
        <Mark className="h-6 w-auto" />
        <span className={`${serif} text-[22px] leading-none`}>Rayume</span>
      </Link>
      {nav.map((n) => (
        <button
          key={n.id}
          type="button"
          aria-current={view === n.id ? "page" : undefined}
          onClick={() => {
            setView(n.id);
            setMenu(false);
          }}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] transition ${view === n.id ? "bg-white font-medium text-ink shadow-[0_1px_2px_rgb(22_27_34/0.08)]" : "text-ink/70 hover:bg-white/60 hover:text-ink"}`}
        >
          {icon(n.d)}
          <span className="flex-1">{n.label}</span>
          {counts[n.id] !== undefined && <span className="text-[12px] text-ink/45">{counts[n.id]}</span>}
        </button>
      ))}
      <Link href="/templates" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-ink/70 transition hover:bg-white/60 hover:text-ink">
        {icon("M3.5 4h5v5h-5zM11.5 4h5v5h-5zM3.5 11h5v5h-5zM11.5 11h5v5h-5z")}
        Templates
      </Link>
      <div className="mt-auto flex items-center gap-3 rounded-xl px-2 py-2">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-medium text-white">LM</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium">{profile.name}</span>
          <span className="block truncate text-[12px] text-ink/50">{profile.email}</span>
        </span>
        <Link href="/" aria-label="Sign out" className="grid size-9 place-items-center rounded-full text-ink/50 transition hover:bg-white/60 hover:text-ink">
          {icon("M8 4H5v12h3M12 6l4 4-4 4M16 10H8")}
        </Link>
      </div>
    </nav>
  );

  const chat = (
    <Chat
      messages={messages}
      typing={typing}
      mode={mode}
      setMode={pickMode}
      draft={draft}
      setDraft={setDraft}
      quote={quote}
      clearQuote={() => setQuote(null)}
      send={send}
      apply={apply}
      addEntry={addEntry}
      tailor={tailor}
      pickPosting={pickPosting}
    />
  );

  let body: ReactNode;
  if (view === "resume") {
    body = (
      <div className="flex min-h-0 flex-1">
        <div className={`min-h-0 flex-1 overflow-y-auto bg-mist px-3 py-4 sm:px-6 sm:py-8 ${pane === "chat" ? "max-lg:hidden" : ""}`}>
          <Resume entries={list} flash={flash} onQuote={quoteIt} />
        </div>
        <aside aria-label="Chat with Rayume" className={`min-h-0 w-full border-ink/10 bg-paper lg:w-[26rem] lg:shrink-0 lg:border-l ${pane === "resume" ? "max-lg:hidden" : ""}`}>
          {chat}
        </aside>
      </div>
    );
  } else if (view === "resumes") {
    body = (
      <Panel title="My resumes" intro="Versions made from your Master Resume, each tailored to a job or kept general.">
        <ul className="grid gap-3 sm:grid-cols-2">
          {saved.map((r) => (
            <li key={r.id} className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgb(22_27_34/0.08)]">
              <p className="font-medium">{r.title}</p>
              <p className="mt-1 text-sm text-ink/55">
                {r.template}, version {r.version}, updated {new Date(`${r.updated}T00:00:00Z`).toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" })}
              </p>
            </li>
          ))}
        </ul>
      </Panel>
    );
  } else if (view === "jobs") {
    body = (
      <Panel title="Job postings" intro="Jobs you saved from the web or the extension, with the keywords Rayume pulled out of each.">
        <ul className="grid gap-3">
          {postings.map((p) => (
            <li key={p.id} className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgb(22_27_34/0.08)]">
              <p className="font-medium">
                {p.title} <span className="font-normal text-ink/55">at {p.company}</span>
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {p.keywords.map((k) => (
                  <li key={k} className={`rounded-full px-2.5 py-1 text-[12px] ${p.missing.includes(k) ? "bg-mist text-ink/55" : "bg-accent/15 text-accent-text"}`}>
                    {k}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[13px] text-ink/50">Highlighted keywords are already on your Master Resume.</p>
            </li>
          ))}
        </ul>
      </Panel>
    );
  } else if (view === "experience") {
    body = (
      <Panel title="Experience" intro="Every entry on your Master Resume. Rayume writes the bullets and tags the skills; you check them.">
        <ul className="grid gap-3">
          {list.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgb(22_27_34/0.08)]">
              <div className="min-w-0">
                <p className="font-medium">
                  {e.title}
                  {e.organization && <span className="font-normal text-ink/55"> at {e.organization}</span>}
                </p>
                <p className="mt-1 text-sm text-ink/55">{span(e)}</p>
              </div>
              <span className="shrink-0 rounded-full bg-mist px-2.5 py-1 text-[12px] capitalize text-ink/65">{e.type}</span>
            </li>
          ))}
        </ul>
      </Panel>
    );
  } else {
    body = (
      <Panel title="Skills" intro="The hard and soft skills Rayume found in your entries. The more entries back a skill, the higher it sits.">
        <h2 className="text-sm font-medium text-ink/55">Hard skills</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {hardSkills(list).map(([s, n]) => (
            <li key={s} className="rounded-full bg-ink px-3 py-1.5 text-[13px] font-medium text-white">
              {s}
              {n > 1 && <span className="ml-1.5 text-white/60">{n}</span>}
            </li>
          ))}
        </ul>
        <h2 className="mt-8 text-sm font-medium text-ink/55">Soft skills</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {softSkills(list).map((s) => (
            <li key={s} className="rounded-full bg-accent/15 px-3 py-1.5 text-[13px] font-medium text-accent-text">
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-[13px] text-ink/50">Last updated {when(new Date().toISOString().slice(0, 7))}.</p>
      </Panel>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-paper font-sans text-ink antialiased">
      <aside className="hidden w-60 shrink-0 border-r border-ink/10 bg-mist/60 lg:block">{sidebar}</aside>

      {/* phones and tablets: the sidebar slides in over the page */}
      {menu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div aria-hidden onClick={() => setMenu(false)} className="absolute inset-0 bg-ink/25 transition-opacity duration-300 starting:opacity-0" />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-paper shadow-xl transition-transform duration-300 ease-out starting:-translate-x-full">
            {sidebar}
          </aside>
        </div>
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-ink/10 px-3 py-2.5 lg:hidden">
          <button type="button" onClick={() => setMenu(true)} aria-label="Open menu" aria-expanded={menu} className="grid size-10 place-items-center rounded-full hover:bg-ink/5">
            {icon("M3.5 6h13M3.5 10h13M3.5 14h13")}
          </button>
          <p className="flex-1 truncate text-[15px] font-medium">{nav.find((n) => n.id === view)!.label}</p>
          {view === "resume" && (
            <div role="group" aria-label="Show" className="flex rounded-full bg-mist p-1 text-[13px]">
              {([["resume", "Resume"], ["chat", "Chat"]] as const).map(([p, label]) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={pane === p}
                  onClick={() => setPane(p)}
                  className={`rounded-full px-3.5 py-1.5 font-medium transition pointer-coarse:py-2 ${pane === p ? "bg-ink text-white" : "text-ink/70"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </header>
        {view === "resume" ? body : <div className="min-h-0 flex-1 overflow-y-auto">{body}</div>}
      </main>
    </div>
  );
}

