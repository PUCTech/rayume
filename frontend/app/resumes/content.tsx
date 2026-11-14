"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Accordion } from "@base-ui/react/accordion";
import { Check, ChevronDown, Link2, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import { entries } from "../app/data";
import { blank, dates, mark, months, outline, projectBullets, strip, tidy, undates, settle, withBullet, withJob, withoutJob, type Doc, type Field, type Group, type Job } from "./tex";

const input =
  "w-full rounded-lg bg-white px-2.5 py-1.5 text-base text-ink ring-1 ring-ink/10 outline-none transition placeholder:text-ink/35 hover:ring-ink/25 focus:ring-2 focus:ring-accent-text disabled:opacity-40 sm:text-[13px]";
const quiet = "flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-ink/60 transition hover:bg-ink/5 hover:text-ink";
const originals = entries.flatMap((e) => e.bullets);
const thisMonth = () => new Date().toISOString().slice(0, 7);
const years = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() + 1 - i));

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

// A month as the API keeps it (YYYY-MM), picked as a month and a year
function Month({ label, value, onChange }: { label: string; value: string; onChange: (ym: string) => void }) {
  const [y, m] = value.split("-");
  const sel = "cursor-pointer rounded-lg bg-white py-1.5 pl-2 pr-1 text-base text-ink ring-1 ring-ink/10 outline-none transition hover:ring-ink/25 focus:ring-2 focus:ring-accent-text sm:text-[13px]";
  return (
    <span role="group" aria-label={label} className="flex gap-1">
      <select aria-label={`${label} month`} value={m} onChange={(e) => onChange(`${y}-${e.target.value}`)} className={sel}>
        {months.map((name, i) => (
          <option key={name} value={String(i + 1).padStart(2, "0")}>
            {name.slice(0, 3)}
          </option>
        ))}
      </select>
      <select aria-label={`${label} year`} value={y} onChange={(e) => onChange(`${e.target.value}-${m}`)} className={sel}>
        {(years.includes(y) ? years : [y, ...years]).map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
    </span>
  );
}

// A job's dates: from, to, or still there (end null, like the API's ExperienceData). Leaving "Current" ends it
// this month.
function Dates({ start, end, onChange }: { start: string; end: string | null; onChange: (start: string, end: string | null) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <Month label="Start" value={start} onChange={(s) => onChange(s, end)} />
      <span aria-hidden className="text-ink/40">–</span>
      {end === null ? <span className="px-1 text-[13px] text-ink/70">Present</span> : <Month label="End" value={end} onChange={(e) => onChange(start, e)} />}
      <label className="ml-auto flex cursor-pointer items-center gap-1.5 text-xs text-ink/70">
        <input type="checkbox" checked={end === null} onChange={(e) => onChange(start, e.target.checked ? null : thisMonth())} className="size-3.5 accent-accent-deep" />
        Current
      </label>
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
// late waits for you to leave the field (a bullet that doesn't exist yet, which saving would move); empty
// lets an emptied field save (a link's address, taken off).
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
}) {
  const [text, setText] = useState(value);
  const [seen, setSeen] = useState<string | null>(value);
  const [focused, setFocused] = useState(false);
  if (value !== seen) {
    setSeen(value);
    if (!focused) setText(value);
  }
  useEffect(() => {
    if (late || !focused || text === value || !(empty || text.trim())) return;
    const id = window.setTimeout(() => onSave(text), 700);
    return () => clearTimeout(id);
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
      if (text !== value && (empty || text.trim())) onSave(text);
    },
    className: `${input} ${className}`,
  };
  return multiline ? (
    <textarea
      {...props}
      rows={1}
      onChange={(e) => setText(e.target.value.replace(/\n/g, " "))}
      // a bullet is one paragraph: Enter finishes it
      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), e.currentTarget.blur())}
      className={`${props.className} resize-none leading-snug [field-sizing:content]`}
    />
  ) : (
    <input {...props} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()} />
  );
}

