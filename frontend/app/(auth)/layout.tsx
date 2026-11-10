import type { ReactNode } from "react";
import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { Mark } from "../logo";
import { Banner } from "./banner";

const serif = GeistSerifRegular.className;

// Sign in and sign up: a manta photo on the left half (desktop only), the form on the right.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper font-sans text-ink antialiased">
      <Banner />
      <main className="flex flex-1 flex-col px-6 py-8 sm:px-10 lg:py-4">
        <Link href="/" aria-label="Rayume home" className="inline-flex items-center gap-2 self-start lg:hidden">
          <Mark className="h-6 w-auto" />
          <span className={`${serif} text-[22px] leading-none`}>Rayume</span>
        </Link>
        <div className="m-auto w-full max-w-sm py-6 lg:py-0">{children}</div>
      </main>
    </div>
  );
}
