import { type BrandAiProvider } from "./ai.provider";
import { type BrandAiInsightsResult } from "./brand-insights";

interface SuggestionInput {
  colors?: unknown;
  typography?: unknown;
  composition?: unknown;
  interactionSignature?: unknown;
  messagingArchitecture?: unknown;
  benchmark?: unknown;
}

export interface VisualSuggestion {
  area: string;
  priority: "high" | "medium" | "low";
  recommendation: string;
  rationale: string;
}

export interface VisualSuggestionResult {
  suggestions: VisualSuggestion[];
}

export function buildDeterministicSuggestions(
  input: SuggestionInput,
): VisualSuggestionResult {
  const suggestions: VisualSuggestion[] = [];
  if (input.typography) {
    suggestions.push({
      area: "typography",
      priority: "medium",
      recommendation: "Reduce the visible typography vocabulary to a tighter display/body pairing.",
      rationale: "A compact typography system improves recall and implementation consistency.",
    });
  }
  if (input.composition) {
    suggestions.push({
      area: "composition",
      priority: "high",
      recommendation: "Standardize hero rhythm and section pacing before refining decorative details.",
      rationale: "Composition changes create the clearest perceived improvement in brand clarity.",
    });
  }
  if (input.interactionSignature) {
    suggestions.push({
      area: "interaction",
      priority: "medium",
      recommendation: "Align hover and navigation behaviors into one repeatable interaction signature.",
      rationale: "Consistent motion and reveal patterns make the brand feel more deliberate.",
    });
  }
  if (input.messagingArchitecture) {
    suggestions.push({
      area: "messaging",
      priority: "high",
      recommendation: "Clarify the headline formula and proof sequence so the brand promise lands faster.",
      rationale: "Messaging structure is often the highest leverage brand improvement after core visuals.",
    });
  }
  return { suggestions };
}

export async function generateAiSuggestions(
  provider: BrandAiProvider,
  input: SuggestionInput,
): Promise<VisualSuggestionResult> {
  const response = await provider.generateJson<VisualSuggestionResult>({
    systemPrompt:
      "You are a brand design improvement assistant. Return strict JSON {\"suggestions\":[{\"area\":\"...\",\"priority\":\"high|medium|low\",\"recommendation\":\"...\",\"rationale\":\"...\"}]} with concise, actionable suggestions.",
    userPrompt: `Analyze this extracted brand data and suggest visual improvements:\n${JSON.stringify(
      input,
      null,
      2,
    )}`,
  });
  return response.data;
}

export function toVisualSuggestionsFromInsights(
  insights: BrandAiInsightsResult,
): VisualSuggestionResult {
  const suggestions: VisualSuggestion[] = [];

  for (const recommendation of insights.paletteApproach || []) {
    suggestions.push({
      area: "palette",
      priority: "high",
      recommendation,
      rationale: "Derived from AI palette scaling guidance.",
    });
  }

  for (const recommendation of insights.typographyApproach || []) {
    suggestions.push({
      area: "typography",
      priority: "medium",
      recommendation,
      rationale: "Derived from AI typography system guidance.",
    });
  }

  for (const recommendation of insights.layoutApproach || []) {
    suggestions.push({
      area: "layout",
      priority: "high",
      recommendation,
      rationale: "Derived from AI layout direction guidance.",
    });
  }

  for (const recommendation of insights.voiceApproach || []) {
    suggestions.push({
      area: "messaging",
      priority: "medium",
      recommendation,
      rationale: "Derived from AI voice and messaging guidance.",
    });
  }

  for (const recommendation of insights.brandScalingApproach || []) {
    suggestions.push({
      area: "brand-scaling",
      priority: "high",
      recommendation,
      rationale: "Derived from AI brand scaling strategy guidance.",
    });
  }

  return {
    suggestions: suggestions.slice(0, 16),
  };
}
