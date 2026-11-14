"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

// Where a bullet's text sits on the page: its lines run from left to right, the first starting at firstX
// (past a bold label, when there is one); top is where the first line box starts, lh the line spacing,
// rows how many lines the PDF gives it (0 for a bullet the PDF doesn't have yet), font the PDF's embedded
// font and size its size, in CSS pixels; glyph is where its "•" goes, when this draws its own.
export type Geometry = { left: number; firstX: number; right: number; top: number; lh: number; rows: number; font: string; size: number; glyph?: number };

// the field being written: a faint tint around the text, not a box whose edge reads as an underline
const halo = "rounded-[2px] bg-accent/[0.05] outline-none shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-accent)_5%,transparent)]";

const offsetIn = (el: HTMLElement) => {
  const sel = document.getSelection();
  if (!sel?.rangeCount || !el.contains(sel.anchorNode)) return null;
  const r = document.createRange();
  r.selectNodeContents(el);
  r.setEnd(sel.anchorNode!, sel.anchorOffset);
  return r.toString().length;
};

const caret = (el: HTMLElement, at?: { x: number; y: number }, offset?: number) => {
  el.focus({ preventScroll: true });
  const range = document.createRange();
  const pos = at && document.caretPositionFromPoint?.(at.x, at.y);
  if (pos && el.contains(pos.offsetNode)) range.setStart(pos.offsetNode, pos.offset);
  else if (offset !== undefined && el.firstChild) range.setStart(el.firstChild, Math.min(offset, el.textContent!.length));
  else {
    range.selectNodeContents(el);
    range.collapse(false);
  }
  range.collapse(true);
  document.getSelection()?.removeAllRanges();
  document.getSelection()?.addRange(range);
};

// A blur finishes the edit, unless the field was swapped out with the page (a PDF typeset from an earlier
// change landing mid-sentence): that blur comes while the field is still attached, so this waits a tick and
// commits only if it's still on the page. Its replacement on the new page takes over, text and caret intact.
const commitLater = (el: HTMLElement, commit: (text: string) => void) => {
  const text = el.textContent ?? "";
  setTimeout(() => el.isConnected && commit(text));
};

// A bullet written on the page. The PDF's own text for it is hidden (by the overlay) and the text is set in
// its place in the PDF's own font, size and line spacing, justified and hyphenated as LaTeX sets it, so
// editing looks like the page itself changing. It reports how many lines it gained or lost (onDelta) so
// the overlay can slide the rest of the page; offset is how far the bullets above have moved it.
// Enter splits it at the caret into a new bullet (onSplit), Backspace in an empty one removes it, Esc
// drops the edit. It stays, no longer editable, until the re-typeset PDF arrives and replaces it.
// What's typed and where the caret is go up as you type (onLive), so a field swapped out with the page
// comes back with both (see commitLater).
// shortcut: glyphs the PDF's font subset lacks show in Times.
export function Written({
  g,
  offset,
  text,
  editing,
  at,
  start,
  busy,
  onCommit,
  onCancel,
  onSplit,
  onRemove,
  onDelta,
  onLive,
  onNav,
}: {
  g: Geometry;
  offset: number;
  text: string;
  editing: boolean;
  at?: { x: number; y: number };
  start?: number;
  busy: boolean;
  onCommit: (text: string) => void;
  onCancel: () => void;
  onSplit: (before: string, after: string) => void;
  onRemove: () => void;
  onDelta: (delta: number) => void;
  onLive: (text: string, at: number) => void;
  onNav: (dir: 1 | -1, x: number) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  // while editing, the browser owns the text: React re-setting it under the caret would move the caret
  const [frozen, setFrozen] = useState(text);
  if (!editing && frozen !== text) setFrozen(text);
  const orig = g.rows * g.lh;
  const [h, setH] = useState(orig);
  // set once a key has handled the edit, so the blur that follows doesn't commit it again
  const handled = useRef(false);
  const delta = h - orig;
  const top = g.top + offset;

  // the caret goes where the click was, which lands on the same word since the text sits where the PDF's did
  useLayoutEffect(() => {
    handled.current = false;
    if (editing && box.current) caret(box.current, at, start);
    // once per edit: later clicks move the caret natively
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  // whole lines only, so the page under it moves a line at a time, as a typeset page would
  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setH(Math.round(el.offsetHeight / g.lh) * g.lh));
    ro.observe(el);
    return () => ro.disconnect();
  }, [g.lh]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reports the height, not the callback
  useEffect(() => onDelta(delta), [delta]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const value = el.textContent ?? "";
    if (e.key === "Enter") {
      e.preventDefault();
      const at = offsetIn(el) ?? value.length;
      handled.current = true;
      onSplit(value.slice(0, at), value.slice(at));
    } else if (e.key === "Backspace" && !value) {
      e.preventDefault();
      handled.current = true;
      onRemove();
    } else if (e.key === "Escape") {
      // the drawer would close on it
      e.stopPropagation();
      handled.current = true;
      onCancel();
    } else if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !e.shiftKey) {
      // past the last line (or above the first) the caret goes on to the next bullet (or the one before),
      // at the same place across, as in a document
      const caretAt = document.getSelection()?.getRangeAt(0).getBoundingClientRect();
      const box = el.getBoundingClientRect();
      if (!caretAt) return;
      const down = e.key === "ArrowDown";
      if (down ? caretAt.bottom > box.bottom - g.lh / 2 : caretAt.top < box.top + g.lh / 2) {
        // saved here, not by the blur: the field goes away before a blur's late save would run
        e.preventDefault();
        handled.current = true;
        onCommit(value);
        onNav(down ? 1 : -1, caretAt.left);
      }
    }
  };

  const type = { fontFamily: `"${g.font}", "Times New Roman", Times, serif`, fontSize: g.size, lineHeight: `${g.lh}px` };
  return (
    <>
      {g.glyph !== undefined && (text || editing) && (
        <span aria-hidden style={{ ...type, left: g.glyph, top }} className="absolute text-black">
          •
        </span>
      )}
      <div
        ref={box}
        data-overlay-ui
        role="textbox"
        aria-label="Bullet text"
        aria-multiline
        lang="en"
        contentEditable={editing ? "plaintext-only" : false}
        suppressContentEditableWarning
        onBlur={(e) => editing && !handled.current && commitLater(e.currentTarget, onCommit)}
        onInput={(e) => onLive(e.currentTarget.textContent ?? "", offsetIn(e.currentTarget) ?? 0)}
        onKeyUp={(e) => editing && onLive(e.currentTarget.textContent ?? "", offsetIn(e.currentTarget) ?? 0)}
        onKeyDown={onKey}
        style={{ ...type, left: g.left, top, width: g.right - g.left, textIndent: g.firstX - g.left, minHeight: editing ? g.lh : undefined }}
        className={`absolute text-justify hyphens-auto text-black caret-black [overflow-wrap:anywhere] ${
          editing ? `pointer-events-auto ${halo}` : "pointer-events-none"
        }`}
      >
        {editing ? frozen : text}
      </div>
      {busy && !editing && (
        <span aria-label="Typesetting" style={{ left: g.left - 28, top: top + g.lh / 2 - 3 }} className="absolute size-1.5 animate-pulse rounded-full bg-accent" />
      )}
    </>
  );
}

