import { parseCSSValue, detectScale } from "@/helpers/general.helpers";
import { type CueExtractor } from "./cue.protocol";

interface SpacingResult {
  base: number | null;
  scale: readonly number[];
  tokens: Record<string, string>;
  raw: number[];
}

function naturalBreakCluster(values: number[]): number[] {
  if (values.length <= 1) return values;
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length <= 2) return sorted;

  const gaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(sorted[i] - sorted[i - 1]);
  }

  const sortedGaps = [...gaps].sort((a, b) => a - b);
  const medianGap = sortedGaps[Math.floor(sortedGaps.length / 2)];

  const clusters: number[][] = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    if (gaps[i - 1] > medianGap) {
      clusters.push([sorted[i]]);
    } else {
      clusters[clusters.length - 1].push(sorted[i]);
    }
  }

  return clusters.map((c) => c[0]);
}

interface SpacingComputedStyle {
  [key: string]: string | undefined;
}

const SPACING_PROPS = [
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "gap",
] as const;

export class SpacingCueExtractor
  implements CueExtractor<[computedStyles: readonly SpacingComputedStyle[]], SpacingResult>
{
  extract(computedStyles: readonly SpacingComputedStyle[] = []): SpacingResult {
    const allValues = new Set<number>();

    for (const style of computedStyles) {
      for (const prop of SPACING_PROPS) {
        const value = parseCSSValue(style[prop]);
        if (value && value.value > 0 && value.value < 500) {
          allValues.add(Math.round(value.value));
        }
      }
    }

    const sorted = [...allValues].sort((a, b) => a - b);
    const clustered = naturalBreakCluster(sorted);
    const { base, scale } = detectScale(clustered);

    const tokens: Record<string, string> = {};
    if (base) {
      for (const spacingValue of scale) {
        const step = spacingValue / base;
        if (Number.isInteger(step)) {
          tokens[String(step)] = `${spacingValue}px`;
        } else {
          tokens[`${spacingValue}px`] = `${spacingValue}px`;
        }
      }
    } else {
      for (let index = 0; index < scale.length; index++) {
        tokens[String(index)] = `${scale[index]}px`;
      }
    }

    return { base, scale, tokens, raw: sorted };
  }
}

export function extractSpacing(
  computedStyles: readonly SpacingComputedStyle[] = [],
): SpacingResult {
  return new SpacingCueExtractor().extract(computedStyles);
}
