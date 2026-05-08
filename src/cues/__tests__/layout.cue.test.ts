import { describe, expect, it } from "@rstest/core";
import { extractLayout } from "../layout.cue";

describe("layout cue", () => {
  it("detects split/product-style layouts from grid, media, and hero evidence", () => {
    const result = extractLayout({
      computedStyles: [
        {
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          area: 220000,
          hasText: true,
          maxWidth: "1200px",
        },
        {
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          area: 180000,
          hasText: false,
          maxWidth: "1200px",
        },
        {
          tag: "img",
          area: 140000,
          hasText: false,
          backgroundImage: "none",
        },
      ],
      sections: [
        {
          role: "hero",
          heading: "Build brand systems that scale",
          text: "A focused platform for visual brand extraction and analysis.",
          buttonCount: 2,
          bounds: { y: 40, h: 520 },
        },
        {
          role: "feature-grid",
          cardCount: 6,
        },
      ],
      images: [{ width: 1440, height: 900, format: "png" }],
    });

    expect(result.pattern).not.toBe("unknown");
    expect(result.hero).not.toBe("unknown");
    expect(result.grid.hasGrid).toBe(true);
    expect(result.confidence).toBeGreaterThan(50);
  });
});
