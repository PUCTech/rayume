"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentLoadingTask } from "pdfjs-dist";

// Draws every page on a canvas the width of the box. The browser's own PDF viewer (an iframe)
// frames the page in its grey background, which no CSS can reach.
// shortcut: pages are drawn once at the width they open with, no text layer; redraw on resize
// and add pdf.js's text layer if people need to zoom or copy text here.
export function Pdf({ src, title }: { src: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let task: PDFDocumentLoadingTask | undefined;
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      task = pdfjs.getDocument({ url: src });
      const doc = await task.promise;
      const pages: HTMLCanvasElement[] = [];
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        const width = box.current?.clientWidth ?? 0;
        const viewport = page.getViewport({ scale: (width / page.getViewport({ scale: 1 }).width) * devicePixelRatio });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.className = "block w-full border-b border-ink/10 bg-white last:border-b-0";
        await page.render({ canvas, viewport }).promise;
        if (cancelled) return;
        pages.push(canvas);
      }
      // swapped in all at once, so a re-render replaces the old pages without a blank flash
      box.current?.replaceChildren(...pages);
    })().catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      task?.destroy();
    };
  }, [src]);

  if (failed) {
    return (
      <p className="m-auto p-6 text-sm text-ink/60">
        Couldn&apos;t draw this PDF.{" "}
        <a href={src} target="_blank" rel="noreferrer" className="font-medium text-verm-text underline underline-offset-2">
          Open it
        </a>
      </p>
    );
  }
  return <div ref={box} role="img" aria-label={title} className="min-h-0 flex-1 overflow-y-auto bg-white" />;
}
