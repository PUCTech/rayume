"use client";

import { useId, useState, type RefObject } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { FieldError, input } from "../(auth)/form";
import type { Posting } from "../app/data";
import { primary, serif } from "../resumes/shared";

export type JobFields = Pick<Posting, "title" | "company" | "url" | "description">;

const LIMIT = { title: 200, company: 200, description: 20000 };

// a link is kept only when it parses as an http(s) URL; anything else (javascript:, data:) is refused
export const safeUrl = (url?: string) => {
  try {
    const u = new URL(url ?? "");
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : undefined;
  } catch {
    return undefined;
  }
};

// Saving a job, or editing one: the API's own fields and limits (docs/backend/endpoints/job-postings.md).
// Checked on submit, each message under its field and focus on the first one wrong; nothing typed is cleared.
// The link is stored and shown, never fetched; the description is plain text.
export function JobDialog({ open, job, onClose, onSave, back }: { open: boolean; job?: Posting; onClose: () => void; onSave: (v: JobFields) => void; back: RefObject<HTMLElement | null> }) {
  const [v, setV] = useState({ title: job?.title ?? "", company: job?.company ?? "", url: job?.url ?? "", description: job?.description ?? "" });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof v, string>>>({});
  const id = useId();

  const check = (form: HTMLFormElement) => {
    const found: typeof errors = {};
    const title = v.title.trim();
    const company = v.company.trim();
    const description = v.description.trim();
    if (!title) found.title = "Enter the job title.";
    else if (title.length > LIMIT.title) found.title = "Keep the title to 200 characters.";
    if (!company) found.company = "Enter the company.";
    else if (company.length > LIMIT.company) found.company = "Keep the company to 200 characters.";
    if (v.url.trim() && !safeUrl(v.url.trim())) found.url = "Use a link that starts with http:// or https://.";
    if (!description) found.description = "Paste the job description.";
    else if (description.length > LIMIT.description) found.description = "Keep the description to 20,000 characters.";
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) (form.elements.namedItem(first) as HTMLElement).focus();
    else onSave({ title, company, url: safeUrl(v.url.trim()), description });
  };
  const bind = (k: keyof typeof v) => ({
    name: k,
    value: v[k],
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `${id}-${k}` : undefined,
    onChange: (e: { target: { value: string } }) => {
      setV((o) => ({ ...o, [k]: e.target.value }));
      if (errors[k]) setErrors((o) => ({ ...o, [k]: undefined }));
    },
  });
  const left = LIMIT.description - v.description.length;

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-ink/30 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          finalFocus={back}
          className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] bg-paper p-5 shadow-[0_24px_64px_-24px_rgb(22_27_34/0.5)] outline-none transition duration-200 data-[ending-style]:scale-[0.97] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:opacity-0 sm:p-7"
        >
          <Dialog.Title className={`${serif} text-[1.75rem] leading-tight tracking-[-0.02em]`}>{job ? "Edit job" : "Save a job"}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink/60">Paste it from the posting. Rayume keeps it here, and never opens the link.</Dialog.Description>
          <form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              check(e.currentTarget);
            }}
            className="mt-5 grid gap-4"
          >
            <label className="block">
              <span className="text-sm font-medium">Job title</span>
              <input {...bind("title")} autoComplete="off" className={input} />
              {errors.title && <FieldError id={`${id}-title`}>{errors.title}</FieldError>}
            </label>
            <label className="block">
              <span className="text-sm font-medium">Company</span>
              <input {...bind("company")} autoComplete="organization" className={input} />
              {errors.company && <FieldError id={`${id}-company`}>{errors.company}</FieldError>}
            </label>
            <label className="block">
              <span className="text-sm font-medium">
                Link <span className="font-normal text-ink/50">(optional)</span>
              </span>
              <input {...bind("url")} type="url" inputMode="url" autoComplete="off" placeholder="https://" className={input} />
              {errors.url && <FieldError id={`${id}-url`}>{errors.url}</FieldError>}
            </label>
            <label className="block">
              <span className="flex justify-between gap-4 text-sm font-medium">
                Description
                {left <= LIMIT.description / 10 && <span className={`font-normal ${left < 0 ? "text-error-text" : "text-ink/50"}`}>{left.toLocaleString("en-US")} left</span>}
              </span>
              {/* grows with the text, up to about half the screen */}
              <textarea {...bind("description")} rows={5} className={`${input} block max-h-[45dvh] min-h-32 resize-none [field-sizing:content]`} />
              {errors.description && <FieldError id={`${id}-description`}>{errors.description}</FieldError>}
            </label>
            <div className="mt-2 flex justify-end gap-3">
              <Dialog.Close className="rounded-full px-5 py-2 text-sm font-medium text-ink/70 ring-1 ring-ink/10 transition hover:text-ink hover:ring-ink/25 pointer-coarse:py-3">Cancel</Dialog.Close>
              <button type="submit" className={`${primary} pointer-coarse:py-3`}>
                {job ? "Save changes" : "Save job"}
              </button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
