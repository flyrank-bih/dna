import { escapeHtml, safeHost } from "@/helpers/render.helpers";

export interface ReportObserver<TDesign = unknown, TOut = unknown> {
  readonly format: (design: TDesign) => TOut;
}

export interface VisualDNAScoreDimensions {
  colorDiscipline?: number;
  typographyConsistency?: number;
  spacingSystem?: number;
  shadowConsistency?: number;
  radiusConsistency?: number;
  accessibility?: number;
  tokenization?: number;
  cssHealth?: number;
}

export interface VisualDNAScore {
  overall: number;
  grade: string;
  scores: VisualDNAScoreDimensions;
  strengths?: string[];
  issues?: string[];
}

export interface VisualDNAReportDesign {
  meta?: { url?: string };
  score: VisualDNAScore;
}

export interface VisualDNAReport {
  html: string;
  markdown: string;
}

const FONT_DISPLAY = "Instrument Serif";
const FONT_BODY = "Inter";
const FONT_MONO = "JetBrains Mono";

const DIMENSIONS: Array<{
  key: keyof VisualDNAScoreDimensions;
  label: string;
  blurb: string;
}> = [
  {
    key: "colorDiscipline",
    label: "Color Discipline",
    blurb: "Palette restraint & clarity",
  },
  {
    key: "typographyConsistency",
    label: "Typography",
    blurb: "Hierarchy & scale discipline",
  },
  {
    key: "spacingSystem",
    label: "Spacing System",
    blurb: "Rhythm & spacing consistency",
  },
  {
    key: "shadowConsistency",
    label: "Elevation",
    blurb: "Depth system integrity",
  },
  {
    key: "radiusConsistency",
    label: "Border Radii",
    blurb: "Shape system control",
  },
  {
    key: "accessibility",
    label: "Accessibility",
    blurb: "Contrast & WCAG alignment",
  },
  {
    key: "tokenization",
    label: "Tokenization",
    blurb: "Design token maturity",
  },
  {
    key: "cssHealth",
    label: "CSS Health",
    blurb: "Code cleanliness & redundancy",
  },
];

const gradeColor = (grade: string): string =>
  (
    {
      A: "#0a8a52",
      B: "#1f6feb",
      C: "#b08400",
      D: "#d2691e",
      F: "#c43d3d",
    } as Record<string, string>
  )[grade] || "#111";

const scoreState = (score: number): "Strong" | "Moderate" | "Weak" =>
  score > 80 ? "Strong" : score > 60 ? "Moderate" : "Weak";

const scoreColor = (score: number): string =>
  score > 80 ? "#0a8a52" : score > 60 ? "#b08400" : "#c43d3d";

const scoreStateMarkdown = (score: number): "Strong" | "OK" | "Weak" =>
  score > 80 ? "Strong" : score > 60 ? "OK" : "Weak";

const gauge = (value: number, color: string): string => {
  const boundedValue = Math.max(0, Math.min(100, value));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - boundedValue / 100);

  return `
<svg viewBox="0 0 80 80" class="fr-gauge">
  <circle cx="40" cy="40" r="${radius}" class="track"/>
  <circle cx="40" cy="40" r="${radius}"
    class="fill"
    stroke="${color}"
    stroke-dasharray="${circumference}"
    stroke-dashoffset="${dashOffset}"
    transform="rotate(-90 40 40)"/>
</svg>`;
};

function buildHTML(design: VisualDNAReportDesign): string {
  const score = design.score;
  const accent = gradeColor(score.grade);

  const dimensionsMarkup = DIMENSIONS.filter(
    (dimension) => score.scores[dimension.key] != null,
  )
    .map((dimension) => {
      const dimensionScore = Math.round(score.scores[dimension.key] || 0);
      const color = scoreColor(dimensionScore);
      const state = scoreState(dimensionScore);

      return `
<article class="dim">
  <div class="g">${gauge(dimensionScore, color)}<span>${dimensionScore}</span></div>
  <div>
    <h3>${dimension.label}</h3>
    <p>${dimension.blurb}</p>
    <em style="color:${color}">${state}</em>
  </div>
</article>`;
    })
    .join("");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>

<link href="https://fonts.googleapis.com/css2?family=${FONT_DISPLAY}&family=${FONT_BODY}&family=${FONT_MONO}&display=swap" rel="stylesheet"/>

<style>
:root {
  --bg:#0b0b0c;
  --fg:#f5f5f5;
  --muted:#9a9a9a;
  --rule:#1f1f22;
  --accent:${accent};
  --display:${FONT_DISPLAY};
  --body:${FONT_BODY};
  --mono:${FONT_MONO};
}

body {
  margin:0;
  font-family:var(--body);
  background:var(--bg);
  color:var(--fg);
}

.wrap { max-width:980px; margin:0 auto; padding:64px 28px; }

header {
  display:flex;
  justify-content:space-between;
  border-bottom:1px solid var(--rule);
  padding-bottom:28px;
}

h1 {
  font-family:var(--display);
  font-weight:400;
  font-size:52px;
}

.grade {
  font-family:var(--display);
  font-size:120px;
  color:var(--accent);
}

.grid {
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:24px;
  margin-top:40px;
}

.dim {
  display:flex;
  gap:16px;
  border:1px solid var(--rule);
  padding:14px;
}

.g {
  position:relative;
  width:80px;
  height:80px;
}

.g span {
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  font-family:var(--mono);
}
</style>
</head>

<body>
<div class="wrap">

<header>
  <div>
    <h1>Visual DNA Report</h1>
    <p>${escapeHtml(safeHost(design.meta?.url))}</p>
  </div>
  <div class="grade">${score.grade}</div>
</header>

<section>
  <h2>${score.overall}/100 System Score</h2>
  <div class="grid">${dimensionsMarkup}</div>
</section>

</div>
</body>
</html>`;
}

function buildMarkdown(design: VisualDNAReportDesign): string {
  const score = design.score;
  return `
# FlyRank Visual DNA Report

**Target:** ${safeHost(design.meta?.url)}  
**Score:** ${score.overall}/100 · Grade **${score.grade}**

## Dimensions

| Dimension | Score | State |
|----------|------|------|
${DIMENSIONS.map(
  (dimension) => {
    const dimensionScore = Math.round(score.scores[dimension.key] || 0);
    return `| ${dimension.label} | ${dimensionScore} | ${scoreStateMarkdown(dimensionScore)} |`;
  },
).join("\n")}

## Strengths
${(score.strengths || []).map((item) => `- ${item}`).join("\n")}

## Issues
${(score.issues || []).map((item) => `- ${item}`).join("\n")}

---

_FlyRank Visual DNA · protocol-oriented observer_
`;
}

export const VisualDNAReportObserver: ReportObserver<
  VisualDNAReportDesign,
  VisualDNAReport
> = {
  format(design: VisualDNAReportDesign): VisualDNAReport {
    return {
      html: buildHTML(design),
      markdown: buildMarkdown(design),
    };
  },
};
