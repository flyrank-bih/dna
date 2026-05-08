import { type CueExtractor } from "./cue.protocol";
import { type CompetitiveFingerprintResult } from "./competitive-fingerprint.cue";
import { type PositioningResult } from "./positioning.cue";

interface BrandArchetypeInput {
  fingerprint: CompetitiveFingerprintResult;
  positioning: PositioningResult;
}

export interface BrandArchetypeResult {
  primary: string;
  alternates: string[];
  confidence: number;
  evidence: string[];
}

interface ArchetypeCandidate {
  name: string;
  score: number;
  evidence: string[];
}

export class BrandArchetypeCueExtractor
  implements CueExtractor<[input: BrandArchetypeInput], BrandArchetypeResult>
{
  extract(input: BrandArchetypeInput): BrandArchetypeResult {
    const { fingerprint, positioning } = input;
    const candidates: ArchetypeCandidate[] = [
      {
        name: "enterprise-trust",
        score:
          (positioning.premium === "premium" ? 0.35 : 0) +
          (fingerprint.proofIntensity === "heavy" ? 0.25 : 0) +
          (positioning.goToMarket === "sales-led" ? 0.2 : 0) +
          (fingerprint.interactionPersonality === "confident" ? 0.1 : 0),
        evidence: ["premium", "proof-heavy", "sales-led"],
      },
      {
        name: "premium-editorial",
        score:
          (fingerprint.typePosture === "editorial-serif" ? 0.35 : 0) +
          (fingerprint.compositionStyle === "editorial" ? 0.25 : 0) +
          (positioning.premium === "premium" ? 0.2 : 0) +
          (positioning.expression !== "minimal" ? 0.1 : 0),
        evidence: ["editorial type", "editorial pacing", "premium posture"],
      },
      {
        name: "developer-minimal",
        score:
          (positioning.narrative === "technical" ? 0.3 : 0) +
          (positioning.expression === "minimal" ? 0.25 : 0) +
          (fingerprint.typePosture === "technical-mixed" ? 0.2 : 0) +
          (fingerprint.compositionStyle === "product-led" ? 0.1 : 0),
        evidence: ["technical narrative", "minimal expression", "product-led"],
      },
      {
        name: "playful-product",
        score:
          (positioning.personality === "playful" ? 0.3 : 0) +
          (fingerprint.paletteEnergy === "vivid" ? 0.2 : 0) +
          (positioning.goToMarket === "product-led" ? 0.2 : 0) +
          (positioning.expression === "expressive" ? 0.15 : 0),
        evidence: ["playful interaction", "vivid palette", "product-led"],
      },
      {
        name: "bold-disruptor",
        score:
          (positioning.innovation === "trend-forward" ? 0.3 : 0) +
          (fingerprint.paletteEnergy === "vivid" ? 0.2 : 0) +
          (fingerprint.motionEnergy === "dynamic" ? 0.2 : 0) +
          (fingerprint.messagingPosture !== "balanced" ? 0.15 : 0),
        evidence: ["trend-forward", "dynamic motion", "assertive messaging"],
      },
    ];

    const ranked = candidates.sort((left, right) => right.score - left.score);
    const primary = ranked[0];
    const alternates = ranked
      .slice(1)
      .filter((candidate) => candidate.score > 0)
      .slice(0, 2)
      .map((candidate) => candidate.name);

    return {
      primary: primary?.name || "balanced-modern",
      alternates,
      confidence: primary ? Math.min(1, primary.score) : 0.35,
      evidence: primary?.evidence || ["balanced cues"],
    };
  }
}

export function extractBrandArchetype(
  input: BrandArchetypeInput,
): BrandArchetypeResult {
  return new BrandArchetypeCueExtractor().extract(input);
}
