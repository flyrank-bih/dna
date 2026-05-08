import { type CueExtractor } from "./cue.protocol";

interface IconClassifierContext {
  strokeDominant: boolean;
  fillDominant: boolean;
  mixedFillStroke: boolean;
  avgWeight: number;
  roundedCaps: boolean;
  grid24: boolean;
}

interface LibraryHint {
  id: string;
  match: (ctx: IconClassifierContext) => boolean;
  score: number;
}

const LIBRARY_HINTS = [
  {
    id: "lucide",
    match: (ctx) =>
      ctx.strokeDominant &&
      ctx.avgWeight > 1.3 &&
      ctx.avgWeight < 1.7 &&
      ctx.grid24 &&
      !ctx.roundedCaps,
    score: 0.8,
  },
  {
    id: "heroicons-outline",
    match: (ctx) =>
      ctx.strokeDominant &&
      ctx.avgWeight >= 1.8 &&
      ctx.avgWeight <= 2.2 &&
      ctx.grid24,
    score: 0.8,
  },
  {
    id: "heroicons-solid",
    match: (ctx) => ctx.fillDominant && ctx.grid24,
    score: 0.55,
  },
  {
    id: "phosphor",
    match: (ctx) => ctx.strokeDominant && ctx.roundedCaps && ctx.grid24,
    score: 0.7,
  },
  {
    id: "tabler",
    match: (ctx) => ctx.strokeDominant && ctx.avgWeight > 1.9 && ctx.grid24,
    score: 0.6,
  },
  {
    id: "feather",
    match: (ctx) =>
      ctx.strokeDominant &&
      ctx.avgWeight > 1.8 &&
      ctx.roundedCaps &&
      ctx.grid24,
    score: 0.7,
  },
  {
    id: "remix",
    match: (ctx) => ctx.mixedFillStroke && ctx.grid24,
    score: 0.45,
  },
  {
    id: "material",
    match: (ctx) => ctx.fillDominant && ctx.grid24,
    score: 0.4,
  },
] as const satisfies readonly LibraryHint[];

interface IconInput {
  svg?: string;
  stroke?: string;
  fill?: string;
  viewBox?: string;
  classList?: string;
}

function parseStroke(v: string | undefined): number {
  if (!v) return 0;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function viewBoxGrid(vb: string | undefined): number | null {
  if (!vb) return null;
  const parts = vb.trim().split(/\s+/).map(Number);
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const w = parts[2],
    h = parts[3];
  if (w === h && [16, 20, 24, 32, 48, 64].includes(w)) return w;
  return null;
}

function detectRoundedCaps(svg: string | undefined): boolean {
  // Look for `stroke-linecap="round"` or `stroke-linejoin="round"` as a
  // proxy for Phosphor/Feather-style rounded terminals.
  return /stroke-linecap="round"|stroke-linejoin="round"/i.test(svg || "");
}

export interface IconSystemResult {
  library: string;
  confidence: number;
  alternates?: Array<{ id: string; score: number }>;
  stats: {
    count?: number;
    strokeOnly?: number;
    fillOnly?: number;
    mixed?: number;
    avgStrokeWidth?: number;
    gridDistribution?: Record<number, number>;
    roundedCapsFraction?: number;
  };
  signals: string[];
  icons: Array<{
    class: string;
    grid: number | null;
    strokeWidth: number | null;
    style: "stroke" | "fill" | "mixed";
  }>;
}

export class IconSystemCueExtractor
  implements CueExtractor<[icons: IconInput[]], IconSystemResult>
{
  extract(icons: IconInput[] = []): IconSystemResult {
    if (!icons.length) {
      return {
        library: "unknown",
        confidence: 0,
        stats: {},
        signals: [],
        icons: [],
      };
    }

    let strokeCount = 0;
    let fillCount = 0;
    let mixed = 0;
    const weights: number[] = [];
    const gridHits: Record<number, number> = {};
    let rounded = 0;
    const perIconHints: Array<{
      class: string;
      grid: number | null;
      strokeWidth: number | null;
      style: "stroke" | "fill" | "mixed";
    }> = [];

    for (const icon of icons) {
    const svg = icon.svg || "";
    const stroke = icon.stroke || (svg.match(/stroke="([^"]+)"/i) || [])[1];
    const fill = icon.fill || (svg.match(/fill="([^"]+)"/i) || [])[1];
    const strokeWidthMatch = svg.match(/stroke-width="([0-9.]+)"/i);
    const sw = strokeWidthMatch ? parseStroke(strokeWidthMatch[1]) : 0;

    const hasStroke = !!(stroke && stroke !== "none");
    const hasFill = !!(fill && fill !== "none");
    if (hasStroke && !hasFill) strokeCount++;
    else if (hasFill && !hasStroke) fillCount++;
    else if (hasStroke && hasFill) mixed++;
    if (sw > 0) weights.push(sw);
    const grid = viewBoxGrid(icon.viewBox);
    if (grid) gridHits[grid] = (gridHits[grid] || 0) + 1;
    if (detectRoundedCaps(svg)) rounded++;

    perIconHints.push({
      class: (icon.classList || "").slice(0, 80),
      grid,
      strokeWidth: sw || null,
      style:
        hasStroke && !hasFill
          ? "stroke"
          : hasFill && !hasStroke
            ? "fill"
            : "mixed",
    });
    }

    const avgWeight = weights.length
      ? weights.reduce((a, b) => a + b, 0) / weights.length
      : 0;
    const total = icons.length;
    const ctx: IconClassifierContext = {
      strokeDominant: strokeCount / total > 0.55,
      fillDominant: fillCount / total > 0.55,
      mixedFillStroke: mixed / total > 0.3,
      avgWeight,
      roundedCaps: rounded / total > 0.4,
      grid24: gridHits[24] ? gridHits[24] / total > 0.5 : false,
    };

    const scored = LIBRARY_HINTS.map((lib) => ({
      id: lib.id,
      score: lib.match(ctx) ? lib.score : 0,
    }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score);

    const primary = scored[0] || { id: "unknown", score: 0 };

    return {
      library: primary.id,
      confidence: Number(primary.score.toFixed(3)),
      alternates: scored.slice(1, 4),
      stats: {
        count: total,
        strokeOnly: strokeCount,
        fillOnly: fillCount,
        mixed,
        avgStrokeWidth: Number(avgWeight.toFixed(2)),
        gridDistribution: gridHits,
        roundedCapsFraction: Number((rounded / total).toFixed(2)),
      },
      signals: Object.entries(ctx)
        .filter(([, v]) => v === true)
        .map(([k]) => k),
      icons: perIconHints.slice(0, 30),
    };
  }
}

export function extractIconSystem(icons: IconInput[] = []): IconSystemResult {
  return new IconSystemCueExtractor().extract(icons);
}
