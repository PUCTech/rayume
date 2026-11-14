import type { Metadata } from "next";
import { profile } from "../app/data";
import { Home } from "./home";

export const metadata: Metadata = {
  title: `${profile.name}'s resumes · Rayume`,
  description: "Your main resume and every version tailored to a job.",
  robots: { index: false },
};

export default function Resumes() {
  return <Home />;
}
