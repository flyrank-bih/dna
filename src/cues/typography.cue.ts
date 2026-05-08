import { parseCSSValue } from "@/helpers/general.helpers";
import { type CueExtractor } from "./cue.protocol";

interface TypographyStyleInput {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  tag?: string;
}

interface TypographyScaleEntry {
  size: number;
  weight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  tags: Array<string | undefined>;
  count: number;
}

interface TypographyResult {
  families: Array<{ name: string; count: number; usage: "all" | "headings" | "body" }>;
  scale: TypographyScaleEntry[];
  headings: TypographyScaleEntry[];
  body: TypographyScaleEntry | null;
  weights: Array<{ weight: string; count: number }>;
}

interface TypographySizeEntry {
  size: number;
  weight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  tag?: string;
  family?: string;
}

export class TypographyCueExtractor
  implements CueExtractor<[computedStyles?: TypographyStyleInput[]], TypographyResult>
{
  extract(computedStyles: TypographyStyleInput[] = []): TypographyResult {
    const familyCount = new Map<string, number>();
    const sizeEntries: TypographySizeEntry[] = [];
    const weightCount = new Map<string, number>();

    for (const style of computedStyles) {
      const family = style.fontFamily?.replace(/["']/g, "").split(",")[0]?.trim();
      if (family) familyCount.set(family, (familyCount.get(family) || 0) + 1);

      const sizeVal = parseCSSValue(style.fontSize);
      if (sizeVal) {
        sizeEntries.push({
          size: sizeVal.value,
          weight: style.fontWeight,
          lineHeight: style.lineHeight,
          letterSpacing: style.letterSpacing,
          tag: style.tag,
          family,
        });
      }

      if (style.fontWeight) {
        weightCount.set(style.fontWeight, (weightCount.get(style.fontWeight) || 0) + 1);
      }
    }

    const families = [...familyCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => {
        const usedOn = computedStyles
          .filter((style) => style.fontFamily?.includes(name))
          .map((style) => style.tag);
        const headingUse = usedOn.some((tag) => /^h[1-6]$/.test(tag || ""));
        const bodyUse = usedOn.some((tag) =>
          ["p", "span", "li", "div"].includes(tag || ""),
        );
        const usage: "all" | "headings" | "body" =
          headingUse && bodyUse ? "all" : headingUse ? "headings" : "body";
        return {
          name,
          count,
          usage,
        };
      });

    const sizeMap = new Map<
      number,
      {
        size: number;
        weight?: string;
        lineHeight?: string;
        letterSpacing?: string;
        tags: Set<string | undefined>;
        count: number;
      }
    >();
    for (const entry of sizeEntries) {
      const key = entry.size;
      if (!sizeMap.has(key)) {
        sizeMap.set(key, {
          size: entry.size,
          weight: entry.weight,
          lineHeight: entry.lineHeight,
          letterSpacing: entry.letterSpacing,
          tags: new Set(),
          count: 0,
        });
      }
      const scaleEntry = sizeMap.get(key);
      if (!scaleEntry) continue;
      scaleEntry.tags.add(entry.tag);
      scaleEntry.count++;
    }

    const scale = [...sizeMap.values()]
      .sort((a, b) => b.size - a.size)
      .map((entry) => ({ ...entry, tags: [...entry.tags] }));

    const headings = scale.filter((entry) =>
      entry.tags.some((tag) => /^h[1-6]$/.test(tag || "")),
    );

    const bodyEntries = sizeEntries.filter((entry) =>
      ["p", "span", "li"].includes(entry.tag || ""),
    );
    const bodySizeCount = new Map<number, number>();
    for (const entry of bodyEntries) {
      bodySizeCount.set(entry.size, (bodySizeCount.get(entry.size) || 0) + 1);
    }
    const bodySize = [...bodySizeCount.entries()].sort((a, b) => b[1] - a[1])[0];
    const body = bodySize ? scale.find((entry) => entry.size === bodySize[0]) || null : null;

    const weights = [...weightCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([weight, count]) => ({ weight, count }));

    return { families, scale, headings, body, weights };
  }
}

export function extractTypography(
  computedStyles: TypographyStyleInput[] = [],
): TypographyResult {
  return new TypographyCueExtractor().extract(computedStyles);
}
