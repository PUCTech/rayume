import type { Metadata } from "next";
import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { legal } from "./info";

const serif = GeistSerifRegular.className;

export const metadata: Metadata = {
  title: "Legal · Rayume",
  description: "Rayume's privacy policy, terms of service and cookie policy.",
};

const docs = [
  {
    href: "/legal/privacy",
    title: "Privacy Policy",
    body: "What we collect, why, who processes it with us, how long we keep it, and your rights under the LGPD and US state privacy laws.",
  },
  {
    href: "/legal/terms",
    title: "Terms of Service",
    body: "The rules for using Rayume: your account, your content, AI-written text, and what we can and can't promise.",
  },
  {
    href: "/legal/cookies",
    title: "Cookie Policy",
    body: "The two cookies we use to keep you signed in, and why there's no cookie banner.",
  },
];

export default function LegalIndex() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6 lg:pt-24">
      <h1 className={`${serif} max-w-2xl text-[clamp(2.6rem,5vw,4rem)] leading-[1.02] tracking-[-0.03em]`}>
        The fine print, in plain words.
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/65">
        Rayume handles your career history, so we keep these documents short, specific and honest. They were last
        updated on {legal.updated}.
      </p>
      <ul className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
        {docs.map((d) => (
          <li key={d.href}>
            <Link
              href={d.href}
              className="flex h-full flex-col rounded-[28px] bg-mist p-6 transition hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgb(22_27_34/0.45)] motion-reduce:hover:translate-y-0 sm:p-7"
            >
              <span className={`${serif} text-2xl tracking-[-0.02em]`}>{d.title}</span>
              <span className="mt-3 text-[15px] leading-relaxed text-ink/65">{d.body}</span>
              <span className="mt-auto pt-6 text-sm font-medium text-verm-text">Read</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-12 max-w-2xl text-sm leading-relaxed text-ink/55">
        Questions about any of these? Write to <a href={`mailto:${legal.email}`} className="font-medium text-verm-text underline underline-offset-2">{legal.email}</a>.
      </p>
    </section>
  );
}
