import { type CueExtractor } from "./cue.protocol";

const CTA_RE =
  /\b(get started|sign ?up|try (free|it|now)|start (free|trial|now)|book a demo|request demo|contact sales|talk to sales|learn more|watch demo)\b/i;
const STATS_RE = /\b(\d[\d,.]*[+%]|\d+x\b|\$\d+[MBK]\b)/i;
const FAQ_RE =
  /\b(frequently asked|faq|common questions|questions & answers)\b/i;
const STEPS_RE = /\b(step\s?\d|how it works|\d\s*\.\s+[A-Z])/i;
const COMPARE_RE = /\b(vs\.?|compared to|free vs|basic vs|enterprise vs)\b/i;
const TESTIMONIAL_RE =
  /(".{20,}"|".{20,}"|—\s?[A-Z][a-z]+\s+[A-Z][a-z]+|ceo|founder|head of)/i;
const PRICING_RE =
  /(\$\s?\d|€\s?\d|£\s?\d|per\s?(month|user|seat)|\/mo\b|\/month|billed)/i;

interface SectionLike {
  tag?: string;
  role?: string;
  className?: string;
  id?: string;
  text?: string;
  headings?: string[];
  cardCount?: number;
  buttonCount?: number;
  bounds?: { y?: number; h?: number };
}

interface RegionLike {
  role?: string;
}

interface SectionRoleLabel {
  index: number;
  tag?: string;
  role: string;
  subrole: string | null;
  confidence: number;
  heading: string | null;
  bounds?: { y?: number; h?: number };
  buttonCount: number;
  cardCount: number;
  slots: Record<string, unknown>;
  needsSmart: boolean;
}

interface SectionRoleExtractionResult {
  sections: SectionRoleLabel[];
  counts: Record<string, number>;
  readingOrder: string[];
}

function sectionBlob(section: SectionLike): string {
  return `${section.className || ""} ${section.id || ""}`.toLowerCase();
}

function detectLogoWall(section: SectionLike): boolean {
  const sectionText = section.text || "";
  const fullText = `${sectionText} ${sectionBlob(section)}`;
  if (
    (section.cardCount || 0) >= 5 &&
    sectionText.length < 400 &&
    /(trusted by|used by|customers|as seen in|logos?|partners|clients)/i.test(fullText)
  ) {
    return true;
  }
  return false;
}

function detectBento(section: SectionLike): boolean {
  const classBlob = sectionBlob(section);
  if (/bento/.test(classBlob)) return true;
  const cards = section.cardCount || 0;
  const hasGridHint = /\b(grid|mosaic|tile|cards?)\b/.test(classBlob);
  return hasGridHint && cards >= 4 && cards <= 12;
}

