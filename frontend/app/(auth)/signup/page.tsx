import type { Metadata } from "next";
import { share } from "../../share";
import { SignupForm } from "../form";

export const metadata: Metadata = share("Create your account · Rayume", "Create a free Rayume account and turn your projects into LaTeX resumes tailored to every job.");

// the heading lives in the form, under its progress bar
export default function Signup() {
  return <SignupForm />;
}
