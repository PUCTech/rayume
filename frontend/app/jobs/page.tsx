import { Suspense } from "react";
import type { Metadata } from "next";
import { Jobs } from "./jobs";

export const metadata: Metadata = {
  title: "Jobs · Rayume",
  description: "The jobs you saved and applied to, and the resume that went to each.",
  robots: { index: false },
};

// the tab lives in the URL (?tab=applied), which is only known in the browser, so the list renders inside Suspense
export default function JobsPage() {
  return (
    <Suspense>
      <Jobs />
    </Suspense>
  );
}
