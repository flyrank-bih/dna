import { describe, expect, it } from "@rstest/core";
import {
  buildTailwindAssistantPack,
  formatTailwind,
} from "../tailwind.generator";

const design = {
  colors: {
    primary: { hex: "#2563eb" },
    neutrals: [{ hex: "#f3f4f6" }],
    backgrounds: ["#ffffff"],
    text: ["#111827"],
  },
  typography: {
    families: [{ name: "Inter", usage: "body" }],
    scale: [{ size: 16, lineHeight: 1.5 }],
  },
  spacing: { tokens: { md: "16px" } },
  borders: { radii: [{ label: "md", value: 8 }] },
  shadows: { values: [{ label: "md", raw: "0 4px 8px rgba(0,0,0,.1)" }] },
  breakpoints: [{ label: "lg", value: "1024px", type: "min-width" }],
  animations: {
    durations: [{ value: "120ms" }],
    easings: ["ease-in", { value: "cubic-bezier(0.2, 0.8, 0.2, 1)" }],
  },
  layout: { containerWidths: [{ maxWidth: "1200px", padding: "1rem" }] },
};

describe("tailwind.generator", () => {
  it("formats tailwind config without duplicating px units", () => {
    const output = formatTailwind(design);
    expect(output).toContain("lg: '1024px'");
    expect(output).not.toContain("1024pxpx");
    expect(output).toContain("custom1");
  });

  it("creates assistant integration pack", () => {
    const pack = buildTailwindAssistantPack(design);
    expect(pack.codex).toContain("Implement UI");
    expect(pack.cursor).toContain("Tailwind Integration");
    expect(pack.generic).toContain("Rules:");
  });
});
