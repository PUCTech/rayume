"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useResumes } from "../store";
import { Editor } from "../editor";
import { master } from "../data";

const noop = () => () => {};

// The resume in the URL, from the browser's list, in the editor. Nothing renders on the server: the list
// (and the edits the editor brings back) only exist in the browser.
export function Open({ tex, body }: { tex: Record<string, string>; body: string }) {
  const { id } = useParams<{ id: string }>();
  const list = useResumes();
  const browser = useSyncExternalStore(noop, () => true, () => false);
  if (!browser) return null;
  const r = list.find((x) => x.id === id);
  if (!r)
    return (
      <div className="grid min-h-screen place-items-center px-4 text-center">
        <div>
          <p className="font-medium">This resume isn&apos;t here.</p>
          <Link href="/resumes" className="mt-3 inline-block text-sm font-medium text-accent-text">
            Back to your resumes
          </Link>
        </div>
      </div>
    );
  return <Editor key={r.id} r={r} master={list.find((x) => x.id === master.id) ?? master} template={tex[r.template]} body={body} />;
}
