import { type CueExtractor } from "./cue.protocol";

interface MessagingInput {
  pageIntent?: { type?: string };
  voice?: {
    sampleHeadings?: string[];
    ctaVerbs?: Array<{ value?: string; count?: number }>;
    buttonPatterns?: Array<{ value?: string; count?: number }>;
  };
  sectionRoles?: {
    sections?: Array<{ role?: string; heading?: string; slots?: { heading?: string } }>;
    readingOrder?: string[];
  };
}

interface MessagingArchitectureResult {
  headlineFormula:
    | "question-led"
    | "outcome-led"
    | "proof-led"
    | "feature-led"
    | "unknown";
  ctaHierarchy: {
    primary: string[];
    secondary: string[];
  };
  proofModules: string[];
  persuasionSequence: string[];
}

function normalizeText(value?: string): string {
  return (value || "").replace(/\s+/g, " ").trim().toLowerCase();
}

export class MessagingArchitectureCueExtractor
  implements CueExtractor<[input: MessagingInput], MessagingArchitectureResult>
{
  extract(input: MessagingInput = {}): MessagingArchitectureResult {
    const headings = input.voice?.sampleHeadings || [];
    const firstHeading = normalizeText(headings[0]);
    const sectionRoles = input.sectionRoles?.sections || [];
    const ctas = (input.voice?.buttonPatterns || [])
      .map((entry) => normalizeText(entry.value))
      .filter(Boolean);

    const headlineFormula: MessagingArchitectureResult["headlineFormula"] =
      firstHeading.includes("?")
        ? "question-led"
        : /increase|grow|get|improve|launch|convert|scale/.test(firstHeading)
          ? "outcome-led"
          : sectionRoles.some((section) =>
                /testimonial|logo|proof|case-study|stats/.test(section.role || ""),
              )
            ? "proof-led"
            : sectionRoles.some((section) => /feature/i.test(section.role || ""))
              ? "feature-led"
              : "unknown";

    const proofModules = [
      sectionRoles.some((section) => /testimonial/i.test(section.role || "")) ? "testimonials" : "",
      sectionRoles.some((section) => /logo/i.test(section.role || "")) ? "logo-cloud" : "",
      sectionRoles.some((section) => /stats|metric/i.test(section.role || "")) ? "stats" : "",
      sectionRoles.some((section) => /faq/i.test(section.role || "")) ? "faq" : "",
    ].filter(Boolean);

    const persuasionSequence =
      (input.sectionRoles?.readingOrder || []).length > 0
        ? (input.sectionRoles?.readingOrder || []).slice(0, 8)
        : [input.pageIntent?.type || "landing", ...proofModules].slice(0, 8);

    return {
      headlineFormula,
      ctaHierarchy: {
        primary: ctas.slice(0, 3),
        secondary: ctas.slice(3, 6),
      },
      proofModules,
      persuasionSequence,
    };
  }
}

export function extractMessagingArchitecture(
  input: MessagingInput = {},
): MessagingArchitectureResult {
  return new MessagingArchitectureCueExtractor().extract(input);
}
