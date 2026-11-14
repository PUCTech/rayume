import type { Metadata } from "next";
import { share } from "../share";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { Browser } from "./browser";
import { sources } from "./detail";

const serif = GeistSerifRegular.className;

export const metadata: Metadata = share("Templates · Rayume", "Every LaTeX resume template Rayume can typeset, shown filled in with a real resume.");

export default async function Templates() {
  const tex = await sources();
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:pt-10">
      <Browser tex={tex}>
        <div>
          <h1 className={`${serif} text-[clamp(2.2rem,4vw,3rem)] leading-none tracking-[-0.03em]`}>Templates</h1>
          <p className="mt-2 text-ink/65">The Overleaf favorites and our own, each shown with a real resume.</p>
        </div>
      </Browser>
    </div>
  );
}
