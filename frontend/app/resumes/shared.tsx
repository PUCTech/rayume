"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { Menu } from "@base-ui/react/menu";
import { BriefcaseBusiness, FileText, LifeBuoy, LogOut, UserRound } from "lucide-react";
import { Mark } from "../logo";
import type { Posting } from "../app/data";
import { copyEdits, newId, save, today, useMe, useResumes } from "./store";
import { master, type Saved } from "./data";

// What the signed-in pages share: the app bar, the class strings, a company's logo, the dates, the menus,
// and starting a resume from the master.

export const serif = GeistSerifRegular.className;
export const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const dateYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
// the day something happened, as YYYY-MM-DD in the person's own time zone: a day is kept as it is, a full
// time (2026-11-17T00:30Z) becomes the day it was where they are
export const localDay = (iso: string) => (iso.length === 10 ? iso : new Date(iso).toLocaleDateString("en-CA"));
// "Nov 12" this year, "Nov 12, 2025" another
export const day = (iso: string) => {
  const d = localDay(iso);
  return (d.slice(0, 4) === String(new Date().getFullYear()) ? date : dateYear).format(new Date(d));
};

export const primary =
  "inline-flex items-center gap-1.5 rounded-full bg-accent-deep px-4 py-2 text-sm font-medium text-white shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--color-accent)_70%,transparent),inset_0_1px_0_rgb(255_255_255/0.25)] transition hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))] active:scale-[0.97]";
export const item = "block w-full rounded-lg px-3 py-2 text-left text-sm text-ink/80 transition hover:bg-ink/5 hover:text-ink";
// a card's menu, under its ••• button
export const menuPanel =
  "absolute right-0 top-full z-20 mt-1 w-44 rounded-xl bg-white p-1 shadow-[0_12px_32px_-12px_rgb(22_27_34/0.35)] ring-1 ring-ink/10 transition duration-200 ease-out starting:-translate-y-1 starting:opacity-0";
export const tabTrack = "flex rounded-full bg-ink/5 p-1";
export const tabButton = (on: boolean) =>
  `rounded-full px-3.5 py-1.5 text-sm transition pointer-coarse:py-2.5 ${on ? "bg-white font-medium text-ink shadow-sm" : "text-ink/60 hover:text-ink"}`;

export function More({ label, open, onClick }: { label: string; open: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={onClick}
      className="-mr-1 grid size-8 place-items-center rounded-full text-ink/50 transition hover:bg-ink/5 hover:text-ink pointer-coarse:size-11"
    >
      <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="currentColor">
        <circle cx="4.5" cy="10" r="1.5" />
        <circle cx="10" cy="10" r="1.5" />
        <circle cx="15.5" cy="10" r="1.5" />
      </svg>
    </button>
  );
}

// a company's logo, or its initial on a tile when there is none (a job saved by hand)
export function Logo({ p, className }: { p: Pick<Posting, "company" | "logo">; className: string }) {
  return p.logo ? (
    <Image src={`/logos/${p.logo}.svg`} alt="" width={24} height={24} unoptimized className={`${className} shrink-0 rounded-md`} />
  ) : (
    <span aria-hidden className={`${className} grid shrink-0 place-items-center rounded-md bg-ink/10 text-[11px] font-medium text-ink/70`}>
      {p.company[0]}
    </span>
  );
}

// Which menu or popover is open (one at a time, by name). It closes on Escape or a click anywhere outside
// its [data-menu] box; Escape hands focus back to the box's first button, the one that opened it.
export function useMenu() {
  const [menu, setMenu] = useState<string | null>(null);
  useEffect(() => {
    if (!menu) return;
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent) {
        if (e.key !== "Escape") return;
        document.activeElement?.closest("[data-menu]")?.querySelector("button")?.focus();
        setMenu(null);
      } else if (!(e.target as Element).closest("[data-menu]")) setMenu(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", close);
    };
  }, [menu]);
  return [menu, setMenu] as const;
}

// a copy of a resume, its edits included
export const copy = (from: Saved, extra: Partial<Saved>): Saved => {
  const fresh = { ...from, id: newId(), updated: today(), ...extra };
  copyEdits(from.id, fresh.id);
  return fresh;
};

// A new resume from the master, opened in the editor; or tailored to a job: the master's copy linked to it,
// opened on Rayume's tailoring (/resumes/[id]/tailor), which proposes the changes to review.
// shortcut: the copy stands in for POST /resumes with job_posting_id, which makes the tailored version itself.
export function useTailor() {
  const list = useResumes();
  const router = useRouter();
  // links to a route share one prefetched shell (partialPrefetching), so warming any id makes the click on a
  // fresh one instant instead of waiting on the server
  useEffect(() => {
    router.prefetch("/resumes/_/tailor");
    router.prefetch("/resumes/_");
  }, [router]);
  return (job?: Posting) => {
    const from = list.find((r) => r.id === master.id) ?? master;
    const fresh = job
      ? copy(from, { title: `${job.company}, ${job.title}`, job: job.id, company: job.logo ? { name: job.company, logo: job.logo } : undefined })
      : copy(from, { title: "Untitled resume" });
    save([...list, fresh]);
    router.push(job ? `/resumes/${fresh.id}/tailor` : `/resumes/${fresh.id}`);
  };
}

