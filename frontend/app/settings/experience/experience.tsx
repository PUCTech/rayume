"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { Content } from "../../resumes/content";
import { master } from "../../resumes/data";
import { keep, kept, touch } from "../../resumes/store";
import type { Doc } from "../../resumes/tex";

const serif = GeistSerifRegular.className;
const noop = () => () => {};

// Your experience, outside any resume (/settings/experience): the master resume's content form on its own,
// writing the master's document, so it and the master's editor are two views of one set of experiences
// (the API's experiences table; docs/backend/endpoints/experiences.md). The PDF is the master resume's.
// Nothing renders on the server: the document only exists in the browser.
// shortcut: no undo here and the edits live in localStorage; with the API each change is PATCH /experiences/{id}.
export function Experience({ body }: { body: string }) {
  const browser = useSyncExternalStore(noop, () => true, () => false);
  return (
    <div className="min-h-dvh bg-paper font-sans text-ink antialiased">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 sm:px-6">
          <Link href="/resumes" aria-label="Back to your resumes" className="grid size-9 shrink-0 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 hover:text-ink">
            <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5 7 10l5 5" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className={`${serif} truncate text-xl leading-tight tracking-[-0.01em]`}>Your experience</h1>
            <p className="hidden truncate text-xs text-ink/50 sm:block">What your master resume says, and what every new resume starts from</p>
          </div>
          <Link href={`/resumes/${master.id}`} className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-ink/85">
            <span className="sm:hidden">See the PDF</span>
            <span className="max-sm:hidden">Open master resume</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-1 pb-24 pt-4 sm:px-3">{browser && <Form body={body} />}</main>
    </div>
  );
}

function Form({ body }: { body: string }) {
  const [doc, setDoc] = useState<Doc>(() => kept(master.id));
  const change = (d: Doc) => {
    setDoc(d);
    keep(master.id, d);
    touch(master.id);
  };
  return <Content body={body} doc={doc} change={change} />;
}
