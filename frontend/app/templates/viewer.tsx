"use client";

import { useEffect, useState } from "react";
import { Pdf } from "./pdf";

// rendering edits needs a TeX engine; only the dev server has one until the compile worker exists
const canRender = process.env.NODE_ENV === "development";

export function Viewer({ file, name, tex }: { file: string; name: string; tex: string }) {
  const [mode, setMode] = useState<"pdf" | "code">("pdf");
  const [code, setCode] = useState(tex);
  const [pdf, setPdf] = useState(`/resumes/${file}.pdf`);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

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
      </div>

      {mode === "pdf" ? (
        <Pdf src={pdf} title={`${name} resume PDF`} />
      ) : (
        <>
          <label htmlFor="tpl-code" className="sr-only">
            {name} LaTeX source
          </label>
          <textarea
            id="tpl-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="min-h-0 flex-1 resize-none bg-white px-6 pb-6 pt-18 font-mono text-[13px] leading-relaxed text-ink outline-none"
          />
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
