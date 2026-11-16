// no "use client": only client components import this, so its function props never cross from the server

import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import { Accordion } from "@base-ui/react/accordion";
import { Popover } from "@base-ui/react/popover";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Link2, Plus, Trash2, X } from "lucide-react";
import { entries } from "../app/data";
import { blank, dates, mark, months, outline, projectBullets, strip, tidy, undates, settle, withBullet, withJob, withoutJob, type Doc, type Field, type Group, type Job } from "./tex";

// rounded-2xl: a one-line field is a pill, a bullet's box keeps soft corners (the sign-in form's fields)
const input =
  "w-full rounded-2xl bg-white px-3 py-1.5 text-base text-ink ring-1 ring-ink/10 outline-none transition placeholder:text-ink/35 hover:ring-ink/25 focus:ring-2 focus:ring-accent-text disabled:opacity-40 sm:text-[13px] pointer-coarse:py-2.5";
const quiet = "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-ink/60 transition hover:bg-ink/5 hover:text-ink";
const originals = entries.flatMap((e) => e.bullets);
const thisMonth = () => new Date().toISOString().slice(0, 7);
// what a header link is, by its text: an email, a phone number, or anything else, with the address it takes
const linkKind = (text: string) =>
  text.includes("@")
    ? { name: "Email", address: "Email address link", placeholder: "mailto:you@example.com" }
    : /^\+?[\d\s().-]{7,}$/.test(text.trim())
      ? { name: "Phone", address: "Phone number link", placeholder: "tel:+5511987654321" }
      : { name: "Link", address: `Link address for ${text}`, placeholder: "https://" };

// A field's name, always shown above it: a placeholder goes once the field is filled, and then nothing says
// which box is the company and which the place.
function Labeled({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-ink/55">{label}</span>
      {children}
    </label>
  );
}

// the month menus' surface, the toolbar's Pick popup's (editor.tsx), so both read as one family
const popup =
  "origin-(--transform-origin) rounded-xl bg-white p-1 shadow-[0_16px_40px_-14px_rgb(22_27_34/0.4)] ring-1 ring-ink/10 outline-none transition-[scale,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none";
