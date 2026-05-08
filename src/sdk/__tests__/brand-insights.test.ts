import { describe, expect, it } from "@rstest/core";
import {
  buildDeterministicBrandInsights,
  toBrandScalingResult,
  toLayoutDirectionsResult,
  toPaletteEvolutionResult,
  toTypographySystemResult,
} from "../ai/brand-insights";

describe("brand insights", () => {
  it("builds deterministic AI-ready brand insights from extracted signals", () => {
    const result = buildDeterministicBrandInsights({
      colors: { primary: "#2563eb" },
      typography: { families: ["Inter", "IBM Plex Mono"] },
      layout: { pattern: "split", overallFeel: "systematic-product" },
      voice: { tone: "confident" },
      assets: { logos: [{ src: "https://example.com/logo.svg" }] },
      screenshots: { hero: { path: "screenshots/full-page.png" } },
    });

    expect(result.provider).toBe("deterministic");
    expect(result.priorities.length).toBeGreaterThan(0);
    expect(result.paletteApproach.length).toBeGreaterThan(0);
    expect(result.layoutApproach.length).toBeGreaterThan(0);
    expect(result.brandScalingApproach.length).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(60);
  });

  it("projects deterministic insights into focused AI mini-method outputs", () => {
    const insights = buildDeterministicBrandInsights({
      colors: { primary: "#2563eb" },
      typography: { families: ["Inter"] },
      layout: { pattern: "centered" },
    });

    const palette = toPaletteEvolutionResult(insights);
    const typography = toTypographySystemResult(insights);
    const layout = toLayoutDirectionsResult(insights);
    const scaling = toBrandScalingResult(insights);

    expect(palette.actions.length).toBeGreaterThan(0);
    expect(typography.actions.length).toBeGreaterThan(0);
    expect(layout.actions.length).toBeGreaterThan(0);
    expect(scaling.actions.length).toBeGreaterThan(0);
  });
});
