function pxToRem(px: number): number {
  return +(px / 16).toFixed(4);
}

interface MarkdownRgb {
  r?: number;
  g?: number;
  b?: number;
}

interface MarkdownHsl {
  h?: number;
  s?: number;
  l?: number;
}

interface MarkdownColorEntry {
  hex?: string;
  rgb?: MarkdownRgb;
  hsl?: MarkdownHsl;
  count?: number;
  contexts?: string[];
}

interface MarkdownTypographyFamily {
  name?: string;
  usage?: string;
  count?: number;
}

interface MarkdownTypographyScale {
  size?: number;
  weight?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  tags?: string[];
}

interface MarkdownShadowEntry {
  label?: string;
  inset?: boolean;
  blur?: number;
  raw?: string;
}

interface MarkdownBorderRadiusEntry {
  label?: string;
  value?: number;
  count?: number;
}

interface MarkdownAnimationKeyframeStep {
  offset?: string;
  style?: string;
}

interface MarkdownAnimationKeyframe {
  name?: string;
  steps?: MarkdownAnimationKeyframeStep[];
}

interface MarkdownLayoutContainerWidth {
  maxWidth?: string | number;
  padding?: string | number;
}

interface MarkdownLayoutGridColumn {
  columns?: string | number;
  count?: number;
}

interface MarkdownLayoutTopGrid {
  columns?: string;
  gap?: string;
}

interface MarkdownResponsiveViewport {
  name?: string;
  width?: number;
  bodyFontSize?: string | number;
  navVisible?: boolean;
  maxColumns?: number;
  hasHamburger?: boolean;
  scrollHeight?: number;
}

interface MarkdownResponsiveDiff {
  property?: string;
  from?: string | number;
  to?: string | number;
}

interface MarkdownResponsiveChange {
  breakpoint?: string;
  from?: string | number;
  to?: string | number;
  diffs?: MarkdownResponsiveDiff[];
}

interface MarkdownInteractionDelta {
  from?: unknown;
  to?: unknown;
}

interface MarkdownInteractionStateItem {
  text?: string;
  hover?: Record<string, MarkdownInteractionDelta>;
  focus?: Record<string, MarkdownInteractionDelta>;
}

interface MarkdownAccessibilityPair {
  level?: string;
  foreground?: string;
  background?: string;
  ratio?: number;
  elements?: string[];
  count?: number;
}

interface MarkdownGradientEntry {
  type?: string;
  direction?: string;
  stops?: unknown[];
  classification?: string;
  raw?: string;
}

interface MarkdownZIndexLayer {
  name?: string;
  range?: string;
  elements?: string[];
}

interface MarkdownFontFile {
  family?: string;
  source?: string;
  weights?: Array<string | number>;
  styles?: string[];
}

interface MarkdownImagePattern {
  name?: string;
  count?: number;
  styles?: Record<string, unknown>;
}

interface MarkdownImageAspectRatio {
  ratio?: string;
  count?: number;
}

interface MarkdownMotionDuration {
  name?: string;
  css?: string;
  ms?: number;
}

interface MarkdownMotionEasing {
  family?: string;
  count?: number;
  raw?: string;
}

interface MarkdownMotionSpring {
  raw?: string;
}

interface MarkdownMotionKeyframe {
  name?: string;
  kind?: string;
  propertiesAnimated?: string[];
  usageCount?: number;
  used?: boolean;
}

interface MarkdownComponentVariant {
  name?: string;
  count?: number;
  sampleText?: string[];
}

interface MarkdownComponentAnatomy {
  kind?: string;
  totalInstances?: number;
  slots?: Record<string, boolean>;
  props?: {
    variant?: string[];
    size?: string[];
  };
  variants?: MarkdownComponentVariant[];
}

interface MarkdownVoiceVerb {
  value?: string;
  count?: number;
}

interface MarkdownPageIntentAlternate {
  type?: string;
  score?: number;
}

interface MarkdownSectionRole {
  index?: number;
  role?: string;
  subrole?: string;
  heading?: string;
  confidence?: number;
}

interface MarkdownMultiPageEntry {
  type?: string;
  url?: string;
  error?: unknown;
}

interface MarkdownComponentScreenshot {
  cluster?: string;
  variant?: string | number;
  bounds?: { w?: number; h?: number };
  path?: string;
}

interface MarkdownComponentClusterVariant {
  instanceCount?: number;
  css?: Record<string, unknown>;
}

interface MarkdownComponentCluster {
  kind?: string;
  instanceCount?: number;
  variants?: MarkdownComponentClusterVariant[];
}

