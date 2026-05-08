import { type CueExtractor } from "./cue.protocol";

interface LayoutStyleInput {
  tag?: string;
  classList?: string;
  area?: number;
  hasText?: boolean;
  display?: string;
  position?: string;
  flexDirection?: string;
  flexWrap?: string;
  justifyContent?: string;
  alignItems?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  maxWidth?: string;
  gap?: string;
  backgroundImage?: string;
}

interface LayoutSectionInput {
  role?: string;
  heading?: string;
  text?: string;
  cardCount?: number;
  buttonCount?: number;
  bounds?: { y?: number; h?: number };
}

interface LayoutImageInput {
  width?: number;
  height?: number;
  format?: string;
}

export interface LayoutCueInput {
  computedStyles?: LayoutStyleInput[];
  sections?: LayoutSectionInput[];
  images?: LayoutImageInput[];
}

export interface LayoutCueResult {
  pattern:
    | "split"
    | "centered"
    | "editorial"
    | "dashboard"
    | "grid-heavy"
    | "single-column"
    | "masonry"
    | "card-wall"
    | "unknown";
  hero:
    | "split-media"
    | "headline-centered"
    | "proof-led"
    | "product-ui"
    | "unknown";
  density: "compact" | "balanced" | "spacious";
  alignment: "left-led" | "centered" | "mixed";
  mediaBalance: "text-led" | "balanced" | "visual-led";
  grid: {
    hasGrid: boolean;
    hasFlex: boolean;
    multiColumnSections: number;
    averageColumns: number;
    commonMaxWidths: Array<string | number>;
  };
  rhythm: {
    sectionCount: number;
    cardHeavy: boolean;
    alternatingCadence: boolean;
  };
  overallFeel:
    | "structured-editorial"
    | "systematic-product"
    | "marketing-visual"
    | "minimal-focused"
    | "utility-dense"
    | "unknown";
  confidence: number;
  evidence: string[];
}