// What the form (Content) shows and writes for a document, given how the document changes: the editor's change (undo
// and typesetting with it) or the experience settings' (kept, no more). Both pages pass the master resume's
// document when they edit it, so what either writes is what the other opens with. A text is found whatever
// its capitals: the page reads the name in the capitals the template sets it in, the form as the LaTeX has it.
function form(body: string, doc: Doc, change: (d: Doc) => void) {
  const runKey = (f: Field) => Object.keys(doc.runs).find((k) => k.toLowerCase() === f.key.toLowerCase());
  const text = (id: string) => strip(doc.added.find((a) => a.id === id)?.text ?? doc.bullets[id] ?? [...originals, ...projectBullets(doc)].find((b) => b.id === id)?.text ?? "");
  const chain = (id: string): { id: string; text: string }[] => {
    const t = text(id);
    const next = doc.added.filter((a) => a.after === id).reverse().flatMap((a) => chain(a.id));
    return [...(t ? [{ id, text: t }] : []), ...next];
  };
  return {
    sections: outline(body, doc, originals),
    run: (f: Field) => doc.runs[runKey(f) ?? ""] ?? f.was,
    bullets: chain,
    links: doc.links ?? {},
    onRun: (f: Field, raw: string) => {
      const t = tidy(raw);
      const was = runKey(f);
      if (!t || t === (was ? doc.runs[was] : f.was)) return;
      // settled: a job whose dates changed moves to its place in the date order
      const next = { ...doc, runs: { ...Object.fromEntries(Object.entries(doc.runs).filter(([k]) => k !== was)), [f.key]: t } };
      change(settle(body, next, next));
    },
    // the form writes plain text: a bullet it changes loses its bold and italic
    onBullet: (id: string, raw: string) => tidy(raw) !== text(id) && change(withBullet(doc, id, mark(tidy(raw)))),
    onAdd: (after: string, raw: string) => tidy(raw) && change({ ...doc, added: [...doc.added, { id: `new-${Date.now()}`, after, text: mark(tidy(raw)) }] }),
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
// (email, LinkedIn) also take the address they link to in the PDF. It saves as you type, and says so at the
// top, with the PDF being typeset again when busy says it is; settings links to where else it can be edited.
export function Content({
  body,
  doc,
  change,
  busy,
  settings,
}: {
  body: string;
  doc: Doc;
  change: (d: Doc) => void;
  // whether the PDF is being typeset with the latest changes
  busy?: boolean;
  settings?: { href: string; label: string };
}) {
  const { sections, run, bullets, links, onRun, onBullet, onAdd, onLink, onJob, onDrop } = form(body, doc, change);
  const saved = doc !== blank;
  // the entry a new bullet is being written for: "section/group"
  const [adding, setAdding] = useState<string | null>(null);
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
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-ink/10 px-4 py-2 text-xs text-ink/55">
      <span role="status" className="flex items-center gap-1.5">
        {busy ? <LoaderCircle aria-hidden className="size-3.5 animate-spin motion-reduce:animate-none" /> : saved && <Check aria-hidden className="size-3.5 text-accent-text" />}
        {busy ? "Saved, updating the PDF" : saved ? "Saved in this browser" : "Changes save as you type"}
      </span>
      {settings && (
        <Link href={settings.href} className="font-medium text-accent-text hover:underline">
          {settings.label}
        </Link>
      )}
    </div>
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
                const fields = (
                  <div className="space-y-1.5 p-2">
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
                              <Text value={run(f)} label={f.hint === "Title" ? "Job title" : f.hint!} onSave={(t) => onRun(f, t)} className={f === g.fields[0] ? "font-medium" : ""} />
                            </Labeled>
                          );
                        })}
                      </div>
                    )}
                    {rest.map((f) =>
                      f.link ? (
                        <div key={f.key}>
                        <span className="mb-1 block text-xs font-medium text-ink/55">Link</span>
                        <div className="rounded-lg bg-white ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-accent-text">
                          <Text value={run(f)} label="Link text" onSave={(t) => onRun(f, t)} className="!bg-transparent !ring-0" />
                          <div className="flex items-center gap-1.5 border-t border-ink/10 pl-2.5 text-ink/40">
                            <Link2 aria-hidden className="size-3.5 shrink-0" />
                            <Text
                              value={links[f.was] ?? ""}
                              label={`Address for ${run(f)}`}
                              placeholder={f.was.includes("@") ? "mailto:you@example.com" : "https://"}
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
                          <Text value={run(f)} label={f === g.fields[0] ? "Title" : "Details"} onSave={(t) => onRun(f, t)} className={f === g.fields[0] && g.fields.length > 1 ? "font-medium" : ""} />
                        </Labeled>
                      ),
                    )}
                    {(shown.length > 0 || adding === id) && <span className="block pt-1 text-xs font-medium text-ink/55">Bullets</span>}
                    {shown.map((b, n) => (
                      <div key={b.id} className="relative">
                        <Text value={b.text} label={`Bullet ${n + 1}`} placeholder="Bullet" multiline onSave={(t) => onBullet(b.id, t)} className="pr-8" />
                        <button
                          type="button"
                          aria-label={`Delete bullet ${n + 1}`}
                          title="Delete this bullet"
                          onClick={() => onBullet(b.id, "")}
                          className="absolute right-1 top-1 grid size-6 place-items-center rounded-md text-ink/35 transition hover:bg-error/25 hover:text-error-text pointer-coarse:size-8"
                        >
                          <X aria-hidden className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    {adding === id && (
                      <Text
                        value=""
                        label="New bullet"
                        multiline
                        late
                        autoFocus
                        onSave={(t) => {
                          onAdd(shown.at(-1)?.id ?? g.items.at(-1)!, t);
                          setAdding(null);
                        }}
                      />
                    )}
                    {(g.items.length > 0 || g.job) && (
                      <div className="flex items-center justify-between gap-2">
                        {g.items.length > 0 && adding !== id ? (
                          <button type="button" onClick={() => setAdding(id)} className={quiet}>
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