interface MarkdownFormatInput {
  meta?: {
    title?: string;
    url?: string;
    timestamp?: string;
    elementCount?: number;
    pagesAnalyzed?: number;
  };
  colors?: {
    primary?: MarkdownColorEntry | null;
    secondary?: MarkdownColorEntry | null;
    accent?: MarkdownColorEntry | null;
    neutrals?: MarkdownColorEntry[];
    backgrounds?: string[];
    text?: string[];
    gradients?: string[];
    all?: MarkdownColorEntry[];
  };
  typography?: {
    families?: MarkdownTypographyFamily[];
    scale?: MarkdownTypographyScale[];
    headings?: MarkdownTypographyScale[];
    body?: MarkdownTypographyScale | null;
    weights?: Array<{ weight?: string | number; count?: number }>;
  };
  spacing?: { base?: number | null; scale?: number[] };
  shadows?: { values?: MarkdownShadowEntry[] };
  borders?: { radii?: MarkdownBorderRadiusEntry[] };
  variables?: Record<string, Record<string, unknown>>;
  breakpoints?: Array<{ label?: string; value?: string | number; type?: string }>;
  animations?: {
    transitions?: string[];
    keyframes?: MarkdownAnimationKeyframe[];
    easings?: string[];
    durations?: string[];
  };
  components?: Record<string, { count?: number; baseStyle?: Record<string, unknown> }>;
  componentClusters?: MarkdownComponentCluster[];
  layout?: {
    gridCount?: number;
    flexCount?: number;
    containerWidths?: MarkdownLayoutContainerWidth[];
    gridColumns?: MarkdownLayoutGridColumn[];
    topGrids?: MarkdownLayoutTopGrid[];
    flexDirections?: Record<string, number>;
    gaps?: string[];
  } | null;
  responsive?: {
    viewports?: MarkdownResponsiveViewport[];
    changes?: MarkdownResponsiveChange[];
  } | null;
  interactions?: {
    buttons?: MarkdownInteractionStateItem[];
    links?: MarkdownInteractionStateItem[];
    inputs?: MarkdownInteractionStateItem[];
  } | null;
  accessibility?: {
    score?: number;
    passCount?: number;
    failCount?: number;
    pairs?: MarkdownAccessibilityPair[];
  } | null;
  darkMode?: {
    colors?: {
      primary?: MarkdownColorEntry | null;
      secondary?: MarkdownColorEntry | null;
      backgrounds?: string[];
      text?: string[];
    };
    variables?: Record<string, Record<string, unknown>>;
  } | null;
  score?: {
    overall?: number;
    grade?: string;
    scores?: Record<string, number | undefined>;
    strengths?: string[];
    issues?: string[];
  } | null;
  gradients?: {
    count?: number;
    gradients?: MarkdownGradientEntry[];
  } | null;
  zIndex?: {
    allValues?: Array<string | number>;
    layers?: MarkdownZIndexLayer[];
    issues?: string[];
  } | null;
  icons?: {
    count?: number;
    dominantStyle?: string;
    sizeDistribution?: Record<string, number>;
    colorPalette?: string[];
  } | null;
  fonts?: {
    fonts?: MarkdownFontFile[];
    googleFontsUrl?: string;
  } | null;
  images?: {
    patterns?: MarkdownImagePattern[];
    aspectRatios?: MarkdownImageAspectRatio[];
  } | null;
  motion?: {
    feel?: string;
    scrollLinked?: { present?: boolean };
    durations?: MarkdownMotionDuration[];
    easings?: MarkdownMotionEasing[];
    springs?: MarkdownMotionSpring[];
    keyframes?: MarkdownMotionKeyframe[];
  } | null;
  componentAnatomy?: MarkdownComponentAnatomy[];
  voice?: {
    tone?: string;
    pronoun?: string;
    headingStyle?: string;
    headingLengthClass?: string;
    ctaVerbs?: MarkdownVoiceVerb[];
    buttonPatterns?: MarkdownVoiceVerb[];
    sampleHeadings?: string[];
  } | null;
  pageIntent?: {
    type?: string;
    confidence?: number;
    description?: string;
    alternates?: MarkdownPageIntentAlternate[];
  } | null;
  sectionRoles?: {
    sections?: MarkdownSectionRole[];
    readingOrder?: string[];
  } | null;
  materialLanguage?: {
    label?: string;
    confidence?: number;
    metrics?: Record<string, unknown>;
  } | null;
  imageryStyle?: {
    label?: string;
    confidence?: number;
    counts?: Record<string, number>;
    dominantAspect?: string;
    radiusProfile?: string;
  } | null;
  componentLibrary?: {
    library?: string;
    confidence?: number;
    evidence?: string[];
    alternates?: Array<{ id?: string; score?: number }>;
  } | null;
  multiPage?: {
    pages?: MarkdownMultiPageEntry[];
    consistency?: {
      shared?: {
        colors?: string[];
      };
    };
  } | null;
  componentScreenshots?: {
    components?: MarkdownComponentScreenshot[];
    fullPage?: { path?: string } | null;
  } | null;
}

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function asRecord<T extends Record<string, unknown>>(
  value: T | undefined | null,
): T | Record<string, never> {
  return value && typeof value === "object" ? value : {};
}

