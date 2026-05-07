/**
 *
 * Design Token Helpers
 *
 * Internal ( Resolves Reference Strings )
 *
 * Flyrank©, 2026
 * Created by: @admirsaheta on 8/5/2026
 *
 */

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ParsedColor {
  rgb?: RGB;
  hsl?: HSL;
}

export interface ColorConverter {
  toHslParts(hex: string): HSL | null;
  toHslString(hex: string): string;
  isLightHex(hex: string): boolean;
}

export class DefaultColorConverter implements ColorConverter {
  toHslParts(hex: string): HSL | null {
    if (!hex) return null;
    const h = hex.replace("#", "");
    if (h.length !== 3 && h.length !== 6) return null;

    const fullHex =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;

    const r = parseInt(fullHex.slice(0, 2), 16) / 255;
    const g = parseInt(fullHex.slice(2, 4), 16) / 255;
    const b = parseInt(fullHex.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
      return { h: 0, s: 0, l: Math.round(l * 100) };
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let hue: number;

    if (max === r) {
      hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      hue = ((b - r) / d + 2) / 6;
    } else {
      hue = ((r - g) / d + 4) / 6;
    }

    return {
      h: Math.round(hue * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  toHslString(hex: string): string {
    const hsl = this.toHslParts(hex);
    if (!hsl) return "0 0% 0%";
    return `${hsl.h} ${hsl.s}% ${hsl.l}%`;
  }

  isLightHex(hex: string): boolean {
    if (!hex) return false;
    const h = hex.replace("#", "");
    if (h.length !== 3 && h.length !== 6) return false;

    const fullHex =
      h.length === 3
        ? h
            .split("")
            .map((c) => c + c)
            .join("")
        : h;

    const r = parseInt(fullHex.slice(0, 2), 16);
    const g = parseInt(fullHex.slice(2, 4), 16);
    const b = parseInt(fullHex.slice(4, 6), 16);

    const luminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    return luminance > 0.5;
  }
}

export const colorConverter = new DefaultColorConverter();

export function toHslParts(hex: string): HSL | null {
  return colorConverter.toHslParts(hex);
}

export function toHslString(hex: string): string {
  return colorConverter.toHslString(hex);
}

export function isLightHex(hex: string): boolean {
  return colorConverter.isLightHex(hex);
}

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const fullHex =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;

  return {
    r: parseInt(fullHex.slice(0, 2), 16),
    g: parseInt(fullHex.slice(2, 4), 16),
    b: parseInt(fullHex.slice(4, 6), 16),
  };
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;

  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

const COLOR_SCALE_LEVELS: Array<{ name: string; lightness: number }> = [
  { name: "50", lightness: 97 },
  { name: "100", lightness: 94 },
  { name: "200", lightness: 86 },
  { name: "300", lightness: 76 },
  { name: "400", lightness: 64 },
  { name: "500", lightness: 50 },
  { name: "600", lightness: 40 },
  { name: "700", lightness: 32 },
  { name: "800", lightness: 24 },
  { name: "900", lightness: 16 },
  { name: "950", lightness: 10 },
];

export function generateHslScale(
  hex: string,
  parsed: ParsedColor = {},
): Record<string, string> {
  const { h, s } = parsed.hsl ?? rgbToHsl(parsed.rgb ?? hexToRgb(hex));
  const scale: Record<string, string> = {};

  for (const { name, lightness } of COLOR_SCALE_LEVELS) {
    scale[name] = `hsl(${h}, ${s}%, ${lightness}%)`;
  }

  return scale;
}

const clamp = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const srgbGamma = (x: number) =>
  x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;

const toByte = (v: number) => Math.round(clamp(v) * 255);

const toHex = (v: number) => toByte(v).toString(16).padStart(2, "0");

const rgbToHex = (r: number, g: number, b: number) =>
  `#${toHex(r)}${toHex(g)}${toHex(b)}`;

const isNum = (v: unknown): v is number =>
  typeof v === "number" && !Number.isNaN(v);

const parseFloatSafe = (v: string) => {
  if (v.endsWith("%")) return parseFloat(v) / 100;
  return parseFloat(v);
};

function oklabToLinearRgb(L: number, a: number, b: number) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

export function oklabToSrgb(L: number, a: number, b: number) {
  const rgb = oklabToLinearRgb(L, a, b);

  return [srgbGamma(rgb.r), srgbGamma(rgb.g), srgbGamma(rgb.b)];
}

export function oklchToSrgb(L: number, C: number, h: number) {
  const rad = (h * Math.PI) / 180;
  return oklabToSrgb(L, C * Math.cos(rad), C * Math.sin(rad));
}

export function parseOklch(raw: string | null | undefined) {
  if (!raw) return null;

  const match = raw.match(/^\s*(oklch|oklab)\(([^)]+)\)\s*$/i);
  if (!match) return null;

  const type = match[1].toLowerCase();
  const parts = match[2]
    .split("/")[0]
    .trim()
    .split(/[\s,]+/);

  if (parts.length < 3) return null;

  const L = parseFloatSafe(parts[0]);
  const X = parseFloatSafe(parts[1]);
  const Y = parseFloatSafe(parts[2]);

  if (!isNum(L) || !isNum(X) || !isNum(Y)) return null;

  return type === "oklch"
    ? { type: "oklch" as const, L, C: X, h: Y, raw }
    : { type: "oklab" as const, L, a: X, b: Y, raw };
}

export function oklchToHex(raw: string) {
  const parsed = parseOklch(raw);
  if (!parsed) return null;

  const [r, g, b] =
    parsed.type === "oklch"
      ? oklchToSrgb(parsed.L, parsed.C, parsed.h)
      : oklabToSrgb(parsed.L, parsed.a, parsed.b);

  return rgbToHex(r, g, b);
}