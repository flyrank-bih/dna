import { type CueExtractor } from "./cue.protocol";

interface ScoreCard {
  colorDiscipline: number;
  typographyConsistency: number;
  spacingSystem: number;
  shadowConsistency: number;
  radiusConsistency: number;
  accessibility: number;
  tokenization: number;
  cssHealth: number;
}

interface DesignInput {
  colors: { all: unknown[]; primary?: unknown };
  typography: { families: unknown[]; weights: unknown[]; scale: unknown[] };
  spacing: { base?: number; scale: number[] };
  shadows: { values: unknown[] };
  borders: { radii: unknown[] };
  accessibility?: { score?: number; failCount?: number };
  cssHealth?: { unusedPercent: number; importantCount: number; duplicates: number };
  variables: Record<string, Record<string, unknown>>;
}

function toDesignInput(input: Partial<DesignInput>): DesignInput {
  return {
    colors: { all: input.colors?.all || [], primary: input.colors?.primary },
    typography: {
      families: input.typography?.families || [],
      weights: input.typography?.weights || [],
      scale: input.typography?.scale || [],
    },
    spacing: { base: input.spacing?.base, scale: input.spacing?.scale || [] },
    shadows: { values: input.shadows?.values || [] },
    borders: { radii: input.borders?.radii || [] },
    accessibility: input.accessibility,
    cssHealth: input.cssHealth,
    variables: input.variables || {},
  };
}

interface DesignScoreResult {
  overall: number;
  grade: string;
  scores: ScoreCard;
  issues: string[];
  strengths: string[];
}

