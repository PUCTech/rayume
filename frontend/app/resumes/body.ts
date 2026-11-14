import { readFile } from "node:fs/promises";
import path from "node:path";

// the shared content every template inputs; the editor puts its changes into it and re-renders, and the
// experience settings read their form off it
export async function body() {
  "use cache";
  return readFile(path.join(process.cwd(), "resumes", "body.tex"), "utf8");
}
