import { type CueExtractor } from "./cue.protocol";

type GradientType = "linear" | "radial" | "conic" | "repeating-linear" | "repeating-radial" | "repeating-conic";
type GradientClassification = "subtle" | "brand" | "bold" | "complex";

interface GradientStyleInput {
  backgroundImage?: string;
}

interface GradientStop {
  color: string;
  position: string | null;
}

interface ParsedGradient {
  raw: string;
  type: GradientType | string;
  direction: string | null;
  stops: GradientStop[];
  classification: GradientClassification;
}

interface GradientResult {
  gradients: ParsedGradient[];
  count: number;
}

export class GradientCueExtractor
  implements CueExtractor<[styles: GradientStyleInput[]], GradientResult>
{
  private splitGradients(value: string): string[] {
    const results: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < value.length; i++) {
      if (value[i] === "(") depth++;
      else if (value[i] === ")") depth--;
      else if (value[i] === "," && depth === 0) {
        const chunk = value.slice(start, i).trim();
        if (chunk.includes("gradient")) results.push(chunk);
        start = i + 1;
      }
    }
    const last = value.slice(start).trim();
    if (last.includes("gradient")) results.push(last);
    return results;
  }

  private parseGradient(raw: string): ParsedGradient {
    const typeMatch = raw.match(/^(repeating-)?(linear|radial|conic)-gradient/);
    const type = typeMatch
      ? (`${typeMatch[1] || ""}${typeMatch[2]}` as GradientType)
      : "linear";
    const inner = raw.slice(raw.indexOf("(") + 1, raw.lastIndexOf(")"));

    const args: string[] = [];
    let depth = 0;
    let start = 0;
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === "(") depth++;
      else if (inner[i] === ")") depth--;
      else if (inner[i] === "," && depth === 0) {
        args.push(inner.slice(start, i).trim());
        start = i + 1;
      }
    }
    args.push(inner.slice(start).trim());

    let direction: string | null = null;
    let stopArgs = args;
    const first = args[0] || "";
    if (
      /^(to |from |\d+(\.\d+)?(deg|grad|rad|turn)|at )/.test(first) ||
      /^(circle|ellipse)/.test(first)
    ) {
      direction = first;
      stopArgs = args.slice(1);
    }

    const stops: GradientStop[] = stopArgs.map((stop) => {
      const trimmed = stop.trim();
      const lastParen = trimmed.lastIndexOf(")");
      const trailing = lastParen >= 0 ? trimmed.slice(lastParen + 1).trim() : trimmed;
      const posMatch = trailing.match(/([\d.]+(%|px|em|rem|vw|vh)?)$/);
      let position: string | null = null;
      let color = trimmed;

      if (posMatch && posMatch[0] !== trimmed) {
        position = posMatch[0];
        color = trimmed
          .slice(0, trimmed.length - trailing.length + trailing.indexOf(posMatch[0]))
          .trim();
      } else if (lastParen < 0) {
        const simplePos = trimmed.match(/\s+([\d.]+(%|px|em|rem|vw|vh)?)$/);
        if (simplePos) {
          position = simplePos[1];
          color = trimmed.slice(0, simplePos.index).trim();
        }
      }

      return { color, position };
    });

    const colorCount = stops.length;
    let classification: GradientClassification = "subtle";
    if (colorCount > 4) classification = "complex";
    else if (colorCount > 2) classification = "bold";
    else if (colorCount === 2) classification = "brand";

    return { raw, type, direction, stops, classification };
  }

  extract(styles: GradientStyleInput[] = []): GradientResult {
    const seen = new Set<string>();
    const gradients: ParsedGradient[] = [];

    for (const element of styles) {
      const bg = element.backgroundImage;
      if (!bg || !bg.includes("gradient")) continue;
      const rawGradients = this.splitGradients(bg);
      for (let raw of rawGradients) {
        raw = raw.replace(/-(webkit|moz)-/g, "");
        if (seen.has(raw)) continue;
        seen.add(raw);
        gradients.push(this.parseGradient(raw));
      }
    }

    return { gradients, count: gradients.length };
  }
}

export function extractGradients(styles: GradientStyleInput[] = []): GradientResult {
  return new GradientCueExtractor().extract(styles);
}
