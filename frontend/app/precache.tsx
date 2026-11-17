"use client";

import { useEffect } from "react";
import { getImageProps } from "next/image";
import { postings } from "./app/data";
import { templates } from "./templates/data";

// the sizes each page shows a resume's picture at, shared with those pages so the images warmed here are the
// very URLs (same /_next/image width) they'll ask for
export const sheetSizes = {
  card: "(min-width: 1280px) 230px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  gallery: "(min-width: 1024px) 300px, (min-width: 640px) 33vw, 50vw",
  job: "(min-width: 1024px) 600px, 60vh",
};

// Warms the browser's cache with every resume picture and company logo once a page has loaded and the browser
// is idle, so /resumes, /jobs and /templates draw them at once. Plain image requests, no API: the browser
// picks the same srcset candidate the page's <Image> would.
export function Precache() {
  useEffect(() => {
    const warm = () => {
      for (const t of templates)
        for (const sizes of Object.values(sheetSizes)) {
          const { props } = getImageProps({ src: `/resumes/${t.file}.png`, alt: "", fill: true, sizes });
          const img = new Image();
          img.sizes = props.sizes ?? "";
          img.srcset = props.srcSet ?? "";
          img.src = props.src;
        }
      for (const p of postings) if (p.logo) new Image().src = `/logos/${p.logo}.svg`;
    };
    // Safari has no requestIdleCallback
    const idle = (f: () => void) => ("requestIdleCallback" in window ? requestIdleCallback(f) : setTimeout(f, 1500));
    if (document.readyState === "complete") idle(warm);
    else addEventListener("load", () => idle(warm), { once: true });
  }, []);
  return null;
}
