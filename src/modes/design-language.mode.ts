import {
  extractAssetsSlice,
  extractDesignPaletteSlice,
  extractFontFamiliesSlice,
} from "@/sdk/modular-extraction";

export type ExtractMode =
  | "standard"
  | "overview"
  | "stack"
  | "dna"
  | "voice"
  | "layout"
  | "palette"
  | "fonts"
  | "assets"
  | "identity"
  | "messaging"
  | "composition"
  | "interaction"
  | "recreate"
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
  assets?: unknown;
  aiInsights?: unknown;
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
  brandIdentity?: unknown;
  composition?: unknown;
  artDirection?: unknown;
  messagingArchitecture?: unknown;
  interactionSignature?: unknown;
  themeRelationships?: unknown;
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
  composition: unknown;
  artDirection: unknown;
}

export interface VoiceModeResult extends ModeBase<"voice"> {
  mode: "voice";
  voice: unknown;
}

export interface LayoutModeResult extends ModeBase<"layout"> {
  mode: "layout";
  layout: unknown;
}

export interface PaletteModeResult extends ModeBase<"palette"> {
  mode: "palette";
  palette: ReturnType<typeof extractDesignPaletteSlice>;
}

export interface FontsModeResult extends ModeBase<"fonts"> {
  mode: "fonts";
  fonts: ReturnType<typeof extractFontFamiliesSlice>;
}

export interface AssetsModeResult extends ModeBase<"assets"> {
  mode: "assets";
  assets: ReturnType<typeof extractAssetsSlice>;
}

export interface IdentityModeResult extends ModeBase<"identity"> {
  mode: "identity";
  identity: unknown;
}

export interface MessagingModeResult extends ModeBase<"messaging"> {
  mode: "messaging";
  messaging: unknown;
}

export interface CompositionModeResult extends ModeBase<"composition"> {
  mode: "composition";
  composition: unknown;
  artDirection: unknown;
}

export interface InteractionModeResult extends ModeBase<"interaction"> {
  mode: "interaction";
  interaction: unknown;
}

export interface RecreateModeResult extends ModeBase<"recreate"> {
  mode: "recreate";
  recreate: {
    tokens: unknown;
    identity: unknown;
    composition: unknown;
    messaging: unknown;
    interaction: unknown;
    promptsHint: string[];
  };
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
    assets: unknown;
    aiInsights: unknown;
    images: unknown;
    motion: unknown;
    componentAnatomy: unknown[];
    brandVoice: unknown;
    pageIntent: unknown;
    sectionRoles: unknown;
    materialLanguage: unknown;
    imageryStyle: unknown;
    componentLibrary: unknown;
    layout: unknown;
    brandIdentity: unknown;
    composition: unknown;
    artDirection: unknown;
    messagingArchitecture: unknown;
    interactionSignature: unknown;
    themeRelationships: unknown;
    quickStart: string[];
  };
}

export type ModeExtractResult =
  | OverviewModeResult
  | StackModeResult
  | DnaModeResult
  | VoiceModeResult
  | LayoutModeResult
  | PaletteModeResult
  | FontsModeResult
  | AssetsModeResult
  | IdentityModeResult
  | MessagingModeResult
  | CompositionModeResult
  | InteractionModeResult
  | RecreateModeResult
  | DesignLanguageModeResult;

export function isModeExtractResult(value: unknown): value is ModeExtractResult {
  const mode = (value as { mode?: string } | null)?.mode;
  return (
    mode === "overview" ||
    mode === "stack" ||
    mode === "dna" ||
    mode === "voice" ||
    mode === "layout" ||
    mode === "palette" ||
    mode === "fonts" ||
    mode === "assets" ||
    mode === "identity" ||
    mode === "messaging" ||
    mode === "composition" ||
    mode === "interaction" ||
    mode === "recreate" ||
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
      assets: design.assets || {},
      aiInsights: design.aiInsights || {},
      images: design.images || {},
      motion: design.motion || {},
      componentAnatomy: design.componentAnatomy || [],
      brandVoice: design.voice || {},
      pageIntent: design.pageIntent || {},
      sectionRoles: design.sectionRoles || {},
      materialLanguage: design.materialLanguage || {},
      imageryStyle: design.imageryStyle || {},
      componentLibrary: design.componentLibrary || {},
      layout: design.layout || {},
      brandIdentity: design.brandIdentity || {},
      composition: design.composition || {},
      artDirection: design.artDirection || {},
      messagingArchitecture: design.messagingArchitecture || {},
      interactionSignature: design.interactionSignature || {},
      themeRelationships: design.themeRelationships || {},
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
    composition: design.composition || {},
    artDirection: design.artDirection || {},
  };
}

export function createVoiceModeResult(designInput: unknown): VoiceModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "voice"),
    voice: design.voice || {},
  };
}

export function createLayoutModeResult(designInput: unknown): LayoutModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "layout"),
    layout: design.layout || {},
  };
}

export function createPaletteModeResult(designInput: unknown): PaletteModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "palette"),
    palette: extractDesignPaletteSlice(
      design as Parameters<typeof extractDesignPaletteSlice>[0],
    ),
  };
}

export function createFontsModeResult(designInput: unknown): FontsModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "fonts"),
    fonts: extractFontFamiliesSlice(
      design as Parameters<typeof extractFontFamiliesSlice>[0],
    ),
  };
}

export function createAssetsModeResult(designInput: unknown): AssetsModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "assets"),
    assets: extractAssetsSlice(
      design as Parameters<typeof extractAssetsSlice>[0],
    ),
  };
}

export function createIdentityModeResult(designInput: unknown): IdentityModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "identity"),
    identity: design.brandIdentity || {},
  };
}

export function createMessagingModeResult(designInput: unknown): MessagingModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "messaging"),
    messaging: design.messagingArchitecture || {},
  };
}

export function createCompositionModeResult(designInput: unknown): CompositionModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "composition"),
    composition: design.composition || {},
    artDirection: design.artDirection || {},
  };
}

export function createInteractionModeResult(designInput: unknown): InteractionModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "interaction"),
    interaction: design.interactionSignature || {},
  };
}

export function createRecreateModeResult(designInput: unknown): RecreateModeResult {
  const design = (designInput || {}) as DesignLike;
  return {
    ...modeBase(design, "recreate"),
    recreate: {
      tokens: {
        colors: design.colors || {},
        typography: design.typography || {},
        spacing: design.spacing || {},
        borders: design.borders || {},
        shadows: design.shadows || {},
        themeRelationships: design.themeRelationships || {},
      },
      identity: design.brandIdentity || {},
      composition: {
        composition: design.composition || {},
        artDirection: design.artDirection || {},
      },
      messaging: design.messagingArchitecture || {},
      interaction: design.interactionSignature || {},
      promptsHint: [
        "Preserve the identity assets and lockup treatment.",
        "Recreate composition rhythm before micro-detail polish.",
        "Keep CTA hierarchy and proof modules aligned to source intent.",
      ],
    },
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
  if (mode === "layout") return createLayoutModeResult(designInput);
  if (mode === "palette") return createPaletteModeResult(designInput);
  if (mode === "fonts") return createFontsModeResult(designInput);
  if (mode === "assets") return createAssetsModeResult(designInput);
  if (mode === "identity") return createIdentityModeResult(designInput);
  if (mode === "messaging") return createMessagingModeResult(designInput);
  if (mode === "composition") return createCompositionModeResult(designInput);
  if (mode === "interaction") return createInteractionModeResult(designInput);
  if (mode === "recreate") return createRecreateModeResult(designInput);
  return createDesignLanguageModeResult(designInput);
}
