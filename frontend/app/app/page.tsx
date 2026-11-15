import { redirect } from "next/navigation";

// The old workspace (sidebar, HTML resume, chat) gave way to /resumes and each resume's own editor page.
export default function App() {
  redirect("/resumes");
}
