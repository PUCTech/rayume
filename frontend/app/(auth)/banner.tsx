"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { Mark } from "../logo";
import signupPhoto from "../../public/auth/manta-signup.jpg";
import loginPhoto from "../../public/auth/manta-login.jpg";

const serif = GeistSerifRegular.className;

// a different manta per page; both Unsplash License, credited on the photo
const photos = {
  signup: {
    src: signupPhoto,
    alt: "A manta ray gliding through open blue water, seen from above",
    crop: "object-[45%_50%]",
    by: "Ishan @seefromthesky",
    href: "https://unsplash.com/photos/3rSr37wFxKQ",
  },
  login: {
    src: loginPhoto,
    alt: "A manta ray with remoras under its wings, gliding through deep blue water",
    // keeps the raised right wing whole; the left wingtip runs off the edge
    crop: "object-[72%_50%]",
    by: "Swanson Chan",
    href: "https://unsplash.com/photos/yB1k0KaVcXE",
  },
};

// The photo half of the auth pages (desktop only), edge to edge and full height while the form scrolls.
export function Banner() {
  const p = photos[usePathname() === "/login" ? "login" : "signup"];
  return (
    <aside className="hidden w-1/2 shrink-0 lg:block">
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0d5f8a]">
        <Image
          key={p.href}
          src={p.src}
          alt={p.alt}
          fill
          priority
          placeholder="blur"
          // a landscape photo covering a tall panel is drawn as wide as its aspect ratio times the viewport height
          sizes={`${Math.ceil((p.src.width / p.src.height) * 100)}vh`}
          className={`object-cover ${p.crop}`}
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
          <a href={p.href} className="underline underline-offset-2 transition hover:text-white">
            {p.by}
          </a>{" "}
          on Unsplash
        </p>
      </div>
    </aside>
  );
}
