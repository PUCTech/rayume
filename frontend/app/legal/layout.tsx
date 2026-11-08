import { GeistSerifRegular } from "geist/font/serif/regular";
import { Refraction } from "../lens";
import { Nav } from "../nav";
import { Footer } from "../footer";

const serif = GeistSerifRegular.className;

export default function LegalLayout({ children }: LayoutProps<"/legal">) {
  return (
    <div className="min-h-screen overflow-x-clip bg-paper font-sans text-ink antialiased">
      <Refraction />
      <Nav serif={serif} />
      <main>{children}</main>
      <Footer serif={serif} />
    </div>
  );
}
