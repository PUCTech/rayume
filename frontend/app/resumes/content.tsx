"use client";

import { useEffect, useState } from "react";
import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown, Link2, Plus, Trash2 } from "lucide-react";
import type { Field, Group, Section } from "./tex";

const input =
  "w-full rounded-lg bg-white px-2.5 py-1.5 text-base text-ink ring-1 ring-ink/10 outline-none transition placeholder:text-ink/35 hover:ring-ink/25 focus:ring-2 focus:ring-accent-text sm:text-[13px]";

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

// The resume's content as a form, beside the page: a section of the accordion per section of the resume,
// each entry a card with its texts and its bullets (tex.ts's outline reads them off the LaTeX). It writes the
// same changes the page does, so either can be used and both stay in step. Texts the resume underlines in
// its header (email, LinkedIn) also take the address they link to in the PDF.
export function Content({
  sections,
  run,
  bullets,
  links,
  onRun,
  onBullet,
  onAdd,
  onLink,
}: {
  sections: Section[];
  // a text as the resume has it now
  run: (f: Field) => string;
  // a bullet of the body as the resume has it now: itself unless deleted, then the bullets added after it
  bullets: (id: string) => { id: string; text: string }[];
  links: Record<string, string>;
  onRun: (f: Field, text: string) => void;
  onBullet: (id: string, text: string) => void;
  onAdd: (after: string, text: string) => void;
  onLink: (f: Field, url: string) => void;
}) {
  // the entry a new bullet is being written for: "section/group"
  const [adding, setAdding] = useState<string | null>(null);
  // an entry folded to one line: its title, then its company and dates (or its first two texts)
  const by = (g: Group, hint: string) => g.fields.find((f) => f.hint === hint);
  const summary = (g: Group, i: number) => {
    const head = by(g, "Title") ?? g.fields[0];
    const sub = [by(g, "Company") ?? g.fields[1], by(g, "Dates")].filter((f): f is Field => !!f && f !== head);
    return { head: head ? run(head) : `Entry ${i + 1}`, sub: sub.map(run).join(" · ") };
  };
  const panel = "h-(--accordion-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none";
  return (
    <Accordion.Root multiple defaultValue={sections.map((s) => s.title)} className="h-full overflow-y-auto [scrollbar-gutter:stable]">
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
                        {labelled.map((f) => (
                          <div key={f.key} className={f.hint === "Company" || f.hint === "Location" ? "" : "col-span-2"}>
                            <Text value={run(f)} label={f.hint!} onSave={(t) => onRun(f, t)} className={f === g.fields[0] ? "font-medium" : ""} />
                          </div>
                        ))}
                      </div>
                    )}
                    {rest.map((f) =>
                      f.link ? (
                        <div key={f.key} className="rounded-lg bg-white ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-accent-text">
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
                      ) : (
                        <Text key={f.key} value={run(f)} label={f === g.fields[0] ? "Title" : "Details"} onSave={(t) => onRun(f, t)} className={f === g.fields[0] && g.fields.length > 1 ? "font-medium" : ""} />
                      ),
                    )}
                    {shown.map((b) => (
                      <div key={b.id} className="group/b relative">
                        <Text value={b.text} label="Bullet" multiline onSave={(t) => onBullet(b.id, t)} className="pr-8" />
                        <button
                          type="button"
                          aria-label="Delete this bullet"
                          onClick={() => onBullet(b.id, "")}
                          className="absolute right-1 top-1 grid size-6 place-items-center rounded-md text-ink/40 opacity-0 transition hover:bg-error/25 hover:text-error-text focus-visible:opacity-100 group-hover/b:opacity-100 pointer-coarse:opacity-100"
                        >
                          <Trash2 aria-hidden className="size-3.5" />
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
                    {g.items.length > 0 && adding !== id && (
                      <button type="button" onClick={() => setAdding(id)} className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-ink/55 transition hover:bg-ink/5 hover:text-ink">
                        <Plus aria-hidden className="size-3.5" />
                        Add bullet
                      </button>
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
            </Accordion.Root>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
