import type { Metadata } from "next";
import { body } from "../../resumes/body";
import { Experience } from "./experience";

export const metadata: Metadata = { title: "Your experience · Rayume", robots: { index: false } };

export default async function ExperiencePage() {
  return <Experience body={await body()} />;
}
