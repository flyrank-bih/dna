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
