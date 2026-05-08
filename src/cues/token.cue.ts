import { parseColor, rgbToHex } from "@/helpers/general.helpers";
import { type CueExtractor } from "./cue.protocol";

interface StyleSourceRef {
  url?: string;
}

interface TokenStyleInput {
  sources?: StyleSourceRef[];
  color?: string;
  fontFamily?: string;
  paddingTop?: string;
  paddingLeft?: string;
  marginTop?: string;
  gap?: string;
  borderRadius?: string;
}

interface TokenDesignInput {
  colors?: { primary?: { hex?: string }; text?: string[] };
  typography?: { families?: Array<{ name?: string }> };
  spacing?: { base?: number };
  borders?: { radii?: Array<string | { value?: string }> };
}

interface TokenSourceMapping {
  token: string;
  path: string;
  sourceUrl: string;
}

function firstSourceUrlWhere(
  styles: TokenStyleInput[],
  predicate: (style: TokenStyleInput) => boolean,
): string {
  for (const s of styles) {
    if (!s || !predicate(s)) continue;
    const src = Array.isArray(s.sources) ? s.sources[0] : null;
    if (src && src.url) return src.url;
  }
  return "";
}

export class TokenSourceCueExtractor
  implements CueExtractor<[design: TokenDesignInput, computedStyles: unknown], TokenSourceMapping[]>
{
  extract(
    design: TokenDesignInput = {},
    computedStyles: unknown,
  ): TokenSourceMapping[] {
    const styles = Array.isArray(computedStyles)
      ? (computedStyles as TokenStyleInput[])
      : [];
    const out: TokenSourceMapping[] = [];

    const primaryHex = design.colors?.primary?.hex;
    if (primaryHex) {
      const url = firstSourceUrlWhere(styles, (style) => {
        const parsedColor = parseColor(style.color);
        return !!parsedColor && rgbToHex(parsedColor) === primaryHex;
      });
      out.push({
        token: "color.primary",
        path: "colors.primary",
        sourceUrl: url,
      });
    }

    const textHex = (design.colors?.text || [])[0];
    if (textHex) {
      const url = firstSourceUrlWhere(styles, (style) => {
        const parsedColor = parseColor(style.color);
        return !!parsedColor && rgbToHex(parsedColor) === textHex;
      });
      out.push({ token: "color.text", path: "colors.text[0]", sourceUrl: url });
    }

    const bodyFont = design.typography?.families?.[0]?.name;
    if (bodyFont) {
      const url = firstSourceUrlWhere(
        styles,
        (style) =>
          typeof style.fontFamily === "string" && style.fontFamily.includes(bodyFont),
      );
      out.push({
        token: "font.body",
        path: "typography.families[0]",
        sourceUrl: url,
      });
    }

    const spacingBase = design.spacing?.base;
    if (spacingBase != null) {
      const target = `${spacingBase}px`;
      const url = firstSourceUrlWhere(
        styles,
        (style) =>
          style.paddingTop === target ||
          style.paddingLeft === target ||
          style.marginTop === target ||
          style.gap === target,
      );
      out.push({ token: "spacing.base", path: "spacing.base", sourceUrl: url });
    }

    const radii = design.borders?.radii || [];
    const firstRadius = radii.find((radius) => {
      const value = typeof radius === "string" ? radius : radius.value || "";
      return !!value && value !== "0px";
    });
    if (firstRadius) {
      const target = typeof firstRadius === "string" ? firstRadius : firstRadius.value || "";
      const url = firstSourceUrlWhere(styles, (style) => style.borderRadius === target);
      out.push({
        token: "radius.base",
        path: "borders.radii[0]",
        sourceUrl: url,
      });
    }

    return out;
  }
}

export function extractTokenSources(
  design: TokenDesignInput = {},
  computedStyles: unknown,
): TokenSourceMapping[] {
  return new TokenSourceCueExtractor().extract(design, computedStyles);
}