const sections = [
  { href: "/resumes", name: "Resumes", Icon: FileText },
  { href: "/jobs", name: "Jobs", Icon: BriefcaseBusiness },
] as const;
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
const menuItem = "flex cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink/80 outline-none select-none data-highlighted:bg-ink/5 data-highlighted:text-ink pointer-coarse:py-3";

// Your account, under your initials: who's signed in, then your personal information and your experience
// (what every resume is made from), help and the legal pages, and signing out.
// shortcut: signing out goes to /login; with the API it's POST /auth/logout first, which clears the cookie.
function Account() {
  const me = useMe();
  const router = useRouter();
  const links = [
    { href: "/settings/profile", label: "Personal information", Icon: UserRound },
    { href: "/settings/experience", label: "Experience", Icon: BriefcaseBusiness },
  ];
  return (
    <Menu.Root>
      <Menu.Trigger aria-label={`Your account, ${me.name}`} className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-xs font-medium text-white transition hover:bg-ink/85 data-popup-open:ring-2 data-popup-open:ring-accent-text data-popup-open:ring-offset-2 data-popup-open:ring-offset-paper pointer-coarse:size-11">
        {initials(me.name)}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50 outline-none">
          <Menu.Popup className="w-64 origin-(--transform-origin) rounded-2xl bg-white p-1.5 shadow-[0_16px_40px_-14px_rgb(22_27_34/0.4)] ring-1 ring-ink/10 outline-none transition-[scale,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 motion-reduce:transition-none">
            <div className="flex items-center gap-3 px-2.5 pb-3 pt-2">
              <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-xs font-medium text-white">
                {initials(me.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{me.name}</p>
                <p className="truncate text-xs text-ink/55">{me.email}</p>
              </div>
            </div>
            <Menu.Separator className="mx-1 mb-1 h-px bg-ink/10" />
            {links.map(({ href, label, Icon }) => (
              <Menu.Item key={href} render={<Link href={href} />} className={menuItem}>
                <Icon aria-hidden className="size-4 text-ink/50" />
                {label}
              </Menu.Item>
            ))}
            <Menu.Separator className="mx-1 my-1 h-px bg-ink/10" />
            <Menu.Item render={<Link href="/legal" />} className={menuItem}>
              <LifeBuoy aria-hidden className="size-4 text-ink/50" />
              Help and legal
            </Menu.Item>
            <Menu.Item onClick={() => router.push("/login")} className={menuItem}>
              <LogOut aria-hidden className="size-4 text-ink/50" />
              Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

// The signed-in pages' bar (no marketing nav): the brand, the two sections, the page's own search and main
// action, then your account. On a phone the sections are icons, named for screen readers.
export function AppBar({ current, label, query, onQuery, children }: { current: "/resumes" | "/jobs"; label: string; query: string; onQuery: (q: string) => void; children: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 sm:gap-4 sm:px-6">
        <Link href="/" className="inline-flex shrink-0 items-center gap-2" aria-label="Rayume home">
          <Mark className="h-6 w-auto" />
          <span className={`${serif} hidden text-[22px] leading-none sm:inline`}>Rayume</span>
        </Link>
        <nav aria-label="Sections" className="flex shrink-0 gap-0.5 sm:gap-1">
          {sections.map(({ href, name, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={href === current ? "page" : undefined}
              className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full text-sm transition max-sm:w-9 sm:px-3.5 pointer-coarse:h-11 max-sm:pointer-coarse:w-10 ${href === current ? "bg-ink font-medium text-white" : "text-ink/60 hover:bg-ink/5 hover:text-ink"}`}
            >
              <Icon aria-hidden className="size-4 sm:hidden" />
              <span className="max-sm:sr-only">{name}</span>
            </Link>
          ))}
        </nav>
        <div role="search" className="mx-auto flex w-full min-w-0 max-w-md items-center gap-2.5 rounded-full bg-white px-4 ring-1 ring-ink/10 focus-within:ring-2 focus-within:ring-accent-text max-sm:gap-1.5 max-sm:px-3">
          <svg aria-hidden viewBox="0 0 20 20" className="size-4 shrink-0 text-ink/45" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="m13 13 4 4" />
          </svg>
          <label htmlFor="bar-search" className="sr-only">{label}</label>
          <input
            id="bar-search"
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={label}
            className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-ink/45 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
        {children}
        <Account />
      </div>
    </header>
  );
}
