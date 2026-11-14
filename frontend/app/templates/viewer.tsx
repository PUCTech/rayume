"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Menu } from "@base-ui/react/menu";
import { ChevronDown, Download } from "lucide-react";
import { Code } from "./code";
import { Pdf, type Page } from "./pdf";
import { Reveal, ThemeMenu } from "./theme-menu";

// rendering edits needs a TeX engine; only the dev server has one until the compile worker exists
const canRender = process.env.NODE_ENV === "development";

// popular light code themes, from each theme's published palette, set as CSS variables on the editor;
// the first is the default. shortcut: light only for now, add dark ones once the site has dark mode
const themes = {
  "GitHub Light": { bg: "#ffffff", text: "#24292f", command: "#cf222e", brace: "#8250df", comment: "#6e7781", selection: "#0969da33" },
  "One Light": { bg: "#fafafa", text: "#383a42", command: "#a626a4", brace: "#4078f2", comment: "#a0a1a7", selection: "#e5e5e6" },
  "Solarized Light": { bg: "#fdf6e3", text: "#657b83", command: "#268bd2", brace: "#d33682", comment: "#93a1a1", selection: "#eee8d5" },
  "Catppuccin Latte": { bg: "#eff1f5", text: "#4c4f69", command: "#8839ef", brace: "#1e66f5", comment: "#7c7f93", selection: "#acb0be66" },
  "Gruvbox Light": { bg: "#fbf1c7", text: "#3c3836", command: "#9d0006", brace: "#8f3f71", comment: "#928374", selection: "#ebdbb2" },
};
type Theme = keyof typeof themes;
const vars = (t: Theme) => Object.fromEntries(Object.entries(themes[t]).map(([k, v]) => [`--c-${k}`, v])) as CSSProperties;

// Tectonic's "error: file.tex:LINE: what" lines; the line is where Code jumps when one is clicked
const located = /^error: .+?\.tex:(\d+): (.*)$/;
// headings in the outline: \section and the templates' own \...section commands
const heading = /\\[A-Za-z]*section\*?\{([^}]*)\}/;

