import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// class names joined, later Tailwind classes winning over earlier ones (shadcn's helper, which the copied
// assistant-ui components import)
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
