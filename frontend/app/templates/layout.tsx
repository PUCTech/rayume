import { GeistSerifRegular } from "geist/font/serif/regular";
import { Refraction } from "../lens";
import { Nav } from "../nav";
import { Footer } from "../footer";

const serif = GeistSerifRegular.className;

// modal is the @modal slot: a template opened from the grid shows there, over the page
export default function TemplatesLayout({ children, modal }: LayoutProps<"/templates">) {
  return (
    <div className="min-h-screen overflow-x-clip bg-paper font-sans text-ink antialiased">
      <Refraction />
      <Nav serif={serif} />
      <main>{children}</main>
      <Footer serif={serif} />
      {modal}
    </div>
  );
}
