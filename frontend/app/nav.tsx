"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mark } from "./logo";

const links = [
  ["How it works", "/#how"],
  ["Templates", "/#templates"],
  ["Why Rayume", "/#why"],
];

const ease = "duration-300 ease-out";

// Floating glass nav. A sustained scroll down shrinks it to the mark, the links and "Start free";
// a deliberate scroll back up (or reaching the top) brings back the wordmark and "Sign in".
export function Nav({ serif }: { serif: string }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let compacted = false;
    let anchor = window.scrollY; // where the current scroll direction started
    let last = anchor;
    const onScroll = () => {
      const y = window.scrollY;
      if (y === last) return;
      if ((y > last) !== (last > anchor)) anchor = last; // direction flipped
      last = y;
      // hysteresis: small flicks either way don't toggle it
      if (!compacted && y > 160 && y - anchor > 32) compacted = true;
      else if (compacted && (y < 80 || anchor - y > 120)) compacted = false;
      setCompact(compacted);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-3 z-40 px-4">
      <nav
        aria-label="Main"
        className={`glass mx-auto flex items-center justify-between rounded-full py-2 pr-2 transition-[max-width,padding,background-color] ${ease} ${
          compact ? "max-w-44 bg-paper/75! pl-4 md:max-w-[33rem]" : "max-w-6xl pl-5"
        }`}
      >
        <Link href="/" className="inline-flex items-center" aria-label="Rayume home">
          <Mark className="h-6 w-auto" />
          <span
            className={`${serif} overflow-hidden whitespace-nowrap text-[22px] leading-none transition-all ${ease} ${
              compact ? "ml-0 max-w-0 opacity-0" : "ml-2 max-w-28 opacity-100"
            }`}
          >
            Rayume
          </span>
        </Link>
        <div className="hidden items-center text-sm md:flex">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="rounded-full px-4 py-2 text-ink/70 transition hover:bg-white/50 hover:text-ink">
              {label}
            </a>
          ))}
        </div>
        <div className="flex items-center text-sm">
          <Link
            href="/login"
            tabIndex={compact ? -1 : undefined}
            className={`hidden overflow-hidden whitespace-nowrap rounded-full py-2 transition-all hover:bg-white/50 sm:inline-block ${ease} ${
              compact ? "max-w-0 px-0 opacity-0" : "mr-1 max-w-24 px-4 opacity-100"
            }`}
          >
            Sign in
          </Link>
          <Link href="/signup" className="whitespace-nowrap rounded-full bg-ink px-4 py-2 font-medium text-white transition hover:bg-ink/85">
            Start free
          </Link>
        </div>
      </nav>
    </header>
  );
}
