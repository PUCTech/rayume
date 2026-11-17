import { Suspense } from "react";
import type { Metadata } from "next";
import { sources } from "../../../templates/detail";
import { body } from "../../body";
import { Tailor } from "./tailor";

export const metadata: Metadata = { title: "Tailoring your resume · Rayume", robots: { index: false } };

// which resume and job this is lives in the browser's lists, read from the URL at request time, so the page
// renders inside Suspense; every template's LaTeX comes along for the resume beside the chat, as the editor's
export default async function TailorPage() {
  return (
    <Suspense>
      <Tailor tex={await sources()} body={await body()} />
    </Suspense>
  );
}
