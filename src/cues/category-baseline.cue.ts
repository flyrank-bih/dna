import { type CueExtractor } from "./cue.protocol";
import { type BrandArchetypeResult } from "./brand-archetype.cue";
import { type CompetitiveFingerprintResult } from "./competitive-fingerprint.cue";
import { type PositioningResult } from "./positioning.cue";

interface CategoryBrandInput {
  hostname: string;
  fingerprint: CompetitiveFingerprintResult;
  positioning: PositioningResult;
  archetype: BrandArchetypeResult;
}

interface CategoryBaselineInput {
  brands: CategoryBrandInput[];
}

export interface CategoryBaselineResult {
  brandCount: number;
  dominantPatterns: Record<string, string>;
  crowdedLanes: string[];
  archetypeDistribution: Record<string, number>;
  positioningDistribution: Record<string, Record<string, number>>;
}

function countBy(values: string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    if (!value) return accumulator;
    accumulator[value] = (accumulator[value] || 0) + 1;
    return accumulator;
  }, {});
}

function dominantValue(values: string[]): string {
  const counts = countBy(values);
  const [winner] = Object.entries(counts).sort((left, right) => right[1] - left[1]);
  return winner?.[0] || "unknown";
}

function crowdedFromDistribution(
  prefix: string,
  distribution: Record<string, number>,
  total: number,
): string[] {
  return Object.entries(distribution)
    .filter(([, count]) => count / Math.max(1, total) >= 0.5)
    .map(([value]) => `${prefix}:${value}`);
}

export class CategoryBaselineCueExtractor
  implements CueExtractor<[input: CategoryBaselineInput], CategoryBaselineResult>
{
  extract(input: CategoryBaselineInput): CategoryBaselineResult {
    const brands = input.brands || [];
    const total = brands.length;

    const dominantPatterns = {
      paletteTemperature: dominantValue(
        brands.map((brand) => brand.fingerprint.paletteTemperature),
      ),
      paletteEnergy: dominantValue(
        brands.map((brand) => brand.fingerprint.paletteEnergy),
      ),
      typePosture: dominantValue(
        brands.map((brand) => brand.fingerprint.typePosture),
      ),
      compositionStyle: dominantValue(
        brands.map((brand) => brand.fingerprint.compositionStyle),
      ),
      messagingPosture: dominantValue(
        brands.map((brand) => brand.fingerprint.messagingPosture),
      ),
      proofIntensity: dominantValue(
        brands.map((brand) => brand.fingerprint.proofIntensity),
      ),
      premium: dominantValue(brands.map((brand) => brand.positioning.premium)),
      expression: dominantValue(
        brands.map((brand) => brand.positioning.expression),
      ),
      archetype: dominantValue(brands.map((brand) => brand.archetype.primary)),
    };

    const archetypeDistribution = countBy(
      brands.map((brand) => brand.archetype.primary),
    );
    const positioningDistribution = {
      premium: countBy(brands.map((brand) => brand.positioning.premium)),
      personality: countBy(brands.map((brand) => brand.positioning.personality)),
      narrative: countBy(brands.map((brand) => brand.positioning.narrative)),
      goToMarket: countBy(brands.map((brand) => brand.positioning.goToMarket)),
      expression: countBy(brands.map((brand) => brand.positioning.expression)),
      innovation: countBy(brands.map((brand) => brand.positioning.innovation)),
    };

    const crowdedLanes = [
      ...crowdedFromDistribution(
        "archetype",
        archetypeDistribution,
        total,
      ),
      ...crowdedFromDistribution(
        "premium",
        positioningDistribution.premium,
        total,
      ),
      ...crowdedFromDistribution(
        "expression",
        positioningDistribution.expression,
        total,
      ),
      ...crowdedFromDistribution(
        "narrative",
        positioningDistribution.narrative,
        total,
      ),
      ...crowdedFromDistribution(
        "composition",
        countBy(brands.map((brand) => brand.fingerprint.compositionStyle)),
        total,
      ),
    ];

    return {
      brandCount: total,
      dominantPatterns,
      crowdedLanes,
      archetypeDistribution,
      positioningDistribution,
    };
  }
}

export function extractCategoryBaseline(
  input: CategoryBaselineInput,
): CategoryBaselineResult {
  return new CategoryBaselineCueExtractor().extract(input);
}
