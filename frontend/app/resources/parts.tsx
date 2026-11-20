import type { ReactNode } from "react";
import { Ticks } from "./checklist";

// What the writing may use beyond plain elements. The design pass owns how these look; their props stay.
// They render inside the article's prose, whose descendant rules (p, ul, li margins, list markers) outrank
// plain classes, hence the `!` overrides below.

// shared by every box: a white panel on the paper with a hairline navy shadow, and flush first paragraphs
const panel = "mt-6 rounded-2xl bg-white shadow-[0_1px_2px_rgb(22_27_34/0.08),0_8px_24px_-16px_rgb(22_27_34/0.25)]";
const flush = "[&>p:first-child]:mt-0!";
const bare = "mt-0! list-none! pl-0!";

function Check({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={`size-3.5 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    </svg>
  );
}

function Cross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={`size-3.5 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" />
    </svg>
  );
}

// a resume line rewritten: the weak version and the strong one, with an optional note on why.
// The labels default to Before and After; a guide comparing other things can rename them (Generic, Tailored)
export function Example({
  before,
  after,
  note,
  beforeLabel = "Before",
  afterLabel = "After",
}: {
  before: ReactNode;
  after: ReactNode;
  note?: ReactNode;
  beforeLabel?: ReactNode;
  afterLabel?: ReactNode;
}) {
  const row = "grid gap-1.5 px-5 py-4 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-4";
  const label = "flex items-center gap-1.5 text-[13px] font-medium sm:pt-0.5";
  return (
    <figure className={`${panel} overflow-hidden text-[15px] leading-relaxed`}>
      <div className={row}>
        <span className={`${label} text-ink/55`}>
          <Cross className="text-ink/40" />
          {beforeLabel}
        </span>
        <div className={`text-ink/60 ${flush}`}>{before}</div>
      </div>
      {/* the strong line carries the weight: full ink, and a short ultramarine bar at its edge */}
      <div className={`${row} relative border-t border-ink/10 before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-r-full before:bg-accent`}>
        <span className={`${label} text-accent-text`}>
          <Check />
          {afterLabel}
        </span>
        <div className={`text-ink ${flush}`}>{after}</div>
      </div>
      {note && <figcaption className={`bg-mist/60 px-5 py-3 text-sm leading-relaxed text-ink/75 ${flush}`}>{note}</figcaption>}
    </figure>
  );
}

// a side note worth stopping for: a tip, or a warning about a common mistake. `title` renames the label
export function Note({ kind = "tip", title, children }: { kind?: "tip" | "warning"; title?: ReactNode; children: ReactNode }) {
  const warning = kind === "warning";
  // a white card on the paper, coloured only in its icon, label and edge: a tinted fill turns ochre to mud.
  // The label is always words ("Tip", "Watch out"), so the colour is never the only signal
  return (
    <aside
      className={`${panel} relative overflow-hidden px-5 py-4 text-ink ring-1 before:absolute before:inset-y-0 before:left-0 before:w-[3px] ${warning ? "ring-warning/35 before:bg-warning" : "ring-accent/20 before:bg-accent"}`}
    >
      <p className={`mt-0! flex items-center gap-2 text-[13px] font-medium ${warning ? "text-warning-text" : "text-accent-text"}`}>
        <svg viewBox="0 0 20 20" aria-hidden className={`size-4 shrink-0 ${warning ? "text-warning" : ""}`} fill="currentColor">
          {warning ? (
            <path d="M10 2.5 18.5 17h-17L10 2.5Zm-.9 5v4.6h1.8V7.5H9.1Zm0 6.1V15h1.8v-1.4H9.1Z" />
          ) : (
            <path d="M10 1.8a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.6v.3h5.6v-.3c0-.6.3-1.2.8-1.6A6 6 0 0 0 10 1.8ZM7.4 16.2h5.2v.6c0 .8-.7 1.4-1.5 1.4H8.9c-.8 0-1.5-.6-1.5-1.4v-.6Z" />
          )}
        </svg>
        {title ?? (warning ? "Watch out" : "Tip")}
      </p>
      <div className={`mt-1.5 text-[15px] leading-relaxed ${flush}`}>{children}</div>
    </aside>
  );
}

// the section or article in a few lines, for readers who skim: put it first or last, not both
export function Takeaways({ title = "In short", items }: { title?: ReactNode; items: ReactNode[] }) {
  return (
    <aside className="mt-6 rounded-2xl bg-mist px-5 py-5 text-ink sm:px-6">
      <p className="mt-0! font-medium">{title}</p>
      <ul className={`${bare} mt-3! space-y-2.5`}>
        {items.map((it, i) => (
          <li key={i} className="mt-0! flex gap-3 text-[15px] leading-relaxed">
            <span className="mt-[0.3em] grid size-5 shrink-0 place-items-center rounded-full bg-accent-deep text-white">
              <Check className="size-3" />
            </span>
            <span className="min-w-0">{it}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

// a real sequence the reader follows in order; for a list that isn't one, use a plain ul
export function Steps({ items }: { items: { title: ReactNode; detail?: ReactNode }[] }) {
  return (
    <ol className={`${bare} mt-6! space-y-5`}>
      {items.map((it, i) => (
        <li key={i} className="mt-0! grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3">
          <span aria-hidden className="grid size-9 place-items-center rounded-full bg-mist text-[15px] font-medium tabular-nums text-accent-text">
            {i + 1}
          </span>
          <div className="min-w-0 pt-1.5">
            <span className="block font-medium text-ink">{it.title}</span>
            {it.detail && <div className={`mt-1 text-[15px] leading-relaxed text-ink/70 ${flush}`}>{it.detail}</div>}
          </div>
        </li>
      ))}
    </ol>
  );
}

// two short lists side by side (stacked on phones): what to do, and what to skip
export function DoDont({ do: yes, dont: no }: { do: ReactNode[]; dont: ReactNode[] }) {
  const cols = [
    { label: "Do", items: yes, icon: <Check className="text-accent-text" />, head: "text-accent-text", text: "text-ink" },
    { label: "Don’t", items: no, icon: <Cross className="text-ink/45" />, head: "text-ink/60", text: "text-ink/70" },
  ];
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {cols.map((c) => (
        <div key={c.label} className={`${panel} mt-0! px-5 py-4`}>
          <p className={`mt-0! text-[13px] font-medium ${c.head}`}>{c.label}</p>
          <ul className={`${bare} mt-2! space-y-2`}>
            {c.items.map((it, i) => (
              <li key={i} className={`mt-0! flex gap-2.5 text-[15px] leading-relaxed ${c.text}`}>
                <span className="mt-[0.4em]">{c.icon}</span>
                <span className="min-w-0">{it}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// a list of things to check off; each item can be ticked, kept in this browser under the list's id
export function Checklist({ id, items }: { id: string; items: { label: ReactNode; detail?: ReactNode }[] }) {
  return <Ticks id={id} items={items} />;
}

// a numbered reference to the article's sources
export function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 text-[0.7em] leading-none">
      <a href={`#source-${n}`} aria-label={`Source ${n}`} className="rounded-sm px-px font-medium tabular-nums text-accent-text no-underline! hover:underline!">
        [{n}]
      </a>
    </sup>
  );
}
