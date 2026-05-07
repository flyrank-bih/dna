export type Grade = "A" | "B" | "C" | "D" | "F" | "unknown";

export interface BadgeModel {
  label: string;
  value: string;
  grade: Grade;
}

export interface ScoreModel {
  grade?: Exclude<Grade, "unknown">;
  overall?: number;
}

export interface ColorStrategy {
  getColor(grade: Grade): string;
}

export const DefaultColorStrategy: ColorStrategy = {
  getColor(grade: Grade): string {
    const colors: Record<Grade, string> = {
      A: "#0a8a52",
      B: "#1f6feb",
      C: "#b08400",
      D: "#d2691e",
      F: "#c43d3d",
      unknown: "#555",
    };
    return colors[grade];
  },
};

export interface FontMetrics {
  measure(text: string): number;
}

export class VerdanaFontMetrics implements FontMetrics {
  constructor(private readonly widths: Record<string, number>) {}

  measure(text: string): number {
    let width = 0;
    for (const char of text) {
      width += this.widths[char] ?? 7;
    }
    return width;
  }
}

const VERDANA_WIDTHS: Readonly<Record<string, number>> = {
  " ": 5,
  "!": 5,
  "#": 9,
  $: 7,
  "%": 12,
  "&": 9,
  "'": 3,
  "(": 5,
  ")": 5,
  "*": 7,
  "+": 7,
  ",": 5,
  "-": 5,
  ".": 5,
  "/": 5,
  "0": 7,
  "1": 7,
  "2": 7,
  "3": 7,
  "4": 7,
  "5": 7,
  "6": 7,
  "7": 7,
  "8": 7,
  "9": 7,
  ":": 5,
  ";": 5,
  "<": 7,
  "=": 7,
  ">": 7,
  "?": 7,
  "@": 12,
  A: 8,
  B: 8,
  C: 8,
  D: 9,
  E: 7,
  F: 7,
  G: 9,
  H: 9,
  I: 5,
  J: 5,
  K: 8,
  L: 7,
  M: 10,
  N: 9,
  O: 9,
  P: 7,
  Q: 9,
  R: 8,
  S: 7,
  T: 7,
  U: 9,
  V: 8,
  W: 12,
  X: 8,
  Y: 8,
  Z: 7,
  "[": 5,
  "]": 5,
  _: 7,
  "`": 7,
  a: 7,
  b: 7,
  c: 6,
  d: 7,
  e: 7,
  f: 4,
  g: 7,
  h: 7,
  i: 3,
  j: 4,
  k: 7,
  l: 3,
  m: 11,
  n: 7,
  o: 7,
  p: 7,
  q: 7,
  r: 5,
  s: 6,
  t: 4,
  u: 7,
  v: 7,
  w: 10,
  x: 7,
  y: 7,
  z: 6,
  "|": 5,
};

export interface TextEscaper {
  escape(value: string): string;
}

export const HtmlEscaper: TextEscaper = {
  escape(value: string): string {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return String(value).replace(/[&<>"']/g, (c) => map[c]);
  },
};

export interface BadgeRenderer {
  render(model: BadgeModel): string;
}

export class SvgBadgeRenderer implements BadgeRenderer {
  constructor(
    private readonly font: FontMetrics,
    private readonly colors: ColorStrategy,
    private readonly escaper: TextEscaper,
  ) {}

  private pad(n: number): number {
    return n + 12;
  }

  render(model: BadgeModel): string {
    const label = model.label;
    const value = model.value;

    const labelW = this.pad(this.font.measure(label));
    const valueW = this.pad(this.font.measure(value));
    const totalW = labelW + valueW;

    const labelX = labelW / 2;
    const valueX = labelW + valueW / 2;

    const fill = this.colors.getColor(model.grade);

    const esc = this.escaper.escape;

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="20" role="img" aria-label="${esc(label)}: ${esc(value)}">
  <title>${esc(label)}: ${esc(value)}</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalW}" height="20" rx="3"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelW}" height="20" fill="#555"/>
    <rect x="${labelW}" width="${valueW}" height="20" fill="${fill}"/>
    <rect width="${totalW}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110">
    <text x="${labelX * 10}" y="140" transform="scale(.1)" textLength="${this.font.measure(label) * 10}">${esc(label)}</text>
    <text x="${valueX * 10}" y="140" transform="scale(.1)" textLength="${this.font.measure(value) * 10}">${esc(value)}</text>
  </g>
</svg>`;
  }
}

const font = new VerdanaFontMetrics(VERDANA_WIDTHS);

const renderer = new SvgBadgeRenderer(font, DefaultColorStrategy, HtmlEscaper);

export function formatBadge(model: BadgeModel): string {
  return renderer.render(model);
}

export function formatScoreBadge(
  score: ScoreModel | undefined,
  label = "design",
): string {
  if (!score?.grade) {
    return formatBadge({ label, value: "—", grade: "unknown" });
  }

  return formatBadge({
    label,
    value: `${score.grade} · ${score.overall ?? 0}`,
    grade: score.grade,
  });
}
