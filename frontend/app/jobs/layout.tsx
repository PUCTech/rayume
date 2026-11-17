// The signed-in app, like /resumes: the page brings its own bar, so no marketing nav or footer here.
export default function JobsLayout({ children }: LayoutProps<"/jobs">) {
  return <div className="min-h-dvh bg-paper font-sans text-ink antialiased">{children}</div>;
}
