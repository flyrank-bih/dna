import { type CueExtractor } from "./cue.protocol";

const KW = {
  pricing: /\b(\$\s*\d|per\s?month|\/mo\b|pricing|free|billed)/i,
  testimonials: /(customer|review|testimonial|said|"|")/i,
  features: /(feature|benefit|why|what you get)/i,
  cta: /(get started|sign up|try free|start now|request demo|contact sales)/i,
};

interface SemanticSection {
  role?: string;
  tag?: string;
  className?: string;
  id?: string;
  text?: string;
  headings?: string[];
  cardCount?: number;
  buttonCount?: number;
  bounds?: { h?: number };
}

export interface SemanticRegionResult {
  role: string;
  tag?: string;
  bounds?: { h?: number };
  heading: string | null;
  buttonCount: number;
  cardCount: number;
  className: string | null;
}

function classify(section: SemanticSection): string {
  const role = (section.role || "").toLowerCase();
  const tag = (section.tag || "").toLowerCase();
  if (tag === "nav" || role === "navigation") return "nav";
  if (tag === "header" || role === "banner") return "nav";
  if (tag === "footer" || role === "contentinfo") return "footer";
  if (tag === "aside" || role === "complementary") return "sidebar";

  const cls = (section.className || "").toLowerCase();
  const id = (section.id || "").toLowerCase();
  const blob = `${cls} ${id}`;
  const text = section.text || "";
  const headings = section.headings || [];

  if (/hero/.test(blob)) return "hero";
  if (/pricing/.test(blob) || KW.pricing.test(text)) return "pricing";
  if (/testimonial|review/.test(blob) || KW.testimonials.test(text))
    return "testimonials";
  if (/features?|grid/.test(blob) && (section.cardCount || 0) >= 3) return "features";
  if (KW.features.test(text) && (section.cardCount || 0) >= 3) return "features";
  if (
    (section.buttonCount || 0) <= 2 &&
    headings.length &&
    text.length < 400 &&
    KW.cta.test(text)
  )
    return "cta";
  if (
    headings.length === 1 &&
    (section.buttonCount || 0) >= 1 &&
    section.bounds &&
    (section.bounds.h || 0) > 300
  )
    return "hero";
  return "content";
}

export class SemanticRegionsCueExtractor
  implements CueExtractor<[sections?: SemanticSection[]], SemanticRegionResult[]>
{
  extract(sections: SemanticSection[] = []): SemanticRegionResult[] {
    return sections.map((section) => ({
      role: classify(section),
      tag: section.tag,
      bounds: section.bounds,
      heading: (section.headings && section.headings[0]) || null,
      buttonCount: section.buttonCount || 0,
      cardCount: section.cardCount || 0,
      className: section.className || null,
    }));
  }
}

export function extractSemanticRegions(
  sections: SemanticSection[] = [],
): SemanticRegionResult[] {
  return new SemanticRegionsCueExtractor().extract(sections);
}
