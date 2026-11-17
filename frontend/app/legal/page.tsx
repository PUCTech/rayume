import type { Metadata } from "next";
import { share } from "../share";
import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { legal } from "./info";

const serif = GeistSerifRegular.className;

export const metadata: Metadata = share(
  "Legal · Rayume",
  "Rayume's privacy policy, terms of service and cookie policy.",
);

const docs = [
  {
    href: "/legal/privacy",
    title: "Privacy Policy",
    body: "What we collect, who processes it with us, how long we keep it, and your rights under the LGPD and US state laws.",
  },
  {
    href: "/legal/terms",
    title: "Terms of Service",
    body: "Your account, your content, text the AI writes, and what we can and can't promise.",
  },
  {
    href: "/legal/cookies",
    title: "Cookie Policy",
    body: "The two cookies that keep you signed in, and why there's no banner.",
  },
];

// the parts people come here for, each a line from the policies themselves; change them there first
const facts = [
  "We don't sell your data, show ads or use tracking cookies.",
  "Google's Gemini API writes and tailors your resumes, and isn't allowed to train on your text.",
  `Security logs are deleted after ${legal.logRetentionDays} days. Everything else stays until you ask us to erase it.`,
];

// The legal index: the three documents, the few facts most people want, and who to write to. No pitch.
export default function LegalIndex() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:pt-24">
      <div className="max-w-3xl">
        <h1
          className={`${serif} text-[2.5rem] leading-none tracking-[-0.02em]`}
        >
          Legal
        </h1>
        <p className="mt-3 text-sm text-ink/60">Updated {legal.updated}</p>

        <ul className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
          {docs.map((d) => (
            <li key={d.href}>
              <Link
                href={d.href}
                className="group grid gap-1 py-5 sm:grid-cols-[12rem_minmax(0,1fr)] sm:gap-6"
              >
                <span className="font-medium group-hover:text-accent-text group-hover:underline group-hover:underline-offset-4">
                  {d.title}
                </span>
                <span className="text-[15px] leading-relaxed text-ink/65">
                  {d.body}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <h2 className="mt-12 text-sm font-medium text-ink/60">In short</h2>
        <ul className="mt-3 grid gap-2 text-[15px] leading-relaxed">
          {facts.map((f) => (
            <li key={f} className="flex gap-3">
              <span
                aria-hidden
                className="mt-[0.7em] size-1 shrink-0 rounded-full bg-ink/40"
              />
              {f}
            </li>
          ))}
        </ul>

        <p className="mt-12 text-[15px] text-ink/65">
          To see, correct, export or erase your data, write to{" "}
          <a
            href={`mailto:${legal.email}`}
            className="font-medium text-accent-text underline underline-offset-2"
          >
            {legal.email}
          </a>
          .
        </p>
      </div>
    </section>
  );
}
