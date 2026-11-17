import { Suspense } from "react";
import type { Metadata } from "next";
import { Tailor } from "./tailor";

export const metadata: Metadata = { title: "Tailoring your resume · Rayume", robots: { index: false } };

// which resume and job this is lives in the browser's lists, read from the URL at request time, so the page
// renders inside Suspense
export default function TailorPage() {
  return (
    <Suspense>
      <Tailor />
    </Suspense>
  );
}
