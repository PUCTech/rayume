"use client";

import { useEffect, useRef, useState } from "react";
import { GeistSerifRegular } from "geist/font/serif/regular";
import Image from "next/image";
import Link from "next/link";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown, MessageSquareQuote, Omega, PanelLeft, PanelRight, Redo2, Undo2 } from "lucide-react";
import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";
import { Mark } from "../logo";
import { Viewer } from "../templates/viewer";
import type { Page } from "../templates/pdf";
import { Chat, type Mode } from "../app/chat";
import { answer } from "../app/workspace";
import { entries, postings, profile } from "../app/data";
import type { Quote } from "../app/resume";
import type { Saved } from "./data";
import { editsOf, kept, touch } from "./store";
import { master as masterSeed } from "./data";
import { Overlay, type Target } from "./overlay";
import { plain } from "./regions";
import { Content } from "./content";
import { blank, fonts, inline, margins, projectBullets, sizes, strip, settle, styled, symbols, tidy, withBullet, withDoc, type Doc, type Setup } from "./tex";

const serif = GeistSerifRegular.className;
const only: Mode[] = ["refine", "add"];
const originals = entries.flatMap((e) => e.bullets);


// a target's text in a document: what was written, or what the PDF started with
const textIn = (d: Doc, t: Target, draft = "") => {
  if (t.kind === "run") return d.runs[t.key] ?? t.key.slice(t.key.indexOf(":") + 1);
  const added = d.added.find((a) => a.id === t.id);
  if (added) return added.text;
  if (t.kind === "new") return draft;
  return d.bullets[t.id] ?? [...originals, ...projectBullets(d)].find((b) => b.id === t.id)?.text ?? "";
};
// toolbar buttons take the press without taking the caret out of the text
const tool = "grid size-8 place-items-center rounded-md text-ink/70 transition hover:bg-ink/5 hover:text-ink disabled:pointer-events-none disabled:opacity-30 aria-pressed:bg-accent/15 aria-pressed:text-accent-text pointer-coarse:size-10";
// the line between two panels: a hairline that lights up under the pointer, dragged to resize them
const handle = "w-px bg-ink/10 outline-none transition-colors data-[separator=hover]:bg-accent data-[separator=active]:bg-accent focus-visible:bg-accent";

