import { execFile } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { templates } from "../../templates/data";

const run = promisify(execFile);

// Compiles an edited template with the local Tectonic and returns the PDF.
// shortcut: dev only. Raw LaTeX can't be escaped and Tectonic still reads any file it can see,
// so production waits for the sandboxed worker in docs/endpoints/renders.md and docs/security.
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });

  const { file, tex } = await request.json().catch(() => ({}));
  if (!templates.some((t) => t.file === file) || typeof tex !== "string" || tex.length > 100_000) {
    return new Response("Bad request", { status: 400 });
  }

  // a scratch copy of resumes/, so \input{common} and the .cls files resolve next to the edited file
  const dir = await mkdtemp(path.join(tmpdir(), "rayume-render-"));
  try {
    await cp(path.join(process.cwd(), "resumes"), dir, { recursive: true });
    await writeFile(path.join(dir, `${file}.tex`), tex);
    await run("tectonic", ["-X", "compile", `${file}.tex`], { cwd: dir, timeout: 30_000 });
    return new Response(await readFile(path.join(dir, `${file}.pdf`)), { headers: { "content-type": "application/pdf" } });
  } catch (e) {
    const { killed, stderr } = e as { killed?: boolean; stderr?: string };
    const lines = (stderr || String(e)).trim().split("\n");
    // Tectonic's own "error: file.tex:LINE: ..." lines say what broke; the TeX transcript after them is noise
    const errors = lines.filter((l) => /^error: .+\.tex:\d+:/.test(l));
    const log = killed ? "Timed out after 30 s." : (errors.length ? errors : lines.slice(-12)).join("\n");
    return new Response(log, { status: 422 });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
