import type { Metadata } from "next";
import { GeistSerifRegular } from "geist/font/serif/regular";
import { AuthForm } from "../form";

const serif = GeistSerifRegular.className;

export const metadata: Metadata = {
  title: "Sign in · Rayume",
  description: "Sign in to Rayume to pick up your resumes where you left them.",
};

export default function Login() {
  return (
    <>
      <h1 className={`${serif} text-[2.6rem] leading-[1.05] tracking-[-0.03em]`}>Welcome back</h1>
      <p className="mt-3 text-ink/65">Sign in to pick up your resumes where you left them.</p>
      <AuthForm kind="login" />
    </>
  );
}
