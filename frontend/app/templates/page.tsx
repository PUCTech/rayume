import type { Metadata } from "next";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { Browser } from "./browser";
import { sources } from "./detail";

const serif = GeistSerifRegular.className;

export const metadata: Metadata = {
  title: "Templates · Rayume",
  description: "Every LaTeX resume template Rayume can typeset, shown filled in with a real resume.",
};

export default async function Templates() {
  const tex = await sources();
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:pt-24">
      <h1 className={`${serif} mx-auto max-w-3xl text-center text-[clamp(2.6rem,5vw,4rem)] leading-[1.02] tracking-[-0.03em]`}>
        Templates, already filled in.
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-relaxed text-ink/65">
        The Overleaf favorites and our own, each shown with the same real resume so you compare layouts, not content.
      </p>
      <Browser tex={tex} />
    </div>
  );
}
