import type { Metadata } from "next";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { AuthForm } from "../form";

const serif = GeistSerifRegular.className;

export const metadata: Metadata = {
  title: "Create your account · Rayume",
  description: "Create a free Rayume account and turn your projects into LaTeX resumes tailored to every job.",
};

export default function Signup() {
  return (
    <>
      <h1 className={`${serif} text-[2.6rem] leading-[1.05] tracking-[-0.03em]`}>Create your account</h1>
      <p className="mt-3 text-ink/65">Free while you hunt. Your first resume takes a couple of minutes.</p>
      <AuthForm kind="signup" />
    </>
  );
}
