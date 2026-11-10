import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { Mark } from "../logo";
import manta from "../../public/auth/manta.jpg";

const serif = GeistSerifRegular.className;

// Sign in and sign up: a manta photo on the left half (desktop only), the form on the right.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper font-sans text-ink antialiased">
      <aside className="hidden w-1/2 shrink-0 p-3 lg:block">
        <div className="sticky top-3 h-[calc(100vh-1.5rem)] overflow-hidden rounded-[36px] bg-[#0d5f8a]">
          <Image
            src={manta}
            alt="A manta ray gliding through open blue water, seen from above"
            fill
            priority
            placeholder="blur"
            // landscape photo covering a tall panel: drawn as wide as 1.78x the viewport height, not 50vw
            sizes="178vh"
            className="object-cover object-[45%_50%]"
          />
          {/* darkens the bottom so the white slogan keeps its contrast over the bright water */}
          <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/5 to-ink/20" />
          <Link href="/" aria-label="Rayume home" className="absolute left-8 top-8 inline-flex items-center gap-2 text-white">
            <Mark className="h-7 w-auto" />
            <span className={`${serif} text-[24px] leading-none`}>Rayume</span>
          </Link>
          <p className={`${serif} absolute bottom-16 left-10 right-10 max-w-md text-[clamp(2.6rem,3.8vw,3.8rem)] leading-[1.02] tracking-[-0.03em] text-white`}>
            Glide through the job hunt.
          </p>
          <p className="absolute bottom-6 left-10 text-xs text-white/65">
            Photo by{" "}
            <a href="https://unsplash.com/photos/3rSr37wFxKQ" className="underline underline-offset-2 transition hover:text-white">
              Ishan @seefromthesky
            </a>{" "}
            on Unsplash
          </p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col px-6 py-8 sm:px-10">
        <Link href="/" aria-label="Rayume home" className="inline-flex items-center gap-2 self-start lg:hidden">
          <Mark className="h-6 w-auto" />
          <span className={`${serif} text-[22px] leading-none`}>Rayume</span>
        </Link>
        <div className="m-auto w-full max-w-sm py-12">{children}</div>
      </main>
    </div>
  );
}
