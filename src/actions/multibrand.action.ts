import { extractDesignLanguage, type ExtractDesignLanguageOptions } from "..";
import { extractBrandArchetype, type BrandArchetypeResult } from "../cues/brand-archetype.cue";
import { extractCategoryBaseline, type CategoryBaselineResult } from "../cues/category-baseline.cue";
import {
  extractCompetitiveFingerprint,
  type CompetitiveFingerprintResult,
} from "../cues/competitive-fingerprint.cue";
import {
  extractDistinctiveness,
  type DistinctivenessResult,
} from "../cues/distinctiveness.cue";
import { extractPositioning, type PositioningResult } from "../cues/positioning.cue";
import {
  extractWhitespaceOpportunities,
  type WhiteSpaceResult,
} from "../cues/whitespace-opportunities.cue";
import { type ActionHandler } from "./action.protocol";

interface BrandDesignSnapshot {
  colors: {
    primary?: { hex?: string };
    secondary?: { hex?: string };
    all?: Array<{ hex?: string }>;
  };
  typography: { families?: Array<{ name?: string } | string> };
  spacing: { base?: number };
  accessibility?: { score?: number };
  shadows: { values?: Array<{ raw?: string }> };
  borders: { radii?: Array<{ value?: number | string }> };
  variables?: Record<string, unknown>;
  components?: Record<string, unknown>;
  motion?: {
    durations?: Array<number | { value?: number }>;
    feel?: string;
  };
  composition?: {
    heroPattern?: string;
    density?: string;
    pacing?: string;
    emphasisPatterns?: string[];
  };
  messagingArchitecture?: {
    headlineFormula?: string;
    proofModules?: string[];
  };
  interactionSignature?: {
    hoverTreatment?: string;
    navigationReveal?: string;
    consistency?: string;
  };
  materialLanguage?: {
    label?: string;
  };
  componentLibrary?: {
    library?: string;
  };
  brandIdentity?: {
    themeColor?: string | null;
  };
}

export interface BrandBenchmarkEntry {
  url: string;
  hostname: string;
  design?: BrandDesignSnapshot;
  summary?: {
    primaryColor: string | null;
    secondaryColor: string | null;
    fonts: string[];
    spacingBase: number | null;
    accessibilityScore: number | null;
    componentCount: number;
    variableCount: number;
  };
  fingerprint?: CompetitiveFingerprintResult;
  distinctiveness?: DistinctivenessResult;
  positioning?: PositioningResult;
  archetype?: BrandArchetypeResult;
  evidence?: string[];
  error?: string;
}

type CompleteBrandEntry = BrandBenchmarkEntry & {
  design: NonNullable<BrandBenchmarkEntry["design"]>;
  summary: NonNullable<BrandBenchmarkEntry["summary"]>;
  fingerprint: CompetitiveFingerprintResult;
  distinctiveness: DistinctivenessResult;
  positioning: PositioningResult;
  archetype: BrandArchetypeResult;
  error?: undefined;
};

export interface BrandSimilarityEdge {
  left: string;
  right: string;
  score: number;
  sharedAxes: string[];
}

export interface BrandBenchmarkResult {
  brands: BrandBenchmarkEntry[];
  similarityMatrix: BrandSimilarityEdge[];
  baseline: CategoryBaselineResult;
  whitespace: WhiteSpaceResult;
  topSharedPatterns: string[];
  topUniqueSignals: Array<{ hostname: string; signals: string[] }>;
  errors: Array<{ url: string; hostname: string; error: string }>;
}

