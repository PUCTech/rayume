"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Pdf } from "./pdf";
import { ThemeMenu } from "./theme-menu";

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

// comments, \commands (or escaped symbols like \%), and braces/brackets
const token = /(%.*$)|(\\(?:[A-Za-z@]+\*?|.))|([{}[\]])/gm;

function highlight(code: string) {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of code.matchAll(token)) {
    out.push(code.slice(last, m.index));
    const color = m[1] ? "text-(--c-comment) italic" : m[2] ? "text-(--c-command)" : "text-(--c-brace)";
    out.push(<span key={m.index} className={color}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  // a trailing newline needs a character after it, or the last empty line has no height
  out.push(code.slice(last) + " ");
  return out;
}

const editor =
  "absolute inset-0 m-0 overflow-y-scroll whitespace-pre-wrap break-words px-6 pb-6 pt-18 font-mono text-[13px] leading-relaxed [tab-size:2]";

export function Viewer({ file, name, tex }: { file: string; name: string; tex: string }) {
  const [mode, setMode] = useState<"pdf" | "code">("pdf");
  const [code, setCode] = useState(tex);
  const [pdf, setPdf] = useState(`/resumes/${file}.pdf`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<Theme>("GitHub Light");
  const shadow = useRef<HTMLPreElement>(null);

  // free each rendered PDF once a newer one replaces it or the viewer closes
  useEffect(() => () => (pdf.startsWith("blob:") ? URL.revokeObjectURL(pdf) : undefined), [pdf]);

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
      setMode("pdf");
    } catch {
      setError("Couldn't reach the renderer.");
    } finally {
      setBusy(false);
    }
  }

  const tab = (m: typeof mode, label: string) => (
    <button
      type="button"
      aria-pressed={mode === m}
      onClick={() => setMode(m)}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${mode === m ? "bg-ink text-white" : "text-ink/70 hover:text-ink"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="relative flex min-h-[75vh] flex-1 flex-col bg-mist lg:min-h-0">
      <div role="group" aria-label="View" className="glass absolute right-4 top-4 z-10 flex gap-1 rounded-full p-1">
        {tab("pdf", "PDF")}
        {tab("code", "Code")}
        <ThemeMenu themes={themes} value={theme} onChange={setTheme} hidden={mode !== "code"} />
      </div>

      {mode === "pdf" ? (
        <Pdf src={pdf} title={`${name} resume PDF`} />
      ) : (
        <>
          <label htmlFor="tpl-code" className="sr-only">
            {name} LaTeX source
          </label>
          {/* the colors live on a <pre> behind a transparent textarea; both must wrap and scroll identically */}
          <div style={vars(theme)} className="relative min-h-0 flex-1 bg-(--c-bg) transition-colors duration-300">
            <pre ref={shadow} aria-hidden className={`${editor} text-(--c-text) transition-colors duration-300 [&_span]:transition-colors [&_span]:duration-300`}>
              {highlight(code)}
            </pre>
            <textarea
              id="tpl-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onScroll={(e) => shadow.current?.scrollTo(e.currentTarget.scrollLeft, e.currentTarget.scrollTop)}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              className={`${editor} resize-none bg-transparent text-transparent caret-(--c-text) outline-none selection:bg-(--c-selection)`}
            />
          </div>
          {error && (
            <pre role="alert" className="max-h-40 overflow-auto border-t border-verm/30 bg-verm/10 px-6 py-3 font-mono text-xs whitespace-pre-wrap text-verm-text">
              {error}
            </pre>
          )}
          <div className="flex items-center justify-end gap-3 border-t border-ink/10 bg-paper px-4 py-3 text-sm">
            {code !== tex && (
              <button type="button" onClick={() => setCode(tex)} className="mr-auto px-2 text-ink/60 hover:text-ink">
                Reset
              </button>
            )}
            {!canRender && <span className="text-ink/55">Rendering edits is coming soon.</span>}
            <button
              type="button"
              onClick={render}
              disabled={!canRender || busy}
              className="rounded-full bg-verm-deep px-5 py-2 font-medium text-white transition hover:bg-verm-text disabled:opacity-50"
            >
              {busy ? "Rendering…" : "Render"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
