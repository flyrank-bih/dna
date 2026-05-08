/**
 * @file a11y helpers
 * @description Shared WCAG contrast utilities and remediation logic.
 */

export interface RgbTriplet {
  r: number;
  g: number;
  b: number;
}

export type WcagRule = "AA-normal" | "AA-large" | "AAA-normal" | "AAA-large";

export interface A11ySuggestion {
  replace: "fg";
  color: string;
  newRatio: number;
}

export interface FailingContrastPair {
  fg: string;
  bg: string;
  rule?: WcagRule | string;
  [key: string]: unknown;
}

export interface RemediatedContrastPair extends FailingContrastPair {
  suggestion: A11ySuggestion | null;
}

const WCAG_THRESHOLDS: Record<WcagRule, number> = {
  "AA-normal": 4.5,
  "AA-large": 3,
  "AAA-normal": 7,
  "AAA-large": 4.5,
};

function normalizeHex(value: string): string {
  const hex = value.trim().replace(/^#/, "");
  if (hex.length === 3) {
    return hex
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }
  if (hex.length === 4) {
    return hex
      .slice(0, 3)
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }
  if (hex.length >= 6) return hex.slice(0, 6);
  return "000000";
}

function toRgbTriplet(hex: string): RgbTriplet {
  const normalized = normalizeHex(String(hex || ""));
  const parsed = Number.parseInt(normalized, 16);
  if (Number.isNaN(parsed)) return { r: 0, g: 0, b: 0 };
  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function linearizedSrgb(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : Math.pow((normalized + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: RgbTriplet): number {
  return (
    0.2126 * linearizedSrgb(rgb.r) +
    0.7152 * linearizedSrgb(rgb.g) +
    0.0722 * linearizedSrgb(rgb.b)
  );
}

export function contrastRatio(foregroundHex: string, backgroundHex: string): number {
  const foregroundLum = relativeLuminance(toRgbTriplet(foregroundHex));
  const backgroundLum = relativeLuminance(toRgbTriplet(backgroundHex));
  return (
    (Math.max(foregroundLum, backgroundLum) + 0.05) /
    (Math.min(foregroundLum, backgroundLum) + 0.05)
  );
}

function thresholdForRule(rule?: string): number {
  return WCAG_THRESHOLDS[rule as WcagRule] ?? WCAG_THRESHOLDS["AA-normal"];
}

export function remediateFailingPairs(
  failing: readonly FailingContrastPair[] = [],
  palette: readonly string[] = [],
): RemediatedContrastPair[] {
  return failing.map((pair) => {
    const targetRatio = thresholdForRule(pair.rule);
    let bestSuggestion: A11ySuggestion | null = null;

    for (const candidate of palette) {
      if (!candidate) continue;
      const newRatio = contrastRatio(candidate, pair.bg);
      if (newRatio < targetRatio) continue;
      if (bestSuggestion && newRatio <= bestSuggestion.newRatio) continue;
      bestSuggestion = {
        replace: "fg",
        color: candidate,
        newRatio: Math.round(newRatio * 100) / 100,
      };
    }

    return {
      ...pair,
      suggestion: bestSuggestion,
    };
  });
}

export { contrastRatio as _contrast };
