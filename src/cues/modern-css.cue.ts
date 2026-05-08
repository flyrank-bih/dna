import { type CueExtractor } from "./cue.protocol";

interface ModernCssStyle {
  tag?: string;
  classList?: string;
  pseudo?: { before?: string; after?: string };
  fontVariationSettings?: string;
  fontFeatureSettings?: string;
  textWrap?: string;
  textDecorationStyle?: string;
  textDecorationThickness?: string;
  textUnderlineOffset?: string;
}

interface ModernCssPayload {
  light?: {
    computedStyles?: ModernCssStyle[];
    containerQueries?: string[];
    envUsage?: string[];
  };
  computedStyles?: ModernCssStyle[];
  containerQueries?: string[];
  envUsage?: string[];
}

interface ModernCssResult {
  pseudoElements: {
    count: number;
    samples: Array<{ tag?: string; classList?: string; which: string; style: string }>;
  };
  variableFonts: {
    count: number;
    axes: Array<{ axis: string; min: number; max: number; count: number }>;
  };
  openTypeFeatures: Array<{ feature: string; count: number }>;
  textWrap: {
    wrap: Array<{ value: string; count: number }>;
    decorationStyle: Array<{ value: string; count: number }>;
    decorationThickness: Array<{ value: string; count: number }>;
    underlineOffset: Array<{ value: string; count: number }>;
  };
  containerQueries: { count: number; rules: string[] };
  envUsage: string[];
}

export class ModernCssCueExtractor
  implements CueExtractor<[payload: ModernCssPayload], ModernCssResult>
{
  extract(payload: ModernCssPayload): ModernCssResult {
    const light = (payload && payload.light) || payload || {};
    const styles = Array.isArray(light.computedStyles) ? light.computedStyles : [];
    const pseudoSamples: ModernCssResult["pseudoElements"]["samples"] = [];
    let pseudoCount = 0;
    for (const s of styles) {
      const p = s && s.pseudo;
      if (!p) continue;
      if (p.before) {
        pseudoCount++;
        if (pseudoSamples.length < 20) {
          pseudoSamples.push({
            tag: s.tag,
            classList: s.classList,
            which: "::before",
            style: p.before,
          });
        }
      }
      if (p.after) {
        pseudoCount++;
        if (pseudoSamples.length < 20) {
          pseudoSamples.push({
            tag: s.tag,
            classList: s.classList,
            which: "::after",
            style: p.after,
          });
        }
      }
    }

    const axesMap = new Map<string, { axis: string; min: number; max: number; count: number }>();
    let variableFontCount = 0;
    for (const s of styles) {
    const v = s && s.fontVariationSettings;
    if (!v || v === "normal" || v === "") continue;
    variableFontCount++;
    for (const m of String(v).matchAll(/"([^"]+)"\s+(-?\d+(?:\.\d+)?)/g)) {
      const axis = m[1];
      const val = parseFloat(m[2]);
      if (!axesMap.has(axis))
        axesMap.set(axis, { axis, min: val, max: val, count: 0 });
      const a = axesMap.get(axis);
      if (!a) continue;
      a.min = Math.min(a.min, val);
      a.max = Math.max(a.max, val);
      a.count++;
    }
    }

    const featMap = new Map<string, number>();
    for (const s of styles) {
    const f = s && s.fontFeatureSettings;
    if (!f || f === "normal" || f === "") continue;
    for (const m of String(f).matchAll(/"([^"]+)"(?:\s+(on|off|\d+))?/g)) {
      const key = m[1];
      featMap.set(key, (featMap.get(key) || 0) + 1);
    }
    }

    const textWrapMap = new Map<string, number>();
    const decStyleMap = new Map<string, number>();
    const thicknessMap = new Map<string, number>();
    const offsetMap = new Map<string, number>();
    for (const s of styles) {
    if (s.textWrap && s.textWrap !== "wrap" && s.textWrap !== "") {
      textWrapMap.set(s.textWrap, (textWrapMap.get(s.textWrap) || 0) + 1);
    }
    if (
      s.textDecorationStyle &&
      s.textDecorationStyle !== "solid" &&
      s.textDecorationStyle !== ""
    ) {
      decStyleMap.set(
        s.textDecorationStyle,
        (decStyleMap.get(s.textDecorationStyle) || 0) + 1,
      );
    }
    if (
      s.textDecorationThickness &&
      s.textDecorationThickness !== "auto" &&
      s.textDecorationThickness !== ""
    ) {
      thicknessMap.set(
        s.textDecorationThickness,
        (thicknessMap.get(s.textDecorationThickness) || 0) + 1,
      );
    }
    if (
      s.textUnderlineOffset &&
      s.textUnderlineOffset !== "auto" &&
      s.textUnderlineOffset !== ""
    ) {
      offsetMap.set(
        s.textUnderlineOffset,
        (offsetMap.get(s.textUnderlineOffset) || 0) + 1,
      );
    }
    }

    const containerQueries = Array.isArray(light.containerQueries)
      ? light.containerQueries
      : [];
    const envUsage = Array.isArray(light.envUsage) ? light.envUsage : [];

    return {
      pseudoElements: {
        count: pseudoCount,
        samples: pseudoSamples,
      },
      variableFonts: {
        count: variableFontCount,
        axes: [...axesMap.values()].sort((a, b) => b.count - a.count),
      },
      openTypeFeatures: [...featMap.entries()]
        .map(([feature, count]) => ({ feature, count }))
        .sort((a, b) => b.count - a.count),
      textWrap: {
        wrap: [...textWrapMap.entries()].map(([value, count]) => ({
          value,
          count,
        })),
        decorationStyle: [...decStyleMap.entries()].map(([value, count]) => ({
          value,
          count,
        })),
        decorationThickness: [...thicknessMap.entries()].map(([value, count]) => ({
          value,
          count,
        })),
        underlineOffset: [...offsetMap.entries()].map(([value, count]) => ({
          value,
          count,
        })),
      },
      containerQueries: {
        count: containerQueries.length,
        rules: containerQueries,
      },
      envUsage: [...new Set(envUsage)],
    };
  }
}

export function extractModernCss(payload: ModernCssPayload): ModernCssResult {
  return new ModernCssCueExtractor().extract(payload);
}
