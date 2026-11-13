"use client";

import { useState, useSyncExternalStore, type ChangeEvent, type ComponentProps } from "react";
import { GeistSerifRegular } from "geist/font/serif/regular";
import Link from "next/link";

// 16px on phones, or iOS Safari zooms the page when an input takes focus
const input =
  "mt-1.5 w-full rounded-2xl bg-white px-4 py-3 text-base ring-1 ring-ink/10 transition placeholder:text-ink/40 hover:ring-ink/20 focus:outline-none focus:ring-2 focus:ring-accent-text sm:text-[15px]";

function Field({ label, hint, ...props }: { label: string; hint?: string } & ComponentProps<"input">) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input required {...props} className={input} />
      {hint && <span className="mt-1.5 block text-xs text-ink/55">{hint}</span>}
    </label>
  );
}

// GitHub from Simple Icons (CC0); Google's four-colour G, as its sign-in branding asks
function GitHub() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function Google() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29a11.86 11.86 0 0 0 0 10.76l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

const provider =
  "flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-5 py-3 text-[15px] font-medium ring-1 ring-ink/10 transition hover:ring-ink/25 active:scale-[0.98]";

const submit =
  "inline-flex w-full items-center justify-center rounded-full bg-accent-deep px-6 py-3.5 text-[15px] font-medium text-white shadow-[0_8px_24px_-8px_color-mix(in_srgb,var(--color-accent)_70%,transparent),inset_0_1px_0_rgb(255_255_255/0.25)] transition hover:bg-[color-mix(in_oklab,var(--color-accent)_45%,var(--color-accent-deep))] active:scale-[0.97]";

const serif = GeistSerifRegular.className;

function Providers() {
  return (
    <>
      <div className="mt-8 grid gap-3">
        <button type="button" className={provider}>
          <GitHub />
          Continue with GitHub
        </button>
        <button type="button" className={provider}>
          <Google />
          Continue with Google
        </button>
      </div>
      <div className="mt-7 flex items-center gap-4 text-xs text-ink/45">
        <span className="h-px flex-1 bg-ink/10" />
        or with email
        <span className="h-px flex-1 bg-ink/10" />
      </div>
    </>
  );
}

// Fields from docs/backend/endpoints/auth.md.
// shortcut: nothing is sent until the API has /auth, so submitting does nothing yet. Wire the forms to
// POST /auth/login and /auth/register and the provider buttons to GET /auth/{github,google} then.
// The email typed on login, carried to signup when someone switches over. It lives in this module, so
// it survives the client-side move between the two pages and not a reload; it never goes in the URL.
// Only the browser writes it (in onChange), so the copy on the server stays empty. Signup subscribes
// rather than copying once: Next keeps a visited page mounted, so a copy would go stale.
let loginEmail = "";
const emailListeners = new Set<() => void>();
const setLoginEmail = (e: string) => {
  loginEmail = e;
  emailListeners.forEach((l) => l());
};
const subscribeEmail = (l: () => void) => {
  emailListeners.add(l);
  return () => emailListeners.delete(l);
};

export function LoginForm() {
  return (
    <>
      <Providers />
      {/* preventDefault keeps the browser from submitting by GET, which would put the password in the URL */}
      <form onSubmit={(e) => e.preventDefault()}
        className="mt-7 grid gap-4"
      >
        <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" onChange={(e) => setLoginEmail(e.target.value)} />
        <Field label="Password" name="password" type="password" autoComplete="current-password" maxLength={128} />
        <button type="submit" className={`${submit} mt-2`}>
          Sign in
        </button>
      </form>
      <p className="mt-6 text-sm text-ink/65">
        New to Rayume?{" "}
        <Link href="/signup" className="font-medium text-accent-text">
          Create an account
        </Link>
      </p>
    </>
  );
}

const steps = ["Account", "Password", "Name"];
type Values = { username: string; password: string; name: string };

