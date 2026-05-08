import { type CueExtractor } from "./cue.protocol";

const LAYER_DEFS = [
  { name: "modal", min: 1000, max: Infinity },
  { name: "dropdown", min: 100, max: 999 },
  { name: "sticky", min: 10, max: 99 },
  { name: "base", min: -Infinity, max: 9 },
];

interface ZIndexStyle {
  tag?: string;
  classList?: string[] | Set<string>;
  zIndex?: string;
}

interface ZIndexLayer {
  name: string;
  range: [number, number];
  elements: string[];
}

interface ZIndexIssue {
  type: "excessive" | "z-index-war";
  message: string;
}

interface ZIndexResult {
  layers: ZIndexLayer[];
  allValues: number[];
  issues: ZIndexIssue[];
  scale: Array<{
    value: number;
    count: number;
    elements: string[];
  }>;
}

function elLabel(el: ZIndexStyle): string {
  const classValues = Array.isArray(el.classList)
    ? el.classList
    : el.classList
      ? [...el.classList]
      : [];
  const cls = classValues.length ? "." + classValues.join(".") : "";
  return (el.tag || "el") + cls;
}

export class ZIndexCueExtractor
  implements CueExtractor<[styles?: ZIndexStyle[]], ZIndexResult>
{
  extract(styles: ZIndexStyle[] = []): ZIndexResult {
    const entries = styles
      .filter((el) => !!el.zIndex && el.zIndex !== "auto")
      .map((el) => ({ value: parseInt(el.zIndex || "0", 10), el }))
      .filter((entry) => !isNaN(entry.value));

    const byValue = new Map<number, ZIndexStyle[]>();
    for (const { value, el } of entries) {
      if (!byValue.has(value)) byValue.set(value, []);
      const group = byValue.get(value);
      if (group) group.push(el);
    }

    const allValues = [...byValue.keys()].sort((a, b) => a - b);

    const scale = allValues.map((value) => ({
      value,
      count: (byValue.get(value) || []).length,
      elements: (byValue.get(value) || []).map(elLabel),
    }));

    const layers = LAYER_DEFS.map((def) => {
      const matching = allValues.filter((value) => value >= def.min && value <= def.max);
      if (!matching.length) return null;
      const elements = matching.flatMap((value) => (byValue.get(value) || []).map(elLabel));
      return {
        name: def.name,
        range: [Math.min(...matching), Math.max(...matching)] as [number, number],
        elements,
      };
    }).filter((layer): layer is ZIndexLayer => !!layer);

    const issues: ZIndexIssue[] = [];
    const highValues = allValues.filter((value) => value > 9999);
    if (highValues.length) {
      issues.push({
        type: "excessive",
        message: `Very high z-index values: ${highValues.join(", ")}`,
      });
    }
    if (allValues.length >= 5) {
      const spread = allValues[allValues.length - 1] - allValues[0];
      const density = allValues.length / (spread || 1);
      if (density > 0.3) {
        issues.push({
          type: "z-index-war",
          message: `${allValues.length} unique values in a narrow range (${allValues[0]}-${allValues[allValues.length - 1]})`,
        });
      }
    }

    return { layers, allValues, issues, scale };
  }
}

export function extractZIndex(styles: ZIndexStyle[] = []): ZIndexResult {
  return new ZIndexCueExtractor().extract(styles);
}