function countVariableEntries(variables: Record<string, unknown> = {}): number {
  return Object.values(variables).reduce<number>((sum: number, entry: unknown) => {
    if (!entry || typeof entry !== "object") return sum;
    return sum + Object.keys(entry as Record<string, unknown>).length;
  }, 0);
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function getFontNames(
  families: Array<{ name?: string } | string> = [],
): string[] {
  return families
    .map((family) => (typeof family === "string" ? family : family.name || ""))
    .filter(Boolean);
}

function summarizeDesign(design: BrandDesignSnapshot): BrandBenchmarkEntry["summary"] {
  return {
    primaryColor: design.colors.primary?.hex || null,
    secondaryColor: design.colors.secondary?.hex || null,
    fonts: getFontNames(design.typography.families),
    spacingBase: typeof design.spacing.base === "number" ? design.spacing.base : null,
    accessibilityScore:
      typeof design.accessibility?.score === "number"
        ? design.accessibility.score
        : null,
    componentCount: Object.keys(design.components || {}).length,
    variableCount: countVariableEntries(design.variables || {}),
  };
}

function buildFingerprint(
  design: BrandDesignSnapshot,
): CompetitiveFingerprintResult {
  return extractCompetitiveFingerprint({
    colors: design.colors,
    typography: design.typography,
    spacing: design.spacing,
    borders: design.borders,
    shadows: design.shadows,
    motion: design.motion,
    composition: design.composition,
    messagingArchitecture: design.messagingArchitecture,
    interactionSignature: design.interactionSignature,
    materialLanguage: design.materialLanguage,
    componentLibrary: design.componentLibrary,
  });
}

function fingerprintEntries(
  brands: BrandBenchmarkEntry[],
): CompleteBrandEntry[] {
  return brands.filter((brand): brand is CompleteBrandEntry => {
    return Boolean(
      !brand.error &&
        brand.design &&
        brand.summary &&
        brand.fingerprint &&
        brand.distinctiveness &&
        brand.positioning &&
        brand.archetype,
    );
  });
}

function buildSimilarityMatrix(brands: CompleteBrandEntry[]): BrandSimilarityEdge[] {
  const axes: Array<keyof CompetitiveFingerprintResult> = [
    "paletteTemperature",
    "paletteEnergy",
    "typePosture",
    "spacingDensity",
    "radiusStyle",
    "motionEnergy",
    "compositionStyle",
    "messagingPosture",
    "proofIntensity",
    "interactionPersonality",
    "formality",
  ];

  const edges: BrandSimilarityEdge[] = [];
  for (let leftIndex = 0; leftIndex < brands.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < brands.length; rightIndex += 1) {
      const left = brands[leftIndex];
      const right = brands[rightIndex];
      const sharedAxes = axes.filter(
        (axis) => left.fingerprint[axis] === right.fingerprint[axis],
      );
      const score = sharedAxes.length / axes.length;
      edges.push({
        left: left.hostname,
        right: right.hostname,
        score,
        sharedAxes,
      });
    }
  }
  return edges.sort((left, right) => right.score - left.score);
}

function buildTopSharedPatterns(
  baseline: CategoryBaselineResult,
): string[] {
  return [
    `palette:${baseline.dominantPatterns.paletteTemperature}/${baseline.dominantPatterns.paletteEnergy}`,
    `type:${baseline.dominantPatterns.typePosture}`,
    `composition:${baseline.dominantPatterns.compositionStyle}`,
    `messaging:${baseline.dominantPatterns.messagingPosture}`,
    `expression:${baseline.dominantPatterns.expression}`,
    `archetype:${baseline.dominantPatterns.archetype}`,
  ];
}

function buildTopUniqueSignals(
  brands: CompleteBrandEntry[],
): Array<{ hostname: string; signals: string[] }> {
  return brands
    .map((brand) => ({
      hostname: brand.hostname,
      signals: brand.distinctiveness.uniqueSignals.slice(0, 4),
    }))
    .sort(
      (left, right) =>
        (right.signals.length || 0) - (left.signals.length || 0),
    );
}