// Any other run of text written on the page (a title, a date, a skill line): one line in the run's font and
// place, growing the way the PDF sets it: from its left, from its right for text set flush right (dates),
// from its middle for centered text (the name). A run set in capitals (the name, uppercased by the template)
// shows capitals as you type. Enter or a click away saves, Esc drops it.
export function Run({
  x,
  y,
  w,
  h,
  font,
  size,
  align,
  caps,
  pageWidth,
  offset,
  text,
  editing,
  at,
  busy,
  start,
  onCommit,
  onCancel,
  onLive,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  font: string;
  size: number;
  align: "left" | "right" | "center";
  caps: boolean;
  pageWidth: number;
  offset: number;
  text: string;
  editing: boolean;
  at?: { x: number; y: number };
  busy: boolean;
  start?: number;
  onCommit: (text: string) => void;
  onCancel: () => void;
  onLive: (text: string, at: number) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const handled = useRef(false);
  const [frozen, setFrozen] = useState(text);
  if (!editing && frozen !== text) setFrozen(text);
  useLayoutEffect(() => {
    handled.current = false;
    if (editing && box.current) caret(box.current, at, start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);
  return (
    <div
      ref={box}
      data-overlay-ui
      role="textbox"
      aria-label="Text"
      lang="en"
      contentEditable={editing ? "plaintext-only" : false}
      suppressContentEditableWarning
      onBlur={(e) => editing && !handled.current && commitLater(e.currentTarget, onCommit)}
      onInput={(e) => onLive(e.currentTarget.textContent ?? "", offsetIn(e.currentTarget) ?? 0)}
      onKeyUp={(e) => editing && onLive(e.currentTarget.textContent ?? "", offsetIn(e.currentTarget) ?? 0)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          e.stopPropagation();
          handled.current = true;
          onCancel();
        }
      }}
      style={{
        ...(align === "right" ? { right: pageWidth - x - w } : align === "center" ? { left: x + w / 2, transform: "translateX(-50%)" } : { left: x }),
        top: y + offset,
        minWidth: editing ? Math.max(w, 8) : undefined,
        height: h,
        fontFamily: `"${font}", "Times New Roman", Times, serif`,
        fontSize: size,
        lineHeight: `${h}px`,
        textAlign: align,
        textTransform: caps ? "uppercase" : undefined,
      }}
      className={`absolute whitespace-nowrap text-black caret-black ${
        editing ? `pointer-events-auto ${halo}` : "pointer-events-none"
      } ${busy && !editing ? "animate-pulse" : ""}`}
    >
      {editing ? frozen : text}
    </div>
  );
}