// Signup starts like login. Continuing with email and username folds GitHub and Google away and turns
// the form into three steps under a progress bar: email + username, then password, then name. Only the
// current step is mounted, so the browser checks just its fields; values live in state between steps.
export function SignupForm() {
  const [email, setEmail] = useState(false);
  const [step, setStep] = useState(0);
  const [back, setBack] = useState(false);
  const [v, setV] = useState<Values>({ username: "", password: "", name: "" });
  // the login email until the person types their own here
  const fromLogin = useSyncExternalStore(subscribeEmail, () => loginEmail, () => "");
  const [ownEmail, setOwnEmail] = useState<string | null>(null);
  const bind = (k: keyof Values) => ({
    name: k,
    value: v[k],
    onChange: (e: ChangeEvent<HTMLInputElement>) => setV((o) => ({ ...o, [k]: e.target.value })),
  });
  const go = (n: number) => {
    setBack(n < step);
    setStep(n);
  };
  // each step slides in from the side it's coming from
  const enter = `grid gap-4 transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none starting:opacity-0 ${back ? "starting:-translate-x-6" : "starting:translate-x-6"}`;

  return (
    <>
      {/* mt-auto here and on the terms splits the free height, centring the form above the terms line */}
      <div aria-hidden={!email} className={`mt-auto mb-8 transition-opacity duration-500 ${email ? "opacity-100" : "opacity-0"}`}>
        <div className="flex gap-1.5">
          {steps.map((s, i) => (
            <span key={s} className="h-1 flex-1 overflow-hidden rounded-full bg-ink/10">
              <span className={`block h-full rounded-full bg-accent-deep transition-[width] duration-500 ease-out ${i <= step ? "w-full" : "w-0"}`} />
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-ink/55">
          Step {step + 1} of {steps.length}: {steps[step]}
        </p>
      </div>

      <h1 className={`${serif} text-[clamp(2.25rem,10vw,2.6rem)] leading-[1.05] tracking-[-0.03em]`}>Create your account</h1>
      <p className="mt-3 text-ink/65">Free while you hunt. It takes a minute.</p>

      {/* grid rows 1fr to 0fr folds the providers away to nothing once the email route starts */}
      <div
        inert={email}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${email ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <Providers />
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setEmail(true);
          if (step < steps.length - 1) go(step + 1);
        }}
        className="mt-7 grid gap-4"
      >
        {step === 0 && (
          <div key="account" className={enter}>
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={ownEmail ?? fromLogin}
              onChange={(e) => setOwnEmail(e.target.value)}
            />
            <Field
              label="Username"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              pattern="[a-z0-9_\-]{3,30}"
              placeholder="lucasmendes"
              hint="3 to 30 characters: lowercase letters, numbers, - and _."
              {...bind("username")}
            />
          </div>
        )}
        {step === 1 && (
          <div key="password" className={enter}>
            <Field label="Password" type="password" autoComplete="new-password" minLength={8} maxLength={128} hint="At least 8 characters." autoFocus {...bind("password")} />
          </div>
        )}
        {step === 2 && (
          <div key="name" className={enter}>
            <Field label="What should we call you?" autoComplete="name" maxLength={100} placeholder="Lucas" autoFocus {...bind("name")} />
          </div>
        )}
        <div className="mt-2 flex gap-3">
          {step > 0 && (
            <button type="button" onClick={() => go(step - 1)} className="rounded-full px-5 py-3.5 text-[15px] font-medium text-ink/70 ring-1 ring-ink/10 transition hover:text-ink hover:ring-ink/25">
              Back
            </button>
          )}
          <button type="submit" className={`${submit} flex-1`}>
            {step < steps.length - 1 ? "Continue" : "Create account"}
          </button>
        </div>
      </form>
      <p className="mt-6 text-sm text-ink/65">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent-text">
          Sign in
        </Link>
      </p>

      <p className="mt-auto pt-8 text-center text-xs leading-relaxed text-ink/55">
        By creating an account you agree to our{" "}
        <Link href="/legal/terms" className="underline underline-offset-2 hover:text-ink">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-ink">
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}
