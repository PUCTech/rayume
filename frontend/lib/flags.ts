// Feature flags, read once here. NEXT_PUBLIC_ values are inlined at build time, so a change needs a rebuild
// (or a dev server restart).
export const darkMode = process.env.NEXT_PUBLIC_FLAG_DARK_MODE === "true";
