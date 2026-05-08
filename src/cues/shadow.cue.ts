import { type CueExtractor } from "./cue.protocol";

interface ShadowStyleInput {
  boxShadow?: string;
  textShadow?: string;
}

interface ParsedShadow {
  raw: string;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
  visualWeight: number;
  label: "none" | "xs" | "sm" | "md" | "lg" | "xl";
}

interface ShadowExtractionResult {
  values: ParsedShadow[];
  textShadows: ParsedShadow[];
}

export class ShadowCueExtractor
  implements CueExtractor<[computedStyles?: ShadowStyleInput[]], ShadowExtractionResult>
{
  extract(computedStyles: ShadowStyleInput[] = []): ShadowExtractionResult {
    const shadowSet = new Set<string>();
    const textShadowSet = new Set<string>();

    for (const style of computedStyles) {
      if (style.boxShadow && style.boxShadow !== "none") {
        shadowSet.add(style.boxShadow);
      }
      if (style.textShadow && style.textShadow !== "none") {
        textShadowSet.add(style.textShadow);
      }
    }

    const values = [...shadowSet].map((raw) => parseShadow(raw));
    values.sort((a, b) => a.visualWeight - b.visualWeight);

    const textShadows = [...textShadowSet].map((raw) => parseShadow(raw));
    textShadows.sort((a, b) => a.visualWeight - b.visualWeight);

    return { values, textShadows };
  }
}

export function extractShadows(
  computedStyles: ShadowStyleInput[] = [],
): ShadowExtractionResult {
  return new ShadowCueExtractor().extract(computedStyles);
}

function parseShadow(raw: string): ParsedShadow {
  const inset = raw.includes("inset");
  const cleaned = raw.replace(/\binset\b/g, "").trim();

  let color = "";
  let numericPart = cleaned;
  const colorFnMatch = cleaned.match(/(rgba?\([^)]+\)|hsla?\([^)]+\))/);
  if (colorFnMatch) {
    color = colorFnMatch[1];
    numericPart = cleaned.replace(color, "").trim();
  } else {
    const hexMatch = cleaned.match(/(#[0-9a-fA-F]{3,8})/);
    if (hexMatch) {
      color = hexMatch[1];
      numericPart = cleaned.replace(color, "").trim();
    } else {
      const tokens = cleaned.split(/\s+/);
      const colorToken = tokens.find(
        (t) => !/^-?[\d.]+px$/.test(t) && !/^[\d.]+$/.test(t),
      );
      if (colorToken) {
        color = colorToken;
        numericPart = cleaned.replace(colorToken, "").trim();
      }
    }
  }

  const nums =
    numericPart.match(/-?[\d.]+px/g)?.map((n) => parseFloat(n)) || [];
  const offsetX = nums[0] || 0;
  const offsetY = nums[1] || 0;
  const blur = nums[2] || 0;
  const spread = nums[3] || 0;

  const visualWeight = Math.sqrt(offsetX * offsetX + offsetY * offsetY) + blur;

  let label: ParsedShadow["label"] = "none";
  if (visualWeight > 0 && visualWeight <= 3) label = "xs";
  else if (visualWeight <= 8) label = "sm";
  else if (visualWeight <= 16) label = "md";
  else if (visualWeight <= 32) label = "lg";
  else if (visualWeight > 32) label = "xl";

  return {
    raw,
    offsetX,
    offsetY,
    blur,
    spread,
    color,
    inset,
    visualWeight: Math.round(visualWeight * 100) / 100,
    label,
  };
}
