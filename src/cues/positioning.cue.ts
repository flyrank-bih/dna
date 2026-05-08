import { type CueExtractor } from "./cue.protocol";
import { type CompetitiveFingerprintResult } from "./competitive-fingerprint.cue";

interface PositioningInput {
  fingerprint: CompetitiveFingerprintResult;
}

export interface PositioningResult {
  premium: "premium" | "accessible" | "balanced";
  personality: "serious" | "playful" | "balanced";
  narrative: "technical" | "aspirational" | "balanced";
  goToMarket: "product-led" | "sales-led" | "balanced";
  expression: "minimal" | "expressive" | "balanced";
  innovation: "conservative" | "trend-forward" | "balanced";
  evidence: string[];
}

export class PositioningCueExtractor
  implements CueExtractor<[input: PositioningInput], PositioningResult>
{
  extract(input: PositioningInput): PositioningResult {
    const fingerprint = input.fingerprint;

    const premium: PositioningResult["premium"] =
      fingerprint.formality === "formal" ||
      fingerprint.typePosture === "editorial-serif"
        ? "premium"
        : fingerprint.formality === "friendly"
          ? "accessible"
          : "balanced";

    const personality: PositioningResult["personality"] =
      fingerprint.interactionPersonality === "playful"
        ? "playful"
        : fingerprint.interactionPersonality === "reserved"
          ? "serious"
          : "balanced";

    const narrative: PositioningResult["narrative"] =
      fingerprint.messagingPosture === "technical-led"
        ? "technical"
        : fingerprint.messagingPosture === "aspirational"
          ? "aspirational"
          : "balanced";

    const goToMarket: PositioningResult["goToMarket"] =
      fingerprint.compositionStyle === "product-led"
        ? "product-led"
        : fingerprint.proofIntensity === "heavy" ||
            fingerprint.messagingPosture === "credibility-led"
          ? "sales-led"
          : "balanced";

    const expression: PositioningResult["expression"] =
      fingerprint.paletteEnergy === "vivid" ||
      fingerprint.typePosture === "expressive-display"
        ? "expressive"
        : fingerprint.paletteEnergy === "muted" &&
            fingerprint.radiusStyle !== "soft"
          ? "minimal"
          : "balanced";

    const innovation: PositioningResult["innovation"] =
      fingerprint.motionEnergy === "dynamic" ||
      fingerprint.paletteEnergy === "vivid"
        ? "trend-forward"
        : fingerprint.motionEnergy === "calm" &&
            fingerprint.proofIntensity === "heavy"
          ? "conservative"
          : "balanced";

    return {
      premium,
      personality,
      narrative,
      goToMarket,
      expression,
      innovation,
      evidence: [
        `premium:${premium}`,
        `personality:${personality}`,
        `narrative:${narrative}`,
        `gtm:${goToMarket}`,
        `expression:${expression}`,
        `innovation:${innovation}`,
      ],
    };
  }
}

export function extractPositioning(
  input: PositioningInput,
): PositioningResult {
  return new PositioningCueExtractor().extract(input);
}
