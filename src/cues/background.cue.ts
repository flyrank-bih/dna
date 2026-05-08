import { type CueExtractor } from "./cue.protocol";

interface BackgroundStyleInput {
  backgroundImage?: string;
  "background-image"?: string;
}

interface BackgroundRawData {
  light?: { computedStyles?: BackgroundStyleInput[] };
}

interface BackgroundPatternResult {
  labels: string[];
  counts: {
    noise: number;
    dotGrid: number;
    lineGrid: number;
    meshCount: number;
    svgPattern: number;
  };
  gradientTotals: { radial: number; linear: number };
  samples: Array<{ tag: string; value: string }>;
}

// All pattern detectors operate on a length-capped string. Adversarial CSS
// background-image values (data URIs in particular) can run several KB; cap
// to 4KB so the regexes can never run quadratic over megabyte payloads.
const MAX_BG_LEN = 4096;
function cap(s: string | undefined): string {
  return typeof s === "string" ? s.slice(0, MAX_BG_LEN) : "";
}

function looksLikeDotGrid(image: string): boolean {
  const s = cap(image);
  // Bounded inner content (.{0,256}) instead of unbounded .* — no nested quantifier risk.
  return (
    /radial-gradient\([^)]{0,256}\)/i.test(s) &&
    /repeat/i.test(s) &&
    /\d{1,4}px\s{0,4}\d{1,4}px/.test(s)
  );
}

function looksLikeLineGrid(image: string): boolean {
  // repeating-linear-gradient with a narrow colored band.
  return /repeating-linear-gradient/i.test(cap(image));
}

function looksLikeNoise(image: string): boolean {
  const s = cap(image);
  // Bounded character class instead of .+ — `.+` could backtrack on long data URIs.
  return (
    /feTurbulence|data:image\/svg[^"']{0,2048}fractalNoise/i.test(s) ||
    /noise\.(png|svg|webp)/i.test(s)
  );
}

function countRadialGradients(image: string): number {
  return (image.match(/radial-gradient\(/gi) || []).length;
}

function countLinearGradients(image: string): number {
  return (image.match(/linear-gradient\(/gi) || []).length;
}

function detectSvgPattern(image: string): boolean {
  return /url\("data:image\/svg/i.test(image) && !looksLikeNoise(image);
}

export class BackgroundPatternCueExtractor
  implements CueExtractor<[rawData: BackgroundRawData], BackgroundPatternResult>
{
  extract(rawData: BackgroundRawData = {}): BackgroundPatternResult {
    const styles = rawData.light?.computedStyles || [];
    let dotGrid = 0;
    let lineGrid = 0;
    let noise = 0;
    let svgPattern = 0;
    let radialSum = 0;
    let linearSum = 0;
    let meshCount = 0;
    const samples: Array<{ tag: string; value: string }> = [];

    for (const style of styles) {
      const bg = style.backgroundImage || style["background-image"] || "";
      if (!bg || bg === "none") continue;

      const radial = countRadialGradients(bg);
      const linear = countLinearGradients(bg);
      radialSum += radial;
      linearSum += linear;

      let tag: string | null = null;
      if (looksLikeNoise(bg)) {
        noise++;
        tag = "noise";
      } else if (looksLikeDotGrid(bg)) {
        dotGrid++;
        tag = "dot-grid";
      } else if (looksLikeLineGrid(bg)) {
        lineGrid++;
        tag = "line-grid";
      } else if (radial >= 2) {
        meshCount++;
        tag = "gradient-mesh";
      } else if (detectSvgPattern(bg)) {
        svgPattern++;
        tag = "svg-pattern";
      }

      if (tag && samples.length < 8) samples.push({ tag, value: bg.slice(0, 200) });
    }

    const total = styles.length || 1;
    const labels: string[] = [];
    if (noise / total > 0.002) labels.push("noise");
    if (dotGrid / total > 0.002) labels.push("dot-grid");
    if (lineGrid / total > 0.002) labels.push("line-grid");
    if (meshCount > 0) labels.push("gradient-mesh");
    if (svgPattern > 0) labels.push("svg-pattern");
    if (!labels.length) labels.push("plain");

    return {
      labels,
      counts: { noise, dotGrid, lineGrid, meshCount, svgPattern },
      gradientTotals: { radial: radialSum, linear: linearSum },
      samples,
    };
  }
}

export function extractBackgroundPatterns(
  rawData: BackgroundRawData = {},
): BackgroundPatternResult {
  return new BackgroundPatternCueExtractor().extract(rawData);
}
