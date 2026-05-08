import { type BrandAiProvider } from "./ai.provider";

export interface BrandInsightInput {
  colors?: unknown;
  typography?: unknown;
  layout?: unknown;
  voice?: unknown;
  composition?: unknown;
  artDirection?: unknown;
  assets?: unknown;
  brandIdentity?: unknown;
  screenshots?: unknown;
  stackIntel?: unknown;
  benchmark?: unknown;
}

export interface BrandAiInsightsResult {
  summary: string;
  priorities: string[];
  paletteApproach: string[];
  typographyApproach: string[];
  layoutApproach: string[];
  brandScalingApproach: string[];
  voiceApproach: string[];
  confidence: number;
  provider: string;
}

export interface PaletteEvolutionResult {
  direction: string;
  actions: string[];
  confidence: number;
  provider: string;
}

export interface TypographySystemResult {
  direction: string;
  actions: string[];
  confidence: number;
  provider: string;
}

export interface LayoutDirectionsResult {
  direction: string;
  actions: string[];
  confidence: number;
  provider: string;
}

export interface BrandScalingResult {
  strategy: string;
  actions: string[];
  confidence: number;
  provider: string;
}

function summarize(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value || {}, null, 2);
}

function detectPresence(value: unknown): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
  return true;
}

export function buildDeterministicBrandInsights(
  input: BrandInsightInput,
): BrandAiInsightsResult {
  const priorities: string[] = [];
  const paletteApproach: string[] = [];
  const typographyApproach: string[] = [];
  const layoutApproach: string[] = [];
  const brandScalingApproach: string[] = [];
  const voiceApproach: string[] = [];

  if (detectPresence(input.layout) || detectPresence(input.composition)) {
    priorities.push("Stabilize layout rhythm before refining secondary visual details.");
    layoutApproach.push(
      "Standardize hero structure and section pacing across core landing surfaces.",
    );
    layoutApproach.push(
      "Keep one primary layout grammar for marketing pages, then vary only proof and CTA modules.",
    );
  }

  if (detectPresence(input.colors)) {
    priorities.push("Tighten palette hierarchy into primary, support, and accent roles.");
    paletteApproach.push(
      "Reserve the strongest chromatic accent for CTA and high-importance emphasis states.",
    );
    paletteApproach.push(
      "Reduce low-value palette drift by mapping colors to semantic roles before adding new hues.",
    );
  }

  if (detectPresence(input.typography)) {
    priorities.push("Reduce typography sprawl and lock a scalable text system.");
    typographyApproach.push(
      "Constrain display/body/mono roles and keep weight changes more meaningful than family changes.",
    );
    typographyApproach.push(
      "Scale brand typography by expanding sizes and spacing rules before adding more families.",
    );
  }

  if (detectPresence(input.voice)) {
    voiceApproach.push(
      "Keep CTA verbs and headline framing consistent so the brand promise scales across campaigns.",
    );
    voiceApproach.push(
      "Define one primary persuasion structure and reuse it across landing, product, and support surfaces.",
    );
  }

  if (detectPresence(input.assets) || detectPresence(input.brandIdentity)) {
    brandScalingApproach.push(
      "Normalize logo lockups, favicon treatment, and recurring media crops before launching new sub-brands or product lines.",
    );
    brandScalingApproach.push(
      "Create reusable asset rules for screenshots, illustrations, and logos so new pages inherit the same visual system.",
    );
  }

  if (detectPresence(input.screenshots)) {
    brandScalingApproach.push(
      "Use extracted screenshots as reference fixtures for ongoing brand QA and prompt-driven recreation workflows.",
    );
  }

  if (brandScalingApproach.length === 0) {
    brandScalingApproach.push(
      "Scale the brand by locking layout, type, and palette roles into a repeatable system before expanding channels.",
    );
  }

  const confidence =
    55 +
    (detectPresence(input.layout) ? 8 : 0) +
    (detectPresence(input.colors) ? 8 : 0) +
    (detectPresence(input.typography) ? 8 : 0) +
    (detectPresence(input.assets) ? 7 : 0) +
    (detectPresence(input.voice) ? 7 : 0);

  return {
    summary:
      "Use deterministic extraction as the operating baseline, then scale the brand by tightening layout, palette, typography, and identity reuse patterns.",
    priorities: [...new Set(priorities)].slice(0, 5),
    paletteApproach: [...new Set(paletteApproach)].slice(0, 4),
    typographyApproach: [...new Set(typographyApproach)].slice(0, 4),
    layoutApproach: [...new Set(layoutApproach)].slice(0, 4),
    brandScalingApproach: [...new Set(brandScalingApproach)].slice(0, 5),
    voiceApproach: [...new Set(voiceApproach)].slice(0, 4),
    confidence: Math.max(0, Math.min(100, confidence)),
    provider: "deterministic",
  };
}

export async function generateAiBrandInsights(
  provider: BrandAiProvider,
  input: BrandInsightInput,
): Promise<BrandAiInsightsResult> {
  const response = await provider.generateJson<BrandAiInsightsResult>({
    systemPrompt:
      "You are a brand systems strategist. Return strict JSON with keys summary, priorities, paletteApproach, typographyApproach, layoutApproach, brandScalingApproach, voiceApproach, confidence, provider. All list fields must be arrays of concise actionable strings.",
    userPrompt: `Generate AI brand scaling insights from this extracted brand context:\n${summarize(
      input,
    )}`,
  });
  return {
    ...response.data,
    provider: response.usage?.model || provider.name,
  };
}

export function toPaletteEvolutionResult(
  insights: BrandAiInsightsResult,
): PaletteEvolutionResult {
  return {
    direction: insights.summary,
    actions: insights.paletteApproach,
    confidence: insights.confidence,
    provider: insights.provider,
  };
}

export function toTypographySystemResult(
  insights: BrandAiInsightsResult,
): TypographySystemResult {
  return {
    direction: insights.summary,
    actions: insights.typographyApproach,
    confidence: insights.confidence,
    provider: insights.provider,
  };
}

export function toLayoutDirectionsResult(
  insights: BrandAiInsightsResult,
): LayoutDirectionsResult {
  return {
    direction: insights.summary,
    actions: insights.layoutApproach,
    confidence: insights.confidence,
    provider: insights.provider,
  };
}

export function toBrandScalingResult(
  insights: BrandAiInsightsResult,
): BrandScalingResult {
  return {
    strategy: insights.summary,
    actions: insights.brandScalingApproach,
    confidence: insights.confidence,
    provider: insights.provider,
  };
}
