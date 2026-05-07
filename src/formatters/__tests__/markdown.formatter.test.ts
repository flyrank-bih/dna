import { describe, expect, it } from "@rstest/core";
import { formatMarkdown, MarkdownFormatter } from "../markdown.formatter";

describe("markdown formatter", () => {
  const design = {
    meta: {
      title: "Example",
      url: "https://example.com",
      timestamp: Date.now(),
      elementCount: 100,
      pagesAnalyzed: 1,
    },
    colors: {
      primary: { hex: "#2563eb", rgb: { r: 37, g: 99, b: 235 }, hsl: { h: 221, s: 83, l: 53 }, count: 10 },
      secondary: undefined,
      accent: undefined,
      neutrals: [],
      backgrounds: ["#ffffff"],
      text: ["#111827"],
      gradients: [],
      all: [],
    },
    typography: {
      families: [{ name: "Inter", usage: "body", count: 40 }],
      scale: [{ size: 16, weight: 400, lineHeight: 1.5, letterSpacing: "normal", tags: ["body"] }],
      headings: [],
      body: { size: 16, weight: 400, lineHeight: 1.5 },
      weights: [{ weight: "400", count: 40 }],
    },
    spacing: { base: 8, scale: [4, 8, 16] },
    shadows: { values: [] },
    borders: { radii: [] },
    variables: {},
    breakpoints: [],
    animations: { transitions: [], keyframes: [], easings: [], durations: [] },
    components: {},
  };

  it("renders markdown from function API", () => {
    const markdown = formatMarkdown(design);
    expect(markdown).toContain("# Design Language: Example");
    expect(markdown).toContain("## Color Palette");
  });

  it("renders markdown from class API", () => {
    const markdown = new MarkdownFormatter(design).format();
    expect(markdown).toContain("## Quick Start");
  });
});
