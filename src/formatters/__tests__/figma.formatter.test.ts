import { describe, expect, it } from "@rstest/core";
import { formatFigma } from "../figma.formatter";

describe("formatFigma", () => {
  it("produces figma variables collections JSON", () => {
    const json = formatFigma({
      colors: {
        primary: { hex: "#2563eb" },
        secondary: { hex: "#9333ea" },
        accent: { hex: "#f59e0b" },
        neutrals: [{ hex: "#f3f4f6" }, { hex: "#111827" }],
        backgrounds: ["#ffffff"],
        text: ["#111827"],
      },
      typography: {
        scale: [{ size: 16, weight: "400", lineHeight: "1.5" }],
      },
      spacing: { scale: [4, 8, 16] },
      borders: { radii: [{ label: "md", value: 8 }] },
    });

    expect(json).toContain("\"name\": \"Brand\"");
    expect(json).toContain("\"name\": \"Typography\"");
    expect(json).toContain("\"name\": \"Spacing\"");
    expect(json).toContain("\"color/primary\"");
  });
});
