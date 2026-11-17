import type { ReactNode } from "react";
import { Ticks } from "./checklist";

// What the writing may use beyond plain elements. The design pass owns how these look; their props stay.
// They render inside the article's prose, whose descendant rules (p, ul, li margins) outrank plain classes,
// hence the few `!` overrides below.

// a resume line rewritten: the weak version and the strong one, with an optional note on why
export function Example({ before, after, note }: { before: ReactNode; after: ReactNode; note?: ReactNode }) {
  return (
    <figure className="mt-6 overflow-hidden rounded-2xl bg-white text-[15px] leading-relaxed shadow-[0_1px_2px_rgb(22_27_34/0.08)]">
      <div className="grid gap-1 px-5 py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-4">
        <span className="text-[13px] font-medium text-ink/50">Before</span>
        <div className="text-ink/60 [&>p:first-child]:mt-0!">{before}</div>
      </div>
      <div className="grid gap-1 border-t border-ink/10 px-5 py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-4">
        <span className="text-[13px] font-medium text-accent-text">After</span>
        <div className="text-ink [&>p:first-child]:mt-0!">{after}</div>
      </div>
      {note && (
        <figcaption className="bg-mist/60 px-5 py-3 text-sm leading-relaxed text-ink/70 [&>p:first-child]:mt-0!">{note}</figcaption>
      )}
    </figure>
  );
}

// a side note worth stopping for: a tip, or a warning about a common mistake
export function Note({ kind = "tip", children }: { kind?: "tip" | "warning"; children: ReactNode }) {
  const warning = kind === "warning";
  return (
    <aside className={`mt-6 flex gap-3 rounded-2xl p-5 text-ink ${warning ? "bg-warning/15" : "bg-accent/10"}`}>
      <svg viewBox="0 0 20 20" aria-hidden className={`mt-1 size-4 shrink-0 ${warning ? "text-warning" : "text-accent-text"}`} fill="currentColor">
        {warning ? (
          <path d="M10 2.5 18.5 17h-17L10 2.5Zm-.9 5v4.6h1.8V7.5H9.1Zm0 6.1V15h1.8v-1.4H9.1Z" />
        ) : (
          <path d="M10 1.8a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.6v.3h5.6v-.3c0-.6.3-1.2.8-1.6A6 6 0 0 0 10 1.8ZM7.4 16.2h5.2v.6c0 .8-.7 1.4-1.5 1.4H8.9c-.8 0-1.5-.6-1.5-1.4v-.6Z" />
        )}
      </svg>
      <div className="min-w-0">
        <p className={`mt-0! text-sm font-medium ${warning ? "text-warning-text" : "text-accent-text"}`}>{warning ? "Watch out" : "Tip"}</p>
        <div className="[&>p:first-child]:mt-1!">{children}</div>
      </div>
    </aside>
  );
}

// a list of things to check off; each item can be ticked, kept in this browser under the list's id
export function Checklist({ id, items }: { id: string; items: { label: ReactNode; detail?: ReactNode }[] }) {
  return <Ticks id={id} items={items} />;
}

// a numbered reference to the article's sources
export function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5">
      <a href={`#source-${n}`} aria-label={`Source ${n}`} className="no-underline!">
        [{n}]
      </a>
    </sup>
  );
}