const cell = "rounded-full text-[13px] text-ink/80 outline-none transition hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-accent-text disabled:pointer-events-none disabled:opacity-30";
const short = (ym: string) => `${months[Number(ym.slice(5, 7)) - 1].slice(0, 3)} ${ym.slice(0, 4)}`;
const long = (ym: string) => `${months[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;

// A month as the API keeps it (YYYY-MM), or null for still there (present, the end only), picked as the
// resume reads it: a pill saying "Feb 2025" that opens a year with its twelve months. Years step without
// closing; a month picks and closes. Months before min can't be picked. The arrow keys walk the months.
function Month({ label, value, min, present, onChange }: { label: string; value: string | null; min?: string; present?: boolean; onChange: (ym: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(Number((value ?? thisMonth()).slice(0, 4)));
  const chosen = useRef<HTMLButtonElement>(null);
  const pick = (ym: string | null) => {
    onChange(ym);
    setOpen(false);
  };
  const walk = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 }[e.key];
    if (!step) return;
    e.preventDefault();
    const all = [...e.currentTarget.querySelectorAll("button")];
    let i = all.indexOf(document.activeElement as HTMLButtonElement);
    do i += step;
    while (all[i]?.disabled);
    all[i]?.focus();
  };
  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setYear(Number((value ?? min ?? thisMonth()).slice(0, 4)));
      }}
    >
      <Popover.Trigger aria-label={`${label}, ${value ? long(value) : "Present"}`} className={`${input} text-left tabular-nums data-popup-open:ring-2 data-popup-open:ring-accent-text`}>
        {value ? short(value) : "Present"}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6} align="start" collisionPadding={8} className="z-[70] outline-none">
          <Popover.Popup initialFocus={chosen} aria-label={label} className={`${popup} w-60`}>
            {present && (
              <button type="button" onClick={() => pick(null)} className={`${cell} mb-1 flex h-8 w-full items-center justify-between px-2.5 pointer-coarse:h-11 ${value === null ? "text-accent-text" : ""}`}>
                Present
                {value === null && <Check aria-hidden className="size-3.5 text-accent-text" />}
              </button>
            )}
            <div className="flex items-center justify-between">
              <button type="button" aria-label="Previous year" disabled={!!min && year <= Number(min.slice(0, 4))} onClick={() => setYear((y) => y - 1)} className={`${cell} grid size-8 place-items-center pointer-coarse:size-11`}>
                <ChevronLeft aria-hidden className="size-4" />
              </button>
              <span aria-live="polite" className="text-[13px] font-medium tabular-nums">
                {year}
              </span>
              <button type="button" aria-label="Next year" onClick={() => setYear((y) => y + 1)} className={`${cell} grid size-8 place-items-center pointer-coarse:size-11`}>
                <ChevronRight aria-hidden className="size-4" />
              </button>
            </div>
            <div onKeyDown={walk} className="mt-1 grid grid-cols-4 gap-0.5">
              {months.map((name, i) => {
                const ym = `${year}-${String(i + 1).padStart(2, "0")}`;
                const on = ym === value;
                return (
                  <button
                    key={name}
                    ref={on || (!value && ym === (min ?? thisMonth())) ? chosen : undefined}
                    type="button"
                    aria-label={`${name} ${year}`}
                    aria-pressed={on}
                    disabled={!!min && ym < min}
                    onClick={() => pick(ym)}
                    className={`${cell} h-8 pointer-coarse:h-11 ${on ? "bg-accent/10 font-medium text-accent-text" : ""}`}
                  >
                    {name.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

// A job's dates: from, to, or still there (end null, like the API's ExperienceData), as two pills with a dash
// between, the way the resume writes them. An end before the start can't be picked, and a start moved past
// the end takes the end with it.
function Dates({ start, end, onChange }: { start: string; end: string | null; onChange: (start: string, end: string | null) => void }) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5">
      <Month label="Start date" value={start} onChange={(s) => s && onChange(s, end && end < s ? s : end)} />
      <span aria-hidden className="text-ink/40">
        –
      </span>
      <Month label="End date" value={end} min={start} present onChange={(e) => onChange(start, e)} />
    </div>
  );
}

// A job that isn't on the resume yet, as a short form: it goes in, in its place by date, only once it has
// what a \role line needs (title, company, place, dates) and a first bullet; after that it's edited like the rest.
function NewJob({ onAdd, onCancel }: { onAdd: (j: Job) => void; onCancel: () => void }) {
  const [j, setJ] = useState<Job>({ id: "", title: "", organization: "", location: "", start: thisMonth(), end: null, bullets: [""] });
  const set = (patch: Partial<Job>) => setJ((was) => ({ ...was, ...patch }));
  const ready = [j.title, j.organization, j.location, j.bullets[0]].every((t) => t.trim());
  return (
    <form
      aria-label="New experience"
      onSubmit={(e) => {
        e.preventDefault();
        if (ready) onAdd({ ...j, id: `job-${Date.now()}`, title: tidy(j.title), organization: tidy(j.organization), location: tidy(j.location), bullets: [tidy(j.bullets[0])] });
      }}
      className="space-y-2 rounded-xl bg-white p-3 ring-1 ring-accent-text/30"
    >
      <p className="text-[13px] font-medium">New experience</p>
      <Labeled label="Job title">
        <input autoFocus value={j.title} onChange={(e) => set({ title: e.target.value })} placeholder="Backend Engineer" className={input} />
      </Labeled>
      <div className="grid grid-cols-2 gap-2">
        <Labeled label="Company">
          <input value={j.organization} onChange={(e) => set({ organization: e.target.value })} placeholder="Acme" className={input} />
        </Labeled>
        <Labeled label="Location">
          <input value={j.location} onChange={(e) => set({ location: e.target.value })} placeholder="City, or Remote" className={input} />
        </Labeled>
      </div>
      <div>
        <span className="mb-1 block text-xs font-medium text-ink/55">Dates</span>
        <Dates start={j.start} end={j.end} onChange={(start, end) => set({ start, end })} />
      </div>
      <Labeled label="First bullet">
        <textarea
          rows={2}
          value={j.bullets[0]}
          onChange={(e) => set({ bullets: [e.target.value.replace(/\n/g, " ")] })}
          placeholder="What you built, and what changed because of it"
          className={`${input} resize-none leading-snug [field-sizing:content]`}
        />
      </Labeled>
      <div className="flex items-center justify-end gap-1.5 pt-1">
        <button type="button" onClick={onCancel} className="rounded-full px-3 py-1.5 text-[13px] font-medium text-ink/65 transition hover:bg-ink/5 hover:text-ink">
          Cancel
        </button>
        <button type="submit" disabled={!ready} className="rounded-full bg-accent-deep px-3.5 py-1.5 text-[13px] font-medium text-white transition hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40">
          Add to resume
        </button>
      </div>
    </form>
  );
}

// A text of the resume as a form field. It saves itself as a document does: on a pause in the typing, and
// when you leave it. An empty field isn't saved: leaving it brings the text back. What the resume has
// (value) replaces what's shown whenever the field isn't being typed in: a change made on the page, an undo.
// late waits for you to leave the field (a bullet that doesn't exist yet, which saving would move), and
// saves on leaving even unchanged (a split-off bullet's text); empty lets an emptied field save (a link's
// address, taken off). A bullet's keys, each saying whether it took the edit (it then saves nothing itself):
// Enter splits it at the caret (onEnter), Backspace in an empty one removes it (onEmpty), ⌥↑ ⌥↓ move it (onMove).
function Text({
  value,
  label,
  placeholder,
  multiline,
  late,
  empty,
  autoFocus,
  className = "",
  onSave,
  onLive,
  onEnter,
  onEmpty,
  onMove,
}: {
  value: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  late?: boolean;
  empty?: boolean;
  autoFocus?: boolean;
  className?: string;
  onSave: (text: string) => void;
  // each keystroke's text, for a live preview, ahead of the save on a pause
  onLive?: (text: string) => void;
  onEnter?: (before: string, after: string) => boolean;
  onEmpty?: (el: HTMLTextAreaElement) => boolean;
  onMove?: (up: boolean, text: string, el: HTMLTextAreaElement) => boolean;
}) {
  const [text, setText] = useState(value);
  const timer = useRef(0);
  // set once a key took the edit: the blur that follows saves nothing
  const taken = useRef(false);
  // a field opened for you starts at its start: a split-off bullet's caret goes before its text
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (autoFocus) ref.current?.setSelectionRange(0, 0);
  }, [autoFocus]);
  const [seen, setSeen] = useState<string | null>(value);
  const [focused, setFocused] = useState(false);
  if (value !== seen) {
    setSeen(value);
    if (!focused) setText(value);
  }
  useEffect(() => {
    if (late || !focused || text === value || !(empty || text.trim())) return;
    onLive?.(text);
    timer.current = window.setTimeout(() => onSave(text), 700);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restarts with each keystroke
  }, [text]);
  const props = {
    value: text,
    "aria-label": label,
    title: label,
    placeholder: placeholder ?? label,
    autoFocus,
    onFocus: () => setFocused(true),
    onBlur: () => {
      setFocused(false);
      // shows what the resume has from here on: the saved text tidied, or the old one if this wasn't saved
      setSeen(null);
      if (taken.current) return void (taken.current = false);
      if ((late || text !== value) && (empty || text.trim())) onSave(text);
    },
    className: `${input} ${className}`,
  };
  return multiline ? (
    <textarea
      {...props}
      rows={1}
      onChange={(e) => setText(e.target.value.replace(/\n/g, " "))}
      ref={ref}
      onKeyDown={(e) => {
        const el = e.currentTarget;
        const take = (done: boolean) => done && (clearTimeout(timer.current), (taken.current = true));
        // a bullet is one paragraph: Enter finishes it, or starts the next
        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
          e.preventDefault();
          if (!onEnter) el.blur();
          else take(onEnter(text.slice(0, el.selectionStart), text.slice(el.selectionEnd)));
        } else if (e.key === "Backspace" && !text && onEmpty) {
          e.preventDefault();
          take(onEmpty(el));
        } else if (e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown") && onMove) {
          e.preventDefault();
          take(onMove(e.key === "ArrowUp", text, el));
        }
      }}
      className={`${input} ${className} resize-none leading-snug [field-sizing:content]`}
    />
  ) : (
    <input {...props} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
  );
}

// What the form (Content) shows and writes for a document, given how the document changes: the editor's change (undo
// and typesetting with it) or the experience settings' (kept, no more). Both pages pass the master resume's
// document when they edit it, so what either writes is what the other opens with. A text is found whatever
// its capitals: the page reads the name in the capitals the template sets it in, the form as the LaTeX has it.
function form(body: string, doc: Doc, change: (d: Doc) => void, preview?: (d: Doc) => void) {
  const runKey = (f: Field) => Object.keys(doc.runs).find((k) => k.toLowerCase() === f.key.toLowerCase());
  // a bullet as the document keeps it, bold and italic included, and as bare text
  const raw = (id: string) => doc.added.find((a) => a.id === id)?.text ?? doc.bullets[id] ?? [...originals, ...projectBullets(doc)].find((b) => b.id === id)?.text ?? "";
  const text = (id: string) => strip(raw(id));
  const chain = (id: string): { id: string; text: string }[] => {
    const t = text(id);
    const next = doc.added.filter((a) => a.after === id).reverse().flatMap((a) => chain(a.id));
    return [...(t ? [{ id, text: t }] : []), ...next];
  };
  // the document with a text written, or null when that changes nothing; settled moves a job whose dates
  // changed to its place by date (a save does, a live preview doesn't: half a date would send it last)
  const withRun = (f: Field, raw: string, settled: boolean): Doc | null => {
    const t = tidy(raw);
    const was = runKey(f);
    if (!t || t === (was ? doc.runs[was] : f.was)) return null;
    const next = { ...doc, runs: { ...Object.fromEntries(Object.entries(doc.runs).filter(([k]) => k !== was)), [f.key]: t } };
    return settled ? settle(body, next, next) : next;
  };
  // the form writes plain text: a bullet it changes loses its bold and italic
  const withText = (id: string, raw: string): Doc | null => (tidy(raw) !== text(id) ? withBullet(doc, id, mark(tidy(raw))) : null);
  return {
    sections: outline(body, doc, originals),
    run: (f: Field) => doc.runs[runKey(f) ?? ""] ?? f.was,
    bullets: chain,
    links: doc.links ?? {},
    onRun: (f: Field, raw: string) => {
      const next = withRun(f, raw, true);
      if (next) change(next);
    },
    onBullet: (id: string, raw: string) => {
      const next = withText(id, raw);
      if (next) change(next);
    },
    // what's being typed, typeset as it's typed; the saves above still wait for a pause
    liveRun: (f: Field, raw: string) => {
      const next = withRun(f, raw, false);
      if (next) preview?.(next);
    },
    liveBullet: (id: string, raw: string) => {
      const next = withText(id, raw);
      if (next) preview?.(next);
    },
    // the new bullet's id, or nothing for an empty one
    onAdd: (after: string, typed: string) => {
      if (!tidy(typed)) return;
      const id = `new-${Date.now()}`;
      change({ ...doc, added: [...doc.added, { id, after, text: mark(tidy(typed)) }] });
      return id;
    },
    // A bullet moved past its neighbour swaps texts with it: the page's bullets are matched by their place, so
    // the text is what moves. typed is what its field holds now; unchanged, it keeps its bold and italic.
    // shortcut: a bold label opening an item (Relevant Activities:) stays where it is; real order needs the API's
    // bullets as a list (ExperienceData)
    onMove: (id: string, typed: string, to: string) => {
      if (!tidy(typed)) return false;
      const mine = tidy(typed) === text(id) ? raw(id) : mark(tidy(typed));
      change(withBullet(withBullet(doc, id, raw(to)), to, mine));
      return true;
    },
    onLink: (f: Field, url: string) => change({ ...doc, links: { ...doc.links, [f.was]: url } }),
    onJob: (j: Job) => change(withJob(body, doc, j)),
    // any job, the resume's own too: the user says what's on their resume
    onDrop: (id: string) => change(withoutJob(body, doc, id)),
  };
}

// The resume's content as a form, beside the page: a section of the accordion per section of the resume,
// each entry a card with its texts and its bullets (tex.ts's outline reads them off the LaTeX). It writes the
// same changes the page does, so either can be used and both stay in step. Every field has its name above
// it; a job's dates are picked as months; Experience takes new jobs. Texts the resume underlines in its header
// (email, phone, LinkedIn) also take the address they link to in the PDF, each named for what it is. It saves
// as you type, and says so at the top unless status is off (the editor says it by the resume's name);
// settings links to where else it can be edited.
export function Content({
  body,
  doc,
  change,
  preview,
  status = true,
  settings,
}: {
  body: string;
  doc: Doc;
  change: (d: Doc) => void;
  // typesets a document without saving it: what a field holds while it's being typed in
  preview?: (d: Doc) => void;
  // whether it says that changes are saved
  status?: boolean;
  settings?: { href: string; label: string };
}) {
  const { sections, run, bullets, links, onRun, onBullet, liveRun, liveBullet, onAdd, onMove, onLink, onJob, onDrop } = form(body, doc, change, preview);
  const saved = doc !== blank;
  // the bullet being written that isn't in the resume yet: its entry ("section/group"), the bullet it goes
  // under, and the text it starts with (what Enter split off)
  const [adding, setAdding] = useState<{ group: string; after: string; text: string } | null>(null);
  // the field n places from el among its entry's bullets, the caret at its end (or at caret)
  const focusNear = (el: HTMLElement, n: number, caret?: number) => {
    const all = [...el.closest("[data-bullets]")!.querySelectorAll("textarea")];
    const to = all[all.indexOf(el as HTMLTextAreaElement) + n];
    to?.focus();
    to?.setSelectionRange(caret ?? to.value.length, caret ?? to.value.length);
    return !!to;
  };
  const [newJob, setNewJob] = useState(false);
  // the job a first press on its remove button asked about: a second one removes it (settings have no undo)
  const [dropping, setDropping] = useState<string | null>(null);
  // an entry folded to one line: its title, then its company and dates (or its first two texts)
  const by = (g: Group, hint: string) => g.fields.find((f) => f.hint === hint);
  const summary = (g: Group, i: number) => {
    const head = by(g, "Title") ?? g.fields[0];
    const sub = [by(g, "Company") ?? g.fields[1], by(g, "Dates")].filter((f): f is Field => !!f && f !== head);
    return { head: head ? run(head) : `Entry ${i + 1}`, sub: sub.map(run).join(" · ") };
  };
  const panel = "h-(--accordion-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none";
  return (
    <div className="flex h-full flex-col">
    {(status || settings) && (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-ink/10 px-4 py-2 text-xs text-ink/55">
      {status && (
      <span role="status" className="flex items-center gap-1.5">
        {saved && <Check aria-hidden className="size-3.5 text-accent-text" />}
        {saved ? "Saved in this browser" : "Changes save as you type"}
      </span>
      )}
      {settings && (
        <Link href={settings.href} className="ml-auto font-medium text-accent-text hover:underline">
          {settings.label}
        </Link>
      )}
    </div>
    )}
    <Accordion.Root multiple defaultValue={sections.map((s) => s.title)} className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
      {sections.map((s) => (
        <Accordion.Item key={s.title} value={s.title} className="border-b border-ink/10">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13px] font-semibold tracking-wide text-ink/80 transition hover:text-ink">
              {s.title}
              <span className="flex items-center gap-2 font-normal text-ink/40">
                {s.groups.length > 1 && <span className="text-xs tabular-nums">{s.groups.length}</span>}
                <ChevronDown aria-hidden className="size-4 transition-transform duration-200 group-data-panel-open:rotate-180" />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className={panel}>
            {/* several entries (jobs, schools) fold to a line each, one open at a time, so the form isn't a wall of fields */}
            <Accordion.Root className="space-y-1.5 px-3 pb-4">
              {s.groups.map((g, i) => {
                const id = `${s.title}/${i}`;
                const shown = g.items.flatMap(bullets);
                const labelled = g.fields.filter((f) => f.hint && !f.link);
                const rest = g.fields.filter((f) => !f.hint || f.link);
                const { head, sub } = summary(g, i);
                const open = adding?.group === id ? adding : null;
                const fresh = open && (
                  <Text
                    key={`new:${open.after}`}
                    value={open.text}
                    label="New bullet"
                    multiline
                    late
                    empty
                    autoFocus
                    onSave={(t) => {
                      onAdd(open.after, t);
                      setAdding(null);
                    }}
                    // the text before the caret goes in, the rest starts the next new bullet
                    onEnter={(before, after) => {
                      const added = onAdd(open.after, before);
                      if (added) setAdding({ group: id, after: added, text: after });
                      return !!added;
                    }}
                    onEmpty={(el) => {
                      focusNear(el, -1);
                      setAdding(null);
                      return true;
                    }}
                  />
                );
                const fields = (
                  <div data-bullets className="space-y-1.5 p-2">
                    {labelled.length > 0 && (
                      // a company and its place share a row; a title or dates need the width
                      <div className="grid grid-cols-2 gap-1.5">
                        {labelled.map((f) => {
                          const span = f.hint === "Company" || f.hint === "Location" ? "" : "col-span-2";
                          const d = f.hint === "Dates" ? undates(run(f)) : null;
                          // dates written the resume's way are picked as months; any other way stays a text
                          if (d)
                            return (
                              <div key={f.key} className={span}>
                                <span className="mb-1 block text-xs font-medium text-ink/55">Dates</span>
                                <Dates start={d.start} end={d.end} onChange={(start, end) => onRun(f, dates(start, end))} />
                              </div>
                            );
                          return (
                            <Labeled key={f.key} label={f.hint === "Title" ? "Job title" : f.hint!} className={span}>
                              <Text value={run(f)} label={f.hint === "Title" ? "Job title" : f.hint!} onSave={(t) => onRun(f, t)} onLive={(t) => liveRun(f, t)} className={f === g.fields[0] ? "font-medium" : ""} />
                            </Labeled>
                          );
                        })}
                      </div>
                    )}
                    {rest.map((f) => {
                      const kind = linkKind(run(f));
                      return f.link ? (
                        <div key={f.key}>
                        <span className="mb-1 block text-xs font-medium text-ink/55">{kind.name}</span>
                        <div className="rounded-2xl bg-white ring-1 ring-ink/10 transition hover:ring-ink/25 focus-within:ring-2 focus-within:ring-accent-text">
                          <Text value={run(f)} label={kind.name === "Link" ? "Link text" : kind.name} onSave={(t) => onRun(f, t)} onLive={(t) => liveRun(f, t)} className="!bg-transparent !ring-0" />
                          <div className="flex items-center gap-1.5 border-t border-ink/10 pl-3 text-ink/40">
                            <Link2 aria-hidden className="size-3.5 shrink-0" />
                            <Text
                              value={links[f.was] ?? ""}
                              label={kind.address}
                              placeholder={kind.placeholder}
                              // an emptied address takes the link off
                              empty
                              onSave={(t) => onLink(f, t.trim())}
                              className="!bg-transparent !px-0 !ring-0 text-ink/70"
                            />
                          </div>
                        </div>
                        </div>
                      ) : (
                        <Labeled key={f.key} label={f === g.fields[0] ? "Title" : "Details"}>
                          <Text value={run(f)} label={f === g.fields[0] ? "Title" : "Details"} onSave={(t) => onRun(f, t)} onLive={(t) => liveRun(f, t)} className={f === g.fields[0] && g.fields.length > 1 ? "font-medium" : ""} />
                        </Labeled>
                      );
                    })}
                    {(shown.length > 0 || open) && (
                      // wraps under the label in a narrow panel rather than running out of it
                      <span className="flex flex-wrap items-baseline justify-between gap-x-2 pt-1 text-xs">
                        <span className="font-medium text-ink/55">Bullets</span>
                        <span className="text-ink/40 pointer-coarse:hidden">Enter adds one, Alt ↑ ↓ moves it</span>
                      </span>
                    )}
                    {shown.map((b, n) => (
                      <div key={b.id} className="space-y-1.5">
                      <div className="relative">
                        <Text
                          value={b.text}
                          label={`Bullet ${n + 1}`}
                          placeholder="Bullet"
                          multiline
                          onSave={(t) => onBullet(b.id, t)}
                          onLive={(t) => liveBullet(b.id, t)}
                          // Enter at the start leaves the bullet whole and opens an empty one under it
                          onEnter={(before, after) => {
                            const keep = tidy(before) ? before : b.text;
                            if (tidy(keep) !== b.text) onBullet(b.id, keep);
                            setAdding({ group: id, after: b.id, text: tidy(before) ? after : "" });
                            return true;
                          }}
                          onEmpty={(el) => {
                            if (!focusNear(el, -1)) focusNear(el, 1, 0);
                            onBullet(b.id, "");
                            return true;
                          }}
                          onMove={(up, t, el) => {
                            const to = shown[n + (up ? -1 : 1)];
                            if (!to) return false;
                            const at = el.selectionStart;
                            el.blur();
                            onMove(b.id, t, to.id);
                            requestAnimationFrame(() => focusNear(el, up ? -1 : 1, at));
                            return true;
                          }}
                          className="pr-8"
                        />
                        <button
                          type="button"
                          aria-label={`Delete bullet ${n + 1}`}
                          title="Delete this bullet"
                          onClick={() => onBullet(b.id, "")}
                          className="absolute right-1 top-1 grid size-6 place-items-center rounded-full text-ink/35 transition hover:bg-error/25 hover:text-error-text pointer-coarse:size-8"
                        >
                          <X aria-hidden className="size-3.5" />
                        </button>
                      </div>
                      {open?.after === b.id && fresh}
                      </div>
                    ))}
                    {open && !shown.some((b) => b.id === open.after) && fresh}
                    {(g.items.length > 0 || g.job) && (
                      <div className="flex items-center justify-between gap-2">
                        {g.items.length > 0 && !open ? (
                          <button type="button" onClick={() => setAdding({ group: id, after: shown.at(-1)?.id ?? g.items.at(-1)!, text: "" })} className={quiet}>
                            <Plus aria-hidden className="size-3.5" />
                            Add bullet
                          </button>
                        ) : (
                          <span />
                        )}
                        {g.job && (
                          <button
                            type="button"
                            onClick={() => (dropping === g.job ? onDrop(g.job) : setDropping(g.job!))}
                            onBlur={() => setDropping(null)}
                            className={`${quiet} hover:bg-error/25 hover:text-error-text ${dropping === g.job ? "bg-error/25 text-error-text" : ""}`}
                          >
                            <Trash2 aria-hidden className="size-3.5" />
                            {dropping === g.job ? "Press again to remove" : "Remove experience"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
                if (s.groups.length === 1) return <div key={id} className="rounded-xl bg-mist/60">{fields}</div>;
                return (
                  <Accordion.Item key={id} value={id} className="rounded-xl bg-mist/60">
                    <Accordion.Header>
                      <Accordion.Trigger className="group/e flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-ink/5">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-ink">{head}</span>
                          {sub && <span className="block truncate text-xs text-ink/50">{sub}</span>}
                        </span>
                        <ChevronDown aria-hidden className="size-4 shrink-0 text-ink/40 transition-transform duration-200 group-data-panel-open/e:rotate-180" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Panel className={panel}>{fields}</Accordion.Panel>
                  </Accordion.Item>
                );
              })}
              {/* the jobs' section takes new ones: the section with a company in it, whatever it's called */}
              {s.groups.some((g) => by(g, "Company")) &&
                (newJob ? (
                  <NewJob
                    onAdd={(j) => {
                      onJob(j);
                      setNewJob(false);
                    }}
                    onCancel={() => setNewJob(false)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setNewJob(true)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-ink/20 px-3 py-2.5 text-[13px] font-medium text-ink/70 transition hover:border-accent-text/50 hover:bg-white hover:text-accent-text"
                  >
                    <Plus aria-hidden className="size-4" />
                    Add experience
                  </button>
                ))}
            </Accordion.Root>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
    </div>
  );
}
