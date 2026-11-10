import { TemplateDetail } from "../../detail";
import { Drawer } from "../../drawer";

// a template opened from the grid; a direct visit or refresh renders ../../[id]/page.tsx instead.
// The drawer opens at once and the template streams into it.
export default function TemplateDrawer({ params }: PageProps<"/templates/[id]">) {
  return (
    <Drawer>
      <TemplateDetail params={params} />
    </Drawer>
  );
}
