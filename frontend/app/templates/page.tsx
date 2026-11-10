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
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:pt-14">
      <Browser tex={tex}>
        <div>
          <h1 className={`${serif} text-[clamp(2.4rem,4.4vw,3.4rem)] leading-none tracking-[-0.03em]`}>Templates</h1>
          <p className="mt-3 text-lg text-ink/65">The Overleaf favorites and our own, filled in with the same real resume.</p>
        </div>
      </Browser>
    </div>
  );
}
