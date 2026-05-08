import { describe, expect, it } from "@rstest/core";
import { analyzeBrandIdentityAudit } from "../brand-audit";
import { normalizeSdkConfig } from "../config";
import { compareBrandSnapshots, createBrandSnapshot } from "../monitoring/brand-monitor";
import {
  createResponseMeta,
  errorResponse,
  successResponse,
} from "../response";
import { extractStackIntel } from "../../cues/intel.cue";
import {
  extractAssetsSlice,
  extractBrandVoiceSlice,
  extractDesignPaletteSlice,
  extractFontFamiliesSlice,
  extractTechStackSlice,
} from "../modular-extraction";

describe("sdk foundation", () => {
  it("creates standardized success and error envelopes", () => {
    const meta = createResponseMeta({
      durationMs: 12,
      version: "1.0.6",
      source: "sdk.test",
      requestId: "req-1",
    });

    const ok = successResponse({ value: 1 }, meta);
    const fail = errorResponse(
      {
        code: "analysis_failed",
        message: "Failed",
        source: "sdk.test",
        retryable: false,
      },
      meta,
    );

    expect(ok.ok).toBe(true);
    expect(ok.data.value).toBe(1);
    expect(fail.ok).toBe(false);
    expect(fail.error?.code).toBe("analysis_failed");
  });

  it("normalizes nested SDK config without losing extraction defaults", () => {
    const config = normalizeSdkConfig({
      crawl: { pages: 4, responsive: true },
      artifacts: { outputDir: ".sdk-artifacts", emitFiles: false },
      ai: { enabled: true, provider: "openai", apiKey: "test-key" },
      monitoring: { enabled: true },
    });

    expect(config.extract.pages).toBe(4);
    expect(config.extract.responsive).toBe(true);
    expect(config.extract.outputDir).toBe(".sdk-artifacts");
    expect(config.extract.emitFiles).toBe(false);
    expect(config.ai.enabled).toBe(true);
    expect(config.monitoring.enabled).toBe(true);
  });

  it("builds a concise brand audit from extracted-style input", () => {
    const result = analyzeBrandIdentityAudit({
      colors: {
        all: [{ hex: "#111827" }, { hex: "#2563eb" }],
        primary: { hex: "#2563eb" },
      },
      typography: {
        families: [{ name: "Inter" }, "JetBrains Mono"],
      },
      brandIdentity: {
        primaryLogo: { label: "wordmark" },
        themeColor: "#2563eb",
      },
      interactionSignature: {
        consistency: "high",
      },
      messagingArchitecture: {
        proofModules: ["logos", "stats"],
      },
      themeRelationships: {
        hasDarkMode: true,
      },
      composition: {
        heroPattern: "split-hero",
        pacing: "balanced",
      },
    });

    expect(result.summary).toContain("Brand identity");
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.metrics.hasDarkMode).toBe(true);
  });

  it("creates and compares monitoring snapshots", () => {
    const previous = createBrandSnapshot({
      meta: { url: "https://example.com" },
      colors: { primary: { hex: "#111827" } },
      typography: { families: [{ name: "Inter" }] },
      brandIdentity: { primaryLogo: { label: "wordmark" } },
      composition: { heroPattern: "split-hero" },
      messagingArchitecture: { headlineFormula: "outcome-led" },
      interactionSignature: { hoverTreatment: "underline" },
    });

    const current = createBrandSnapshot({
      meta: { url: "https://example.com" },
      colors: { primary: { hex: "#2563eb" } },
      typography: { families: [{ name: "Inter" }, "JetBrains Mono"] },
      brandIdentity: { primaryLogo: { label: "wordmark" } },
      composition: { heroPattern: "feature-grid" },
      messagingArchitecture: { headlineFormula: "credibility-led" },
      interactionSignature: { hoverTreatment: "lift" },
    });

    const diff = compareBrandSnapshots(current, previous);
    expect(diff.changed).toBe(true);
    expect(diff.changes).toContain("primaryColor");
    expect(diff.changes).toContain("heroPattern");
  });

  it("expands stack intel categories for SDK consumers", () => {
    const intel = extractStackIntel({
      scripts: [
        "https://cdn.segment.io/analytics.js",
        "https://js.stripe.com/v3",
        "https://static.intercomcdn.com/widget.js",
        "https://example.vercel.app/_vercel/insights/script.js",
      ],
      metas: [
        { name: "generator", content: "Next.js app" },
      ],
      classNameSample: ["tailwind", "__next", "radix-dropdown"],
    });

    expect(intel.analytics).toContain("segment");
    expect(intel.frontend).toContain("next.js");
    expect(intel.hosting).toContain("vercel");
    expect(intel.designSystem).toContain("tailwindcss");
    expect(intel.support).toContain("intercom");
    expect(intel.commerce).toContain("stripe");
    expect(intel.evidence.scripts.length).toBeGreaterThan(0);
  });

  it("builds modular palette, font, asset, voice, and stack slices", () => {
    const design = {
      meta: { url: "https://example.com", title: "Example" },
      colors: {
        primary: { hex: "#2563eb" },
        secondary: { hex: "#111827" },
        accent: { hex: "#22c55e" },
        neutrals: [{ hex: "#f3f4f6" }],
        backgrounds: ["#ffffff"],
        text: ["#111827"],
        all: [
          { hex: "#2563eb", count: 10 },
          { hex: "#111827", count: 8 },
          { hex: "#22c55e", count: 2 },
        ],
      },
      typography: {
        families: [{ name: "Inter", count: 12, usage: "all" }],
      },
      fonts: {
        fonts: [
          {
            family: "Inter",
            provider: "google-fonts",
            assetUrls: ["https://fonts.gstatic.com/s/inter.woff2"],
            weights: ["400", "600"],
            styles: ["normal"],
            license: "open-source (provider-dependent)",
          },
        ],
        googleFontsUrl:
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap",
        links: {
          googleFonts: [
            "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap",
          ],
          cdn: ["https://fonts.gstatic.com/s/inter.woff2"],
          selfHosted: [],
          all: ["https://fonts.gstatic.com/s/inter.woff2"],
          stylesheets: [
            "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap",
          ],
        },
        systemFonts: ["Arial"],
      },
      brandIdentity: {
        primaryLogo: {
          src: "https://example.com/logo.svg",
          kind: "logo",
          label: "Example logo",
        },
        alternateLogos: [],
        favicons: [{ src: "https://example.com/favicon.ico", kind: "favicon" }],
        manifest: "https://example.com/site.webmanifest",
        themeColor: "#2563eb",
      },
      voice: {
        tone: "friendly",
        pronoun: "we→you",
        headingStyle: "Sentence case",
        headingLengthClass: "balanced",
        ctaVerbs: [{ value: "start", count: 4 }],
        buttonPatterns: [{ value: "start free", count: 2 }],
        sampleHeadings: ["Build faster with design clarity"],
      },
      stackIntel: {
        frontend: ["next.js", "react"],
        designSystem: ["tailwindcss"],
        commerce: ["shopify"],
        observability: ["datadog"],
        support: ["zendesk"],
        signals: { scriptCount: 10, metaCount: 4 },
      },
      _raw: {
        light: {
          logos: [
            {
              src: "https://example.com/logo.svg",
              alt: "Example logo",
              width: 120,
              height: 32,
              format: "svg",
              sourceType: "image",
            },
          ],
          images: [
            {
              src: "https://example.com/hero.jpg",
              alt: "Hero visual",
              width: 1200,
              height: 800,
              naturalWidth: 1200,
              naturalHeight: 800,
              format: "jpg",
              transferSize: 180000,
            },
          ],
          fontData: {
            stylesheetLinks: [
              "https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap",
            ],
          },
        },
      },
    };

    const palette = extractDesignPaletteSlice(design);
    const fonts = extractFontFamiliesSlice(design);
    const assets = extractAssetsSlice(design);
    const voice = extractBrandVoiceSlice(design);
    const stack = extractTechStackSlice(design);

    expect(palette.palette.primary).toBe("#2563eb");
    expect(palette.score.overall).toBeGreaterThan(50);
    expect(fonts.families[0].family).toBe("Inter");
    expect(assets.logos[0].url).toBe("https://example.com/logo.svg");
    expect(assets.fonts.length).toBeGreaterThan(0);
    expect(voice.voice.tone).toBe("friendly");
    expect(stack.summary.some((entry) => entry.includes("frontend"))).toBe(true);
  });
});
