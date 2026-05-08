import { type CueExtractor } from "./cue.protocol";
import { type CategoryBaselineResult } from "./category-baseline.cue";
import { type BrandArchetypeResult } from "./brand-archetype.cue";
import { type CompetitiveFingerprintResult } from "./competitive-fingerprint.cue";
import { type PositioningResult } from "./positioning.cue";

interface WhiteSpaceBrandInput {
  hostname: string;
  fingerprint: CompetitiveFingerprintResult;
  positioning: PositioningResult;
  archetype: BrandArchetypeResult;
}

interface WhiteSpaceInput {
  brands: WhiteSpaceBrandInput[];
  baseline: CategoryBaselineResult;
}

export interface WhiteSpaceOpportunity {
  lane: string;
  rationale: string;
  suggestedMoves: string[];
}

export interface WhiteSpaceResult {
  opportunities: WhiteSpaceOpportunity[];
}

function countValues(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] || 0) + 1;
    return accumulator;
  }, {});
}

function leastUsed(values: string[]): string[] {
  const counts = Object.entries(countValues(values)).sort(
    (left, right) => left[1] - right[1],
  );
  if (!counts.length) return [];
  const minimum = counts[0][1];
  return counts
    .filter(([, count]) => count === minimum)
    .map(([value]) => value);
}

export class WhiteSpaceOpportunitiesCueExtractor
  implements CueExtractor<[input: WhiteSpaceInput], WhiteSpaceResult>
{
  extract(input: WhiteSpaceInput): WhiteSpaceResult {
    const brands = input.brands || [];
    if (!brands.length) return { opportunities: [] };

    const rareArchetypes = leastUsed(brands.map((brand) => brand.archetype.primary));
    const rareExpressions = leastUsed(
      brands.map((brand) => brand.positioning.expression),
    );
    const rareNarratives = leastUsed(
      brands.map((brand) => brand.positioning.narrative),
    );
    const rareCompositions = leastUsed(
      brands.map((brand) => brand.fingerprint.compositionStyle),
    );
    const rareInteractions = leastUsed(
      brands.map((brand) => brand.fingerprint.interactionPersonality),
    );

    const opportunities: WhiteSpaceOpportunity[] = [];

    for (const archetype of rareArchetypes.slice(0, 2)) {
      opportunities.push({
        lane: `archetype:${archetype}`,
        rationale: `This archetype is underrepresented across ${input.baseline.brandCount} analyzed brands.`,
        suggestedMoves: [
          `Lean into the ${archetype} narrative more explicitly across identity and hero framing.`,
          "Reinforce the lane with proof modules and interaction patterns that support the position.",
        ],
      });
    }

    for (const expression of rareExpressions.slice(0, 1)) {
      opportunities.push({
        lane: `expression:${expression}`,
        rationale: `Most brands cluster around ${input.baseline.dominantPatterns.expression}, leaving ${expression} less occupied.`,
        suggestedMoves: [
          `Push the visual system toward ${expression} through palette energy, type posture, and radius choices.`,
          "Keep the shift coherent across marketing pages and product shell surfaces.",
        ],
      });
    }

    for (const narrative of rareNarratives.slice(0, 1)) {
      opportunities.push({
        lane: `narrative:${narrative}`,
        rationale: `Messaging in this cohort mostly trends toward ${input.baseline.dominantPatterns.messagingPosture}; ${narrative} is less saturated.`,
        suggestedMoves: [
          `Adopt a clearer ${narrative} headline formula and proof system.`,
          "Map section order and CTA language to that narrative consistently.",
        ],
      });
    }

    for (const composition of rareCompositions.slice(0, 1)) {
      opportunities.push({
        lane: `composition:${composition}`,
        rationale: `The category baseline favors ${input.baseline.dominantPatterns.compositionStyle}, so ${composition} creates visual separation.`,
        suggestedMoves: [
          `Reframe the hero and section pacing around ${composition} composition cues.`,
          "Back the composition shift with matching art direction and proof placement.",
        ],
      });
    }

    for (const interaction of rareInteractions.slice(0, 1)) {
      opportunities.push({
        lane: `interaction:${interaction}`,
        rationale: `${interaction} interaction behavior is uncommon in this cohort and can become a memorable brand signature.`,
        suggestedMoves: [
          `Standardize hover, navigation, and reveal behavior around a ${interaction} interaction personality.`,
          "Use motion consistently so the interaction pattern feels intentional rather than accidental.",
        ],
      });
    }

    return {
      opportunities: opportunities.slice(0, 6),
    };
  }
}

export function extractWhitespaceOpportunities(
  input: WhiteSpaceInput,
): WhiteSpaceResult {
  return new WhiteSpaceOpportunitiesCueExtractor().extract(input);
}
