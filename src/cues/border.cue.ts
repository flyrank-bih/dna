import { parseCSSValue, clusterValues } from "@/helpers/general.helpers";
import { type CueExtractor } from "./cue.protocol";

function parseBorderRadius(raw: string | undefined): number[] {
  if (!raw || raw === "0px") return [];
  // Handle slash-separated (x/y) syntax — take the x part
  const parts = raw.split("/")[0].trim().split(/\s+/);
  const values: number[] = [];
  for (const p of parts) {
    const v = parseCSSValue(p);
    if (v && v.value > 0) values.push(Math.round(v.value));
  }
  return values;
}

interface BorderComputedStyle {
  borderRadius?: string;
  borderWidth?: string;
  borderStyle?: string;
}

interface BorderResult {
  radii: Array<{ value: number; label: string; count: number }>;
  widths: number[];
  styles: string[];
}

export class BorderCueExtractor
  implements CueExtractor<[computedStyles: readonly BorderComputedStyle[]], BorderResult>
{
  extract(computedStyles: readonly BorderComputedStyle[] = []): BorderResult {
    const radiiSet = new Map<number, number>();
    const widthSet = new Set<number>();
    const styleSet = new Set<string>();

    for (const el of computedStyles) {
    if (el.borderRadius && el.borderRadius !== "0px") {
      const values = parseBorderRadius(el.borderRadius);
      if (values.length > 0) {
        const representative = Math.max(...values);
        radiiSet.set(representative, (radiiSet.get(representative) || 0) + 1);
      }
    }

    if (el.borderWidth) {
      const parts = el.borderWidth.split(/\s+/);
      for (const p of parts) {
        const v = parseCSSValue(p);
        if (v && v.value > 0) widthSet.add(Math.round(v.value));
      }
    }

    if (el.borderStyle) {
      const parts = el.borderStyle.split(/\s+/);
      for (const p of parts) {
        if (p && p !== "none" && p !== "initial") styleSet.add(p);
      }
    }
    }

    const sorted = [...radiiSet.keys()].sort((a, b) => a - b);
    const clustered = clusterValues(sorted, 2);

    const radii = clustered.map((v: number) => {
      let label;
      if (v <= 2) label = "xs";
      else if (v <= 5) label = "sm";
      else if (v <= 10) label = "md";
      else if (v <= 16) label = "lg";
      else if (v <= 24) label = "xl";
      else label = "full";
      return { value: v, label, count: radiiSet.get(v) || 0 };
    });

    const widths = [...widthSet].sort((a, b) => a - b);
    const styles = [...styleSet].sort((a, b) => a.localeCompare(b));

    return { radii, widths, styles };
  }
}

export function extractBorders(
  computedStyles: readonly BorderComputedStyle[] = [],
): BorderResult {
  return new BorderCueExtractor().extract(computedStyles);
}