function numberOr(value: number | undefined | null, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function stringOr(value: string | undefined | null, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export function formatMarkdown(design: MarkdownFormatInput = {}) {
  const lines: string[] = [];
  const {
    meta,
    colors,
    typography,
    spacing,
    shadows,
    borders,
    variables,
    breakpoints,
    animations,
    components,
  } = design;
  const safeMeta = meta || {
    title: "Unknown Site",
    url: "",
    timestamp: new Date().toISOString(),
    elementCount: 0,
    pagesAnalyzed: 1,
  };
  const safeColors = {
    primary: colors?.primary || null,
    secondary: colors?.secondary || null,
    accent: colors?.accent || null,
    neutrals: asArray(colors?.neutrals),
    backgrounds: asArray(colors?.backgrounds),
    text: asArray(colors?.text),
    gradients: asArray(colors?.gradients),
    all: asArray(colors?.all),
  };
  const safeTypography = {
    families: asArray(typography?.families),
    scale: asArray(typography?.scale),
    headings: asArray(typography?.headings),
    body: typography?.body || null,
    weights: asArray(typography?.weights),
  };
  const safeSpacing = {
    base: spacing?.base ?? null,
    scale: asArray(spacing?.scale),
  };
  const safeShadows = { values: asArray(shadows?.values) };
  const safeBorders = { radii: asArray(borders?.radii) };
  const safeVariables = asRecord(variables);
  const safeBreakpoints = asArray(breakpoints);
  const safeAnimations = {
    transitions: asArray(animations?.transitions),
    keyframes: asArray(animations?.keyframes),
    easings: asArray(animations?.easings),
    durations: asArray(animations?.durations),
  };
  const safeComponents = asRecord(components);
  const componentClusters = asArray(design.componentClusters);
  const safeLayout = {
    gridCount: numberOr(design.layout?.gridCount),
    flexCount: numberOr(design.layout?.flexCount),
    containerWidths: asArray(design.layout?.containerWidths),
    gridColumns: asArray(design.layout?.gridColumns),
    topGrids: asArray(design.layout?.topGrids),
    flexDirections: asRecord(design.layout?.flexDirections),
    gaps: asArray(design.layout?.gaps),
  };
  const safeResponsive = {
    viewports: asArray(design.responsive?.viewports),
    changes: asArray(design.responsive?.changes),
  };
  const safeInteractions = {
    buttons: asArray(design.interactions?.buttons),
    links: asArray(design.interactions?.links),
    inputs: asArray(design.interactions?.inputs),
  };
  const safeAccessibility = {
    score: numberOr(design.accessibility?.score),
    passCount: numberOr(design.accessibility?.passCount),
    failCount: numberOr(design.accessibility?.failCount),
    pairs: asArray(design.accessibility?.pairs),
  };
  const safeDarkColors = {
    primary: design.darkMode?.colors?.primary || null,
    secondary: design.darkMode?.colors?.secondary || null,
    backgrounds: asArray(design.darkMode?.colors?.backgrounds),
    text: asArray(design.darkMode?.colors?.text),
  };
  const safeDarkVariables = asRecord(design.darkMode?.variables);
  const safeScore = {
    overall: numberOr(design.score?.overall),
    grade: stringOr(design.score?.grade),
    scores: asRecord(design.score?.scores),
    strengths: asArray(design.score?.strengths),
    issues: asArray(design.score?.issues),
  };
  const safeGradients = {
    count: numberOr(design.gradients?.count),
    gradients: asArray(design.gradients?.gradients),
  };
  const safeZIndex = {
    allValues: asArray(design.zIndex?.allValues),
    layers: asArray(design.zIndex?.layers),
    issues: asArray(design.zIndex?.issues),
  };
  const safeIcons = {
    count: numberOr(design.icons?.count),
    dominantStyle: stringOr(design.icons?.dominantStyle, "mixed"),
    sizeDistribution: asRecord(design.icons?.sizeDistribution),
    colorPalette: asArray(design.icons?.colorPalette),
  };
  const safeFonts = {
    fonts: asArray(design.fonts?.fonts),
    googleFontsUrl: stringOr(design.fonts?.googleFontsUrl),
  };
  const safeImages = {
    patterns: asArray(design.images?.patterns),
    aspectRatios: asArray(design.images?.aspectRatios),
  };
  const safeMotion = {
    feel: stringOr(design.motion?.feel, "unknown"),
    scrollLinked: { present: Boolean(design.motion?.scrollLinked?.present) },
    durations: asArray(design.motion?.durations),
    easings: asArray(design.motion?.easings),
    springs: asArray(design.motion?.springs),
    keyframes: asArray(design.motion?.keyframes),
  };
  const safeComponentAnatomy = asArray(design.componentAnatomy);
  const safeVoice = {
    tone: stringOr(design.voice?.tone, "neutral"),
    pronoun: stringOr(design.voice?.pronoun, "unknown"),
    headingStyle: stringOr(design.voice?.headingStyle, "unknown"),
    headingLengthClass: stringOr(design.voice?.headingLengthClass, "unknown"),
    ctaVerbs: asArray(design.voice?.ctaVerbs),
    buttonPatterns: asArray(design.voice?.buttonPatterns),
    sampleHeadings: asArray(design.voice?.sampleHeadings),
  };
  const safePageIntent = design.pageIntent || null;
  const safeSectionRoles = {
    sections: asArray(design.sectionRoles?.sections),
    readingOrder: asArray(design.sectionRoles?.readingOrder),
  };
  const safeMaterialLanguage = design.materialLanguage || null;
  const safeImageryStyle = design.imageryStyle || null;
  const safeComponentLibrary = design.componentLibrary || null;
  const safeMultiPage = {
    pages: asArray(design.multiPage?.pages),
    sharedColors: asArray(design.multiPage?.consistency?.shared?.colors),
  };
  const safeComponentScreenshots = {
    components: asArray(design.componentScreenshots?.components),
    fullPage: design.componentScreenshots?.fullPage || null,
  };

  lines.push(`# Design Language: ${safeMeta.title || "Unknown Site"}`);
  lines.push("");
  lines.push(
    `> Extracted from \`${safeMeta.url}\` on ${new Date(safeMeta.timestamp || new Date().toISOString()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`,
  );
  lines.push(
    `> ${numberOr(safeMeta.elementCount)} elements analyzed${numberOr(safeMeta.pagesAnalyzed) > 1 ? ` across ${numberOr(safeMeta.pagesAnalyzed)} pages` : ""}`,
  );
  lines.push("");
  lines.push(
    "This document describes the complete design language of the website. It is structured for AI/LLM consumption — use it to faithfully recreate the visual design in any framework.",
  );
  lines.push("");

  // ── Colors ──
  lines.push("## Color Palette");
  lines.push("");
  if (safeColors.primary) {
    lines.push("### Primary Colors");
    lines.push("");
    lines.push("| Role | Hex | RGB | HSL | Usage Count |");
    lines.push("|------|-----|-----|-----|-------------|");
    if (safeColors.primary)
      lines.push(
        `| Primary | \`${safeColors.primary.hex || "N/A"}\` | rgb(${numberOr(safeColors.primary.rgb?.r)}, ${numberOr(safeColors.primary.rgb?.g)}, ${numberOr(safeColors.primary.rgb?.b)}) | hsl(${numberOr(safeColors.primary.hsl?.h)}, ${numberOr(safeColors.primary.hsl?.s)}%, ${numberOr(safeColors.primary.hsl?.l)}%) | ${numberOr(safeColors.primary.count)} |`,
      );
    if (safeColors.secondary)
      lines.push(
        `| Secondary | \`${safeColors.secondary.hex || "N/A"}\` | rgb(${numberOr(safeColors.secondary.rgb?.r)}, ${numberOr(safeColors.secondary.rgb?.g)}, ${numberOr(safeColors.secondary.rgb?.b)}) | hsl(${numberOr(safeColors.secondary.hsl?.h)}, ${numberOr(safeColors.secondary.hsl?.s)}%, ${numberOr(safeColors.secondary.hsl?.l)}%) | ${numberOr(safeColors.secondary.count)} |`,
      );
    if (safeColors.accent)
      lines.push(
        `| Accent | \`${safeColors.accent.hex || "N/A"}\` | rgb(${numberOr(safeColors.accent.rgb?.r)}, ${numberOr(safeColors.accent.rgb?.g)}, ${numberOr(safeColors.accent.rgb?.b)}) | hsl(${numberOr(safeColors.accent.hsl?.h)}, ${numberOr(safeColors.accent.hsl?.s)}%, ${numberOr(safeColors.accent.hsl?.l)}%) | ${numberOr(safeColors.accent.count)} |`,
      );
    lines.push("");
  }

  if (safeColors.neutrals.length > 0) {
    lines.push("### Neutral Colors");
    lines.push("");
    lines.push("| Hex | HSL | Usage Count |");
    lines.push("|-----|-----|-------------|");
    for (const c of safeColors.neutrals.slice(0, 12)) {
      lines.push(
        `| \`${c.hex || "N/A"}\` | hsl(${numberOr(c.hsl?.h)}, ${numberOr(c.hsl?.s)}%, ${numberOr(c.hsl?.l)}%) | ${numberOr(c.count)} |`,
      );
    }
    lines.push("");
  }

  if (safeColors.backgrounds.length > 0) {
    lines.push("### Background Colors");
    lines.push("");
    lines.push(
      `Used on large-area elements: ${safeColors.backgrounds.map((h: string) => `\`${h}\``).join(", ")}`,
    );
    lines.push("");
  }

  if (safeColors.text.length > 0) {
    lines.push("### Text Colors");
    lines.push("");
    lines.push(
      `Text color palette: ${safeColors.text.map((h: string) => `\`${h}\``).join(", ")}`,
    );
    lines.push("");
  }

  if (safeColors.gradients.length > 0) {
    lines.push("### Gradients");
    lines.push("");
    for (const g of safeColors.gradients) {
      lines.push("```css");
      lines.push(`background-image: ${g};`);
      lines.push("```");
      lines.push("");
    }
  }

  if (safeColors.all.length > 0) {
    lines.push("### Full Color Inventory");
    lines.push("");
    lines.push("| Hex | Contexts | Count |");
    lines.push("|-----|----------|-------|");
    for (const c of safeColors.all.slice(0, 30)) {
      lines.push(`| \`${c.hex || "N/A"}\` | ${asArray(c.contexts).join(", ")} | ${numberOr(c.count)} |`);
    }
    lines.push("");
  }

  // ── Typography ──
  lines.push("## Typography");
  lines.push("");

  if (safeTypography.families.length > 0) {
    lines.push("### Font Families");
    lines.push("");
    for (const f of safeTypography.families) {
      lines.push(`- **${f.name || "Unknown"}** — used for ${f.usage || "unspecified usage"} (${numberOr(f.count)} elements)`);
    }
    lines.push("");
  }

  if (safeTypography.scale.length > 0) {
    lines.push("### Type Scale");
    lines.push("");
    lines.push(
      "| Size (px) | Size (rem) | Weight | Line Height | Letter Spacing | Used On |",
    );
    lines.push(
      "|-----------|------------|--------|-------------|----------------|---------|",
    );
    for (const s of safeTypography.scale.slice(0, 15)) {
      lines.push(
        `| ${numberOr(s.size)}px | ${pxToRem(numberOr(s.size))}rem | ${s.weight || "normal"} | ${s.lineHeight || "normal"} | ${s.letterSpacing || "normal"} | ${asArray(s.tags).slice(0, 4).join(", ")} |`,
      );
    }
    lines.push("");
  }

  if (safeTypography.headings.length > 0) {
    lines.push("### Heading Scale");
    lines.push("");
    lines.push("```css");
    for (const h of safeTypography.headings) {
      const tag = asArray(h.tags).find((t: string) => /^h[1-6]$/.test(t)) || "h";
      lines.push(
        `${tag} { font-size: ${numberOr(h.size)}px; font-weight: ${h.weight || "normal"}; line-height: ${h.lineHeight || "normal"}; }`,
      );
    }
    lines.push("```");
    lines.push("");
  }

  if (safeTypography.body) {
    lines.push("### Body Text");
    lines.push("");
    lines.push("```css");
    lines.push(
      `body { font-size: ${numberOr(safeTypography.body.size)}px; font-weight: ${safeTypography.body.weight || "normal"}; line-height: ${safeTypography.body.lineHeight || "normal"}; }`,
    );
    lines.push("```");
    lines.push("");
  }

  if (safeTypography.weights.length > 0) {
    lines.push("### Font Weights in Use");
    lines.push("");
    lines.push(
      safeTypography.weights
        .map((w) => `\`${w.weight || "unknown"}\` (${numberOr(w.count)}x)`)
        .join(", "),
    );
    lines.push("");
  }

  // ── Spacing ──
  lines.push("## Spacing");
  lines.push("");
  if (safeSpacing.base) {
    lines.push(`**Base unit:** ${safeSpacing.base}px`);
    lines.push("");
  }
  if (safeSpacing.scale.length > 0) {
    lines.push("| Token | Value | Rem |");
    lines.push("|-------|-------|-----|");
    for (const v of safeSpacing.scale.slice(0, 20)) {
      lines.push(`| spacing-${v} | ${v}px | ${pxToRem(v)}rem |`);
    }
    lines.push("");
  }

  // ── Borders ──
  if (safeBorders.radii.length > 0) {
    lines.push("## Border Radii");
    lines.push("");
    lines.push("| Label | Value | Count |");
    lines.push("|-------|-------|-------|");
    for (const r of safeBorders.radii) {
      lines.push(`| ${r.label || "radius"} | ${numberOr(r.value)}px | ${numberOr(r.count)} |`);
    }
    lines.push("");
  }

  // ── Shadows ──
  if (safeShadows.values.length > 0) {
    lines.push("## Box Shadows");
    lines.push("");
    for (const s of safeShadows.values) {
      lines.push(
        `**${s.label || "shadow"}${s.inset ? " (inset)" : ""}** — blur: ${numberOr(s.blur)}px`,
      );
      lines.push("```css");
      lines.push(`box-shadow: ${s.raw || "none"};`);
      lines.push("```");
      lines.push("");
    }
  }

  // ── CSS Variables ──
  const varCategories = Object.entries(safeVariables).filter(
    ([, v]) => Object.keys(v as Record<string, unknown>).length > 0,
  );
  if (varCategories.length > 0) {
    lines.push("## CSS Custom Properties");
    lines.push("");
    for (const [category, vars] of varCategories) {
      lines.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`);
      lines.push("");
      lines.push("```css");
      for (const [name, value] of Object.entries(vars as Record<string, unknown>)) {
        lines.push(`${name}: ${value};`);
      }
      lines.push("```");
      lines.push("");
    }
  }

  // ── Breakpoints ──
  if (safeBreakpoints.length > 0) {
    lines.push("## Breakpoints");
    lines.push("");
    lines.push("| Name | Value | Type |");
    lines.push("|------|-------|------|");
    for (const bp of safeBreakpoints) {
      lines.push(`| ${bp.label || "breakpoint"} | ${bp.value ?? "N/A"}px | ${bp.type || "unknown"} |`);
    }
    lines.push("");
  }

  // ── Animations ──
  if (safeAnimations.transitions.length > 0 || safeAnimations.keyframes.length > 0) {
    lines.push("## Transitions & Animations");
    lines.push("");

    if (safeAnimations.easings.length > 0) {
      lines.push(
        `**Easing functions:** ${safeAnimations.easings.map((e: string) => `\`${e}\``).join(", ")}`,
      );
      lines.push("");
    }
    if (safeAnimations.durations.length > 0) {
      lines.push(
        `**Durations:** ${safeAnimations.durations.map((d: string) => `\`${d}\``).join(", ")}`,
      );
      lines.push("");
    }

    if (safeAnimations.transitions.length > 0) {
      lines.push("### Common Transitions");
      lines.push("");
      lines.push("```css");
      for (const t of safeAnimations.transitions.slice(0, 10)) {
        lines.push(`transition: ${t};`);
      }
      lines.push("```");
      lines.push("");
    }

    if (safeAnimations.keyframes.length > 0) {
      lines.push("### Keyframe Animations");
      lines.push("");
      for (const kf of safeAnimations.keyframes.slice(0, 10)) {
        lines.push(`**${kf.name || "unnamed"}**`);
        lines.push("```css");
        lines.push(`@keyframes ${kf.name || "unnamed"} {`);
        for (const step of asArray(kf.steps)) {
          lines.push(`  ${step.offset || "0%"} { ${step.style || ""} }`);
        }
        lines.push("}");
        lines.push("```");
        lines.push("");
      }
    }
  }

  // ── Components ──
  if (Object.keys(safeComponents).length > 0) {
    lines.push("## Component Patterns");
    lines.push("");
    lines.push("Detected UI component patterns and their most common styles:");
    lines.push("");

    for (const [name, component] of Object.entries(safeComponents)) {
      lines.push(
        `### ${name.charAt(0).toUpperCase() + name.slice(1)} (${numberOr(component.count)} instances)`,
      );
      lines.push("");
      lines.push("```css");
      lines.push(`.${name.slice(0, -1)} {`);
      for (const [prop, val] of Object.entries(asRecord(component.baseStyle))) {
        const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
        lines.push(`  ${cssProp}: ${val};`);
      }
      lines.push("}");
      lines.push("```");
      lines.push("");
    }
  }

  // ── Component Clusters (v7) ──
  if (componentClusters.length > 0) {
    lines.push("## Component Clusters");
    lines.push("");
    lines.push(
      "Reusable component instances grouped by DOM structure and style similarity:",
    );
    lines.push("");
    for (const cluster of componentClusters) {
      const kind = stringOr(cluster.kind, "unknown");
      const kindLabel = kind.charAt(0).toUpperCase() + kind.slice(1);
      lines.push(
        `### ${kindLabel} — ${numberOr(cluster.instanceCount)} instance${cluster.instanceCount === 1 ? "" : "s"}, ${asArray(cluster.variants).length} variant${asArray(cluster.variants).length === 1 ? "" : "s"}`,
      );
      lines.push("");
      asArray(cluster.variants).forEach((v, i: number) => {
        lines.push(
          `**Variant ${i + 1}** (${numberOr(v.instanceCount)} instance${v.instanceCount === 1 ? "" : "s"})`,
        );
        lines.push("");
        lines.push("```css");
        for (const [prop, val] of Object.entries(v.css || {})) {
          const cssProp = prop.replace(/([A-Z])/g, "-$1").toLowerCase();
          lines.push(`  ${cssProp}: ${val};`);
        }
        lines.push("```");
        lines.push("");
      });
    }
  }

  // ── Layout ──
  if (design.layout) {
    const l = safeLayout;
    lines.push("## Layout System");
    lines.push("");
    lines.push(
      `**${l.gridCount} grid containers** and **${l.flexCount} flex containers** detected.`,
    );
    lines.push("");

    if (l.containerWidths.length > 0) {
      lines.push("### Container Widths");
      lines.push("");
      lines.push("| Max Width | Padding |");
      lines.push("|-----------|---------|");
      for (const c of l.containerWidths) {
        lines.push(`| ${c.maxWidth ?? "N/A"} | ${c.padding ?? "N/A"} |`);
      }
      lines.push("");
    }

    if (l.gridColumns.length > 0) {
      lines.push("### Grid Column Patterns");
      lines.push("");
      lines.push("| Columns | Usage Count |");
      lines.push("|---------|-------------|");
      for (const g of l.gridColumns) {
        lines.push(`| ${g.columns ?? "unknown"}-column | ${numberOr(g.count)}x |`);
      }
      lines.push("");
    }

    if (l.topGrids.length > 0) {
      lines.push("### Grid Templates");
      lines.push("");
      lines.push("```css");
      for (const g of l.topGrids) {
        lines.push(`grid-template-columns: ${g.columns};`);
        if (g.gap !== "normal" && g.gap !== "0px") lines.push(`gap: ${g.gap};`);
      }
      lines.push("```");
      lines.push("");
    }

    if (Object.keys(l.flexDirections).length > 0) {
      lines.push("### Flex Patterns");
      lines.push("");
      lines.push("| Direction/Wrap | Count |");
      lines.push("|----------------|-------|");
      for (const [pattern, count] of Object.entries(l.flexDirections)) {
        lines.push(`| ${pattern} | ${count}x |`);
      }
      lines.push("");
    }

    if (l.gaps.length > 0) {
      lines.push(`**Gap values:** ${l.gaps.map((g: string) => `\`${g}\``).join(", ")}`);
      lines.push("");
    }
  }

  // ── Responsive ──
  if (design.responsive) {
    const r = safeResponsive;
    lines.push("## Responsive Design");
    lines.push("");

    if (r.viewports.length > 0) {
      lines.push("### Viewport Snapshots");
      lines.push("");
      lines.push(
        "| Viewport | Body Font | Nav Visible | Max Columns | Hamburger | Page Height |",
      );
      lines.push(
        "|----------|-----------|-------------|-------------|-----------|-------------|",
      );
      for (const vp of r.viewports) {
        lines.push(
          `| ${vp.name} (${vp.width}px) | ${vp.bodyFontSize} | ${vp.navVisible ? "Yes" : "No"} | ${vp.maxColumns} | ${vp.hasHamburger ? "Yes" : "No"} | ${vp.scrollHeight}px |`,
        );
      }
      lines.push("");
    }

    if (r.changes.length > 0) {
      lines.push("### Breakpoint Changes");
      lines.push("");
      for (const change of r.changes) {
        lines.push(`**${change.breakpoint}** (${change.from} → ${change.to}):`);
        for (const d of asArray(change.diffs)) {
          lines.push(`- ${d.property || "property"}: \`${d.from ?? ""}\` → \`${d.to ?? ""}\``);
        }
        lines.push("");
      }
    }
  }

  // ── Interaction States ──
  if (design.interactions) {
    const hasContent =
      safeInteractions.buttons.length > 0 ||
      safeInteractions.links.length > 0 ||
      safeInteractions.inputs.length > 0;
    if (hasContent) {
      lines.push("## Interaction States");
      lines.push("");

      if (safeInteractions.buttons.length > 0) {
        lines.push("### Button States");
        lines.push("");
        for (const btn of safeInteractions.buttons.slice(0, 3)) {
          lines.push(`**"${btn.text || ""}"**`);
          if (Object.keys(asRecord(btn.hover)).length > 0) {
            lines.push("```css");
            lines.push("/* Hover */");
            for (const [prop, val] of Object.entries(asRecord(btn.hover))) {
              lines.push(
                `${prop.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${(val as MarkdownInteractionDelta).from} → ${(val as MarkdownInteractionDelta).to};`,
              );
            }
            lines.push("```");
          }
          if (Object.keys(asRecord(btn.focus)).length > 0) {
            lines.push("```css");
            lines.push("/* Focus */");
            for (const [prop, val] of Object.entries(asRecord(btn.focus))) {
              lines.push(
                `${prop.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${(val as MarkdownInteractionDelta).from} → ${(val as MarkdownInteractionDelta).to};`,
              );
            }
            lines.push("```");
          }
          lines.push("");
        }
      }

      if (safeInteractions.links.length > 0) {
        lines.push("### Link Hover");
        lines.push("");
        const link = safeInteractions.links[0];
        lines.push("```css");
        for (const [prop, val] of Object.entries(asRecord(link.hover))) {
          lines.push(
            `${prop.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${(val as MarkdownInteractionDelta).from} → ${(val as MarkdownInteractionDelta).to};`,
          );
        }
        lines.push("```");
        lines.push("");
      }

      if (safeInteractions.inputs.length > 0) {
        lines.push("### Input Focus");
        lines.push("");
        const input = safeInteractions.inputs[0];
        lines.push("```css");
        for (const [prop, val] of Object.entries(asRecord(input.focus))) {
          lines.push(
            `${prop.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${(val as MarkdownInteractionDelta).from} → ${(val as MarkdownInteractionDelta).to};`,
          );
        }
        lines.push("```");
        lines.push("");
      }
    }
  }

  // ── Accessibility ──
  if (design.accessibility) {
    const a = safeAccessibility;
    lines.push("## Accessibility (WCAG 2.1)");
    lines.push("");
    lines.push(
      `**Overall Score: ${a.score}%** — ${a.passCount} passing, ${a.failCount} failing color pairs`,
    );
    lines.push("");

    if (a.pairs.length > 0) {
      const failures = a.pairs.filter((p) => p.level === "FAIL");
      if (failures.length > 0) {
        lines.push("### Failing Color Pairs");
        lines.push("");
        lines.push("| Foreground | Background | Ratio | Level | Used On |");
        lines.push("|------------|------------|-------|-------|---------|");
        for (const p of failures.slice(0, 15)) {
          lines.push(
            `| \`${p.foreground || "N/A"}\` | \`${p.background || "N/A"}\` | ${numberOr(p.ratio)}:1 | ${p.level || "FAIL"} | ${asArray(p.elements).join(", ")} (${numberOr(p.count)}x) |`,
          );
        }
        lines.push("");
      }

      const passes = a.pairs.filter((p) => p.level !== "FAIL");
      if (passes.length > 0) {
        lines.push("### Passing Color Pairs");
        lines.push("");
        lines.push("| Foreground | Background | Ratio | Level |");
        lines.push("|------------|------------|-------|-------|");
        for (const p of passes.slice(0, 10)) {
          lines.push(
            `| \`${p.foreground || "N/A"}\` | \`${p.background || "N/A"}\` | ${numberOr(p.ratio)}:1 | ${p.level || "PASS"} |`,
          );
        }
        lines.push("");
      }
    }
  }

  // ── Dark Mode ──
  if (design.darkMode) {
    lines.push("## Dark Mode");
    lines.push("");
    lines.push("The site has a distinct dark mode color scheme:");
    lines.push("");
    const dc = safeDarkColors;
    if (dc.primary) lines.push(`- **Primary:** \`${dc.primary.hex}\``);
    if (dc.secondary) lines.push(`- **Secondary:** \`${dc.secondary.hex}\``);
    if (dc.backgrounds.length > 0)
      lines.push(
        `- **Backgrounds:** ${dc.backgrounds.map((h: string) => `\`${h}\``).join(", ")}`,
      );
    if (dc.text.length > 0)
      lines.push(
        `- **Text:** ${dc.text
          .slice(0, 5)
          .map((h: string) => `\`${h}\``)
          .join(", ")}`,
      );
    lines.push("");

    const darkVars = Object.entries(
      safeDarkVariables as Record<string, Record<string, unknown>>,
    ).filter(
      ([, v]) => Object.keys(v as Record<string, unknown>).length > 0,
    );
    if (darkVars.length > 0) {
      lines.push("### Dark Mode CSS Variables");
      lines.push("");
      lines.push("```css");
      for (const [, vars] of darkVars) {
        for (const [name, value] of Object.entries(vars as Record<string, unknown>)) {
          lines.push(`${name}: ${value};`);
        }
      }
      lines.push("```");
      lines.push("");
    }
  }

  // ── Design Score ──
  if (design.score) {
    const s = safeScore;
    lines.push("## Design System Score");
    lines.push("");
    lines.push(`**Overall: ${s.overall}/100 (Grade: ${s.grade})**`);
    lines.push("");
    lines.push("| Category | Score |");
    lines.push("|----------|-------|");
    if (s.scores.colorDiscipline !== undefined)
      lines.push(`| Color Discipline | ${s.scores.colorDiscipline}/100 |`);
    if (s.scores.typographyConsistency !== undefined)
      lines.push(
        `| Typography Consistency | ${s.scores.typographyConsistency}/100 |`,
      );
    if (s.scores.spacingSystem !== undefined)
      lines.push(`| Spacing System | ${s.scores.spacingSystem}/100 |`);
    if (s.scores.shadowConsistency !== undefined)
      lines.push(`| Shadow Consistency | ${s.scores.shadowConsistency}/100 |`);
    if (s.scores.radiusConsistency !== undefined)
      lines.push(
        `| Border Radius Consistency | ${s.scores.radiusConsistency}/100 |`,
      );
    if (s.scores.accessibility !== undefined)
      lines.push(`| Accessibility | ${s.scores.accessibility}/100 |`);
    if (s.scores.tokenization !== undefined)
      lines.push(`| CSS Tokenization | ${s.scores.tokenization}/100 |`);
    lines.push("");

    if (s.strengths.length > 0) {
      lines.push("**Strengths:** " + s.strengths.join(", "));
      lines.push("");
    }
    if (s.issues.length > 0) {
      lines.push("**Issues:**");
      for (const issue of s.issues) {
        lines.push(`- ${issue}`);
      }
      lines.push("");
    }
  }

  // ── Gradients ──
  if (safeGradients.count > 0) {
    lines.push("## Gradients");
    lines.push("");
    lines.push(`**${safeGradients.count} unique gradients** detected.`);
    lines.push("");
    lines.push("| Type | Direction | Stops | Classification |");
    lines.push("|------|-----------|-------|----------------|");
    for (const g of safeGradients.gradients.slice(0, 15)) {
      lines.push(
        `| ${g.type || "unknown"} | ${g.direction || "—"} | ${asArray(g.stops).length} | ${g.classification || "unknown"} |`,
      );
    }
    lines.push("");
    lines.push("```css");
    for (const g of safeGradients.gradients.slice(0, 5)) {
      lines.push(`background: ${g.raw || "none"};`);
    }
    lines.push("```");
    lines.push("");
  }

  // ── Z-Index Map ──
  if (safeZIndex.allValues.length > 0) {
    lines.push("## Z-Index Map");
    lines.push("");
    lines.push(
      `**${safeZIndex.allValues.length} unique z-index values** across ${safeZIndex.layers.length} layers.`,
    );
    lines.push("");
    if (safeZIndex.layers.length > 0) {
      lines.push("| Layer | Range | Elements |");
      lines.push("|-------|-------|----------|");
      for (const l of safeZIndex.layers) {
        const elNames = asArray(l.elements).slice(0, 3).join(", ");
        lines.push(`| ${l.name || "layer"} | ${l.range || "N/A"} | ${elNames} |`);
      }
      lines.push("");
    }
    if (safeZIndex.issues.length > 0) {
      lines.push("**Issues:**");
      for (const issue of safeZIndex.issues) {
        lines.push(`- ${issue}`);
      }
      lines.push("");
    }
  }

  // ── Icons ──
  if (safeIcons.count > 0) {
    lines.push("## SVG Icons");
    lines.push("");
    lines.push(
      `**${safeIcons.count} unique SVG icons** detected. Dominant style: **${safeIcons.dominantStyle}**.`,
    );
    lines.push("");
    const dist = safeIcons.sizeDistribution;
    if (dist) {
      lines.push("| Size Class | Count |");
      lines.push("|------------|-------|");
      for (const [cls, count] of Object.entries(dist as Record<string, number>)) {
        if (count > 0) lines.push(`| ${cls} | ${count} |`);
      }
      lines.push("");
    }
    if (safeIcons.colorPalette.length > 0) {
      lines.push(
        `**Icon colors:** ${safeIcons.colorPalette
          .slice(0, 10)
          .map((c: string) => `\`${c}\``)
          .join(", ")}`,
      );
      lines.push("");
    }
  }

  // ── Font Files ──
  if (safeFonts.fonts.length > 0) {
    lines.push("## Font Files");
    lines.push("");
    lines.push("| Family | Source | Weights | Styles |");
    lines.push("|--------|--------|---------|--------|");
    for (const f of safeFonts.fonts) {
      lines.push(
        `| ${f.family || "unknown"} | ${f.source || "unknown"} | ${asArray(f.weights).join(", ")} | ${asArray(f.styles).join(", ")} |`,
      );
    }
    lines.push("");
    if (safeFonts.googleFontsUrl) {
      lines.push(`**Google Fonts URL:** \`${safeFonts.googleFontsUrl}\``);
      lines.push("");
    }
  }

  // ── Image Styles ──
  if (safeImages.patterns.length > 0) {
    lines.push("## Image Style Patterns");
    lines.push("");
    lines.push("| Pattern | Count | Key Styles |");
    lines.push("|---------|-------|------------|");
    for (const p of safeImages.patterns) {
      const styles = Object.entries(p.styles || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      lines.push(`| ${p.name} | ${p.count} | ${styles || "—"} |`);
    }
    lines.push("");
    if (safeImages.aspectRatios.length > 0) {
      lines.push(
        `**Aspect ratios:** ${safeImages.aspectRatios
          .slice(0, 8)
          .map((a) => `${a.ratio || "unknown"} (${numberOr(a.count)}x)`)
          .join(", ")}`,
      );
      lines.push("");
    }
  }

  // ── Motion Language (v9) ──
  if (
    design.motion &&
    (safeMotion.durations.length || safeMotion.keyframes.length)
  ) {
    lines.push("## Motion Language");
    lines.push("");
    lines.push(
      `**Feel:** ${safeMotion.feel} · **Scroll-linked:** ${safeMotion.scrollLinked.present ? "yes" : "no"}`,
    );
    lines.push("");
    if (safeMotion.durations.length) {
      lines.push("### Duration Tokens");
      lines.push("");
      lines.push("| name | value | ms |");
      lines.push("|---|---|---|");
      for (const d of safeMotion.durations)
        lines.push(`| \`${d.name || "duration"}\` | \`${d.css || ""}\` | ${numberOr(d.ms)} |`);
      lines.push("");
    }
    if (safeMotion.easings.length) {
      lines.push("### Easing Families");
      lines.push("");
      const byFamily: Record<string, Array<{ count?: number; raw: string }>> = {};
      for (const e of safeMotion.easings)
        (byFamily[e.family || "unknown"] ||= []).push({
          count: e.count,
          raw: e.raw || "",
        });
      for (const [family, list] of Object.entries(byFamily)) {
        lines.push(
          `- **${family}** (${list.reduce((s, e) => s + (e.count || 0), 0)} uses) — \`${list
            .map((e) => e.raw)
            .slice(0, 3)
            .join("`, `")}\``,
        );
      }
      lines.push("");
    }
    if (safeMotion.springs.length) {
      lines.push("### Spring / Overshoot Easings");
      lines.push("");
      for (const s of safeMotion.springs) lines.push(`- \`${s.raw || ""}\``);
      lines.push("");
    }
    const usedKf = safeMotion.keyframes.filter((k) => k.used);
    if (usedKf.length) {
      lines.push("### Keyframes In Use");
      lines.push("");
      lines.push("| name | kind | properties | uses |");
      lines.push("|---|---|---|---|");
      for (const k of usedKf.slice(0, 20))
        lines.push(
          `| \`${k.name || "unnamed"}\` | ${k.kind || "unknown"} | ${asArray(k.propertiesAnimated).slice(0, 4).join(", ")} | ${numberOr(k.usageCount)} |`,
        );
      lines.push("");
    }
  }

  // ── Component Anatomy (v9) ──
  if (safeComponentAnatomy.length) {
    lines.push("## Component Anatomy");
    lines.push("");
    for (const a of safeComponentAnatomy.slice(0, 6)) {
      lines.push(
        `### ${a.kind} — ${a.totalInstances} instance${a.totalInstances === 1 ? "" : "s"}`,
      );
      lines.push("");
      const slots = Object.entries(asRecord(a.slots))
        .filter(([, v]) => v)
        .map(([k]) => k);
      if (slots.length) lines.push(`**Slots:** ${slots.join(", ")}`);
      if (asArray(a.props?.variant).length)
        lines.push(`**Variants:** ${asArray(a.props?.variant).join(" · ")}`);
      if (asArray(a.props?.size).length)
        lines.push(`**Sizes:** ${asArray(a.props?.size).join(" · ")}`);
      lines.push("");
      if (asArray(a.variants).length > 1) {
        lines.push("| variant | count | sample label |");
        lines.push("|---|---|---|");
        for (const v of asArray(a.variants).slice(0, 8))
          lines.push(
            `| ${v.name || "variant"} | ${numberOr(v.count)} | ${(asArray(v.sampleText)[0] || "").slice(0, 40)} |`,
          );
        lines.push("");
      }
    }
  }

  // ── Brand Voice (v9) ──
  if (
    design.voice &&
    (safeVoice.ctaVerbs.length || safeVoice.sampleHeadings.length)
  ) {
    lines.push("## Brand Voice");
    lines.push("");
    lines.push(
      `**Tone:** ${safeVoice.tone} · **Pronoun:** ${safeVoice.pronoun} · **Headings:** ${safeVoice.headingStyle} (${safeVoice.headingLengthClass})`,
    );
    lines.push("");
    if (safeVoice.ctaVerbs.length) {
      lines.push("### Top CTA Verbs");
      lines.push("");
      for (const v of safeVoice.ctaVerbs.slice(0, 8))
        lines.push(`- **${v.value || "unknown"}** (${numberOr(v.count)})`);
      lines.push("");
    }
    if (safeVoice.buttonPatterns.length) {
      lines.push("### Button Copy Patterns");
      lines.push("");
      for (const p of safeVoice.buttonPatterns.slice(0, 10))
        lines.push(`- "${p.value || ""}" (${numberOr(p.count)}x)`);
      lines.push("");
    }
    if (safeVoice.sampleHeadings.length) {
      lines.push("### Sample Headings");
      lines.push("");
      for (const h of safeVoice.sampleHeadings) lines.push(`> ${h}`);
      lines.push("");
    }
  }

  // ── v10: Page Intent ──
  if (safePageIntent && safePageIntent.type) {
    lines.push("## Page Intent");
    lines.push("");
    lines.push(
      `**Type:** \`${safePageIntent.type}\` (confidence ${numberOr(safePageIntent.confidence)})`,
    );
    if (safePageIntent.description)
      lines.push(`**Description:** ${safePageIntent.description}`);
    if (asArray(safePageIntent.alternates).length) {
      lines.push("");
      lines.push(
        "Alternates: " +
          asArray(safePageIntent.alternates)
            .map((a) => `${a.type || "unknown"} (${numberOr(a.score)})`)
            .join(", "),
      );
    }
    lines.push("");
  }

  // ── v10: Section Roles ──
  if (safeSectionRoles.sections.length) {
    lines.push("## Section Roles");
    lines.push("");
    lines.push(
      "Reading order (top→bottom): " +
        safeSectionRoles.readingOrder.join(" → "),
    );
    lines.push("");
    lines.push("| # | Role | Heading | Confidence |");
    lines.push("|---|------|---------|------------|");
    for (const s of safeSectionRoles.sections.slice(0, 20)) {
      const h = (s.heading || "")
        .replace(/\\/g, "\\\\")
        .replace(/\|/g, "\\|")
        .slice(0, 80);
      lines.push(
          `| ${numberOr(s.index)} | ${s.role || "unknown"}${s.subrole ? ` · ${s.subrole}` : ""} | ${h || "—"} | ${numberOr(s.confidence)} |`,
      );
    }
    lines.push("");
  }

  // ── v10: Material Language ──
  if (safeMaterialLanguage && safeMaterialLanguage.label) {
    lines.push("## Material Language");
    lines.push("");
    lines.push(
      `**Label:** \`${safeMaterialLanguage.label}\` (confidence ${numberOr(safeMaterialLanguage.confidence)})`,
    );
    const m = asRecord(safeMaterialLanguage.metrics);
    lines.push("");
    lines.push("| Metric | Value |");
    lines.push("|--------|-------|");
    if (m.saturation != null)
      lines.push(`| Avg saturation | ${m.saturation} |`);
    if (m.shadowProfile) lines.push(`| Shadow profile | ${m.shadowProfile} |`);
    if (m.avgShadowBlur != null)
      lines.push(`| Avg shadow blur | ${m.avgShadowBlur}px |`);
    if (m.maxRadius != null) lines.push(`| Max radius | ${m.maxRadius}px |`);
    if (m.hasBackdropBlur != null)
      lines.push(
        `| backdrop-filter in use | ${m.hasBackdropBlur ? "yes" : "no"} |`,
      );
    if (m.gradientCount != null)
      lines.push(`| Gradients | ${m.gradientCount} |`);
    lines.push("");
  }

  // ── v10: Imagery Style ──
  if (safeImageryStyle && safeImageryStyle.label && safeImageryStyle.label !== "none") {
    lines.push("## Imagery Style");
    lines.push("");
    lines.push(
      `**Label:** \`${safeImageryStyle.label}\` (confidence ${numberOr(safeImageryStyle.confidence)})`,
    );
    const c = asRecord(safeImageryStyle.counts);
    lines.push(
      `**Counts:** total ${c.total || 0}, svg ${c.svg || 0}, icon ${c.icon || 0}, screenshot-like ${c.screenshot || 0}, photo-like ${c.photoLike || 0}`,
    );
    if (safeImageryStyle.dominantAspect)
      lines.push(`**Dominant aspect:** ${safeImageryStyle.dominantAspect}`);
    if (safeImageryStyle.radiusProfile)
      lines.push(
        `**Radius profile on images:** ${safeImageryStyle.radiusProfile}`,
      );
    lines.push("");
  }

  // ── v10: Component Library ──
  if (
    safeComponentLibrary &&
    safeComponentLibrary.library &&
    safeComponentLibrary.library !== "unknown"
  ) {
    lines.push("## Component Library");
    lines.push("");
    lines.push(
      `**Detected:** \`${safeComponentLibrary.library}\` (confidence ${numberOr(safeComponentLibrary.confidence)})`,
    );
    if (asArray(safeComponentLibrary.evidence).length) {
      lines.push("");
      lines.push("Evidence:");
      for (const e of asArray(safeComponentLibrary.evidence)) lines.push(`- ${e}`);
    }
    if (asArray(safeComponentLibrary.alternates).length) {
      lines.push("");
      lines.push(
        "Also considered: " +
          asArray(safeComponentLibrary.alternates)
            .map((a) => `${a.id || "unknown"} (${numberOr(a.score)})`)
            .join(", "),
      );
    }
    lines.push("");
  }

  // ── v10: Multi-Page Map ──
  if (
    design.multiPage &&
    safeMultiPage.pages.length
  ) {
    lines.push("## Multi-Page Map");
    lines.push("");
    lines.push("| Page Type | URL | Status |");
    lines.push("|-----------|-----|--------|");
    for (const p of safeMultiPage.pages) {
      lines.push(
        `| ${p.type || "—"} | ${p.url || ""} | ${p.error ? "error" : "ok"} |`,
      );
    }
    lines.push("");
    if (safeMultiPage.sharedColors.length) {
      lines.push(
        `**Shared colors across pages:** ${safeMultiPage.sharedColors
          .slice(0, 10)
          .map((c: string) => `\`${c}\``)
          .join(", ")}`,
      );
      lines.push("");
    }
  }

  // ── v10.1: Component Screenshots ──
  if (
    design.componentScreenshots &&
    safeComponentScreenshots.components.length
  ) {
    lines.push("## Component Screenshots");
    lines.push("");
    lines.push(
      `${safeComponentScreenshots.components.length} retina crops written to \`screenshots/\`. Index: \`*-screenshots.json\`.`,
    );
    lines.push("");
    lines.push("| Cluster | Variant | Size (px) | File |");
    lines.push("|---------|---------|-----------|------|");
    for (const c of safeComponentScreenshots.components.slice(0, 20)) {
      lines.push(
        `| ${c.cluster} | ${c.variant} | ${c.bounds?.w || "?"} × ${c.bounds?.h || "?"} | \`${c.path}\` |`,
      );
    }
    if (safeComponentScreenshots.fullPage) {
      lines.push("");
      lines.push(`Full-page: \`${safeComponentScreenshots.fullPage.path || ""}\``);
    }
    lines.push("");
  }

  // ── Quick Start ──
  lines.push("## Quick Start");
  lines.push("");
  lines.push("To recreate this design in a new project:");
  lines.push("");
  if (safeTypography.families.length > 0) {
    const fontName = safeTypography.families[0].name || "the detected primary font";
    lines.push(
      `1. **Install fonts:** Add \`${fontName}\` from Google Fonts or your font provider`,
    );
  }
  lines.push(
    `2. **Import CSS variables:** Copy \`variables.css\` into your project`,
  );
  lines.push(
    `3. **Tailwind users:** Use the generated \`tailwind.config.js\` to extend your theme`,
  );
  lines.push(
    `4. **Design tokens:** Import \`design-tokens.json\` for tooling integration`,
  );
  lines.push("");

  return lines.join("\n");
}

export class MarkdownFormatter {
  constructor(private readonly design: unknown) {}

  format(): string {
    return formatMarkdown(this.design as MarkdownFormatInput);
  }
}
