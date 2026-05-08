export type ExtractMode =
  | "standard"
  | "overview"
  | "stack"
  | "dna"
  | "voice"
  | "design-language";

interface DesignLike {
  meta?: {
    url?: string;
    title?: string;
    timestamp?: string;
    elementCount?: number;
    pagesAnalyzed?: number;
  };
  colors?: {
    primary?: { hex?: string };
    secondary?: { hex?: string };
    accent?: { hex?: string };
    all?: Array<{ hex?: string }>;
    neutrals?: Array<{ hex?: string }>;
    backgrounds?: string[];
    text?: string[];
  };
  typography?: {
    families?: Array<{ name?: string; count?: number }>;
    body?: { size?: number; lineHeight?: string };
    headings?: Array<{ size?: number; weight?: number; lineHeight?: string }>;
    scale?: Array<{ size?: number; weight?: number; lineHeight?: string }>;
  };
  spacing?: { base?: number; scale?: Array<number> };
  borders?: { radii?: Array<{ label?: string; value?: number; count?: number }> };
  shadows?: { values?: Array<{ label?: string; raw?: string; blur?: number }> };
  variables?: Record<string, unknown>;
  breakpoints?: Array<{ label?: string; value?: number; type?: string }>;
  animations?: unknown;
  components?: unknown;
  componentClusters?: unknown[];
  layout?: unknown;
  accessibility?: { score?: number; failCount?: number; passCount?: number; pairs?: unknown[] };
  score?: {
    grade?: string;
    overall?: number;
    strengths?: string[];
    issues?: string[];
    scores?: Record<string, number>;
  };
  zIndex?: unknown;
  icons?: unknown;
  fonts?: unknown;
  images?: unknown;
  motion?: unknown;
  componentAnatomy?: unknown[];
  voice?: unknown;
  pageIntent?: unknown;
  sectionRoles?: unknown;
  materialLanguage?: unknown;
  imageryStyle?: unknown;
  componentLibrary?: unknown;
  backgroundPatterns?: unknown;
  stackIntel?: unknown;
  warnings?: string[];
}

interface ModeBase<TMode extends Exclude<ExtractMode, "standard">> {
  mode: TMode;
  generatedAt: string;
  meta: {
    title: string;
    url: string;
    extractedAt: string;
    elementCount: number;
    pagesAnalyzed: number;
  };
}

export interface OverviewModeResult extends ModeBase<"overview"> {
  mode: "overview";
  intent: unknown;
  material: unknown;
  library: unknown;
  tokens: {
    colors: {
      primary: string | null;
      secondary: string | null;
      accent: string | null;
      background: string | null;
      foreground: string | null;
      uniqueCount: number;
    };
    typography: {
      families: string[];
      base: number | null;
    };
    spacing: {
      base: number | null;
      scale: number[];
    };
    radii: Array<{ label: string; value: number | null }>;
    shadows: Array<{ label: string; value: string }>;
  };
  score: unknown;
  warnings: string[];
}

export interface StackModeResult extends ModeBase<"stack"> {
  mode: "stack";
  stack: unknown;
}

export interface DnaModeResult extends ModeBase<"dna"> {
  mode: "dna";
  materialLanguage: unknown;
  imageryStyle: unknown;
  backgroundPatterns: unknown;
}

export interface VoiceModeResult extends ModeBase<"voice"> {
  mode: "voice";
  voice: unknown;
}

export interface DesignLanguageModeResult
  extends ModeBase<"design-language"> {
  mode: "design-language";
  summary: {
    grade: string | null;
    overall: number | null;
    accessibilityScore: number | null;
    warnings: string[];
  };
  sections: {
    colors: unknown;
    typography: unknown;
    spacing: unknown;
    borders: unknown;
    shadows: unknown;
    cssVariables: Record<string, unknown>;
    breakpoints: unknown[];
    accessibility: unknown;
    designSystemScore: unknown;
    zIndex: unknown;
    icons: unknown;
    fonts: unknown;
    images: unknown;
    motion: unknown;
    componentAnatomy: unknown[];
    brandVoice: unknown;
    pageIntent: unknown;
    sectionRoles: unknown;
    materialLanguage: unknown;
    imageryStyle: unknown;
    componentLibrary: unknown;
    quickStart: string[];
  };
}

export type ModeExtractResult =
  | OverviewModeResult
  | StackModeResult
  | DnaModeResult
  | VoiceModeResult
  | DesignLanguageModeResult;

export function isModeExtractResult(value: unknown): value is ModeExtractResult {
  const mode = (value as { mode?: string } | null)?.mode;
  return (
    mode === "overview" ||
    mode === "stack" ||
    mode === "dna" ||
    mode === "voice" ||
    mode === "design-language"
  );
}

export function isDesignLanguageModeResult(
  value: unknown,
): value is DesignLanguageModeResult {
  return (
    !!value &&
    typeof value === "object" &&
    (value as { mode?: string }).mode === "design-language"
  );
}

