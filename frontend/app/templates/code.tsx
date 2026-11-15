"use client";

import { useEffect, useRef } from "react";
import { autocompletion, type CompletionContext } from "@codemirror/autocomplete";
import { HighlightStyle, StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { Prec } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import { basicSetup } from "codemirror";

// the theme's colors come from the CSS variables the viewer sets (--c-bg, --c-command, ...), so switching
// themes is a style change, not a new editor
const look = EditorView.theme({
  "&": { height: "100%", background: "var(--c-bg)", color: "var(--c-text)", fontSize: "13px" },
  "&.cm-focused": { outline: "none" },
  // the room on top is for the viewer's PDF/Code pill, which floats over the code
  ".cm-scroller": { fontFamily: "var(--font-mono, ui-monospace, monospace)", lineHeight: "1.65", paddingTop: "64px", paddingBottom: "24px" },
  ".cm-content": { caretColor: "var(--c-text)" },
  ".cm-gutters": { background: "var(--c-bg)", color: "var(--c-comment)", border: "none" },
  ".cm-activeLine, .cm-activeLineGutter": { background: "color-mix(in oklab, var(--c-text) 5%, transparent)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": { background: "var(--c-selection) !important" },
  ".cm-matchingBracket": { background: "var(--c-selection)", outline: "1px solid var(--c-brace)" },
  ".cm-searchMatch": { background: "color-mix(in oklab, var(--c-command) 22%, transparent)" },
  ".cm-panels": { background: "var(--c-bg)", color: "var(--c-text)" },
  ".cm-panels-bottom": { borderTop: "1px solid color-mix(in oklab, var(--c-text) 12%, transparent)" },
  ".cm-tooltip": { borderRadius: "10px", overflow: "hidden" },
});
// the stex mode's tokens: comments, \commands (tag), braces (bracket), and math and environment names
const colors = HighlightStyle.define([
  { tag: tags.comment, color: "var(--c-comment)", fontStyle: "italic" },
  { tag: [tags.tagName, tags.keyword], color: "var(--c-command)" },
  { tag: [tags.bracket, tags.atom, tags.variableName], color: "var(--c-brace)" },
]);

// \commands: the ones the file already uses (its own macros too), then the common ones
const common = ["\\textbf", "\\textit", "\\underline", "\\emph", "\\href", "\\item", "\\begin", "\\end", "\\section", "\\subsection", "\\vspace", "\\hspace", "\\newline", "\\small", "\\large"];
function commands(ctx: CompletionContext) {
  const word = ctx.matchBefore(/\\[A-Za-z]*/);
  if (!word || (word.from === word.to && !ctx.explicit)) return null;
  const used = ctx.state.doc.toString().match(/\\[A-Za-z]+/g) ?? [];
  return { from: word.from, options: [...new Set([...used, ...common])].map((label) => ({ label, type: "keyword" })), validFor: /^\\[A-Za-z]*$/ };
}

// The LaTeX source as Overleaf's editor has it: line numbers, folding, ⌘F find and replace, bracket matching
// and closing, \command completion, its own undo. ⌘↵ or ⌘S renders. value replaces the text when it changes
// from outside; jump moves the caret to a line (a new object each time, so the same line can be jumped to twice).
export function Code({ id, label, value, onChange, onRun, jump }: { id: string; label: string; value: string; onChange: (v: string) => void; onRun: () => void; jump?: { line: number } }) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView>(null);
  // the latest handlers, for the editor made once
  const on = useRef({ onChange, onRun });
  useEffect(() => {
    on.current = { onChange, onRun };
  });

  useEffect(() => {
    const run = () => (on.current.onRun(), true);
    const v = new EditorView({
      parent: host.current!,
      doc: value,
      extensions: [
        basicSetup,
        // ahead of the default keymap, which takes Mod-Enter for a blank line
        Prec.highest(
          keymap.of([
            { key: "Mod-Enter", run },
            { key: "Mod-s", run, preventDefault: true },
          ]),
        ),
        StreamLanguage.define(stex),
        syntaxHighlighting(colors),
        autocompletion({ override: [commands] }),
        EditorView.lineWrapping,
        look,
        EditorView.contentAttributes.of({ id, "aria-label": label, spellcheck: "false", autocapitalize: "off", autocorrect: "off" }),
        EditorView.updateListener.of((u) => u.docChanged && on.current.onChange(u.state.doc.toString())),
      ],
    });
    view.current = v;
    return () => v.destroy();
    // made once; value and the handlers reach it below and through on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const v = view.current;
    if (v && value !== v.state.doc.toString()) v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
  }, [value]);

  useEffect(() => {
    const v = view.current;
    if (!v || !jump) return;
    const line = v.state.doc.line(Math.min(Math.max(1, jump.line), v.state.doc.lines));
    v.dispatch({ selection: { anchor: line.from, head: line.to }, effects: EditorView.scrollIntoView(line.from, { y: "center" }) });
    v.focus();
  }, [jump]);

  return <div ref={host} className="absolute inset-0" />;
}
