"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { FieldError, input } from "../../(auth)/form";
import { primary, serif } from "../../resumes/shared";
import { saveMe, useMe, type Me } from "../../resumes/store";

const noop = () => () => {};
// the backend's RESERVED_USERNAMES (schemas.py)
const reserved = new Set(["admin", "api", "login", "settings"]);
// PATCH /me's limits (docs/backend/endpoints/users.md)
const limits = { name: 100, profession: 100, phone: 30, address: 200 } as const;

const check = (v: Me): Partial<Record<keyof Me, string>> => {
  const e: Partial<Record<keyof Me, string>> = {};
  if (!v.name.trim()) e.name = "Add your name.";
  if (!/^[a-z0-9_-]{3,30}$/.test(v.username)) e.username = "3 to 30 lowercase letters, numbers, - or _.";
  else if (reserved.has(v.username)) e.username = "That one's taken. Try another.";
  for (const k of ["name", "profession", "phone", "address"] as const) if (v[k].length > limits[k]) e[k] = `Keep it under ${limits[k]} characters.`;
  return e;
};

// Personal information (/settings/profile): who you are on Rayume, the fields PATCH /me takes. Changing them
// leaves the resumes you've made as they are; new ones start from your experience (/settings/experience).
// The email shows but doesn't change here: the API has no way to verify a new one yet.
export function Profile() {
  const browser = useSyncExternalStore(noop, () => true, () => false);
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <header className="sticky top-0 z-30 border-b border-ink/10 bg-paper/95">
        <div className="mx-auto flex h-16 max-w-2xl items-center gap-3 px-4 sm:px-6">
          <Link href="/resumes" aria-label="Back to your resumes" className="grid size-9 shrink-0 place-items-center rounded-full text-ink/60 transition hover:bg-ink/5 hover:text-ink pointer-coarse:size-11">
            <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5 7 10l5 5" />
            </svg>
          </Link>
          <h1 className={`${serif} truncate text-xl leading-tight tracking-[-0.01em]`}>Personal information</h1>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6">{browser && <Form />}</main>
    </div>
  );
}

function Form() {
  const me = useMe();
  const [v, setV] = useState(me);
  const [errors, setErrors] = useState<ReturnType<typeof check>>({});
  const [saved, setSaved] = useState(false);
  const set = (k: keyof Me, value: string) => {
    setV({ ...v, [k]: k === "username" ? value.toLowerCase() : value });
    setErrors({ ...errors, [k]: undefined });
    setSaved(false);
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = check(v);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) return document.getElementById(`me-${first}`)?.focus();
    saveMe({ ...v, name: v.name.trim(), profession: v.profession.trim(), phone: v.phone.trim(), address: v.address.trim() });
    setSaved(true);
  };
  const field = (k: Exclude<keyof Me, "language">, label: string, extra: { hint?: string; type?: string; autoComplete?: string; disabled?: boolean } = {}) => (
    <label className="block text-sm font-medium">
      {label}
      <input
        id={`me-${k}`}
        type={extra.type ?? "text"}
        value={v[k]}
        onChange={(e) => set(k, e.target.value)}
        autoComplete={extra.autoComplete}
        disabled={extra.disabled}
        aria-invalid={!!errors[k]}
        aria-describedby={errors[k] ? `me-${k}-error` : extra.hint ? `me-${k}-hint` : undefined}
        className={`${input} font-normal disabled:bg-mist disabled:text-ink/60`}
      />
      {errors[k] ? (
        <FieldError id={`me-${k}-error`}>{errors[k]!}</FieldError>
      ) : (
        extra.hint && (
          <span id={`me-${k}-hint`} className="mt-1.5 block text-xs font-normal text-ink/55">
            {extra.hint}
          </span>
        )
      )}
    </label>
  );
  return (
    <form noValidate onSubmit={submit} className="grid gap-8">
      <section className="grid gap-5">
        <h2 className="text-sm font-medium text-ink/60">You</h2>
        {field("name", "Name", { autoComplete: "name" })}
        {field("username", "Username", { autoComplete: "username", hint: `Your public page will be at /u/${v.username || "you"}. Changing it breaks old links to it.` })}
        {field("profession", "What you do", { autoComplete: "organization-title", hint: "Like Backend Developer or CS student" })}
      </section>
      <section className="grid gap-5">
        <h2 className="text-sm font-medium text-ink/60">Contact</h2>
        {field("email", "Email", { type: "email", disabled: true, hint: "Changing your email isn't possible yet." })}
        {field("phone", "Phone", { type: "tel", autoComplete: "tel" })}
        {field("address", "City", { autoComplete: "address-level2", hint: "Like São Paulo, Brazil. Recruiters want the city, not the street." })}
      </section>
      <section className="grid gap-5">
        <h2 className="text-sm font-medium text-ink/60">Preferences</h2>
        <label className="block text-sm font-medium">
          Language
          <select value={v.language} onChange={(e) => set("language", e.target.value)} className={`${input} font-normal`}>
            <option value="en">English</option>
            <option value="pt-BR">Português (Brasil)</option>
          </select>
        </label>
      </section>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className={`${primary} pointer-coarse:py-3`}>
          Save changes
        </button>
        <p role="status" className="text-sm text-success-text">
          {saved && "Saved. Resumes you've already made keep their old details."}
        </p>
      </div>
    </form>
  );
}
