import { GeistSerifRegular } from "geist/font/serif/regular";
import { Refraction } from "../lens";
import { Nav } from "../nav";
import { Footer } from "../footer";

const serif = GeistSerifRegular.className;

export default function ResourcesLayout({ children }: LayoutProps<"/resources">) {
  return (
    // printing a guide keeps the article and drops the site chrome (the nav and footer are this div's children)
    <div className="min-h-screen overflow-x-clip bg-paper font-sans text-ink antialiased print:bg-white print:[&>footer]:hidden print:[&>header]:hidden">
      <Refraction />
      <Nav serif={serif} />
      <main>{children}</main>
      <Footer serif={serif} />
    </div>
  );
}
