// The signed-in app: its pages bring their own bars (the resumes home, each resume's editor), so no
// marketing nav or footer here.
export default function ResumesLayout({ children }: LayoutProps<"/resumes">) {
  return <div className="min-h-dvh bg-paper font-sans text-ink antialiased">{children}</div>;
}
