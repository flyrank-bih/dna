/**
 * @file general helpers
 * @description Shared low-level parsing/math helpers used by extractor modules.
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface ParsedColor extends RgbColor {
  a: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export interface ParsedCssValue {
  value: number;
  unit: string;
}

export interface ClusteredValue {
  representative: number;
  members: number[];
}

export interface ClusterableColor {
  hex: string;
  parsed: RgbColor;
  count: number;
}

export interface ColorCluster<T extends ClusterableColor> {
  representative: RgbColor;
  hex: string;
  members: T[];
  count: number;
}

const NAMED_COLORS: Record<string, ParsedColor> = {
  transparent: { r: 0, g: 0, b: 0, a: 0 },
  black: { r: 0, g: 0, b: 0, a: 1 },
  white: { r: 255, g: 255, b: 255, a: 1 },
  red: { r: 255, g: 0, b: 0, a: 1 },
  green: { r: 0, g: 128, b: 0, a: 1 },
  blue: { r: 0, g: 0, b: 255, a: 1 },
  yellow: { r: 255, g: 255, b: 0, a: 1 },
  cyan: { r: 0, g: 255, b: 255, a: 1 },
  magenta: { r: 255, g: 0, b: 255, a: 1 },
  gray: { r: 128, g: 128, b: 128, a: 1 },
  grey: { r: 128, g: 128, b: 128, a: 1 },
  orange: { r: 255, g: 165, b: 0, a: 1 },
  purple: { r: 128, g: 0, b: 128, a: 1 },
  pink: { r: 255, g: 192, b: 203, a: 1 },
  navy: { r: 0, g: 0, b: 128, a: 1 },
  teal: { r: 0, g: 128, b: 128, a: 1 },
  silver: { r: 192, g: 192, b: 192, a: 1 },
  maroon: { r: 128, g: 0, b: 0, a: 1 },
};

const clampUnit = (value: number): number => Math.max(0, Math.min(1, value));

function unitToByte(value: number): number {
  return Math.round(clampUnit(value) * 255);
}

function oklabToRgb(L: number, a: number, b: number): RgbColor {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const blue = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return { r: unitToByte(r), g: unitToByte(g), b: unitToByte(blue) };
}

function oklchToRgb(L: number, C: number, H: number): RgbColor {
  const radians = (H * Math.PI) / 180;
  return oklabToRgb(L, C * Math.cos(radians), C * Math.sin(radians));
}

function alphaFromToken(token?: string): number {
  if (!token) return 1;
  return token.endsWith("%") ? Number.parseFloat(token) / 100 : +token;
}

export function parseColor(input: string | null | undefined): ParsedColor | null {
  if (
    !input ||
    input === "none" ||
    input === "currentcolor" ||
    input === "inherit" ||
    input === "initial"
  ) {
    return null;
  }

  const str = input.trim().toLowerCase();
  if (NAMED_COLORS[str]) return { ...NAMED_COLORS[str] };

  if (str.startsWith("#")) {
    const hex = str.slice(1);
    if (hex.length === 3) {
      return {
        r: Number.parseInt(hex[0] + hex[0], 16),
        g: Number.parseInt(hex[1] + hex[1], 16),
        b: Number.parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    }
    if (hex.length === 4) {
      return {
        r: Number.parseInt(hex[0] + hex[0], 16),
        g: Number.parseInt(hex[1] + hex[1], 16),
        b: Number.parseInt(hex[2] + hex[2], 16),
        a: Number.parseInt(hex[3] + hex[3], 16) / 255,
      };
    }
    if (hex.length === 6) {
      return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    }
    if (hex.length === 8) {
      return {
        r: Number.parseInt(hex.slice(0, 2), 16),
        g: Number.parseInt(hex.slice(2, 4), 16),
        b: Number.parseInt(hex.slice(4, 6), 16),
        a: Number.parseInt(hex.slice(6, 8), 16) / 255,
      };
    }
  }

  const rgbMatch = str.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/,
  );
  if (rgbMatch) {
    return {
      r: +rgbMatch[1],
      g: +rgbMatch[2],
      b: +rgbMatch[3],
      a: rgbMatch[4] ? +rgbMatch[4] : 1,
    };
  }

  const rgbModern = str.match(
    /rgba?\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:\/\s*([\d.]+%?))?\s*\)/,
  );
  if (rgbModern) {
    return {
      r: +rgbModern[1],
      g: +rgbModern[2],
      b: +rgbModern[3],
      a: alphaFromToken(rgbModern[4]),
    };
  }

  const hslMatch = str.match(
    /hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+))?\s*\)/,
  );
  if (hslMatch) {
    const rgb = hslToRgb(+hslMatch[1], +hslMatch[2], +hslMatch[3]);
    return { ...rgb, a: hslMatch[4] ? +hslMatch[4] : 1 };
  }

  const hslModern = str.match(
    /hsla?\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*(?:\/\s*([\d.]+%?))?\s*\)/,
  );
  if (hslModern) {
    const rgb = hslToRgb(+hslModern[1], +hslModern[2], +hslModern[3]);
    return { ...rgb, a: alphaFromToken(hslModern[4]) };
  }

  const oklchMatch = str.match(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?))?\s*\)/,
  );
  if (oklchMatch) {
    return {
      ...oklchToRgb(+oklchMatch[1], +oklchMatch[2], +oklchMatch[3]),
      a: alphaFromToken(oklchMatch[4]),
    };
  }

  const oklabMatch = str.match(
    /oklab\(\s*([\d.e+-]+)\s+([\d.e+-]+)\s+([\d.e+-]+)\s*(?:\/\s*([\d.]+%?))?\s*\)/,
  );
  if (oklabMatch) {
    return {
      ...oklabToRgb(+oklabMatch[1], +oklabMatch[2], +oklabMatch[3]),
      a: alphaFromToken(oklabMatch[4]),
    };
  }

  const mixMatch = str.match(
    /color-mix\(\s*in\s+\w+\s*,\s*(.+?)\s*,\s*(.+?)\s*\)/,
  );
  if (mixMatch) {
    const part1 = mixMatch[1].trim().replace(/\s+\d+%$/, "");
    const part2 = mixMatch[2].trim().replace(/\s+\d+%$/, "");
    const c1 = parseColor(part1);
    const c2 = parseColor(part2);
    if (c1 && c2) {
      return {
        r: Math.round((c1.r + c2.r) / 2),
        g: Math.round((c1.g + c2.g) / 2),
        b: Math.round((c1.b + c2.b) / 2),
        a: (c1.a + c2.a) / 2,
      };
    }
  }

  return null;
}

export function rgbToHex(color: RgbColor): string {
  const toHex = (value: number): string =>
    Math.round(value).toString(16).padStart(2, "0");
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

export function rgbToHsl(input: RgbColor): HslColor {
  const r = input.r / 255;
  const g = input.g / 255;
  const b = input.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(l * 100) };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): RgbColor {
  const hh = h / 360;
  const ss = s / 100;
  const ll = l / 100;
  if (ss === 0) {
    const value = Math.round(ll * 255);
    return { r: value, g: value, b: value };
  }
  const hue2rgb = (p: number, q: number, tRaw: number): number => {
    let t = tRaw;
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  return {
    r: Math.round(hue2rgb(p, q, hh + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hh) * 255),
    b: Math.round(hue2rgb(p, q, hh - 1 / 3) * 255),
  };
}

export function colorDistance(c1: RgbColor, c2: RgbColor): number {
  return Math.sqrt((c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2);
}

export function isSaturated(color: RgbColor): boolean {
  return rgbToHsl(color).s > 10;
}

export function clusterColors<T extends ClusterableColor>(
  colors: readonly T[],
  threshold = 15,
): Array<ColorCluster<T>> {
  const clusters: Array<ColorCluster<T>> = [];
  for (const color of colors) {
    const existing = clusters.find(
      (cluster) => colorDistance(cluster.representative, color.parsed) < threshold,
    );
    if (existing) {
      existing.members.push(color);
      existing.count += color.count;
      continue;
    }
    clusters.push({
      representative: color.parsed,
      hex: color.hex,
      members: [color],
      count: color.count,
    });
  }
  return clusters.sort((a, b) => b.count - a.count);
}

export function clusterValues(values: readonly number[], threshold: number): number[] {
  const sorted = [...values].sort((a, b) => a - b);
  const groups: ClusteredValue[] = [];
  for (const value of sorted) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && Math.abs(value - lastGroup.representative) <= threshold) {
      lastGroup.members.push(value);
    } else {
      groups.push({ representative: value, members: [value] });
    }
  }
  return groups.map((group) => group.representative);
}

export function parseCSSValue(input: string | null | undefined): ParsedCssValue | null {
  if (!input || input === "normal" || input === "auto" || input === "none") return null;
  const match = input.match(/^([\d.]+)(px|rem|em|%|vw|vh|pt)?$/);
  if (!match) return null;
  return { value: Number.parseFloat(match[1]), unit: match[2] || "" };
}

export function remToPx(rem: number, base = 16): number {
  return rem * base;
}

export function pxToRem(px: number, base = 16): number {
  return +(px / base).toFixed(4);
}

export function safeName(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function nameFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return safeName(hostname.replace(/^www\./, ""));
  } catch {
    return "unknown-site";
  }
}

export function detectScale(values: readonly number[]): {
  base: number | null;
  scale: readonly number[];
} {
  if (values.length < 3) return { base: null, scale: values };
  const candidates = [2, 4, 6, 8];
  let bestBase: number | null = null;
  let bestScore = 0;
  for (const base of candidates) {
    const score = values.filter((value) => value > 0 && value % base === 0).length / values.length;
    if (score <= bestScore) continue;
    bestScore = score;
    bestBase = base;
  }
  return { base: bestScore >= 0.6 ? bestBase : null, scale: values };
}