// overlay is drawn over the PDF view's pages (see Pdf), not over the preview under the code; src, when it
// changes, replaces the PDF shown (a render made outside the viewer)
export function Viewer({
  file,
  name,
  tex,
  overlay,
  src,
}: {
  file: string;
  name: string;
  tex: string;
  overlay?: (page: Page) => ReactNode;
  src?: string;
}) {
  const [mode, setMode] = useState<"pdf" | "code">("pdf");
  const [code, setCode] = useState(tex);
  // a new tex from outside (the resume editor's latest changes) replaces the code, unless you've edited it
  const [shownTex, setShownTex] = useState(tex);
  if (tex !== shownTex) {
    setShownTex(tex);
    if (code === shownTex) setCode(tex);
  }
  const [pdf, setPdf] = useState(`/resumes/${file}.pdf`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<Theme>("GitHub Light");
  // code mode only: split the editor with the PDF underneath
  const [preview, setPreview] = useState(false);
  // the line Code jumps to: an error's, or a heading's from the outline
  const [jump, setJump] = useState<{ line: number }>();
  // Overleaf's auto compile: a pause in the typing renders
  const [auto, setAuto] = useState(false);
  const outline = code.split("\n").flatMap((l, i) => (l.match(heading) ? [{ line: i + 1, title: l.match(heading)![1] }] : []));
  // a new src from outside swaps its PDF in, as Render does (set while rendering, React's pattern for props)
  const [shownSrc, setShownSrc] = useState(src);
  if (src !== shownSrc) {
    setShownSrc(src);
    if (src) setPdf(src);
  }

  // free each rendered PDF once a newer one replaces it or the viewer closes
  useEffect(() => () => (pdf.startsWith("blob:") ? URL.revokeObjectURL(pdf) : undefined), [pdf]);

  useEffect(() => {
    if (!auto || !canRender || mode !== "code" || code === tex) return;
    const id = window.setTimeout(render, 1200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restarts with each keystroke
  }, [code, auto]);

  async function render() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ file, tex: code }),
      });
      if (!res.ok) return setError((await res.text()) || `Render failed (${res.status}).`);
      setPdf(URL.createObjectURL(await res.blob()));
      // with the preview open the new PDF shows under the code, so stay there
      if (!preview) setMode("pdf");
    } catch {
      setError("Couldn't reach the renderer.");
    } finally {
      setBusy(false);
    }
  }

  // equal-width tabs, so one thumb can slide between them instead of two backgrounds crossfading
  const tab = (m: typeof mode, label: string) => (
    <button
      type="button"
      aria-pressed={mode === m}
      onClick={() => setMode(m)}
      className={`relative w-14 rounded-full py-1.5 text-sm pointer-coarse:py-2.5 sm:w-16 font-medium transition-colors duration-300 ${mode === m ? "text-white" : "text-ink/70 hover:text-ink"}`}
    >
      {label}
    </button>
  );

  // min-w-0: a page zoomed wider than the viewer scrolls inside it instead of pushing the side panel out
  return (
    <div className="relative flex min-h-[75vh] min-w-0 flex-1 flex-col bg-mist lg:min-h-0">
      {/* anchored right with the extras on the left, so PDF/Code never move out from under the cursor */}
      <div role="group" aria-label="View" className="glass absolute right-3 top-3 z-10 sm:right-4 sm:top-4 flex items-center rounded-full p-1">
        <ThemeMenu themes={themes} value={theme} onChange={setTheme} hidden={mode !== "code"} />
        <Reveal show={mode === "code"}>
          <button
            type="button"
            aria-pressed={preview}
            onClick={() => setPreview((p) => !p)}
            className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm pointer-coarse:py-2.5 sm:px-3.5 font-medium text-ink/70 transition hover:bg-ink/5 hover:text-ink aria-pressed:bg-ink/10 aria-pressed:text-ink"
          >
            Preview
          </button>
        </Reveal>
        <div className="relative grid grid-cols-2">
          <span
            aria-hidden
            className={`absolute inset-y-0 left-0 w-1/2 rounded-full bg-ink transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${mode === "code" ? "translate-x-full" : ""}`}
          />
          {tab("pdf", "PDF")}
          {tab("code", "Code")}
        </div>
      </div>

      {mode === "pdf" ? (
        <Pdf src={pdf} title={`${name} resume PDF`} overlay={overlay} />
      ) : (
        <>
          {/* Preview splits the space: rows 1fr 0fr to 1fr 1fr opens the PDF under the code */}
          <div
            className={`grid min-h-0 flex-1 transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${preview ? "grid-rows-[1fr_1fr]" : "grid-rows-[1fr_0fr]"}`}
          >
            <div style={vars(theme)} className="relative min-h-0 bg-(--c-bg) transition-colors duration-300">
              <Code id="tpl-code" label={`${name} LaTeX source`} value={code} onChange={setCode} onRun={() => canRender && !busy && render()} jump={jump} />
            </div>
            <div className={`flex min-h-0 flex-col overflow-hidden bg-white ${preview ? "border-t border-ink/10" : ""}`}>
              {preview && <Pdf src={pdf} title={`${name} resume PDF preview`} />}
            </div>
          </div>
          {error && (
            <div role="alert" className="max-h-40 overflow-auto border-t border-accent/30 bg-accent/10 px-6 py-3 font-mono text-xs text-accent-text">
              {error.split("\n").map((l, i) => {
                const m = l.match(located);
                return m ? (
                  <button key={i} type="button" onClick={() => setJump({ line: +m[1] })} className="block text-left hover:underline">
                    <span className="font-semibold">Line {m[1]}</span> · {m[2]}
                  </button>
                ) : (
                  <p key={i} className="whitespace-pre-wrap">{l}</p>
                );
              })}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 border-t border-ink/10 bg-paper px-4 py-3 text-sm">
            <div className="mr-auto flex items-center gap-1">
              {outline.length > 0 && (
                <Menu.Root>
                  <Menu.Trigger className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-ink/70 transition hover:bg-ink/5 hover:text-ink data-popup-open:bg-ink/5">
                    Sections
                    <ChevronDown aria-hidden className="size-3.5 text-ink/40" />
                  </Menu.Trigger>
                  <Menu.Portal>
                    <Menu.Positioner side="top" sideOffset={6} align="start" className="z-[70] outline-none">
                      <Menu.Popup className="max-h-72 min-w-48 origin-(--transform-origin) overflow-y-auto rounded-xl bg-white p-1 shadow-[0_16px_40px_-14px_rgb(22_27_34/0.4)] ring-1 ring-ink/10 outline-none transition-[scale,opacity] duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
                        {outline.map((h) => (
                          <Menu.Item key={h.line} onClick={() => setJump({ line: h.line })} className="flex cursor-default items-center justify-between gap-6 rounded-lg px-2.5 py-1.5 text-[13px] outline-none select-none data-highlighted:bg-ink/5">
                            {h.title}
                            <span className="font-mono text-[11px] text-ink/40">{h.line}</span>
                          </Menu.Item>
                        ))}
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.Root>
              )}
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(code)}`}
                download={`${file}.tex`}
                aria-label="Download the LaTeX"
                title="Download .tex"
                className="grid size-8 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 hover:text-ink"
              >
                <Download aria-hidden className="size-4" />
              </a>
              {code !== tex && (
                <button type="button" onClick={() => setCode(tex)} className="px-2 text-ink/60 hover:text-ink">
                  Reset
                </button>
              )}
            </div>
            {canRender && (
              <label className="flex items-center gap-1.5 text-ink/65" title="Render after a pause in the typing">
                <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} className="accent-accent-deep" />
                Auto
              </label>
            )}
            {!canRender && <span className="text-right text-ink/55">Rendering edits is coming soon.</span>}
            <button
              type="button"
              onClick={render}
              disabled={!canRender || busy}
              title="Render (⌘↵)"
              className="rounded-full bg-accent-deep px-5 py-2 font-medium text-white transition hover:bg-accent-text disabled:opacity-50"
            >
              {busy ? "Rendering…" : "Render"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