function toMeta(
  design: DesignLike,
): ModeBase<Exclude<ExtractMode, "standard">>["meta"] {
  const meta = design.meta || {};
  return {
    title: meta.title || "Unknown Site",
    url: meta.url || "",
    extractedAt: meta.timestamp || new Date().toISOString(),
    elementCount: meta.elementCount || 0,
    pagesAnalyzed: meta.pagesAnalyzed || 1,
  };
}

function modeBase<TMode extends Exclude<ExtractMode, "standard">>(
  design: DesignLike,
  mode: TMode,
): ModeBase<TMode> {
  return {
    mode,
    generatedAt: new Date().toISOString(),
    meta: toMeta(design),
  };
}

export function createDesignLanguageModeResult(
  designInput: unknown,
): DesignLanguageModeResult {
  const design = (designInput || {}) as DesignLike;
  const score = design.score || {};
  const accessibility = design.accessibility || {};
  const typography = design.typography || {};
  const primaryFamily =
    typography.families?.[0]?.name || "the primary extracted font";

  return {
    ...modeBase(design, "design-language"),
    summary: {
      grade: score.grade || null,
      overall: typeof score.overall === "number" ? score.overall : null,
      accessibilityScore:
        typeof accessibility.score === "number" ? accessibility.score : null,
      warnings: design.warnings || [],
    },
    sections: {
      colors: design.colors || {},
      typography: design.typography || {},
      spacing: design.spacing || {},
      borders: design.borders || {},
      shadows: design.shadows || {},
      cssVariables: design.variables || {},
      breakpoints: design.breakpoints || [],
      accessibility: design.accessibility || {},
      designSystemScore: design.score || {},
      zIndex: design.zIndex || {},
      icons: design.icons || {},
      fonts: design.fonts || {},
      images: design.images || {},
      motion: design.motion || {},
      componentAnatomy: design.componentAnatomy || [],
      brandVoice: design.voice || {},
      pageIntent: design.pageIntent || {},
      sectionRoles: design.sectionRoles || {},
      materialLanguage: design.materialLanguage || {},
      imageryStyle: design.imageryStyle || {},
      componentLibrary: design.componentLibrary || {},
      quickStart: [
        `Install fonts: add ${primaryFamily}.`,
        "Import CSS variables from variables.css.",
        "For Tailwind projects, map extracted tokens into theme extensions.",
        "Import design tokens JSON for tooling integration.",
      ],
    },
  };
}

export function createOverviewModeResult(designInput: unknown): OverviewModeResult {
  const design = (designInput || {}) as DesignLike;
  const colors = design.colors || {};
  const typography = design.typography || {};
  const spacing = design.spacing || {};
  const borders = design.borders || {};
  const shadows = design.shadows || {};

  return {
    ...modeBase(design, "overview"),
    intent: design.pageIntent || {},
    material: design.materialLanguage || {},
    library: design.componentLibrary || {},
    tokens: {
      colors: {
        primary: colors.primary?.hex || null,
        secondary: colors.secondary?.hex || null,
        accent: colors.accent?.hex || null,
        background: colors.backgrounds?.[0] || null,
        foreground: colors.text?.[0] || null,
        uniqueCount: (colors.all || []).length,
      },
      typography: {
        families: (typography.families || [])
          .map((f) => f.name || "")
          .filter(Boolean),
        base:
          typography.body?.size ||
          typography.scale?.find((s) => s.size === 16)?.size ||
          null,
      },
      spacing: {
        base: spacing.base ?? null,
        scale: spacing.scale || [],
      },
      radii: (borders.radii || []).slice(0, 6).map((r) => ({
        label: r.label || "radius",
        value: r.value ?? null,
      })),
      shadows: (shadows.values || []).slice(0, 4).map((s) => ({
        label: s.label || "shadow",
        value: s.raw || "",
      })),
    },
    score: design.score || {},
    warnings: design.warnings || [],
  };
}

export function createStackModeResult(designInput: unknown): StackModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "stack"),
    stack: design.stackIntel || {},
  };
}

export function createDnaModeResult(designInput: unknown): DnaModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "dna"),
    materialLanguage: design.materialLanguage || {},
    imageryStyle: design.imageryStyle || {},
    backgroundPatterns: design.backgroundPatterns || {},
  };
}

export function createVoiceModeResult(designInput: unknown): VoiceModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "voice"),
    voice: design.voice || {},
  };
}

export function toModeExtractResult(
  designInput: unknown,
  mode: ExtractMode,
): unknown {
  if (mode === "standard") return designInput;
  if (mode === "overview") return createOverviewModeResult(designInput);
  if (mode === "stack") return createStackModeResult(designInput);
  if (mode === "dna") return createDnaModeResult(designInput);
  if (mode === "voice") return createVoiceModeResult(designInput);
  return createDesignLanguageModeResult(designInput);
}