// One of the document's settings in the toolbar (font, size, margins). "" is the template's own.
function Pick({ label, value, items, disabled, onChange }: { label: string; value: string; items: { value: string; label: string }[]; disabled: boolean; onChange: (v: string) => void }) {
  return (
    <Select.Root items={items} value={value} disabled={disabled} onValueChange={(v) => onChange(v ?? "")}>
      <Select.Trigger aria-label={label} title={label} className="flex h-8 items-center gap-1 rounded-md px-2 text-[13px] text-ink/75 transition hover:bg-ink/5 hover:text-ink data-disabled:pointer-events-none data-disabled:opacity-30 data-popup-open:bg-ink/5">
        <Select.Value />
        <Select.Icon>
          <ChevronDown aria-hidden className="size-3.5 text-ink/40" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner sideOffset={6} alignItemWithTrigger={false} className="z-[70] outline-none">
          <Select.Popup className="min-w-(--anchor-width) origin-(--transform-origin) rounded-xl bg-white p-1 shadow-[0_16px_40px_-14px_rgb(22_27_34/0.4)] ring-1 ring-ink/10 outline-none transition-[scale,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
            {items.map((i) => (
              <Select.Item key={i.value} value={i.value} className="flex cursor-default items-center justify-between gap-4 rounded-lg px-2.5 py-1.5 text-[13px] outline-none select-none data-highlighted:bg-ink/5">
                <Select.ItemText>{i.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check aria-hidden className="size-3.5 text-accent-text" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
const fontItems = [{ value: "", label: "Template font" }, ...Object.entries(fonts).map(([value, f]) => ({ value, label: f.label }))];
const sizeItems = [{ value: "", label: "Size" }, ...sizes.map((value) => ({ value, label: `${value} pt` }))];
const marginItems = [{ value: "", label: "Margins" }, ...Object.keys(margins).map((value) => ({ value, label: `${value[0].toUpperCase()}${value.slice(1)} margins` }))];

const key = (t: Target | null) => (!t ? "" : t.kind === "run" ? `run:${t.key}` : `${t.kind}:${t.id}`);

// A resume's own page (/resumes/[id]): the templates' PDF/Code viewer across the width, with Rayume's chat in a
// panel on the right that folds away, under a bar with the way back, the title and the download.
// You write on the PDF itself (overlay.tsx): any text, bullets included; Enter splits a bullet into a new one,
// Backspace in an empty bullet removes it. Each change goes into the document (tex.ts), and the PDF is typeset
// again from the pristine LaTeX with every change (dev only, through /api/render), in well under a second.
// Left of the page is the content as a form (content.tsx), right of it the chat; both are panels that resize
// and fold away. A toolbar under the bar has undo and redo, the document's font, type size and margins
// (tex.ts's styled), bold, italic, underline and symbols (bullets only), and says when changes are saved.
// ⌘Z and ⇧⌘Z step through the changes, they're kept in this browser across reloads, Code shows the whole
// LaTeX with them written in, and the bar says when the resume no longer fits on one page.
// Text selected in the PDF or the code gets a "Send to chat" button, which quotes it in the composer (opening
// the chat if it's folded); Rayume's suggestions go into the document like your own edits.
// shortcut: the chat is scripted (app/workspace.tsx's answer); changes live in localStorage until the API
// saves versions (POST /resumes/{id}/versions); edits made in Code and rendered there aren't part of the
// document, so the next edit on the page typesets over them.
// On the Master Resume (everything you've done) changes are what every new resume starts from; on any other
// resume they're that resume's alone. One the master has changed since gets a bar offering to update it from
// the master (POST /resumes/{id}/regenerate in the API), and one tailored to a job shows the job's keywords,
// each marked by whether the resume says it.
// shortcut: the master's changes go to localStorage like the rest; with the API they're PATCH /experiences.
export function Editor({ r, master, template, body }: { r: Saved; master: Saved; template: string; body: string }) {
  const isMaster = r.id === masterSeed.id;
  const job = postings.find((p) => p.id === r.job);
  const [jobOpen, setJobOpen] = useState(false);
  // the panels either side of the page: the content form and the chat. Both fold away, from their buttons or
  // by dragging them shut; on a narrow screen they start folded
  const [wide] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const left = usePanelRef();
  const right = usePanelRef();
  const [leftOpen, setLeftOpen] = useState(wide);
  const [chat, setChat] = useState(wide);
  // a fold from a button slides: the panels' flex-grow eases for its length (a drag follows the pointer instead)
  const [easing, setEasing] = useState(false);
  const fold = (p: typeof left) => {
    setEasing(true);
    timers.current.push(window.setTimeout(() => setEasing(false), 320));
    return p.current?.isCollapsed() ? p.current.expand() : p.current?.collapse();
  };
  // the symbols menu under the toolbar
  const [sym, setSym] = useState(false);
  const [mode, setMode] = useState<Mode>("refine");
  // set once a render fails: the PDF can't be typeset here, so changes are only drawn over it
  const [offline, setOffline] = useState(false);
  // quotes on their way to the chat's composer, which takes them from here
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [pick, setPick] = useState<{ text: string; x: number; y: number } | null>(null);
  // what's being written, where the click was (for the caret), where the caret starts in a split-off bullet,
  // and that bullet's text until it's saved
  const [editing, setEditing] = useState<Target | null>(null);
  const [editAt, setEditAt] = useState<{ x: number; y: number }>();
  const [editStart, setEditStart] = useState<number>();
  const [fresh, setFresh] = useState("");
  // what's typed so far in the field being edited and where the caret is, so the field survives the page
  // being swapped underneath
  const [live, setLive] = useState<{ key: string; text: string; at: number } | null>(null);
  // the document as written, and as the PDF on screen has it; the difference is drawn over the page
  const [doc, setDoc] = useState<Doc>(() => kept(r.id));
  const [inPdf, setInPdf] = useState<Doc>(blank);
  const past = useRef<Doc[]>([]);
  const future = useRef<Doc[]>([]);
  // how many steps there are to undo and redo, for the toolbar
  const [steps, setSteps] = useState([0, 0]);
  const [src, setSrc] = useState<string>();
  const [busy, setBusy] = useState(false);
  // whether the caret is in bold or italic text, for the toolbar
  const [fmt, setFmt] = useState({ bold: false, italic: false, underline: false });
  const [pages, setPages] = useState(1);
  // what a render that just landed contains, until its pages are drawn; and which render is the latest
  const landing = useRef<Doc | null>(null);
  // whether a render is in flight, and the newest one asked for meanwhile
  const flight = useRef<{ busy: boolean; next: Doc | null }>({ busy: false, next: null });
  const view = useRef<HTMLDivElement>(null);
  // where the pointer last was over the viewer: a textarea can't say where its selected text is on screen
  const pointer = useRef({ x: 0, y: 0 });
  // true while a drag is selecting: the button waits for the release, or it covers text the drag is heading to
  const dragging = useRef(false);
  const timers = useRef<number[]>([]);
  const store = editsOf(r.id);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // the live text, while it's for the field being edited
  const mine = live && live.key === key(editing) ? live : null;
  // typing the document doesn't have yet
  const dirty = !!editing && !!mine && tidy(mine.text) !== tidy(textIn(doc, editing, fresh));

  // typesets the pristine LaTeX with the document's changes; the newest render wins if several overlap
  // One render at a time: what's asked for meanwhile waits, the newest replacing anything older, and goes as
  // soon as the page in flight lands. The typesetter never works on a page that's already out of date.
  const render = async (next: Doc) => {
    if (flight.current.busy) return void (flight.current.next = next);
    flight.current.busy = true;
    setBusy(true);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ file: r.template, tex: inline(styled(template, next.setup), withDoc(body, next, originals)) }),
      });
      if (!res.ok) throw new Error(await res.text());
      landing.current = next;
      setSrc(URL.createObjectURL(await res.blob()));
    } catch {
      setOffline(true);
    } finally {
      flight.current.busy = false;
      const queued = flight.current.next;
      flight.current.next = null;
      if (queued) render(queued);
      else setBusy(false);
    }
  };
  const keep = (d: Doc) => {
    try {
      localStorage.setItem(store, JSON.stringify(d));
    } catch {}
  };
  const change = (next: Doc) => {
    past.current.push(doc);
    future.current = [];
    setSteps([past.current.length, 0]);
    setDoc(next);
    keep(next);
    render(next);
    touch(r.id);
  };
  const step = (back: boolean) => {
    const to = (back ? past : future).current.pop();
    if (!to) return;
    (back ? future : past).current.push(doc);
    setSteps([past.current.length, future.current.length]);
    setEditing(null);
    setDoc(to);
    keep(to);
    render(to);
  };
  // only bullets take bold and italic: any other run is matched back to the LaTeX by its whole text
  const rich = !!editing && editing.kind !== "run";
  // the new pages are on screen: what the render held is now in the PDF
  const drawn = (page: Page) => {
    setPages(page.of);
    if (!landing.current) return;
    setInPdf(landing.current);
    landing.current = null;
  };

  // the changes kept in this browser are typeset as the page opens (doc starts from them, see below)
  useEffect(() => {
    if (doc !== blank) queueMicrotask(() => render(doc));
    // once, on opening
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onChange = () => {
      const [bold, italic, underline] = ["bold", "italic", "underline"].map((c) => document.queryCommandState(c));
      setFmt((f) => (f.bold === bold && f.italic === italic && f.underline === underline ? f : { bold, italic, underline }));
      if (dragging.current) return setPick(null);
      let text = "";
      let { x, y } = pointer.current;
      // the code editor (CodeMirror, contenteditable too) keeps the DOM selection in step with its own; the
      // text being written on the page isn't a source of quotes
      {
        const sel = document.getSelection();
        const writing = (sel?.anchorNode instanceof Element ? sel.anchorNode : sel?.anchorNode?.parentElement)?.closest("[contenteditable]:not(#tpl-code)");
        if (sel && !sel.isCollapsed && !writing && view.current?.contains(sel.anchorNode)) {
          text = sel.toString();
          const r = sel.getRangeAt(0).getBoundingClientRect();
          x = r.left + r.width / 2;
          y = r.top;
        }
      }
      // without the PDF's line breaks and bullet marks
      text = text.replace(/\s+/g, " ").replace(/^[•\s]+/, "").trim();
      setPick(text.length >= 3 ? { text, x, y } : null);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      onChange();
    };
    document.addEventListener("selectionchange", onChange);
    document.addEventListener("pointerup", onUp);
    return () => {
      document.removeEventListener("selectionchange", onChange);
      document.removeEventListener("pointerup", onUp);
    };
  }, []);

  // ⌘Z / Ctrl+Z undoes a change and ⇧ redoes it, unless a text field has the keys for its own undo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const field = (e.target as Element).closest("input, textarea, [contenteditable]:not([contenteditable=false])");
      // a field on the page keeps the keys only while it holds typing that isn't saved yet
      if ((field && (!editing || dirty)) || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      step(!e.shiftKey);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // the entries as the PDF on screen has them, added bullets in place and deleted ones gone: what the overlay
  // finds on the page
  const after = (id: string): { id: string; text: string }[] =>
    inPdf.added
      .filter((a) => a.after === id)
      .reverse()
      .flatMap((a) => [...(a.text ? [{ id: a.id, text: a.text }] : []), ...after(a.id)]);
  const added = (inPdf.projects ?? []).map((p) => ({
    ...entries.find((e) => e.type === "project")!,
    id: p.id,
    title: inPdf.runs[`0:${p.title}`] ?? p.title,
    bullets: p.bullets.map((text, i) => ({ id: `${p.id}-${i}`, text })),
  }));
  // jobs added from the form, like the body's own; the body's taken off the resume aren't on the page
  const jobs = (inPdf.jobs ?? []).map((j) => ({
    ...entries.find((e) => e.type === "professional")!,
    id: j.id,
    title: j.title,
    organization: inPdf.runs[`0:${j.organization}`] ?? j.organization,
    bullets: j.bullets.map((text, i) => ({ id: `${j.id}-${i}`, text })),
  }));
  const own = entries.filter((e) => e.type !== "professional" || !inPdf.hidden?.includes(`exp-${entries.filter((x) => x.type === "professional").indexOf(e)}`));
  const shown = [...added, ...jobs, ...own].map((e) => ({
    ...e,
    bullets: e.bullets.flatMap((b) => {
      // bare text: the page is matched on what it says, not on what's bold
      const text = strip(inPdf.bullets[b.id] ?? b.text);
      return [...(text ? [{ ...b, text }] : []), ...after(b.id).map((a) => ({ ...b, ...a, text: strip(a.text) }))];
    }),
  }));
  const pending = {
    bullets: [...originals.map((b) => b.id), ...projectBullets(inPdf).map((b) => b.id), ...inPdf.added.map((a) => a.id)].filter((id) => textIn(doc, { kind: "bullet", id }) !== textIn(inPdf, { kind: "bullet", id })),
    runs: Object.keys({ ...doc.runs, ...inPdf.runs }).filter((k) => doc.runs[k] !== inPdf.runs[k]),
    added: doc.added.filter((a) => a.text && !inPdf.added.some((b) => b.id === a.id)),
  };
  const edit = (t: Target, at?: { x: number; y: number }, start?: number) => {
    setLive(null);
    setEditAt(at);
    setEditStart(start);
    setEditing(t);
  };
  // a blur commits a tick late (inplace.tsx), when another edit may have started: it ends only its own
  // a new bullet the document doesn't have yet
  const unsaved = (t: Target): t is Target & { kind: "new" } => t.kind === "new" && !doc.added.some((a) => a.id === t.id);
  // the document with what's written in a field, or null when that changes nothing; settled moves a job whose
  // dates were written to its place by date (a save does, a live preview doesn't: half a date would send it last)
  const edited = (t: Target, raw: string, settled = true): Doc | null => {
    const text = tidy(raw);
    if (unsaved(t)) return text ? { ...doc, added: [...doc.added, { id: t.id, after: t.after, text }] } : null;
    if (text === textIn(doc, t)) return null;
    if (t.kind === "run") {
      const next = { ...doc, runs: { ...doc.runs, [t.key]: text } };
      return text ? (settled ? settle(body, next, next) : next) : null;
    }
    return withBullet(doc, t.id, text);
  };
  const save = (t: Target, raw: string) => {
    const next = edited(t, raw);
    if (next) change(next);
  };
  const commit = (t: Target, raw: string) => {
    setEditing((cur) => (key(cur) === key(t) ? null : cur));
    save(t, raw);
  };
  // Writing typesets as you type: each keystroke asks for the page with it (render keeps one in flight), the
  // field and its caret staying where they are over the new page. A pause saves what's there, as a document
  // does, so an undo step is a burst of typing, not a letter; that save typesets the same text, which the
  // render route already has. Never an empty bullet, which would delete it.
  useEffect(() => {
    if (!editing || !dirty || !tidy(mine!.text)) return;
    const live = edited(editing, mine!.text, false);
    if (live) render(live);
    const id = window.setTimeout(() => save(editing, mine!.text), 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restarts with each keystroke
  }, [mine?.text]);
  const setup = (s: Setup) => change({ ...doc, setup: { ...doc.setup, ...s } });
  // one history, as a document has: the field's own for typing not saved yet, the document's otherwise
  const history = (back: boolean) => (dirty ? document.execCommand(back ? "undo" : "redo") : step(back));
  // Enter: the text before the caret stays, the rest starts a new bullet under it, the caret at its start
  const split = (before: string, rest: string) => {
    const t = editing;
    if (!t || t.kind === "run") return;
    const id = `new-${Date.now()}`;
    const kept = tidy(before);
    const next = unsaved(t) ? (kept ? { ...doc, added: [...doc.added, { id: t.id, after: t.after, text: kept }] } : doc) : withBullet(doc, t.id, kept);
    if (next !== doc && kept !== textIn(doc, t)) change(next);
    setFresh(tidy(rest));
    setLive(null);
    setEditAt(undefined);
    setEditStart(0);
    setEditing({ kind: "new", id, after: t.kind === "new" && !kept ? t.after : t.id });
  };
  // Backspace in an empty bullet removes it
  const remove = () => {
    const t = editing;
    setEditing(null);
    setLive(null);
    if (t?.kind === "bullet") change(withBullet(doc, t.id, ""));
  };

  // neither the PDF nor the code knows bullet ids, so a quoted or typed line is matched to its bullet by
  // its first words; the PDF sets curly quotes where the data has straight ones
  const refine = (line: string, q: Quote | null) => {
    if (q?.bulletId) return answer("refine", "", q, entries);
    const clean = line.replace(/^[•\s]+/, "").replace(/\s+/g, " ");
    const head = plain(clean).slice(0, 40);
    const bullet = head.length > 12 ? originals.find((b) => plain(b.text).includes(head)) : undefined;
    return answer("refine", "", bullet ? { text: clean, bulletId: bullet.id } : q, entries);
  };

  // Rayume's answer to what was sent: Refine answers each quoted line on its own, Add experience reads them
  // all as one story
  const reply = (text: string, sent: Quote[]) =>
    mode === "refine"
      ? sent.length
        ? sent.map((q) => refine(q.text, q))
        : [refine(text, null)]
      : [answer(mode, text, sent.length ? { text: sent.map((q) => q.text).join(" ") } : null, entries)];

  // the resume's LaTeX with its changes; a job's keyword counts as said when the text has it
  const latex = withDoc(body, doc, originals);
  const covered = job ? job.keywords.filter((k) => latex.toLowerCase().includes(k.toLowerCase())) : [];
  // Classic and Modern set the shared content (resumes/body.tex); the Overleaf templates carry their own copy
  // of the text, which the document's changes can't reach
  const wired = template.includes("\\input{body}");
  const stale = wired && !isMaster && master.updated > r.updated;

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ink/10 bg-paper px-3 sm:px-4">
        <Link href="/resumes" aria-label="Back to your resumes" className="grid size-9 shrink-0 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 hover:text-ink">
          <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5 7 10l5 5" />
          </svg>
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className={`${serif} truncate text-xl leading-tight tracking-[-0.01em]`}>{r.title}</h1>
          <p className="hidden truncate text-xs text-ink/50 md:block">
            {isMaster ? "Everything you've done · new resumes start from here" : "Click any text to change it · it saves as you write · Enter adds a bullet · ⌘B bold"}
          </p>
        </div>
        {job && (
          <div className="relative shrink-0">
            <button
              type="button"
              aria-expanded={jobOpen}
              onClick={() => setJobOpen((o) => !o)}
              className="inline-flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-sm ring-1 ring-ink/10 transition hover:ring-ink/25"
            >
              {job.logo ? <Image src={`/logos/${job.logo}.svg`} alt="" width={20} height={20} unoptimized className="size-5 rounded" /> : <span aria-hidden className="grid size-5 place-items-center rounded bg-ink/10 text-[10px] font-medium">{job.company[0]}</span>}
              <span className="hidden max-w-48 truncate lg:inline">
                {job.company} · {job.title}
              </span>
              <span className="text-xs text-ink/55">
                {covered.length}/{job.keywords.length}
              </span>
            </button>
            {jobOpen && (
              <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-2xl bg-white p-4 shadow-[0_16px_40px_-14px_rgb(22_27_34/0.4)] ring-1 ring-ink/10 transition duration-200 ease-out starting:-translate-y-1 starting:opacity-0">
                <p className="text-sm font-medium">
                  {job.company} · {job.title}
                </p>
                <p className="mt-1 text-xs text-ink/55">
                  This resume says {covered.length} of the {job.keywords.length} things the posting asks for.
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {job.keywords.map((k) => (
                    <li
                      key={k}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${covered.includes(k) ? "bg-accent/10 text-accent-text" : "bg-error/20 text-error-text"}`}
                    >
                      <span aria-hidden>{covered.includes(k) ? "✓" : "·"}</span>
                      {k}
                      <span className="sr-only">{covered.includes(k) ? "(covered)" : "(missing)"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {pages > 1 && (
          <span role="status" className="shrink-0 rounded-full bg-error/20 px-2.5 py-1 text-xs font-medium text-error-text">
            Runs to {pages} pages
          </span>
        )}
        <a href={src ?? `/resumes/${r.template}.pdf`} download={`${r.title}.pdf`} className="hidden shrink-0 rounded-full px-4 py-2 text-sm font-medium text-ink/75 ring-1 ring-ink/10 transition hover:text-ink hover:ring-ink/25 sm:inline-flex">
          Download PDF
        </a>
        <button
          type="button"
          aria-pressed={chat}
          onClick={() => fold(right)}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition ${chat ? "bg-ink text-white" : "text-ink/75 ring-1 ring-ink/10 hover:text-ink hover:ring-ink/25"}`}
        >
          <Mark className="h-3.5 w-auto" />
          Rayume
        </button>
      </header>
      <div role="toolbar" aria-label="Editing" onMouseDown={(e) => e.preventDefault()} className="flex h-10 shrink-0 items-center gap-0.5 border-b border-ink/10 bg-paper px-3 sm:px-4">
        <button type="button" aria-label="Content" title={leftOpen ? "Hide the content panel" : "Show the content panel"} aria-pressed={leftOpen} onClick={() => fold(left)} className={tool}>
          <PanelLeft aria-hidden className="size-4" />
        </button>
        <span aria-hidden className="mx-1.5 h-4 w-px bg-ink/15" />
        <button type="button" aria-label="Undo" title="Undo (⌘Z)" disabled={!dirty && !steps[0]} onClick={() => history(true)} className={tool}>
          <Undo2 aria-hidden className="size-4" />
        </button>
        <button type="button" aria-label="Redo" title="Redo (⇧⌘Z)" disabled={!dirty && !steps[1]} onClick={() => history(false)} className={tool}>
          <Redo2 aria-hidden className="size-4" />
        </button>
        <span aria-hidden className="mx-1.5 h-4 w-px bg-ink/15" />
        <Pick label="Font" value={doc.setup?.font ?? ""} items={fontItems} disabled={!wired} onChange={(font) => setup({ font })} />
        <Pick label="Type size" value={doc.setup?.size ?? ""} items={sizeItems} disabled={!wired} onChange={(size) => setup({ size })} />
        <Pick label="Margins" value={doc.setup?.margin ?? ""} items={marginItems} disabled={!wired} onChange={(margin) => setup({ margin })} />
        <span aria-hidden className="mx-1.5 h-4 w-px bg-ink/15" />
        <button type="button" aria-label="Bold" title={rich ? "Bold (⌘B)" : "Bold: click into a bullet first"} aria-pressed={rich && fmt.bold} disabled={!rich} onClick={() => document.execCommand("bold")} className={`${tool} ${serif} text-[17px] font-bold`}>
          B
        </button>
        <button type="button" aria-label="Italic" title={rich ? "Italic (⌘I)" : "Italic: click into a bullet first"} aria-pressed={rich && fmt.italic} disabled={!rich} onClick={() => document.execCommand("italic")} className={`${tool} ${serif} text-[17px] italic`}>
          I
        </button>
        <button type="button" aria-label="Underline" title={rich ? "Underline (⌘U)" : "Underline: click into a bullet first"} aria-pressed={rich && fmt.underline} disabled={!rich} onClick={() => document.execCommand("underline")} className={`${tool} ${serif} text-[17px] underline underline-offset-2`}>
          U
        </button>
        <div className="relative">
          <button type="button" aria-label="Symbols" title={rich ? "Insert a symbol" : "Symbols: click into a bullet first"} aria-expanded={rich && sym} disabled={!rich} onClick={() => setSym((o) => !o)} className={tool}>
            <Omega aria-hidden className="size-4" />
          </button>
          {/* plain buttons, not a menu: a menu would take the caret out of the text the symbol goes into */}
          {rich && sym && (
            <div className="absolute left-0 top-full z-40 mt-1.5 flex gap-0.5 rounded-xl bg-white p-1 shadow-[0_16px_40px_-14px_rgb(22_27_34/0.4)] ring-1 ring-ink/10 transition duration-150 starting:-translate-y-1 starting:opacity-0">
              {symbols.map((c) => (
                <button key={c} type="button" aria-label={`Insert ${c}`} onClick={() => document.execCommand("insertText", false, c)} className={`${tool} ${serif} text-[15px]`}>
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        <span role="status" className="ml-auto text-xs text-ink/50">
          {busy ? "Saving…" : offline ? "Saved · the PDF can't be typeset here, so changes are drawn over it" : doc === blank ? "" : "Saved in this browser"}
        </span>
        <span aria-hidden className="mx-1.5 h-4 w-px bg-ink/15" />
        <button type="button" aria-label="Chat" title={chat ? "Hide the chat" : "Show the chat"} aria-pressed={chat} onClick={() => fold(right)} className={tool}>
          <PanelRight aria-hidden className="size-4" />
        </button>
      </div>
      {!wired && (
        <div role="status" className="shrink-0 border-b border-ink/10 bg-error/15 px-4 py-2 text-sm text-ink/75">
          This template keeps its own copy of the text, so changes made here don&apos;t reach its PDF yet. Classic and Modern are wired up.
        </div>
      )}
      {stale && (
        <div role="status" className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b border-ink/10 bg-mist px-4 py-2 text-sm">
          <span className="text-ink/75">Your master resume changed since this one was last edited.</span>
          <button type="button" onClick={() => change(kept(masterSeed.id))} className="font-medium text-accent-text">
            Update from master
          </button>
          <span className="text-xs text-ink/50">replaces this resume&apos;s text; ⌘Z brings it back</span>
        </div>
      )}
      <Group orientation="horizontal" className={`min-h-0 flex-1 ${easing ? "*:data-panel:transition-[flex-grow] *:data-panel:duration-300 *:data-panel:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:*:data-panel:transition-none" : ""}`}>
        <Panel id="content" panelRef={left} collapsible collapsedSize={0} defaultSize={wide ? 320 : 0} minSize={260} maxSize={480} groupResizeBehavior="preserve-pixel-size" onResize={(size) => setLeftOpen(size.inPixels > 1)} className="h-full overflow-hidden bg-paper">
          {/* a folded panel has no width for its content to wrap in: it's hidden rather than left to spill, and
              while it slides it keeps its least width, clipped, instead of rewrapping at every step */}
          <div hidden={!leftOpen && !easing} className="h-full min-w-[260px]">
          {/* the master's content is your experience: settings edits the same, from outside any resume */}
          <Content body={body} doc={doc} change={change} preview={render} busy={busy} settings={isMaster ? { href: "/settings/experience", label: "Open in settings" } : undefined} />
          </div>
        </Panel>
        <Separator className={handle} />
        <Panel id="page" minSize={280} className="flex h-full flex-col">
            <div
              ref={view}
              onPointerDown={() => (dragging.current = true)}
              onPointerMove={(e) => (pointer.current = { x: e.clientX, y: e.clientY })}
              onScrollCapture={() => setPick(null)}
              // min-h-0 down to the viewer: otherwise Code grows to the whole LaTeX and pushes Preview off the panel
              className="flex min-h-0 min-w-0 flex-1 flex-col *:min-h-0"
            >
              <Viewer
                file={r.template}
                name={r.title}
                tex={inline(styled(template, doc.setup), latex)}
                src={src}
                overlay={(page) => (
                  <Overlay
                    page={page}
                    entries={shown}
                    pending={pending}
                    editing={editing}
                    editAt={mine ? undefined : editAt}
                    editStart={mine ? mine.at : editStart}
                    runKeys={inPdf.runs}
                    text={(t) => (mine && key(t) === mine.key ? mine.text : textIn(doc, t, fresh))}
                    busy={busy}
                    onEdit={edit}
                    onCommit={commit}
                    onCancel={() => {
                      setEditing(null);
                      setLive(null);
                    }}
                    onSplit={split}
                    onRemove={remove}
                    onLive={(text, at) => setLive({ key: key(editing), text, at })}
                    onDrawn={drawn}
                  />
                )}
              />
            </div>
        </Panel>
        <Separator className={handle} />
        <Panel id="chat" panelRef={right} collapsible collapsedSize={0} defaultSize={wide ? 400 : 0} minSize={300} maxSize={560} groupResizeBehavior="preserve-pixel-size" onResize={(size) => setChat(size.inPixels > 1)} className="h-full overflow-hidden bg-paper">
            <aside hidden={!chat && !easing} className="flex h-full min-w-[300px] flex-col">
              <div className="min-h-0 flex-1">
                <Chat
                  reply={reply}
                  mode={mode}
                  setMode={setMode}
                  quotes={quotes}
                  takeQuotes={() => setQuotes([])}
                  apply={(bulletId, text) => change(withBullet(doc, bulletId, text))}
                  // a drafted experience goes in as a project, at the top of Projects
                  addEntry={(title, bullets) => change({ ...doc, projects: [{ id: `new-${Date.now()}`, title, bullets }, ...(doc.projects ?? [])] })}
                  only={only}
                  name={profile.name.split(" ")[0]}
                  addedTo={isMaster ? "your master resume, under Projects" : "this resume, under Projects"}
                />
              </div>
            </aside>
        </Panel>
      </Group>
          {pick && (
            <button
              type="button"
              // keep the selection alive while the button takes the click
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                // the same text twice would be one chip answered twice
                setQuotes((qs) => (qs.some((q) => q.text === pick.text) ? qs : [...qs, { text: pick.text }]));
                setMode("refine");
                if (!chat) fold(right);
                document.getSelection()?.removeAllRanges();
                setPick(null);
              }}
              style={{ left: pick.x, top: Math.max(8, pick.y - 44) }}
              className="fixed z-[60] inline-flex -translate-x-1/2 items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-[13px] font-medium text-ink shadow-[0_8px_24px_-10px_rgb(22_27_34/0.45)] ring-1 ring-ink/10 transition duration-150 ease-out hover:bg-mist starting:translate-y-1 starting:opacity-0 pointer-coarse:py-2.5"
            >
              <MessageSquareQuote aria-hidden className="size-4 text-accent-text" />
              Send to chat
            </button>
          )}
    </div>
  );
}
