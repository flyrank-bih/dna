import { type BrandAiProvider } from "./ai.provider";

interface ContentGenerationInput {
  brief?: string;
  voice?: unknown;
  messagingArchitecture?: unknown;
  brandIdentity?: unknown;
  benchmark?: unknown;
}

export interface GeneratedBrandContent {
  taglines: string[];
  description: string;
  visualConcepts: string[];
  messagingVariants: string[];
}

export function buildDeterministicBrandContent(
  input: ContentGenerationInput,
): GeneratedBrandContent {
  const base = input.brief || "brand";
  return {
    taglines: [
      `Built for clarity, designed for momentum.`,
      `A sharper ${base} story with stronger visual recall.`,
      `Confident brand systems for modern teams.`,
    ],
    description:
      "A focused brand system that balances visual clarity, strong messaging, and implementation-friendly consistency.",
    visualConcepts: [
      "Use a restrained palette with one strong accent and consistent interface rhythm.",
      "Anchor the hero around one clear promise, one proof block, and one primary action.",
      "Apply one repeatable interaction signature across links, buttons, and menus.",
    ],
    messagingVariants: [
      "Outcome-led messaging with proof close to the first CTA.",
      "Credibility-led messaging with stronger comparative evidence.",
      "Technical narrative with a clearer product promise for decision makers.",
    ],
  };
}

export async function generateAiBrandContent(
  provider: BrandAiProvider,
  input: ContentGenerationInput,
): Promise<GeneratedBrandContent> {
  const response = await provider.generateJson<GeneratedBrandContent>({
    systemPrompt:
      "You are a brand content generator. Return strict JSON {\"taglines\":string[],\"description\":string,\"visualConcepts\":string[],\"messagingVariants\":string[]} only.",
    userPrompt: `Generate brand content from this context:\n${JSON.stringify(
      input,
      null,
      2,
    )}`,
  });
  return response.data;
}
