import { type CueExtractor } from "./cue.protocol";

interface ColorEntry {
  hex?: string;
}

interface CompetitiveFingerprintInput {
  colors?: {
    all?: ColorEntry[];
    primary?: { hex?: string } | null;
    accent?: { hex?: string } | null;
  };
  typography?: {
    families?: Array<{ name?: string } | string>;
  };
  spacing?: {
    base?: number | null;
  };
  borders?: {
    radii?: Array<{ value?: number | string }>;
  };
  shadows?: {
    values?: Array<{ raw?: string }>;
  };
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
}

export interface CompetitiveFingerprintResult {
  paletteTemperature:
    | "cool"
    | "warm"
    | "neutral"
    | "mixed";
  paletteEnergy:
    | "muted"
    | "balanced"
    | "vivid";
  typePosture:
    | "neutral-sans"
    | "editorial-serif"
    | "technical-mixed"
    | "expressive-display";
  spacingDensity:
    | "compact"
    | "balanced"
    | "spacious";
  radiusStyle:
    | "sharp"
    | "balanced"
    | "soft";
  motionEnergy:
    | "calm"
    | "balanced"
    | "dynamic";
  compositionStyle:
    | "editorial"
    | "product-led"
    | "proof-led"
    | "utilitarian"
    | "balanced";
  messagingPosture:
    | "credibility-led"
    | "outcome-led"
    | "technical-led"
    | "aspirational"
    | "balanced";
  proofIntensity:
    | "light"
    | "moderate"
    | "heavy";
  interactionPersonality:
    | "reserved"
    | "confident"
    | "playful";
  formality:
    | "formal"
    | "balanced"
    | "friendly";
  signatureStrength: number;
  evidence: string[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHex(input?: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) return null;
  if (trimmed.length === 4) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`.toLowerCase();
  }
  return trimmed.toLowerCase();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex) || "#000000";
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

function rgbToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex);
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  const lightness = (max + min) / 2;

  let hue = 0;
  if (delta !== 0) {
    switch (max) {
      case red:
        hue = ((green - blue) / delta) % 6;
        break;
      case green:
        hue = (blue - red) / delta + 2;
        break;
      default:
        hue = (red - green) / delta + 4;
        break;
    }
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
  }

  const saturation =
    delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  return {
    h: hue,
    s: saturation,
    l: lightness,
  };
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function toNumericValue(value: number | string | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function getFamilyNames(
  families: Array<{ name?: string } | string> = [],
): string[] {
  return families
    .map((family: { name?: string } | string) =>
      typeof family === "string" ? family : family?.name || "",
    )
    .filter(Boolean)
    .map((name: string) => name.toLowerCase());
}

export class CompetitiveFingerprintCueExtractor
  implements
    CueExtractor<
      [input: CompetitiveFingerprintInput],
      CompetitiveFingerprintResult
    >
{
  extract(
    input: CompetitiveFingerprintInput = {},
  ): CompetitiveFingerprintResult {
    const palette = [
      ...(input.colors?.all || []).map((entry) => normalizeHex(entry.hex || "")),
      normalizeHex(input.colors?.primary?.hex || ""),
      normalizeHex(input.colors?.accent?.hex || ""),
    ].filter((entry): entry is string => Boolean(entry));

    const hslValues = palette.map((entry) => rgbToHsl(entry));
    const hues = hslValues.map((entry) => entry.h);
    const saturations = hslValues.map((entry) => entry.s);
    const averageHue = average(hues);
    const averageSaturation = average(saturations);

    let paletteTemperature: CompetitiveFingerprintResult["paletteTemperature"] =
      "neutral";
    if (hues.length >= 3) {
      const cool = hues.filter((hue) => hue >= 180 && hue <= 300).length;
      const warm = hues.filter((hue) => hue < 70 || hue > 320).length;
      if (cool && warm) {
        paletteTemperature = "mixed";
      } else if (cool > warm) {
        paletteTemperature = "cool";
      } else if (warm > cool) {
        paletteTemperature = "warm";
      }
    } else if (averageHue >= 180 && averageHue <= 300) {
      paletteTemperature = "cool";
    } else if (averageHue > 0 && (averageHue < 70 || averageHue > 320)) {
      paletteTemperature = "warm";
    }

    const paletteEnergy: CompetitiveFingerprintResult["paletteEnergy"] =
      averageSaturation >= 0.55
        ? "vivid"
        : averageSaturation >= 0.22
          ? "balanced"
          : "muted";

    const familyNames = getFamilyNames(input.typography?.families);
    const hasSerif = familyNames.some((name) =>
      /(serif|garamond|times|georgia|display)/i.test(name),
    );
    const hasMono = familyNames.some((name) =>
      /(mono|code|jetbrains|menlo|consolas)/i.test(name),
    );
    const hasSans = familyNames.some((name) =>
      /(sans|inter|sf pro|helvetica|arial|grotesk)/i.test(name),
    );

    const typePosture: CompetitiveFingerprintResult["typePosture"] = hasSerif
      ? hasSans
        ? "expressive-display"
        : "editorial-serif"
      : hasMono
        ? "technical-mixed"
        : "neutral-sans";

    const spacingBase =
      typeof input.spacing?.base === "number" ? input.spacing.base : 16;
    const spacingDensity: CompetitiveFingerprintResult["spacingDensity"] =
      input.composition?.density === "compact" || spacingBase <= 8
        ? "compact"
        : input.composition?.density === "spacious" || spacingBase >= 20
          ? "spacious"
          : "balanced";

    const radii = (input.borders?.radii || [])
      .map((entry) => toNumericValue(entry.value))
      .filter((value): value is number => value !== null);
    const averageRadius = average(radii);
    const radiusStyle: CompetitiveFingerprintResult["radiusStyle"] =
      averageRadius >= 18 ? "soft" : averageRadius >= 7 ? "balanced" : "sharp";

    const durationValues = (input.motion?.durations || [])
      .map((entry) =>
        typeof entry === "number" ? entry : toNumericValue(entry.value),
      )
      .filter((value): value is number => value !== null);
    const averageDuration = average(durationValues);
    const motionEnergy: CompetitiveFingerprintResult["motionEnergy"] =
      input.motion?.feel === "lively" || averageDuration >= 260
        ? "dynamic"
        : input.motion?.feel === "calm" || averageDuration <= 140
          ? "calm"
          : "balanced";

    let compositionStyle: CompetitiveFingerprintResult["compositionStyle"] =
      "balanced";
    if (input.composition?.pacing === "editorial") {
      compositionStyle = "editorial";
    } else if (input.composition?.heroPattern === "proof-first") {
      compositionStyle = "proof-led";
    } else if (
      input.composition?.heroPattern === "split-hero" ||
      input.composition?.heroPattern === "feature-grid"
    ) {
      compositionStyle = "product-led";
    } else if (input.composition?.pacing === "utilitarian") {
      compositionStyle = "utilitarian";
    }

    const proofModules = input.messagingArchitecture?.proofModules || [];
    const proofIntensity: CompetitiveFingerprintResult["proofIntensity"] =
      proofModules.length >= 4
        ? "heavy"
        : proofModules.length >= 2
          ? "moderate"
          : "light";

    const headlineFormula =
      input.messagingArchitecture?.headlineFormula?.toLowerCase() || "";
    const messagingPosture: CompetitiveFingerprintResult["messagingPosture"] =
      /credibility|comparison|proof/.test(headlineFormula) || proofIntensity === "heavy"
        ? "credibility-led"
        : /outcome|benefit|promise/.test(headlineFormula)
          ? "outcome-led"
          : /technical|platform|developer|spec/.test(headlineFormula) || hasMono
            ? "technical-led"
            : /aspirational|vision|story|mission/.test(headlineFormula) || hasSerif
              ? "aspirational"
              : "balanced";

    const hover = input.interactionSignature?.hoverTreatment || "";
    const navigation = input.interactionSignature?.navigationReveal || "";
    const interactionPersonality: CompetitiveFingerprintResult["interactionPersonality"] =
      /glow|scale|lift|color/.test(hover) || /expanded|layered/.test(navigation)
        ? "playful"
        : /underline|fade|minimal|subtle/.test(hover) ||
            input.interactionSignature?.consistency === "high"
          ? "confident"
          : "reserved";

    const material = input.materialLanguage?.label?.toLowerCase() || "";
    const shadowCount = (input.shadows?.values || []).length;
    const formality: CompetitiveFingerprintResult["formality"] =
      hasSerif || material.includes("editorial")
        ? "formal"
        : radiusStyle === "soft" || shadowCount >= 4
          ? "friendly"
          : "balanced";

    const evidence = [
      `palette:${paletteTemperature}/${paletteEnergy}`,
      `type:${typePosture}`,
      `spacing:${spacingDensity}`,
      `radius:${radiusStyle}`,
      `motion:${motionEnergy}`,
      `composition:${compositionStyle}`,
      `messaging:${messagingPosture}`,
      `proof:${proofIntensity}`,
      `interaction:${interactionPersonality}`,
      `formality:${formality}`,
      input.componentLibrary?.library
        ? `library:${input.componentLibrary.library}`
        : "",
    ].filter(Boolean);

    const signatureStrength = clamp(
      [
        palette.length > 3 ? 0.15 : 0.08,
        proofIntensity === "heavy" ? 0.15 : proofIntensity === "moderate" ? 0.1 : 0.06,
        compositionStyle !== "balanced" ? 0.14 : 0.08,
        messagingPosture !== "balanced" ? 0.14 : 0.08,
        interactionPersonality !== "reserved" ? 0.12 : 0.07,
        radiusStyle !== "balanced" ? 0.1 : 0.06,
        formality !== "balanced" ? 0.1 : 0.06,
        typePosture !== "neutral-sans" ? 0.1 : 0.06,
      ].reduce((sum, value) => sum + value, 0),
      0,
      1,
    );

    return {
      paletteTemperature,
      paletteEnergy,
      typePosture,
      spacingDensity,
      radiusStyle,
      motionEnergy,
      compositionStyle,
      messagingPosture,
      proofIntensity,
      interactionPersonality,
      formality,
      signatureStrength,
      evidence,
    };
  }
}

export function extractCompetitiveFingerprint(
  input: CompetitiveFingerprintInput = {},
): CompetitiveFingerprintResult {
  return new CompetitiveFingerprintCueExtractor().extract(input);
}
