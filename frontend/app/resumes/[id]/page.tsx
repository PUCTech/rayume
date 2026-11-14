import { readFile } from "node:fs/promises";
import path from "node:path";
import { Suspense } from "react";
import type { Metadata } from "next";
import { sources } from "../../templates/detail";
import { Open } from "./open";

export const metadata: Metadata = { title: "Resume · Rayume", robots: { index: false } };

// the shared content every template inputs; the editor puts its changes into it and re-renders
async function body() {
  "use cache";
  return readFile(path.join(process.cwd(), "resumes", "body.tex"), "utf8");
}

// Every template's LaTeX goes to the page, since which resume (and so which template) this is lives in the
// browser's resume list until the API has it; Open picks it out. It reads the id from the URL, which only
// exists at request time, so it renders inside Suspense and the rest of the page prerenders.
export default async function ResumePage() {
  return (
    <Suspense>
      <Open tex={await sources()} body={await body()} />
    </Suspense>
  );
}
