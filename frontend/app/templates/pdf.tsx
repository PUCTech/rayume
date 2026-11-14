"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { PDFDocumentProxy } from "pdfjs-dist";
import "./pdf.css";

// the zoom buttons step through these; a pinch goes anywhere between the ends
const zooms = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
const [min, max] = [zooms[0], zooms.at(-1)!];

// A drawn page as an overlay sees it: the sheet element, its size, and every run of text on it with its
// box in CSS pixels from the sheet's top left, all in reading order. font is the PDF's own embedded font,
// which pdf.js has loaded into the document under that family name, and size its size in CSS pixels; bold and
// italic say which face of the family it is.
// el is the run's element in the text layer.
export type Span = { text: string; x: number; y: number; w: number; h: number; font?: string; size?: number; bold?: boolean; italic?: boolean; el: HTMLElement };
export type Page = { n: number; of: number; el: HTMLElement; width: number; height: number; spans: Span[] };
const zoomButton = "grid size-8 place-items-center rounded-full text-ink/70 transition hover:bg-ink/5 hover:text-ink disabled:opacity-30 pointer-coarse:size-10";

// Draws every page as pdf.js renders it, on a canvas, with pdf.js's invisible text layer over it so text can
// be selected and copied. With an overlay (the resume editor, which writes on the page) the text is real text
// instead: the canvas holds only the graphics (rules, underlines) and the text layer is made visible, set in
// the PDF's own embedded fonts, each run brought to the width pdf.js measured for it. Templates keep the
// canvas: fonts with icons and odd metrics (AltaCV's) don't survive the trip into DOM text.
// A PDF whose fonts pdf.js can't load as fonts (drawn as shapes instead) falls back to the canvas either way.
// The text layer's CSS is in pdf.css. The layer comes from pdf.js's viewer kit (TextLayerBuilder), not the bare
// TextLayer: the kit adds the end-of-content element and selection listener that keep a drag through
// gaps between lines from jumping ahead and back. At 100% a page fills the width of the box;
// zooming redraws from the loaded document and scrolls both ways once a page is wider than the box.
// The browser's own PDF viewer (an iframe) frames the page in its grey background, which no CSS can reach.
// overlay, when given, is rendered over each page (through a portal into the sheet) once its text is laid out,
// and again after every zoom with the new positions.
// Pages are drawn again when the box changes width (a panel beside it opened, closed or was dragged), once
// the resizing pauses.
export function Pdf({ src, title, overlay }: { src: string; title: string; overlay?: (page: Page) => ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PDFDocumentProxy>();
  // the zoom the pages are drawn at, 1 filling the width of the box
  const [zoom, setZoom] = useState(1);
  const [failed, setFailed] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const vector = !!overlay;
  // the box's width the pages are drawn for; 0 until it's measured
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let wait = 0;
    const fit = () => setWidth((w) => (Math.abs(el.clientWidth - w) > 2 ? el.clientWidth : w));
    fit();
    const ro = new ResizeObserver(() => {
      clearTimeout(wait);
      wait = window.setTimeout(fit, 150);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      clearTimeout(wait);
    };
  }, []);
  // Zoom follows the fingers: while a pinch (or a button) changes it, the pages already drawn are scaled with
  // CSS zoom, around the pinch so what's under the fingers stays there, and once it pauses they're drawn again,
  // sharp, at the new size. A trackpad pinch arrives as ctrl+wheel, in Safari as gesture events, on a phone as
  // two touches; the browser's own page zoom is held off over the PDF.
  // live is the zoom on screen, drawn the one the pages were drawn at; shown is live, for the controls
  const live = useRef(1);
  const drawn = useRef(1);
  const [shown, setShown] = useState(1);
  const settle = useRef(0);
  const zoomTo = (to: number, at?: { x: number; y: number }) => {
    const el = box.current;
    const next = Math.min(max, Math.max(min, to));
    const f = next / live.current;
    if (!el || f === 1) return;
    live.current = next;
    (el.firstElementChild as HTMLElement).style.zoom = String(next / drawn.current);
    const p = at ?? { x: el.clientWidth / 2, y: el.clientHeight / 2 };
    el.scrollLeft = (el.scrollLeft + p.x) * f - p.x;
    el.scrollTop = (el.scrollTop + p.y) * f - p.y;
    setShown(next);
    clearTimeout(settle.current);
    settle.current = window.setTimeout(() => setZoom(live.current), 250);
  };
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const local = (x: number, y: number) => {
      const r = el.getBoundingClientRect();
      return { x: x - r.left, y: y - r.top };
    };
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      zoomTo(live.current * Math.exp(-e.deltaY / 100), local(e.clientX, e.clientY));
    };
    // where the pinch started: the fingers' distance and the zoom then
    let from = { gap: 0, zoom: 1 };
    let touching = false;
    const apart = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const onTouch = (e: TouchEvent) => {
      touching = e.touches.length === 2;
      if (!touching) return;
      e.preventDefault();
      const [a, b] = [e.touches[0], e.touches[1]];
      if (e.type === "touchstart") from = { gap: apart(e.touches), zoom: live.current };
      else zoomTo((from.zoom * apart(e.touches)) / from.gap, local((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2));
    };
    // iOS sends gesture events alongside the touches: those already count
    const onGesture = (e: Event) => {
      e.preventDefault();
      const g = e as Event & { scale: number; clientX: number; clientY: number };
      if (touching) return;
      if (e.type === "gesturestart") from = { gap: 1, zoom: live.current };
      else zoomTo(from.zoom * g.scale, local(g.clientX, g.clientY));
    };
    const opts = { passive: false };
    el.addEventListener("wheel", onWheel, opts);
    el.addEventListener("touchstart", onTouch, opts);
    el.addEventListener("touchmove", onTouch, opts);
    el.addEventListener("gesturestart", onGesture, opts);
    el.addEventListener("gesturechange", onGesture, opts);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouch);
      el.removeEventListener("touchmove", onTouch);
      el.removeEventListener("gesturestart", onGesture);
      el.removeEventListener("gesturechange", onGesture);
      clearTimeout(settle.current);
    };
  }, []);
  // the text layers on screen; each holds a global selection listener until it's cancelled
  const layers = useRef<{ cancel(): void }[]>([]);
  useEffect(() => () => layers.current.forEach((l) => l.cancel()), []);

  useEffect(() => {
    let cancelled = false;
    const task = import("pdfjs-dist").then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      // fontExtraProperties keeps each font's PostScript name, the only thing that says which face a TeX font is
      return pdfjs.getDocument({ url: src, fontExtraProperties: true });
    });
    task
      .then((t) => t.promise)
      .then((d) => !cancelled && setDoc(d))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      task.then((t) => t.destroy());
    };
  }, [src]);

  useEffect(() => {
    if (!doc || !width) return;
    let cancelled = false;
    (async () => {
      // the viewer kit reads the pdf.js library from this global instead of importing it
      (globalThis as { pdfjsLib?: unknown }).pdfjsLib = await import("pdfjs-dist");
      const { TextLayerBuilder } = await import("pdfjs-dist/web/pdf_viewer.mjs");
      const fit = width;
      const pages: HTMLElement[] = [];
      const built: { cancel(): void }[] = [];
      const runs: { font: string; size: number; base: number; bold: boolean; italic: boolean }[][] = [];
      const { Util } = await import("pdfjs-dist");
      for (let n = 1; n <= doc.numPages; n++) {
        const page = await doc.getPage(n);
        const scale = (fit / page.getViewport({ scale: 1 }).width) * zoom;
        const viewport = page.getViewport({ scale });
        const sheet = document.createElement("div");
        // isolate: the layers' z-indexes stay inside the page, under the zoom controls
        sheet.className = "relative isolate shrink-0 bg-white shadow-[0_1px_2px_rgb(22_27_34/0.08),0_12px_32px_-16px_rgb(22_27_34/0.3)]";
        sheet.style.cssText = `width:${viewport.width}px;height:${viewport.height}px;--scale-factor:${scale};--total-scale-factor:${scale};--scale-round-x:1px;--scale-round-y:1px`;
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width * devicePixelRatio);
        canvas.height = Math.floor(viewport.height * devicePixelRatio);
        canvas.className = "absolute inset-0 size-full";
        // images: null skips the layer's image placeholders (the types require it, the code checks for null)
        const text = new TextLayerBuilder({ pdfPage: page });
        built.push(text);
        sheet.append(canvas, text.div);
        // for the editor the canvas draws everything but text, which the text layer shows instead
        if (vector) {
          const ctx = canvas.getContext("2d")!;
          ctx.fillText = ctx.strokeText = () => {};
        }
        const [, , content] = await Promise.all([
          page.render({ canvas, viewport: page.getViewport({ scale: scale * devicePixelRatio }) }).promise,
          text.render({ viewport, images: null! }),
          page.getTextContent(),
        ]);
        // one per visible run, in the order the text layer makes its spans
        // base: where the run's baseline is on the page, in CSS pixels from the top
        runs.push(
          content.items.flatMap((item) => {
            if (!("str" in item) || !item.str.trim()) return [];
            // the rendered page has every font it drew
            const name: string = (page.commonObjs.has(item.fontName) && page.commonObjs.get(item.fontName).name) || "";
            const bold = /bold|medi(?!um)|demi|cmbx/i.test(name);
            const italic = /ital|obli|slant|cmti|cmsl/i.test(name);
            return [{ font: item.fontName, size: Math.hypot(item.transform[2], item.transform[3]) * scale, base: Util.transform(viewport.transform, item.transform)[5], bold, italic }];
          }),
        );
        if (cancelled) return built.forEach((l) => l.cancel());
        const loaded = new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")));
        if (vector && !runs.at(-1)!.every((r) => loaded.has(r.font))) {
          // some text has no font to set it in: draw the page again with its text, as an image after all
          const raster = canvas.cloneNode() as HTMLCanvasElement;
          await page.render({ canvas: raster, viewport: page.getViewport({ scale: scale * devicePixelRatio }) }).promise;
          canvas.replaceWith(raster);
          runs[runs.length - 1] = [];
        }
        pages.push(sheet);
      }
      // swapped in all at once, so a zoom replaces the old pages without a blank flash
      const sheets = box.current?.firstElementChild as HTMLElement | null;
      sheets?.replaceChildren(...pages);
      // drawn at this zoom: CSS zoom only covers what a pinch since added
      drawn.current = zoom;
      if (sheets) sheets.style.zoom = String(live.current / zoom);
      layers.current.forEach((l) => l.cancel());
      layers.current = built;
      // Each run in its own font, brought back to the width pdf.js gave it, and nudged so its baseline sits where
      // the PDF puts it: pdf.js placed the run for a stand-in font, and fonts differ in how high their glyphs
      // sit (LaTeX's math font, which draws the "•" separators, most of all). With line-height 1 the baseline
      // is (size + ascent - descent) / 2 below the run's top. Reads, then writes, then reads, then writes, so
      // the layout is worked out a few times rather than once per run.
      const metrics = new Map<string, [number, number]>();
      const ctx2 = document.createElement("canvas").getContext("2d")!;
      const ascent = (font: string, size: number) => {
        const k = `${font}/${size}`;
        if (!metrics.has(k)) {
          ctx2.font = `${size}px "${font}"`;
          const m = ctx2.measureText("Hg");
          metrics.set(k, [m.fontBoundingBoxAscent, m.fontBoundingBoxDescent]);
        }
        return metrics.get(k)!;
      };
      pages.forEach((el, i) => {
        if (!vector || !runs[i].length) return;
        const spans = [...el.querySelectorAll<HTMLElement>(".textLayer span:not(.markedContent)")].filter((s) => s.textContent?.trim());
        const before = spans.map((s) => s.getBoundingClientRect().width);
        spans.forEach((s, j) => (s.style.fontFamily = `"${runs[i][j].font}"`));
        const after = spans.map((s) => s.getBoundingClientRect().width);
        const top = el.getBoundingClientRect().top;
        const tops = spans.map((s) => s.getBoundingClientRect().top - top);
        spans.forEach((s, j) => {
          const x = parseFloat(s.style.getPropertyValue("--scale-x")) || 1;
          // LaTeX justifies a line by widening its spaces, so a run with spaces gets its width back the same
          // way, glyphs at their own width;
          const gaps = s.textContent!.split(" ").length - 1;
          // a run without spaces is stretched as a whole, unless that's far off its own width: then its PDF
          // width holds a gap after it (a "|" separator, say) and the glyph stays as it is
          const natural = after[j] / x;
          if (gaps && natural) {
            s.style.setProperty("--scale-x", "1");
            s.style.wordSpacing = `${(before[j] - natural) / gaps}px`;
          } else if (natural) s.style.setProperty("--scale-x", String(Math.abs(before[j] / natural - 1) < 0.15 ? before[j] / natural : 1));
          const { font, size, base } = runs[i][j];
          const [a, d] = ascent(font, size);
          s.style.marginTop = `${base - (tops[j] + (size + a - d) / 2)}px`;
        });
        el.querySelector(".textLayer")?.classList.add("drawn");
      });
      // measured once the sheets are in the document, where the text layer has its final layout
      setPages(
        pages.map((el, i) => {
          const at = el.getBoundingClientRect();
          const spans = [...el.querySelectorAll<HTMLElement>(".textLayer span:not(.markedContent)")]
            .filter((s) => s.textContent?.trim())
            .map((s, j) => {
              const r = s.getBoundingClientRect();
              return { text: s.textContent!, x: r.left - at.left, y: r.top - at.top, w: r.width, h: r.height, ...runs[i][j], el: s };
            });
          return { n: i + 1, of: pages.length, el, width: at.width, height: at.height, spans };
        }),
      );
    })().catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [doc, zoom, vector, width]);

  if (failed) {
    return (
      <p className="m-auto p-6 text-sm text-ink/60">
        Couldn&apos;t draw this PDF.{" "}
        <a href={src} target="_blank" rel="noreferrer" className="font-medium text-accent-text underline underline-offset-2">
          Open it
        </a>
      </p>
    );
  }
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* the stable gutter keeps the measured width the same once pages overflow and the scrollbar shows */}
      <div ref={box} role="document" aria-label={title} className="min-h-0 flex-1 overflow-auto [scrollbar-gutter:stable]">
        {/* w-max centres pages narrower than the box and lets wider ones scroll from their left edge; at
            100% of the full box width pages sit edge to edge, as before zoom existed */}
        <div className={`mx-auto flex w-max min-w-full flex-col items-center ${shown === 1 ? "" : "gap-4 py-6"}`} />
      </div>
      {overlay && pages.map((p) => createPortal(overlay(p), p.el, `page-${p.n}`))}
      <div role="group" aria-label="Zoom" className="glass absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center rounded-full p-1 text-sm">
        <button type="button" aria-label="Zoom out" disabled={shown <= min} onClick={() => zoomTo(zooms.findLast((z) => z < shown - 0.01) ?? min)} className={zoomButton}>
          <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M5 10h10" />
          </svg>
        </button>
        <button type="button" aria-label="Reset zoom" onClick={() => zoomTo(1)} className="w-14 rounded-full py-1.5 font-medium tabular-nums text-ink/70 transition hover:bg-ink/5 hover:text-ink">
          {Math.round(shown * 100)}%
        </button>
        <button type="button" aria-label="Zoom in" disabled={shown >= max} onClick={() => zoomTo(zooms.find((z) => z > shown + 0.01) ?? max)} className={zoomButton}>
          <svg aria-hidden viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M5 10h10M10 5v10" />
          </svg>
        </button>
      </div>
    </div>
  );
}
