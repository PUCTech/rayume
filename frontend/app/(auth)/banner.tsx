import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { Mark } from "../logo";
import { Slogan } from "./slogan";
import signupPhoto from "../../public/auth/manta-signup.jpg";
import loginPhoto from "../../public/auth/manta-login.jpg";
import kaimPhoto from "../../public/auth/ray-andre-kaim.jpg";
import brucePhoto from "../../public/auth/ray-heidi-bruce.jpg";
import feaguePhoto from "../../public/auth/ray-ty-feague.jpg";

const serif = GeistSerifRegular.className;

// the ray photos, all Unsplash License, credited on the photo (sources in docs/design/README.md#assets)
const photos = [
  {
    src: signupPhoto,
    alt: "A manta ray gliding through open blue water, seen from above",
    crop: "object-[45%_50%]",
    by: "Ishan @seefromthesky",
    href: "https://unsplash.com/photos/3rSr37wFxKQ",
  },
  {
    src: loginPhoto,
    alt: "A manta ray with remoras under its wings, gliding through deep blue water",
    // keeps the raised right wing whole; the left wingtip runs off the edge
    crop: "object-[72%_50%]",
    by: "Swanson Chan",
    href: "https://unsplash.com/photos/yB1k0KaVcXE",
  },
  {
    src: kaimPhoto,
    alt: "A manta ray seen from below, its wing sweeping across dim blue water",
    crop: "object-[62%_50%]",
    by: "Andre Kaim",
    href: "https://unsplash.com/photos/Syzn3nfkYE4",
  },
  {
    src: brucePhoto,
    alt: "A spotted eagle ray swimming through clear blue water",
    crop: "object-[50%_50%]",
    by: "Heidi Bruce",
    href: "https://unsplash.com/photos/qX_WaCWaIng",
  },
  {
    src: feaguePhoto,
    alt: "A ray swimming towards the camera in turquoise water",
    crop: "object-[68%_50%]",
    by: "Ty Feague",
    href: "https://unsplash.com/photos/MFDHmnUs7Sc",
  },
];

// A random ray per visit, picked on the server so the client hydrates the same one. connection()
// moves the pick to request time; the static shell around it keeps the ultramarine panel meanwhile.
async function pickPhoto() {
  await connection();
  return photos[Math.floor(Math.random() * photos.length)];
}

async function Photo() {
  const p = await pickPhoto();
  return (
    <>
      <Image
        src={p.src}
        alt={p.alt}
        fill
        priority
        placeholder="blur"
        // phones: a full-width band. Desktop: a landscape photo covering a tall panel is drawn as wide as
        // its aspect ratio times the viewport height
        sizes={`(min-width: 1024px) ${Math.ceil((p.src.width / p.src.height) * 100)}vh, 100vw`}
        className={`object-cover ${p.crop}`}
      />
      {/* darkens the bottom for the slogan and the top for the wordmark and credit, over the bright water;
          light tokens keep it navy in dark mode */}
      <div aria-hidden data-theme="light" className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/5 to-ink/40 lg:to-ink/20" />
      <p className="absolute right-4 top-7 text-xs text-white/80 lg:right-auto lg:top-auto lg:bottom-7 lg:left-10 lg:text-white/70">
        Photo by{" "}
        <a href={p.href} className="underline underline-offset-2 transition hover:text-white focus-visible:outline-white">
          {p.by}
        </a>
        <span className="max-lg:hidden"> on Unsplash</span>
      </p>
    </>
  );
}

// The photo of the auth pages. Phones: a band on top that the form sheet slides over. Desktop: the left
// half, an inset frame that stays put while the form scrolls.
export function Banner() {
  return (
    <aside className="lg:w-1/2 lg:shrink-0 lg:p-3">
      <div className="relative h-[clamp(11rem,28svh,15rem)] overflow-hidden bg-accent lg:sticky lg:top-3 lg:h-[calc(100dvh-1.5rem)] lg:rounded-[36px] lg:shadow-[0_24px_60px_-28px_color-mix(in_srgb,var(--color-accent)_60%,transparent)]">
        {/* glass over the photo: there's colour behind it to bend. First in the DOM so it's first in tab order,
            z-10 to stay over the photo that follows */}
        <div className="absolute left-4 top-4 z-10 lg:left-6 lg:top-6">
          <Link href="/" aria-label="Rayume home" className="glass glass-dark inline-flex h-11 items-center gap-2 rounded-full pl-3.5 pr-4 text-white focus-visible:outline-white lg:h-12 lg:pl-4 lg:pr-5">
            <Mark className="h-5 w-auto lg:h-6" />
            <span className={`${serif} text-[20px] leading-none lg:text-[22px]`}>Rayume</span>
          </Link>
        </div>
        <Suspense>
          <Photo />
        </Suspense>
        <Slogan className={`${serif} absolute bottom-14 left-4 right-4 text-[clamp(2rem,9vw,2.6rem)] leading-[1.02] tracking-[-0.03em] text-white sm:left-6 lg:bottom-16 lg:left-10 lg:right-10 lg:max-w-md lg:text-[clamp(2.6rem,3.8vw,3.8rem)]`} />
      </div>
    </aside>
  );
}