export class CompareBrandsAction
  implements
    ActionHandler<
      [urls: string[], options?: ExtractDesignLanguageOptions],
      Promise<BrandBenchmarkResult>
    >
{
  async run(
    urls: string[],
    options: ExtractDesignLanguageOptions = {},
  ): Promise<BrandBenchmarkResult> {
    const brands: BrandBenchmarkEntry[] = [];

    for (const url of urls) {
      const normalized = url.startsWith("http") ? url : `https://${url}`;
      const hostname = getHostname(normalized);
      try {
        const design = (await extractDesignLanguage(
          normalized,
          options,
        )) as unknown as BrandDesignSnapshot;
        const fingerprint = buildFingerprint(design);
        const positioning = extractPositioning({ fingerprint });
        const archetype = extractBrandArchetype({
          fingerprint,
          positioning,
        });
        const summary = summarizeDesign(design);
        brands.push({
          url: normalized,
          hostname,
          design,
          summary,
          fingerprint,
          positioning,
          archetype,
          evidence: [
            ...(fingerprint.evidence || []),
            ...(archetype.evidence || []),
            ...(positioning.evidence || []),
          ],
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        brands.push({ url: normalized, hostname, error: message });
      }
    }

    const provisional = brands
      .filter(
        (brand): brand is BrandBenchmarkEntry & {
          fingerprint: CompetitiveFingerprintResult;
          positioning: PositioningResult;
          archetype: BrandArchetypeResult;
          design: BrandDesignSnapshot;
          summary: NonNullable<BrandBenchmarkEntry["summary"]>;
        } =>
          !brand.error &&
          Boolean(
            brand.design &&
              brand.summary &&
              brand.fingerprint &&
              brand.positioning &&
              brand.archetype,
          ),
      )
      .map((brand) => ({
        ...brand,
        distinctiveness: extractDistinctiveness({
          brand: {
            hostname: brand.hostname,
            fingerprint: brand.fingerprint,
          },
          cohort: brands
            .filter(
              (entry): entry is BrandBenchmarkEntry & {
                fingerprint: CompetitiveFingerprintResult;
              } => !entry.error && Boolean(entry.fingerprint),
            )
            .map((entry) => ({
              hostname: entry.hostname,
              fingerprint: entry.fingerprint,
            })),
        }),
      }));

    const valid = fingerprintEntries(
      brands.map((brand) => {
        const match = provisional.find(
          (candidate) => candidate.hostname === brand.hostname,
        );
        return match || brand;
      }),
    );

    const baseline = extractCategoryBaseline({
      brands: valid.map((brand) => ({
        hostname: brand.hostname,
        fingerprint: brand.fingerprint,
        positioning: brand.positioning,
        archetype: brand.archetype,
      })),
    });

    const whitespace = extractWhitespaceOpportunities({
      brands: valid.map((brand) => ({
        hostname: brand.hostname,
        fingerprint: brand.fingerprint,
        positioning: brand.positioning,
        archetype: brand.archetype,
      })),
      baseline,
    });

    const similarityMatrix = buildSimilarityMatrix(valid);
    const errors = brands
      .filter(
        (brand): brand is BrandBenchmarkEntry & { error: string } =>
          typeof brand.error === "string",
      )
      .map((brand) => ({
        url: brand.url,
        hostname: brand.hostname,
        error: brand.error,
      }));

    return {
      brands: [
        ...valid,
        ...brands.filter((brand) => brand.error),
      ],
      similarityMatrix,
      baseline,
      whitespace,
      topSharedPatterns: buildTopSharedPatterns(baseline),
      topUniqueSignals: buildTopUniqueSignals(valid),
      errors,
    };
  }
}

export async function compareBrands(
  urls: string[],
  options: ExtractDesignLanguageOptions = {},
): Promise<BrandBenchmarkResult> {
  return new CompareBrandsAction().run(urls, options);
}

export class BrandMatrixMarkdownFormatter
  implements ActionHandler<[result: BrandBenchmarkResult], string>
{
  run(result: BrandBenchmarkResult): string {
    const valid = fingerprintEntries(result.brands);
    const lines: string[] = [];

    lines.push("# Competitive Brand Benchmark");
    lines.push("");
    lines.push(`Brands analyzed: ${valid.length}`);
    lines.push("");
    lines.push("## Baseline");
    lines.push("");
    lines.push(
      `- Dominant palette: ${result.baseline.dominantPatterns.paletteTemperature}/${result.baseline.dominantPatterns.paletteEnergy}`,
    );
    lines.push(
      `- Dominant type posture: ${result.baseline.dominantPatterns.typePosture}`,
    );
    lines.push(
      `- Dominant composition: ${result.baseline.dominantPatterns.compositionStyle}`,
    );
    lines.push(
      `- Dominant messaging: ${result.baseline.dominantPatterns.messagingPosture}`,
    );
    lines.push(
      `- Crowded lanes: ${result.baseline.crowdedLanes.join(", ") || "none"}`,
    );
    lines.push("");
    lines.push("## Brand Matrix");
    lines.push("");
    lines.push(
      `| Brand | Archetype | Distinctiveness | Sameness Risk | Palette | Composition | Messaging |`,
    );
    lines.push("|---|---|---:|---:|---|---|---|");
    for (const brand of valid) {
      lines.push(
        `| ${brand.hostname} | ${brand.archetype.primary} | ${brand.distinctiveness.overall.toFixed(2)} | ${brand.distinctiveness.samenessRisk.toFixed(2)} | ${brand.fingerprint.paletteTemperature}/${brand.fingerprint.paletteEnergy} | ${brand.fingerprint.compositionStyle} | ${brand.fingerprint.messagingPosture} |`,
      );
    }
    lines.push("");
    lines.push("## Strongest Similarities");
    lines.push("");
    for (const edge of result.similarityMatrix.slice(0, 5)) {
      lines.push(
        `- ${edge.left} vs ${edge.right}: ${edge.score.toFixed(2)} (${edge.sharedAxes.join(", ")})`,
      );
    }
    lines.push("");
    lines.push("## White Space Opportunities");
    lines.push("");
    for (const opportunity of result.whitespace.opportunities) {
      lines.push(`- ${opportunity.lane}: ${opportunity.rationale}`);
    }
    lines.push("");
    lines.push("## Unique Signals");
    lines.push("");
    for (const entry of result.topUniqueSignals.slice(0, 8)) {
      lines.push(`- ${entry.hostname}: ${entry.signals.join(", ") || "none"}`);
    }
    if (result.errors.length > 0) {
      lines.push("");
      lines.push("## Errors");
      lines.push("");
      for (const entry of result.errors) {
        lines.push(`- ${entry.url}: ${entry.error}`);
      }
    }
    return lines.join("\n");
  }
}

export function formatBrandMatrix(result: BrandBenchmarkResult): string {
  return new BrandMatrixMarkdownFormatter().run(result);
}

export function formatBrandMatrixHtml(result: BrandBenchmarkResult): string {
  const valid = fingerprintEntries(result.brands);
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Competitive Brand Benchmark</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,sans-serif; background:#0a0a0a; color:#e5e5e5; padding:40px; }
  h1 { font-size:28px; color:#fff; margin-bottom:24px; }
  h2 { font-size:18px; color:#fff; margin:32px 0 12px; }
  p, li { color:#c7c7c7; }
  table { width:100%; border-collapse:collapse; margin:12px 0; }
  th { text-align:left; padding:10px 12px; background:#141414; color:#888; font-size:12px; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid #222; }
  td { padding:10px 12px; border-bottom:1px solid #1a1a1a; font-size:13px; }
  tr:hover td { background:#111; }
  code { background:#1e1e2e; padding:2px 6px; border-radius:4px; font-size:12px; color:#a78bfa; }
</style></head><body>
<h1>Competitive Brand Benchmark</h1>
<p>${valid.length} brands analyzed</p>
<h2>Baseline</h2>
<ul>
  <li>Palette: <code>${result.baseline.dominantPatterns.paletteTemperature}/${result.baseline.dominantPatterns.paletteEnergy}</code></li>
  <li>Type posture: <code>${result.baseline.dominantPatterns.typePosture}</code></li>
  <li>Composition: <code>${result.baseline.dominantPatterns.compositionStyle}</code></li>
  <li>Messaging: <code>${result.baseline.dominantPatterns.messagingPosture}</code></li>
</ul>
<h2>Brand Matrix</h2>
<table>
  <tr><th>Brand</th><th>Archetype</th><th>Distinctiveness</th><th>Sameness</th><th>Palette</th><th>Composition</th><th>Messaging</th></tr>
  ${valid
    .map(
      (brand) =>
        `<tr><td>${brand.hostname}</td><td>${brand.archetype.primary}</td><td>${brand.distinctiveness.overall.toFixed(2)}</td><td>${brand.distinctiveness.samenessRisk.toFixed(2)}</td><td>${brand.fingerprint.paletteTemperature}/${brand.fingerprint.paletteEnergy}</td><td>${brand.fingerprint.compositionStyle}</td><td>${brand.fingerprint.messagingPosture}</td></tr>`,
    )
    .join("")}
</table>
<h2>White Space</h2>
<ul>
  ${result.whitespace.opportunities
    .map(
      (opportunity) =>
        `<li><strong>${opportunity.lane}</strong>: ${opportunity.rationale}</li>`,
    )
    .join("")}
</ul>
</body></html>`;
}