export class DesignScoringCueExtractor
  implements CueExtractor<[input: Partial<DesignInput>], DesignScoreResult>
{
  extract(input: Partial<DesignInput>): DesignScoreResult {
    const design = toDesignInput(input);
    const scores: ScoreCard = {
    colorDiscipline: 0,
    typographyConsistency: 0,
    spacingSystem: 0,
    shadowConsistency: 0,
    radiusConsistency: 0,
    accessibility: 0,
    tokenization: 0,
    cssHealth: 0,
  };
    const issues: string[] = [];

  const colorCount = design.colors.all.length;
  if (colorCount <= 12) scores.colorDiscipline = 100;
  else if (colorCount <= 25) scores.colorDiscipline = 92;
  else if (colorCount <= 40) scores.colorDiscipline = 80;
  else if (colorCount <= 60) scores.colorDiscipline = 65;
  else if (colorCount <= 100) scores.colorDiscipline = 50;
  else {
    scores.colorDiscipline = 35;
    issues.push(
      `${colorCount} unique colors detected — consider consolidating to a tighter palette`,
    );
  }

  if (!design.colors.primary) {
    scores.colorDiscipline -= 15;
    issues.push("No clear primary brand color detected");
  }

  const fontCount = design.typography.families.length;
  if (fontCount <= 2) scores.typographyConsistency = 100;
  else if (fontCount <= 3) scores.typographyConsistency = 80;
  else {
    scores.typographyConsistency = 50;
    issues.push(
      `${fontCount} font families — consider limiting to 2 (heading + body)`,
    );
  }

  const weightCount = design.typography.weights.length;
  if (weightCount <= 3)
    scores.typographyConsistency = Math.min(scores.typographyConsistency, 100);
  else if (weightCount <= 5)
    scores.typographyConsistency = Math.min(scores.typographyConsistency, 90);
  else if (weightCount <= 7)
    scores.typographyConsistency = Math.min(scores.typographyConsistency, 80);
  else {
    scores.typographyConsistency -= 15;
    issues.push(
      `${weightCount} font weights in use — consider standardizing to 3 (regular, medium, bold)`,
    );
  }

  const scaleSize = design.typography.scale.length;
  if (scaleSize <= 8)
    scores.typographyConsistency = Math.min(scores.typographyConsistency, 100);
  else if (scaleSize <= 14)
    scores.typographyConsistency = Math.min(scores.typographyConsistency, 92);
  else if (scaleSize <= 20)
    scores.typographyConsistency = Math.min(scores.typographyConsistency, 82);
  else {
    scores.typographyConsistency -= 10;
    issues.push(
      `${scaleSize} distinct font sizes — consider a tighter type scale`,
    );
  }

  if (design.spacing.base) {
    const spacingBase = design.spacing.base;
    scores.spacingSystem = 90;
    const fittingValues = design.spacing.scale.filter(
      (v) => v % spacingBase === 0,
    ).length;
    const fitRatio = fittingValues / design.spacing.scale.length;
    if (fitRatio >= 0.8) scores.spacingSystem = 100;
    else if (fitRatio >= 0.6) scores.spacingSystem = 85;
    else scores.spacingSystem = 75;
  } else {
    const varCount = Object.values(design.variables || {}).reduce(
      (sum, value) => sum + Object.keys(value || {}).length,
      0,
    );
    scores.spacingSystem = varCount >= 20 ? 70 : 55;
    if (varCount < 20)
      issues.push(
        "No consistent spacing base unit detected — values appear arbitrary",
      );
  }

  if (design.spacing.scale.length > 50) {
    scores.spacingSystem -= 15;
    issues.push(
      `${design.spacing.scale.length} unique spacing values — too many one-off values`,
    );
  } else if (design.spacing.scale.length > 35) {
    scores.spacingSystem -= 5;
  }

  const shadowCount = design.shadows.values.length;
  if (shadowCount === 0) scores.shadowConsistency = 85;
  else if (shadowCount <= 5) scores.shadowConsistency = 100;
  else if (shadowCount <= 10) scores.shadowConsistency = 90;
  else if (shadowCount <= 18) scores.shadowConsistency = 78;
  else if (shadowCount <= 28) scores.shadowConsistency = 62;
  else {
    scores.shadowConsistency = 50;
    issues.push(
      `${shadowCount} unique shadows — consider a 3-level elevation scale (sm/md/lg)`,
    );
  }

  const radiiCount = design.borders.radii.length;
  if (radiiCount <= 4) scores.radiusConsistency = 100;
  else if (radiiCount <= 7) scores.radiusConsistency = 90;
  else if (radiiCount <= 10) scores.radiusConsistency = 80;
  else if (radiiCount <= 15) scores.radiusConsistency = 65;
  else {
    scores.radiusConsistency = 45;
    issues.push(
      `${radiiCount} unique border radii — standardize to 3-4 values`,
    );
  }

  scores.accessibility = design.accessibility?.score || 0;
  const failCount = design.accessibility?.failCount || 0;
  if (failCount > 0) {
    issues.push(`${failCount} WCAG contrast failures`);
  }

  if (design.cssHealth) {
    const ch = design.cssHealth;
    let h = 100;
    if (ch.unusedPercent >= 70) h -= 30;
    else if (ch.unusedPercent >= 50) h -= 20;
    else if (ch.unusedPercent >= 30) h -= 10;
    if (ch.importantCount >= 20) h -= 20;
    else if (ch.importantCount >= 5) h -= 10;
    else if (ch.importantCount >= 1) h -= 5;
    if (ch.duplicates >= 20) h -= 15;
    else if (ch.duplicates >= 5) h -= 8;
    else if (ch.duplicates >= 1) h -= 3;
    scores.cssHealth = Math.max(0, h);
    if (ch.importantCount >= 5)
      issues.push(
        `${ch.importantCount} !important rules — prefer specificity over overrides`,
      );
    if (ch.unusedPercent >= 50)
      issues.push(`${ch.unusedPercent}% of CSS is unused — consider purging`);
    if (ch.duplicates >= 5)
      issues.push(`${ch.duplicates} duplicate CSS declarations`);
  }

  const varCount = Object.values(design.variables).reduce(
    (sum, value) => sum + Object.keys(value).length,
    0,
  );
  if (varCount >= 20) scores.tokenization = 100;
  else if (varCount >= 10) scores.tokenization = 75;
  else if (varCount >= 1) scores.tokenization = 50;
  else {
    scores.tokenization = 20;
    issues.push("No CSS custom properties found — design is not tokenized");
  }

  const weights = {
    colorDiscipline: 18,
    typographyConsistency: 18,
    spacingSystem: 18,
    shadowConsistency: 9,
    radiusConsistency: 9,
    accessibility: 15,
    tokenization: 5,
    cssHealth: 8,
  };

  let totalWeight = 0;
  let weightedSum = 0;
  for (const [key, weight] of Object.entries(weights) as Array<
    [keyof ScoreCard, number]
  >) {
    weightedSum += Math.max(0, scores[key]) * weight;
    totalWeight += weight;
  }

  const overall = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  let grade;
  if (overall >= 90) grade = "A";
  else if (overall >= 80) grade = "B";
  else if (overall >= 70) grade = "C";
  else if (overall >= 60) grade = "D";
  else grade = "F";

    return {
      overall,
      grade,
      scores,
      issues,
      strengths: getStrengths(scores),
    };
  }
}

export function scoreDesignSystem(input: Partial<DesignInput>): DesignScoreResult {
  return new DesignScoringCueExtractor().extract(input);
}

function getStrengths(scores: ScoreCard): string[] {
  const strengths = [];
  if (scores.colorDiscipline >= 85)
    strengths.push("Tight, disciplined color palette");
  if (scores.typographyConsistency >= 85)
    strengths.push("Consistent typography system");
  if (scores.spacingSystem >= 85) strengths.push("Well-defined spacing scale");
  if (scores.shadowConsistency >= 85) strengths.push("Clean elevation system");
  if (scores.radiusConsistency >= 85) strengths.push("Consistent border radii");
  if (scores.accessibility >= 90)
    strengths.push("Strong accessibility compliance");
  if (scores.tokenization >= 75)
    strengths.push("Good CSS variable tokenization");
  return strengths;
}
