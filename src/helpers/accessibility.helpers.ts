import { relativeLuminance, type RgbTriplet } from "./a11y.helpers";
import { parseColor, rgbToHex, type ParsedColor } from "./general.helpers";

export type WcagLevel = "AAA" | "AA" | "FAIL";

export interface ComputedStyleSnapshot {
  tag?: string;
  hasText?: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: string;
}

interface ContrastPairAggregate {
  fg: ParsedColor;
  bg: ParsedColor;
  fgHex: string;
  bgHex: string;
  count: number;
  tags: Set<string>;
  fontSize: number | null;
}

export interface AccessibilityPairResult {
  foreground: string;
  background: string;
  ratio: number;
  level: WcagLevel;
  isLargeText: boolean;
  count: number;
  elements: string[];
}

export interface AccessibilityReport {
  score: number;
  passCount: number;
  failCount: number;
  totalPairs: number;
  pairs: AccessibilityPairResult[];
}

function contrastRatio(c1: RgbTriplet, c2: RgbTriplet): number {
  const l1 = relativeLuminance(c1);
  const l2 = relativeLuminance(c2);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function wcagLevel(ratio: number, isLargeText: boolean): WcagLevel {
  if (isLargeText) {
    if (ratio >= 4.5) return "AAA";
    if (ratio >= 3) return "AA";
    return "FAIL";
  }
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "FAIL";
}

// Tags where "foreground vs background" contrast is *not* a WCAG text concern —
// SVG/icon glyphs, media, form primitives, and structural containers without
// direct text. Filtering these removes the overlay/decorative false-positives
// that used to crater scores on dark-themed sites.
const NON_TEXT_TAGS = new Set([
  "svg",
  "path",
  "circle",
  "rect",
  "polygon",
  "polyline",
  "line",
  "ellipse",
  "use",
  "defs",
  "g",
  "clippath",
  "mask",
  "filter",
  "symbol",
  "stop",
  "lineargradient",
  "radialgradient",
  "img",
  "picture",
  "video",
  "audio",
  "canvas",
  "iframe",
  "source",
  "track",
  "br",
  "hr",
  "wbr",
  "input",
  "select",
  "textarea",
  "progress",
  "meter",
  "option",
  "optgroup",
  "script",
  "style",
  "link",
  "meta",
  "head",
  "html",
  "body",
  "main",
  "section",
  "article",
  "aside",
  "header",
  "footer",
  "nav",
  "div",
  "figure",
  "form",
  "fieldset",
  "ul",
  "ol",
  "dl",
]);

const TEXT_BEARING_TAGS = new Set([
  "p",
  "a",
  "button",
  "label",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "td",
  "th",
  "code",
  "pre",
  "em",
  "strong",
  "small",
  "b",
  "i",
  "u",
  "time",
  "summary",
  "figcaption",
  "blockquote",
  "q",
  "mark",
  "cite",
  "abbr",
  "dt",
  "dd",
  "kbd",
  "samp",
  "var",
  "sub",
  "sup",
  "del",
  "ins",
  "caption",
  "legend",
  // span is a high-noise/high-signal tag — it wraps both real text and
  // decorative glyphs. Include it but require an explicit background (the
  // opacity filter downstream still removes the decorative transparent ones).
  "span",
]);

function isContrastRelevant(el: ComputedStyleSnapshot): boolean {
  const tag = (el.tag || "").toLowerCase();
  if (NON_TEXT_TAGS.has(tag)) return false;
  if (!TEXT_BEARING_TAGS.has(tag)) return false;
  // If the crawler captured hasText, trust it — filters decorative
  // span/link/button wrappers that hold no real glyphs. If hasText wasn't
  // captured (older fixtures, unit tests) fall back to inclusion.
  if (el.hasText === false) return false;
  return true;
}

function isLargeText(fontSize: number | null, tags: Set<string>): boolean {
  if (fontSize == null) return false;
  return fontSize >= 18 || (fontSize >= 14 && tags.has("b"));
}

export function extractAccessibility(
  computedStyles: readonly ComputedStyleSnapshot[],
): AccessibilityReport {
  const pairs = new Map<string, ContrastPairAggregate>();

  for (const el of computedStyles) {
    if (!isContrastRelevant(el)) continue;

    const fg = parseColor(el.color);
    const bg = parseColor(el.backgroundColor);
    if (!fg || !bg) continue;
    // Skip transparent/semi-transparent — real contrast depends on the parent
    // stack which we don't composite. Counting these as "fails" is noise.
    if (bg.a < 0.9 || fg.a < 0.9) continue;

    const fgHex = rgbToHex(fg);
    const bgHex = rgbToHex(bg);
    if (fgHex === bgHex) continue;
    const key = `${fgHex}|${bgHex}`;

    if (!pairs.has(key)) {
      pairs.set(key, {
        fg,
        bg,
        fgHex,
        bgHex,
        count: 0,
        tags: new Set(),
        fontSize: null,
      });
    }
    const pair = pairs.get(key);
    if (!pair) continue;
    pair.count++;
    pair.tags.add(el.tag || "unknown");
    // Track font size for large text determination
    const size = Number.parseFloat(el.fontSize || "");
    if (!pair.fontSize || size > pair.fontSize) pair.fontSize = size;
  }

  const results: AccessibilityPairResult[] = [];
  let passCount = 0;
  let failCount = 0;

  for (const [, pair] of pairs) {
    if (pair.fgHex === pair.bgHex) continue; // skip same color pairs
    const ratio = contrastRatio(pair.fg, pair.bg);
    const largeText = isLargeText(pair.fontSize, pair.tags);
    const level = wcagLevel(ratio, largeText);

    if (level === "FAIL") failCount += pair.count;
    else passCount += pair.count;

    results.push({
      foreground: pair.fgHex,
      background: pair.bgHex,
      ratio: Math.round(ratio * 100) / 100,
      level,
      isLargeText: largeText,
      count: pair.count,
      elements: [...pair.tags].slice(0, 5),
    });
  }

  // Sort: failures first, then by count
  results.sort((a, b) => {
    if (a.level === "FAIL" && b.level !== "FAIL") return -1;
    if (b.level === "FAIL" && a.level !== "FAIL") return 1;
    return b.count - a.count;
  });

  const total = passCount + failCount;
  const score = total > 0 ? Math.round((passCount / total) * 100) : 100;

  return {
    score,
    passCount,
    failCount,
    totalPairs: results.length,
    pairs: results.slice(0, 50), // top 50 pairs
  };
}
