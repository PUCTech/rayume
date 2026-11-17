"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { Chat } from "../../../app/chat";
import { entries, profile, type Posting } from "../../../app/data";
import { tailorAnswer, tailoring } from "../../../app/workspace";
import { keep, keepReview, kept, review, touch, useJobs, useResumes, type Review } from "../../store";
import { withBullet } from "../../tex";
import type { Saved } from "../../data";
import { Logo, primary, serif } from "../../shared";
import { Missing } from "../open";

const noop = () => () => {};
const none: never[] = [];
const steps = ["Reading the posting", "Picking your most relevant experience", "Rewriting bullets around what they ask for", "Checking it fits one page"];
const STEP_MS = 900;
const secondary = "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-ink/75 ring-1 ring-ink/10 transition hover:text-ink hover:ring-ink/25 pointer-coarse:py-3";
const original = (id: string) => entries.flatMap((e) => e.bullets).find((b) => b.id === id)?.text ?? "";

// Tailoring a new resume to a job: a short loading screen while Rayume works, then its proposals in the chat to
// replace or skip one by one, written into the resume's document as they're accepted, so the editor opens on
// exactly those. Edit it myself (and Open in editor, always in the bar) goes to the editor at any point, with
// whatever was accepted already saved. Coming back shows the chat again, not the loading. A resume with no
// job goes to the editor; one that isn't here says so.
// ?fail=1 makes the demo's tailoring fail, to show (and test) what a 502 from the API looks like: nothing applied.
export function Tailor() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const list = useResumes();
  const jobs = useJobs();
  const browser = useSyncExternalStore(noop, () => true, () => false);
  const r = list.find((x) => x.id === id);
  const job = r && jobs.find((j) => j.id === r.job);
  useEffect(() => {
    if (browser && r && !job) router.replace(`/resumes/${r.id}`);
  }, [browser, r, job, router]);
  if (!browser) return null;
  if (!r) return <Missing />;
  if (!job) return null;
  return <Flow key={r.id} r={r} job={job} />;
}

