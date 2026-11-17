import type { ReactNode } from "react";
import { Banner } from "./banner";

// Sign in and sign up: a manta photo, then the form. Phones stack them, the form on a paper sheet that
// overlaps the photo's bottom edge; desktop puts the photo on the left half and the form on the right.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper font-sans text-ink antialiased lg:flex-row">
      <Banner />
      <main className="relative -mt-8 flex flex-1 flex-col rounded-t-[36px] bg-paper px-4 pt-8 pb-6 shadow-[0_-12px_32px_-16px_rgb(22_27_34/0.3)] sm:px-6 lg:mt-0 lg:rounded-none lg:px-10 lg:py-4 lg:shadow-none">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center lg:py-0">{children}</div>
      </main>
    </div>
  );
}
