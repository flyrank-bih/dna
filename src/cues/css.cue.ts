// CSS health audit — operates on page.coverage.stopCSSCoverage() output
// serialized as [{ url, text, totalBytes, ranges:[{start,end}] }].
import { type CueExtractor } from "./cue.protocol";

interface CoverageRange {
  start?: number;
  end?: number;
}

interface CssCoverageEntry {
  url?: string;
  text?: string;
  totalBytes?: number;
  ranges?: CoverageRange[];
}

interface CssHealthResult {
  sheets: Array<{
    url: string;
    totalBytes: number;
    usedBytes: number;
    unusedBytes: number;
    unusedPercent: number;
  }>;
  totalBytes: number;
  usedBytes: number;
  unusedBytes: number;
  unusedPercent: number;
  importantCount: number;
  duplicates: number;
  vendorPrefixes: { webkit: number; moz: number; ms: number; o: number };
  keyframes: Array<{ name: string; steps: number }>;
  specificity: {
    max: [number, number, number];
    average: [number, number, number];
    count: number;
  };
  issues: string[];
}

export class CssHealthCueExtractor
  implements CueExtractor<[coverage: CssCoverageEntry[]], CssHealthResult>
{
  private countUsed(ranges: CoverageRange[] = []): number {
    let used = 0;
    for (const range of ranges) {
      used += Math.max(0, (range.end || 0) - (range.start || 0));
    }
    return used;
  }

  private countImportant(text: string): number {
    return (text.match(/!important/g) || []).length;
  }

  private countDuplicates(text: string): number {
    const seen = new Map<string, number>();
    const re = /([\w-]+)\s*:\s*([^;{}!]+)(\s*!important)?\s*;?/g;
    for (const match of text.matchAll(re)) {
      const key = `${match[1].trim()}:${match[2].trim()}`;
      seen.set(key, (seen.get(key) || 0) + 1);
    }
    let dup = 0;
    for (const count of seen.values()) if (count >= 2) dup += count - 1;
    return dup;
  }

  private countVendorPrefixes(text: string) {
    return {
      webkit: (text.match(/-webkit-/g) || []).length,
      moz: (text.match(/-moz-/g) || []).length,
      ms: (text.match(/-ms-/g) || []).length,
      o: (text.match(/(^|[^-\w])-o-/g) || []).length,
    };
  }

  private extractKeyframes(text: string): Array<{ name: string; steps: number }> {
    const out: Array<{ name: string; steps: number }> = [];
    const re = /@keyframes\s+([\w-]+)\s*\{([\s\S]*?)\n\}/g;
    for (const match of text.matchAll(re)) {
      const body = match[2];
      const steps = (body.match(/(\d+%|from|to)\s*\{/g) || []).length;
      out.push({ name: match[1], steps });
    }
    return out;
  }

  private specificityFor(selector: string): [number, number, number] {
    const ids = (selector.match(/#[\w-]+/g) || []).length;
    const classes = (
      selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+(?:\([^)]+\))?/g) || []
    ).length;
    const types = (selector.match(/(?:^|[\s>+~,])([a-z][\w-]*)/gi) || []).length;
    return [ids, classes, types];
  }

  private specificityDistribution(text: string): {
    max: [number, number, number];
    average: [number, number, number];
    count: number;
  } {
    const triples: Array<[number, number, number]> = [];
    const re = /([^{}]+)\{([^}]*)\}/g;
    for (const match of text.matchAll(re)) {
      const selectorList = match[1];
      for (const selector of selectorList
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)) {
        if (selector.startsWith("@")) continue;
        triples.push(this.specificityFor(selector));
      }
    }

    if (!triples.length) {
      return { max: [0, 0, 0], average: [0, 0, 0], count: 0 };
    }

    const max: [number, number, number] = [0, 0, 0];
    const sum: [number, number, number] = [0, 0, 0];
    for (const triple of triples) {
      for (let i = 0; i < 3; i++) {
        sum[i] += triple[i];
        if (triple[i] > max[i]) max[i] = triple[i];
      }
    }
    return {
      max,
      average: [
        Math.round((sum[0] / triples.length) * 100) / 100,
        Math.round((sum[1] / triples.length) * 100) / 100,
        Math.round((sum[2] / triples.length) * 100) / 100,
      ],
      count: triples.length,
    };
  }

  extract(coverage: CssCoverageEntry[] = []): CssHealthResult {
    const sheets: CssHealthResult["sheets"] = [];
    let totalBytes = 0;
    let usedBytes = 0;
    let importantCount = 0;
    let duplicates = 0;
    const vendorPrefixes = { webkit: 0, moz: 0, ms: 0, o: 0 };
    const keyframes: Array<{ name: string; steps: number }> = [];
    const specMax: [number, number, number] = [0, 0, 0];
    const specSumWeighted: [number, number, number] = [0, 0, 0];
    let specCount = 0;

    for (const item of coverage) {
      const text = item.text || "";
      const sheetTotal = typeof item.totalBytes === "number" ? item.totalBytes : text.length;
      const sheetUsed = this.countUsed(item.ranges || []);
      const sheetUnused = Math.max(0, sheetTotal - sheetUsed);

      sheets.push({
        url: item.url || "",
        totalBytes: sheetTotal,
        usedBytes: sheetUsed,
        unusedBytes: sheetUnused,
        unusedPercent: sheetTotal ? Math.round((sheetUnused / sheetTotal) * 100) : 0,
      });

      totalBytes += sheetTotal;
      usedBytes += sheetUsed;
      importantCount += this.countImportant(text);
      duplicates += this.countDuplicates(text);

      const prefixes = this.countVendorPrefixes(text);
      vendorPrefixes.webkit += prefixes.webkit;
      vendorPrefixes.moz += prefixes.moz;
      vendorPrefixes.ms += prefixes.ms;
      vendorPrefixes.o += prefixes.o;
      keyframes.push(...this.extractKeyframes(text));

      const spec = this.specificityDistribution(text);
      for (let i = 0; i < 3; i++) {
        if (spec.max[i] > specMax[i]) specMax[i] = spec.max[i];
        specSumWeighted[i] += spec.average[i] * spec.count;
      }
      specCount += spec.count;
    }

    const unusedBytes = Math.max(0, totalBytes - usedBytes);
    const unusedPercent = totalBytes ? Math.round((unusedBytes / totalBytes) * 100) : 0;
    const specAvg: [number, number, number] =
      specCount > 0
        ? [
            Math.round((specSumWeighted[0] / specCount) * 100) / 100,
            Math.round((specSumWeighted[1] / specCount) * 100) / 100,
            Math.round((specSumWeighted[2] / specCount) * 100) / 100,
          ]
        : [0, 0, 0];

    const issues: string[] = [];
    if (importantCount > 0) {
      issues.push(`${importantCount} !important rule${importantCount > 1 ? "s" : ""}`);
    }
    if (duplicates > 0) {
      issues.push(`${duplicates} duplicate declaration${duplicates > 1 ? "s" : ""}`);
    }
    if (unusedPercent >= 50) issues.push(`${unusedPercent}% unused CSS`);

    return {
      sheets,
      totalBytes,
      usedBytes,
      unusedBytes,
      unusedPercent,
      importantCount,
      duplicates,
      vendorPrefixes,
      keyframes,
      specificity: { max: specMax, average: specAvg, count: specCount },
      issues,
    };
  }
}

export function extractCssHealth(coverage: CssCoverageEntry[] = []): CssHealthResult {
  return new CssHealthCueExtractor().extract(coverage);
}
