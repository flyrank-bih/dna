import { describe, expect, it } from "@rstest/core";
import { formatRemix } from "../remix.formatter";

describe("formatRemix", () => {
  it("produces remix HTML document", () => {
    const html = formatRemix(
      {
        meta: { url: "https://example.com", title: "Example" },
        voice: {
          sampleHeadings: ["Build faster"],
          ctaVerbs: ["Start now"],
          tone: "neutral",
        },
        pageIntent: { type: "landing", signals: ["Fast delivery"] },
        sectionRoles: {
          sections: [{ role: "hero", heading: "Ship products", buttonCount: 2 }],
        },
      },
      {
        name: "Modern",
        tokens: {
          paper: "#fff",
          ink: "#111",
          inkSoft: "#555",
          accent: "#4f46e5",
          rule: "#e5e7eb",
          radius: "8px",
          radiusLg: "16px",
          shadow: "0 8px 24px rgba(0,0,0,0.1)",
          shadowSm: "0 2px 8px rgba(0,0,0,0.08)",
          container: "1100px",
          rhythm: "1.5",
        },
      },
      { vocabId: "modern" },
    );

    expect(html).toContain("<!doctype html>");
    expect(html).toContain("remixed");
    expect(html).toContain("npm i @flyrank/visual-dna");
  });
});
