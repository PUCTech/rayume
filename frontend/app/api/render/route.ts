import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, mkdtemp, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { templates } from "../../templates/data";

const run = promisify(execFile);
const resumes = path.join(process.cwd(), "resumes");

// Kept across requests (and dev reloads): one warm working copy of resumes/, the compiles queued through it
// one at a time, and the PDFs of recent inputs.
// The working copy keeps each compile's .aux, so Tectonic reruns TeX only when the aux really changed; in a
// fresh directory every compile paid for a second pass that drew the same pages (measured: same pixels,
// ~70 ms of ~250). Same engine, same input, same output.
// shortcut: in memory, for the dev server's one user; the sandboxed worker (docs/backend/endpoints/renders.md)
// takes this over in production
// synced is what resumes/ held when it was last copied in, "" once a compile wrote its own body.tex over it
type Warm = { dir: Promise<string>; queue: Promise<unknown>; cache: Map<string, Uint8Array>; synced: string };
const warm: Warm = ((globalThis as { rayumeRender?: Warm }).rayumeRender ??= {
  dir: mkdtemp(path.join(tmpdir(), "rayume-render-")),
  queue: Promise.resolve(),
  cache: new Map(),
  synced: "",
});
const cached = 40;

// what resumes/ holds now, so an edited template or class in dev is never served from the cache
async function stamp() {
  const names = await readdir(resumes);
  const times = await Promise.all(names.map(async (n) => `${n}:${(await stat(path.join(resumes, n))).mtimeMs}`));
  return times.join();
}

// Compiles an edited template with the local Tectonic and returns the PDF. body, when sent, replaces the
// shared content (resumes/body.tex) for this compile: the resume editor sends it with the bullets edited.
// An input seen lately comes back from the cache without compiling (an undo, the save after a live preview).
// shortcut: dev only. Raw LaTeX can't be escaped and Tectonic still reads any file it can see,
// so production waits for the sandboxed worker in docs/backend/endpoints/renders.md and docs/security.
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") return new Response("Not found", { status: 404 });

  const { file, tex, body } = await request.json().catch(() => ({}));
  const badBody = body !== undefined && (typeof body !== "string" || body.length > 100_000);
  if (!templates.some((t) => t.file === file) || typeof tex !== "string" || tex.length > 100_000 || badBody) {
    return new Response("Bad request", { status: 400 });
  }

  const now = await stamp();
  const key = createHash("sha256").update(JSON.stringify([file, tex, body ?? null, now])).digest("hex");
  const hit = warm.cache.get(key);
  if (hit) {
    // most recently used last, so the oldest is the first to go
    warm.cache.delete(key);
    warm.cache.set(key, hit);
    return pdf(hit);
  }

  const job = warm.queue.then(async () => {
    const dir = await warm.dir;
    // resumes/ as it is now (a template edited in dev, the pristine body.tex) over the kept intermediates,
    // copied only when the working copy differs from it
    if (warm.synced !== now) await cp(resumes, dir, { recursive: true });
    warm.synced = body === undefined ? now : "";
    await writeFile(path.join(dir, `${file}.tex`), tex);
    if (body !== undefined) await writeFile(path.join(dir, "body.tex"), body);
    try {
      await run("tectonic", ["-X", "compile", `${file}.tex`, "--keep-intermediates"], { cwd: dir, timeout: 30_000 });
    } catch (e) {
      // a failed compile can leave a half-written aux: the next one starts clean
      await rm(path.join(dir, `${file}.aux`), { force: true });
      throw e;
    }
    return new Uint8Array(await readFile(path.join(dir, `${file}.pdf`)));
  });
  warm.queue = job.catch(() => {});
  try {
    const out = await job;
    warm.cache.set(key, out);
    if (warm.cache.size > cached) warm.cache.delete(warm.cache.keys().next().value!);
    return pdf(out);
  } catch (e) {
    const { killed, stderr } = e as { killed?: boolean; stderr?: string };
    const lines = (stderr || String(e)).trim().split("\n");
    // Tectonic's own "error: file.tex:LINE: ..." lines say what broke; the TeX transcript after them is noise
    const errors = lines.filter((l) => /^error: .+\.tex:\d+:/.test(l));
    const log = killed ? "Timed out after 30 s." : (errors.length ? errors : lines.slice(-12)).join("\n");
    return new Response(log, { status: 422 });
  }
}

const pdf = (bytes: Uint8Array) => new Response(bytes as BodyInit, { headers: { "content-type": "application/pdf" } });