function classifyRole(
  section: SectionLike,
  existingRole: string | null,
  pageType: string | null,
) {
  const text = (section.text || "").slice(0, 2000);
  const classBlob = sectionBlob(section);
  const headings = section.headings || [];

  if (section.tag === "footer") return { role: "footer", confidence: 0.95 };
  if (section.tag === "nav" || /^nav|header-nav|top-?bar/.test(classBlob))
    return { role: "nav", confidence: 0.9 };

  if (
    /logo-?(wall|cloud|grid|strip)|trusted-?by/.test(classBlob) ||
    detectLogoWall(section)
  ) {
    return { role: "logo-wall", confidence: 0.85 };
  }
  if (/bento/.test(classBlob) || detectBento(section))
    return { role: "bento", subrole: "features", confidence: 0.75 };
  if (/gallery|carousel|slider/.test(classBlob))
    return { role: "gallery", confidence: 0.7 };
  if (/stat(s|istic)|metric|number/.test(classBlob) && STATS_RE.test(text))
    return { role: "stats", confidence: 0.85 };
  if (FAQ_RE.test(text) || /\bfaq\b/.test(classBlob))
    return { role: "faq", confidence: 0.85 };
  if (STEPS_RE.test(text) && (section.cardCount || 0) >= 3)
    return { role: "steps", confidence: 0.75 };
  if (COMPARE_RE.test(text) && (section.cardCount || 0) >= 2)
    return { role: "comparison", confidence: 0.7 };
  if (PRICING_RE.test(text) && (section.cardCount || 0) >= 2)
    return { role: "pricing-table", confidence: 0.9 };

  if (TESTIMONIAL_RE.test(text) || /testimonial|review|quote/.test(classBlob)) {
    return { role: "testimonial", confidence: 0.8 };
  }
  if (
    /hero/.test(classBlob) ||
    (headings.length === 1 &&
      (section.buttonCount || 0) >= 1 &&
      section.bounds &&
      (section.bounds.h || 0) > 300 &&
      (section.bounds.y || 0) < 400)
  ) {
    return { role: "hero", confidence: 0.85 };
  }
  if (
    (section.cardCount || 0) >= 3 &&
    (/(feature|benefit|what you get|why )/i.test(text) ||
      /feature|grid/.test(classBlob))
  ) {
    return { role: "feature-grid", confidence: 0.8 };
  }
  if (
    CTA_RE.test(text) &&
    (section.buttonCount || 0) >= 1 &&
    text.length < 600
  ) {
    return { role: "cta", confidence: 0.75 };
  }
  if (pageType === "blog" && (section.cardCount || 0) >= 3) {
    return { role: "blog-grid", confidence: 0.75 };
  }

  if (existingRole && existingRole !== "content") {
    return { role: existingRole, confidence: 0.4 };
  }
  return { role: "content", confidence: 0.3 };
}

function extractSlots(section: SectionLike): Record<string, unknown> {
  const slots: Record<string, unknown> = {};
  if ((section.headings || []).length) slots.heading = (section.headings || [])[0];
  if ((section.headings || []).length > 1) {
    slots.subheadings = (section.headings || []).slice(1);
  }
  if ((section.buttonCount || 0) > 0) slots.ctaCount = section.buttonCount || 0;
  const text = section.text || "";
  const firstPara = text.split(/\n{2,}/)[0];
  if (firstPara && firstPara.length < 400 && firstPara !== slots.heading) {
    slots.lede = firstPara.trim();
  }
  return slots;
}

export class SectionRolesCueExtractor
  implements
    CueExtractor<
      [sections?: SectionLike[], regions?: RegionLike[], pageIntent?: { type?: string } | null],
      SectionRoleExtractionResult
    >
{
  extract(
    sections: SectionLike[] = [],
    regions: RegionLike[] = [],
    pageIntent: { type?: string } | null = null,
  ): SectionRoleExtractionResult {
    const pageType = pageIntent?.type || null;
    const labeled = sections.map((section, index) => {
      const existing = regions[index]?.role || null;
      const classified = classifyRole(section, existing, pageType);
      const confidence = Number((classified.confidence || 0).toFixed(3));

      return {
        index,
        tag: section.tag,
        role: classified.role,
        subrole: classified.subrole || null,
        confidence,
        heading: (section.headings && section.headings[0]) || null,
        bounds: section.bounds,
        buttonCount: section.buttonCount || 0,
        cardCount: section.cardCount || 0,
        slots: extractSlots(section),
        needsSmart: confidence < 0.5,
      };
    });

    const byRole: Record<string, number> = {};
    for (const roleLabel of labeled) {
      byRole[roleLabel.role] = (byRole[roleLabel.role] || 0) + 1;
    }

    return {
      sections: labeled,
      counts: byRole,
      readingOrder: labeled
        .filter((entry) => entry.bounds)
        .sort((a, b) => (a.bounds?.y || 0) - (b.bounds?.y || 0))
        .map((entry) => entry.role),
    };
  }
}

export function extractSectionRoles(
  sections: SectionLike[] = [],
  regions: RegionLike[] = [],
  pageIntent: { type?: string } | null = null,
): SectionRoleExtractionResult {
  return new SectionRolesCueExtractor().extract(sections, regions, pageIntent);
}
