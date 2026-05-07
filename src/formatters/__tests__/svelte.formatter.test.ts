import { describe, expect, it } from "@rstest/core";
import { formatSvelteTheme } from "../svelte.formatter";

describe("formatSvelteTheme", () => {
  it("builds css custom properties for svelte themes", () => {
    const css = formatSvelteTheme({
      colors: {
        primary: { hex: "#2563eb" },
        secondary: { hex: "#9333ea" },
        accent: { hex: "#f59e0b" },
        neutrals: [{ hex: "#f3f4f6" }, { hex: "#111827" }],
        backgrounds: ["#ffffff"],
        text: ["#111827"],
      },
      typography: { families: [{ name: "Inter" }], scale: [{ size: 16 }], body: { size: 16 } },
      spacing: { base: 8, scale: [4, 8, 12] },
      borders: { radii: [{ label: "md", value: 8 }] },
    });

    expect(css).toContain(":root {");
    expect(css).toContain("--color-primary: #2563eb;");
    expect(css).toContain("--radius-md: 8px;");
  });
});
