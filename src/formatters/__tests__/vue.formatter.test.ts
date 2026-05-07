import { describe, expect, it } from "@rstest/core";
import { formatVueTheme } from "../vue.formatter";

describe("formatVueTheme", () => {
  it("outputs Vuetify theme plus css variables", () => {
    const output = formatVueTheme({
      colors: {
        primary: { hex: "#4f46e5" },
        secondary: { hex: "#ec4899" },
        accent: { hex: "#f59e0b" },
        neutrals: [{ hex: "#f3f4f6" }],
        backgrounds: ["#ffffff"],
        text: ["#111827"],
      },
      typography: { families: [{ name: "Inter" }] },
      spacing: { scale: [4, 8, 16] },
      borders: { radii: [{ label: "md", value: 8 }] },
      shadows: { values: [] },
    });

    expect(output).toContain("export const flyrankTheme");
    expect(output).toContain("--dl-color-primary");
    expect(output).toContain("--dl-spacing-1");
  });
});
