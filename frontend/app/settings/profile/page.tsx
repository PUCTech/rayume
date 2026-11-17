import type { Metadata } from "next";
import { Profile } from "./profile";

export const metadata: Metadata = { title: "Personal information · Rayume", robots: { index: false } };

export default function ProfilePage() {
  return <Profile />;
}