function Flow({ r, job }: { r: Saved; job: Posting }) {
  const router = useRouter();
  const path = usePathname();
  const fail = useSearchParams().get("fail") === "1";
  const [rev, setRev] = useState<Review>(() => review(r.id));
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const save = (next: Review) => {
    keepReview(r.id, next);
    setRev(next);
  };
  const decide = (bulletId: string, d: "accepted" | "skipped") => save({ ...rev, decided: { ...rev.decided, [bulletId]: d } });
  // a change goes into the resume's own document, read fresh, so nothing the editor kept is lost
  const accept = (bulletId: string, text: string) => {
    keep(r.id, withBullet(kept(r.id), bulletId, text));
    touch(r.id);
  };
  const proposals = rev.opening?.proposals ?? [];
  const pending = proposals.filter((p) => !rev.decided[p.bulletId]);
  const accepted = Object.values(rev.decided).includes("accepted");

  const done = () => {
    if (fail) return setFailed(true);
    const d = kept(r.id);
    save({ opening: tailoring(job, entries, (b) => d.bullets[b] ?? original(b)), decided: {} });
  };

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-ink/10 bg-paper px-3 sm:gap-3 sm:px-4">
        <Link href="/jobs" aria-label="Back to your jobs" className="grid size-9 shrink-0 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 hover:text-ink pointer-coarse:size-11">
          <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5 7 10l5 5" />
          </svg>
        </Link>
        <Logo p={job} className="size-7" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" title={job.company}>
            {job.company}
          </p>
          <p className="truncate text-xs text-ink/55" title={job.title}>
            {job.title}
          </p>
        </div>
        <Link href={`/resumes/${r.id}`} className={`shrink-0 ${accepted ? `${primary} pointer-coarse:py-3` : secondary}`}>
          Open in editor
        </Link>
      </header>

      {rev.opening ? (
        <main className="mx-auto min-h-0 w-full max-w-3xl flex-1">
          <Chat
            reply={(text) => [tailorAnswer(text, pending.length ? pending : proposals)]}
            mode="tailor"
            setMode={() => {}}
            quotes={none}
            takeQuotes={() => {}}
            apply={(bulletId, text) => {
              accept(bulletId, text);
              if (proposals.some((p) => p.bulletId === bulletId)) decide(bulletId, "accepted");
            }}
            addEntry={() => {}}
            only={["tailor"]}
            name={profile.name.split(" ")[0]}
            addedTo="this resume"
            opening={[rev.opening]}
            decided={rev.decided}
            skip={(bulletId) => decide(bulletId, "skipped")}
            acceptAll={
              pending.length
                ? () => {
                    pending.forEach((p) => accept(p.bulletId, p.after));
                    save({ ...rev, decided: { ...rev.decided, ...Object.fromEntries(pending.map((p) => [p.bulletId, "accepted" as const])) } });
                  }
                : undefined
            }
            placeholder="Ask for a change, like: make the second one shorter"
          />
        </main>
      ) : failed ? (
        <main className="grid flex-1 place-items-center px-4">
          <div className="w-full max-w-md">
            <h1 className={`${serif} text-[2rem] leading-tight tracking-[-0.02em]`}>Couldn&apos;t tailor this one</h1>
            <p className="mt-3 text-ink/65">Rayume didn&apos;t finish, so nothing in your resume changed. Try again, or change it yourself in the editor.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setFailed(false);
                  setAttempt((a) => a + 1);
                  router.replace(path);
                }}
                className={`${primary} pointer-coarse:py-3`}
              >
                Try again
              </button>
              <Link href={`/resumes/${r.id}`} className={secondary}>
                Edit it myself
              </Link>
            </div>
          </div>
        </main>
      ) : (
        <Loading key={attempt} company={job.company} onDone={done} editor={`/resumes/${r.id}`} logo={<Logo p={job} className="size-12" />} />
      )}
    </div>
  );
}

// The steps Rayume works through, ticked off in turn; the editor is a press away from the first frame
function Loading({ company, onDone, editor, logo }: { company: string; onDone: () => void; editor: string; logo: ReactNode }) {
  const [step, setStep] = useState(0);
  const finish = useRef(onDone);
  useEffect(() => {
    finish.current = onDone;
  });
  useEffect(() => {
    const t = setTimeout(() => (step < steps.length ? setStep(step + 1) : finish.current()), step < steps.length ? STEP_MS : 300);
    return () => clearTimeout(t);
  }, [step]);
  return (
    <main className="grid flex-1 place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        {logo}
        <h1 className={`${serif} mt-5 text-[clamp(1.9rem,6vw,2.4rem)] leading-tight tracking-[-0.02em]`}>Tailoring your resume to {company}</h1>
        <ol className="mt-7 grid gap-3.5">
          {steps.map((s, i) => (
            <li key={s} className={`flex items-center gap-3 text-[15px] transition-colors duration-300 motion-reduce:transition-none ${i < step ? "text-ink" : i === step ? "text-ink" : "text-ink/40"}`}>
              <span
                aria-hidden
                className={`grid size-6 shrink-0 place-items-center rounded-full transition duration-300 motion-reduce:transition-none ${i < step ? "bg-accent-deep text-white" : i === step ? "ring-2 ring-accent-deep/60 ring-inset" : "ring-1 ring-ink/15 ring-inset"}`}
              >
                {i < step && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              {s}
              {i < step && <span className="sr-only">, done</span>}
            </li>
          ))}
        </ol>
        <p role="status" className="sr-only">
          {step < steps.length ? `${steps[step]}…` : "Done"}
        </p>
        <Link href={editor} className={`${secondary} mt-8`}>
          Edit it myself
        </Link>
      </div>
    </main>
  );
}
