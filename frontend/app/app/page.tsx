import type { Metadata } from "next";
import { Workspace } from "./workspace";

export const metadata: Metadata = {
  title: "Master resume · Rayume",
  robots: { index: false },
};

export default function App() {
  return <Workspace />;
}
