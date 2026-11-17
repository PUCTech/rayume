import type { ReactNode } from "react";

// What the writing may use beyond plain elements. The design pass owns how these look; their props stay.

// a resume line rewritten: the weak version and the strong one, with an optional note on why
export function Example({ before, after, note }: { before: ReactNode; after: ReactNode; note?: ReactNode }) {
  return (
    <figure>
      <p>{before}</p>
      <p>{after}</p>
      {note && <figcaption>{note}</figcaption>}
    </figure>
  );
}

// a side note worth stopping for: a tip, or a warning about a common mistake
export function Note({ kind = "tip", children }: { kind?: "tip" | "warning"; children: ReactNode }) {
  return <aside data-kind={kind}>{children}</aside>;
}

// a list of things to check off; on the ATS checklist each item can be ticked (kept in the browser)
export function Checklist({ id, items }: { id: string; items: { label: ReactNode; detail?: ReactNode }[] }) {
  return (
    <ul data-checklist={id}>
      {items.map((it, i) => (
        <li key={i}>
          {it.label}
          {it.detail && <p>{it.detail}</p>}
        </li>
      ))}
    </ul>
  );
}

// a numbered reference to the article's sources
export function Cite({ n }: { n: number }) {
  return (
    <sup>
      <a href={`#source-${n}`}>[{n}]</a>
    </sup>
  );
}
