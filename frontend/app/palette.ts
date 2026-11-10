// Accent colours under test, each with shades. The first shade of the first accent is the default in globals.css.
// deep and text are darkened until they pass WCAG AA: white on deep, text on paper.
export const accents = [
  {
    name: "Vermilion",
    shades: [
      { name: "Vermilion", base: "#f2542d", deep: "#d63c16", text: "#b8330f" },
    ],
  },
  {
    name: "Cobalt",
    shades: [
      { name: "Cobalt", base: "#2f6bff", deep: "#1055ff", text: "#0047f6" },
      { name: "Azure", base: "#1e90ff", deep: "#0073e2", text: "#0066c8" },
      { name: "Ultramarine", base: "#4338f5", deep: "#271bf4", text: "#180bea" },
      { name: "Sky", base: "#0ea5e9", deep: "#0b7caf", text: "#096b97" },
    ],
  },
  {
    name: "Violet",
    shades: [
      { name: "Violet", base: "#7c4dff", deep: "#652eff", text: "#5215ff" },
      { name: "Indigo", base: "#5b4bff", deep: "#3f2cff", text: "#2813ff" },
      { name: "Grape", base: "#9b3dff", deep: "#8b1eff", text: "#7e04ff" },
      { name: "Orchid", base: "#c04df0", deep: "#b42ced", text: "#aa14e9" },
    ],
  },
  {
    name: "Emerald",
    shades: [
      { name: "Emerald", base: "#10b981", deep: "#0c855d", text: "#0a6e4d" },
      { name: "Jade", base: "#00a86b", deep: "#008454", text: "#006b44" },
      { name: "Lime", base: "#4cc93a", deep: "#318525", text: "#2a711f" },
      { name: "Teal", base: "#0fb5ae", deep: "#0b817c", text: "#096a65" },
    ],
  },
  {
    name: "Magenta",
    shades: [
      { name: "Magenta", base: "#e5308c", deep: "#db1b7d", text: "#c41870" },
      { name: "Hot pink", base: "#ff3d9a", deep: "#e5006e", text: "#cc0062" },
      { name: "Fuchsia", base: "#d63af9", deep: "#c207ec", text: "#ae06d3" },
      { name: "Rose", base: "#f43f5e", deep: "#e80d33", text: "#d00c2e" },
    ],
  },
];
