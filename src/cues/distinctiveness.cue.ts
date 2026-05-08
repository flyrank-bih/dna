import { type CueExtractor } from "./cue.protocol";
import { type CompetitiveFingerprintResult } from "./competitive-fingerprint.cue";

interface DistinctivenessInput {
  brand: {
    hostname?: string;
    fingerprint: CompetitiveFingerprintResult;
  };
  cohort: Array<{
    hostname?: string;
    fingerprint: CompetitiveFingerprintResult;
  }>;
}

export interface DistinctivenessResult {
  overall: number;
  samenessRisk: number;
  signatureStrength: number;
  uniqueSignals: string[];
  commonSignals: string[];
  axisScores: Record<string, number>;
}

const AXES: Array<keyof CompetitiveFingerprintResult> = [
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isNumericAxis(
  key: keyof CompetitiveFingerprintResult,
): key is "signatureStrength" {
  return key === "signatureStrength";
}

export class DistinctivenessCueExtractor
  implements CueExtractor<[input: DistinctivenessInput], DistinctivenessResult>
{
  extract(input: DistinctivenessInput): DistinctivenessResult {
    const cohort = input.cohort.filter(
      (entry) => entry.hostname !== input.brand.hostname,
    );
    const axisScores: Record<string, number> = {};

    if (!cohort.length) {
      for (const axis of AXES) axisScores[axis] = 1;
      return {
        overall: 1,
        samenessRisk: 0,
        signatureStrength: input.brand.fingerprint.signatureStrength,
        uniqueSignals: AXES.map(
          (axis) => `${axis}:${String(input.brand.fingerprint[axis])}`,
        ),
        commonSignals: [],
        axisScores,
      };
    }

    for (const axis of AXES) {
      const brandValue = input.brand.fingerprint[axis];
      if (isNumericAxis(axis)) continue;
      const sameCount = cohort.filter(
        (entry) => entry.fingerprint[axis] === brandValue,
      ).length;
      const score = clamp(1 - sameCount / cohort.length, 0, 1);
      axisScores[axis] = score;
    }

    const overall =
      Object.values(axisScores).reduce((sum, value) => sum + value, 0) /
      Math.max(1, Object.values(axisScores).length);

    const samenessRisk = clamp(1 - overall, 0, 1);
    const uniqueSignals = Object.entries(axisScores)
      .filter(([, value]) => value >= 0.66)
      .map(
        ([axis]) =>
          `${axis}:${String(input.brand.fingerprint[axis as keyof CompetitiveFingerprintResult])}`,
      );
    const commonSignals = Object.entries(axisScores)
      .filter(([, value]) => value <= 0.34)
      .map(
        ([axis]) =>
          `${axis}:${String(input.brand.fingerprint[axis as keyof CompetitiveFingerprintResult])}`,
      );

    return {
      overall,
      samenessRisk,
      signatureStrength: input.brand.fingerprint.signatureStrength,
      uniqueSignals,
      commonSignals,
      axisScores,
    };
  }
}

export function extractDistinctiveness(
  input: DistinctivenessInput,
): DistinctivenessResult {
  return new DistinctivenessCueExtractor().extract(input);
}
