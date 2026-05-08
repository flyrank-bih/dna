import { type CueExtractor } from "./cue.protocol";

interface CompositionInput {
  sections?: Array<{
    role?: string;
    heading?: string;
    text?: string;
    children?: unknown[];
  }>;
  layout?: {
    grids?: unknown[];
    flex?: unknown[];
    containerWidths?: Array<{ maxWidth?: string | number }>;
  };
  components?: Record<string, unknown>;
  voice?: {
    sampleHeadings?: string[];
  };
}

interface CompositionResult {
  heroPattern:
    | "statement-centered"
    | "split-hero"
    | "proof-first"
    | "feature-grid"
    | "unknown";
  density: "compact" | "balanced" | "spacious";
  pacing: "editorial" | "balanced" | "utilitarian";
  emphasisPatterns: string[];
  evidence: string[];
}

function countSections(sections: CompositionInput["sections"]): number {
  return Array.isArray(sections) ? sections.length : 0;
}

export class CompositionCueExtractor
  implements CueExtractor<[input: CompositionInput], CompositionResult>
{
  extract(input: CompositionInput = {}): CompositionResult {
    const sections = input.sections || [];
    const headings = input.voice?.sampleHeadings || [];
    const sectionCount = countSections(sections);
    const containerCount = input.layout?.containerWidths?.length || 0;

    const evidence: string[] = [];
    let heroPattern: CompositionResult["heroPattern"] = "unknown";

    const firstHeading = headings[0] || sections[0]?.heading || "";
    if (/\n/.test(firstHeading) || firstHeading.length > 45) {
      heroPattern = "statement-centered";
      evidence.push("Large multiline opening headline");
    } else if (sections.some((section) => /feature-grid/i.test(section.role || ""))) {
      heroPattern = "feature-grid";
      evidence.push("Feature-grid section detected early");
    } else if (
      sections.some((section) => /testimonial|logo-cloud|stats|proof/i.test(section.role || ""))
    ) {
      heroPattern = "proof-first";
      evidence.push("Proof-oriented sections detected");
    } else if (containerCount > 1) {
      heroPattern = "split-hero";
      evidence.push("Multiple container widths suggest split layout");
    }

    const density: CompositionResult["density"] =
      sectionCount >= 8 ? "compact" : sectionCount <= 4 ? "spacious" : "balanced";

    const pacing: CompositionResult["pacing"] =
      headings.some((heading) => heading.length > 50) || sections.length <= 4
        ? "editorial"
        : sections.some((section) => /faq|pricing|comparison|table/i.test(section.role || ""))
          ? "utilitarian"
          : "balanced";

    const emphasisPatterns = [
      sections.some((section) => /feature-grid/i.test(section.role || "")) ? "feature-grid" : "",
      sections.some((section) => /testimonial|proof|logo/i.test(section.role || "")) ? "proof-modules" : "",
      sections.some((section) => /faq/i.test(section.role || "")) ? "faq" : "",
    ].filter(Boolean);

    return {
      heroPattern,
      density,
      pacing,
      emphasisPatterns,
      evidence,
    };
  }
}

export function extractComposition(
  input: CompositionInput = {},
): CompositionResult {
  return new CompositionCueExtractor().extract(input);
}
