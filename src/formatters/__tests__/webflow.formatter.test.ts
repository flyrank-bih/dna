import { describe, expect, it } from "@rstest/core";
import { formatWebflowTheme } from "../webflow.formatter";

describe("formatWebflowTheme", () => {
  it("returns embed and css assets for webflow", () => {
    const files = formatWebflowTheme({
      colors: {
        primary: { hex: "#4f46e5" },
        backgrounds: ["#ffffff"],
        text: ["#111827"],
      },
      typography: { families: [{ name: "Inter" }] },
      spacing: { scale: [4, 8, 16] },
    });

    expect(files["embed.html"]).toContain("flyrank-visual-dna");
    expect(files["variables.css"]).toContain("--fv-primary: #4f46e5;");
  });
});
