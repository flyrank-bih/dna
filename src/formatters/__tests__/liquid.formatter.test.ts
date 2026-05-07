import { describe, expect, it } from "@rstest/core";
import { formatLiquidTheme } from "../liquid.formatter";

describe("formatLiquidTheme", () => {
  it("generates a liquid section snippet with tokenized variables", () => {
    const files = formatLiquidTheme({
      colors: {
        primary: { hex: "#2563eb" },
        backgrounds: ["#ffffff"],
        text: ["#111827"],
      },
      typography: {
        families: [{ name: "Inter" }],
      },
    });

    expect(files["sections/flyrank-visual-dna.liquid"]).toContain("{% schema %}");
    expect(files["sections/flyrank-visual-dna.liquid"]).toContain("flyrank-visual-dna");
    expect(files["snippets/flyrank-visual-dna.css.liquid"]).toContain("--fv-primary: #2563eb;");
  });
});
