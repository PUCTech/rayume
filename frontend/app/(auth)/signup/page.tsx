import type { Metadata } from "next";
import { SignupForm } from "../form";

export const metadata: Metadata = {
  title: "Create your account · Rayume",
  description: "Create a free Rayume account and turn your projects into LaTeX resumes tailored to every job.",
};

// the heading lives in the form, under its progress bar
export default function Signup() {
  return <SignupForm />;
}