function parseColumns(value?: string): number {
  if (!value || value === "none") return 0;
  const repeatMatch = value.match(/repeat\(\s*(\d+)/i);
  if (repeatMatch) return Number(repeatMatch[1]) || 0;
  return value
    .split(/\s+/)
    .filter((part) => part && !/minmax|fit-content|\//i.test(part)).length;
}

function parseNumericPx(value?: string): number | null {
  if (!value || value === "none") return null;
  const match = value.match(/(-?\d+(?:\.\d+)?)px/);
  return match ? Number(match[1]) : null;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export class LayoutCueExtractor
  implements CueExtractor<[input: LayoutCueInput], LayoutCueResult>
{
  extract(input: LayoutCueInput = {}): LayoutCueResult {
    const styles = input.computedStyles || [];
    const sections = input.sections || [];
    const images = input.images || [];
    const evidence: string[] = [];

    const gridStyles = styles.filter(
      (style) =>
        style.display === "grid" &&
        parseColumns(style.gridTemplateColumns) >= 2 &&
        (style.area || 0) > 40_000,
    );
    const flexRows = styles.filter(
      (style) =>
        style.display === "flex" &&
        style.flexDirection !== "column" &&
        (style.area || 0) > 40_000,
    );
    const commonMaxWidths = [...new Set(
      styles
        .map((style) => style.maxWidth || "")
        .filter((value) => value && value !== "none"),
    )].slice(0, 8);
    const averageColumns =
      gridStyles.length > 0
        ? Number(
            (
              gridStyles.reduce(
                (sum, style) => sum + parseColumns(style.gridTemplateColumns),
                0,
              ) / gridStyles.length
            ).toFixed(1),
          )
        : 0;
    const multiColumnSections =
      gridStyles.length +
      flexRows.filter((style) => /space-between|center/.test(style.justifyContent || "")).length;

    const heroSection = sections[0];
    const heroText = `${heroSection?.heading || ""} ${heroSection?.text || ""}`.trim();
    const screenshotLikeImages = images.filter(
      (image) => (image.width || 0) > 600 && (image.height || 0) > 320,
    ).length;
    const visualArea = styles
      .filter(
        (style) =>
          !style.hasText &&
          ((style.backgroundImage && style.backgroundImage !== "none") ||
            style.tag === "img"),
      )
      .reduce((sum, style) => sum + (style.area || 0), 0);
    const textArea = styles
      .filter((style) => style.hasText)
      .reduce((sum, style) => sum + (style.area || 0), 0);

    let pattern: LayoutCueResult["pattern"] = "unknown";
    if (gridStyles.some((style) => parseColumns(style.gridTemplateColumns) >= 4)) {
      pattern = "grid-heavy";
      evidence.push("Large grid sections detected");
    } else if (sections.some((section) => (section.cardCount || 0) >= 6)) {
      pattern = "card-wall";
      evidence.push("High card-count sections detected");
    } else if (styles.some((style) => /masonry/.test(style.classList || ""))) {
      pattern = "masonry";
      evidence.push("Masonry class hints detected");
    } else if (flexRows.length > 0 && screenshotLikeImages > 0) {
      pattern = "split";
      evidence.push("Split flex rows paired with large imagery/product media");
    } else if (
      commonMaxWidths.length <= 2 &&
      styles.filter((style) => parseNumericPx(style.maxWidth) !== null).length > 10
    ) {
      pattern = "centered";
      evidence.push("Consistent constrained container widths detected");
    } else if (
      sections.length <= 5 &&
      heroText.length > 60 &&
      textArea >= visualArea
    ) {
      pattern = "editorial";
      evidence.push("Long-form hero and text-led layout cadence detected");
    } else if (
      sections.some((section) => /pricing|comparison|faq|stats/i.test(section.role || "")) &&
      multiColumnSections >= 3
    ) {
      pattern = "dashboard";
      evidence.push("Utility/product-style multi-column sections detected");
    } else if (multiColumnSections === 0) {
      pattern = "single-column";
      evidence.push("No substantial multi-column sections detected");
    }

    let hero: LayoutCueResult["hero"] = "unknown";
    if (pattern === "split" || (flexRows.length > 0 && screenshotLikeImages > 0)) {
      hero = "split-media";
    } else if (
      heroSection &&
      (heroSection.buttonCount || 0) > 0 &&
      heroText.length > 30 &&
      (heroSection.cardCount || 0) === 0
    ) {
      hero = "headline-centered";
    } else if (
      sections.some((section) => /logo-wall|stats|testimonial/i.test(section.role || ""))
    ) {
      hero = "proof-led";
    } else if (screenshotLikeImages > 0) {
      hero = "product-ui";
    }
    if (hero !== "unknown") evidence.push(`Hero treatment: ${hero}`);

    const density: LayoutCueResult["density"] =
      sections.length >= 8 || multiColumnSections >= 4
        ? "compact"
        : sections.length <= 4
          ? "spacious"
          : "balanced";

    const centeredStyles = styles.filter(
      (style) =>
        style.display === "flex" &&
        style.alignItems === "center" &&
        style.justifyContent === "center",
    ).length;
    const leftLedStyles = styles.filter(
      (style) =>
        style.display === "flex" &&
        /flex-start|space-between/.test(style.justifyContent || ""),
    ).length;
    const alignment: LayoutCueResult["alignment"] =
      centeredStyles > leftLedStyles * 1.4
        ? "centered"
        : leftLedStyles > centeredStyles * 1.2
          ? "left-led"
          : "mixed";

    const mediaBalance: LayoutCueResult["mediaBalance"] =
      visualArea > textArea * 1.2
        ? "visual-led"
        : textArea > visualArea * 1.2
          ? "text-led"
          : "balanced";

    const alternatingCadence =
      sections.filter((section) => /feature-grid|testimonial|cta|stats/i.test(section.role || ""))
        .length >= 3;
    const cardHeavy = sections.some((section) => (section.cardCount || 0) >= 4);

    let overallFeel: LayoutCueResult["overallFeel"] = "unknown";
    if (pattern === "editorial" || (density === "spacious" && mediaBalance === "text-led")) {
      overallFeel = "structured-editorial";
    } else if (pattern === "dashboard" || hero === "product-ui") {
      overallFeel = "systematic-product";
    } else if (mediaBalance === "visual-led" && density !== "compact") {
      overallFeel = "marketing-visual";
    } else if (pattern === "centered" && sections.length <= 5) {
      overallFeel = "minimal-focused";
    } else if (density === "compact" && cardHeavy) {
      overallFeel = "utility-dense";
    }

    let confidence = 40;
    if (pattern !== "unknown") confidence += 18;
    if (hero !== "unknown") confidence += 12;
    if (commonMaxWidths.length > 0) confidence += 8;
    if (sections.length > 0) confidence += 10;
    if (gridStyles.length > 0 || flexRows.length > 0) confidence += 12;

    return {
      pattern,
      hero,
      density,
      alignment,
      mediaBalance,
      grid: {
        hasGrid: gridStyles.length > 0,
        hasFlex: flexRows.length > 0,
        multiColumnSections,
        averageColumns,
        commonMaxWidths,
      },
      rhythm: {
        sectionCount: sections.length,
        cardHeavy,
        alternatingCadence,
      },
      overallFeel,
      confidence: clampScore(confidence),
      evidence,
    };
  }
}

export function extractLayout(input: LayoutCueInput = {}): LayoutCueResult {
  return new LayoutCueExtractor().extract(input);
}
