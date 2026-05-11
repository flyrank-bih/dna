import { crawlPage } from "./actions/crawl.action";
import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { extractComponentAnatomy } from "./cues/anatomy.cue";
import { extractArtDirection } from "./cues/art-direction.cue";
import { extractAnimations } from "./cues/animation.cue";
import { extractBackgroundPatterns } from "./cues/background.cue";
import { extractBrandIdentity } from "./cues/brand-identity.cue";
import { extractBorders } from "./cues/border.cue";
import { extractBreakpoints } from "./cues/breakpoint.cue";
import { clusterComponents } from "./cues/cluster.cue";
import { extractComposition } from "./cues/composition.cue";
import { extractColors } from "./cues/colors.cue";
import { extractComponents } from "./cues/components.cue";
import { extractCssHealth } from "./cues/css.cue";
import { extractStackFingerprint } from "./cues/fingerprint.cue";
import { extractFonts } from "./cues/font.cue";
import { extractFormStates } from "./cues/form.cue";
import { extractGradients } from "./cues/gradient.cue";
import { extractIconSystem } from "./cues/icon.cue";
import { extractIcons } from "./cues/icons.cue";
import { extractImageryStyle } from "./cues/imagery.style.cue";
import { extractImageStyles } from "./cues/images.cue";
import { extractStackIntel } from "./cues/intel.cue";
import { extractInteractionStates } from "./cues/interaction-state.cue";
import { extractInteractionSignature } from "./cues/interaction-signature.cue";
import { captureInteractions } from "./cues/interaction.cue";
import { extractLayout } from "./cues/layout.cue";
import { extractComponentLibrary } from "./cues/library.cue";
import { extractMaterialLanguage } from "./cues/logo";
import { extractMessagingArchitecture } from "./cues/messaging-architecture.cue";
import { extractModernCss } from "./cues/modern-css.cue";
import { extractMotion } from "./cues/motion.cue";
import { extractPageIntent } from "./cues/page-intent.cue";
import { scoreDesignSystem } from "./cues/scoring.cue";
import { extractSectionRoles } from "./cues/sections.cue";
import { extractSemanticRegions } from "./cues/semantic.cue";
import { extractSeo } from "./cues/seo.cue";
import { extractShadows } from "./cues/shadow.cue";
import { extractSpacing } from "./cues/spacing.cue";
import { extractTokenSources } from "./cues/token.cue";
import { extractThemeRelationships } from "./cues/theme-relationships.cue";
import { extractTypography } from "./cues/typography.cue";
import { extractVariables } from "./cues/variable.cue";
import { extractVoice } from "./cues/voice.cue";
import { captureResponsive } from "./cues/responsiveness.cue";
import { extractWideGamut } from "./cues/wide.cue";
import { extractZIndex } from "./cues/zindex.cue";
import { remediateFailingPairs } from "./helpers/a11y.helpers";
import { extractAccessibility } from "./helpers/accessibility.helpers";
import { nameFromUrl } from "./helpers/general.helpers";
import { formatTokens } from "./helpers/token-formatter.helper";
import { buildPromptPack } from "./generators/prompt.generator";
import { formatMarkdown } from "./formatters/markdown.formatter";
import { DefaultDesignMdObserver } from "./observers/design-markdown.observer";
import {
  analyzeBrandIdentityAudit,
  analyzeDesignConsistencyAudit,
  analyzeVisualSystemAudit,
} from "./sdk/brand-audit";
import { resolveAiProvider } from "./sdk/ai/ai.provider";
import {
  buildDeterministicBrandInsights,
  generateAiBrandInsights,
  toBrandScalingResult,
  toLayoutDirectionsResult,
  toPaletteEvolutionResult,
  toTypographySystemResult,
  type BrandAiInsightsResult,
  type BrandScalingResult,
  type LayoutDirectionsResult,
  type PaletteEvolutionResult,
  type TypographySystemResult,
} from "./sdk/ai/brand-insights";
import {
  buildDeterministicBrandContent,
  generateAiBrandContent,
} from "./sdk/ai/content-generation";
import {
  buildDeterministicSuggestions,
  generateAiSuggestions,
  toVisualSuggestionsFromInsights,
  type VisualSuggestionResult,
} from "./sdk/ai/visual-suggestions";
import { analyzeAssets } from "./sdk/assets/image-analysis";
import {
  type AssetsResult,
  type BatchExtractionResult,
  type BrandVoiceResult,
  type DesignPaletteResult,
  extractAssetsSlice,
  extractBrandVoiceSlice,
  extractDesignPaletteSlice,
  extractFontFamiliesSlice,
  extractTechStackSlice,
  type FontFamiliesResult,
  type TechStackResult,
} from "./sdk/modular-extraction";
import {
  normalizeSdkConfig,
  type SdkInitInput,
} from "./sdk/config";
import { mergeExtractOptions } from "./sdk/extraction/extract-options";
import { ensureValue } from "./sdk/errors";
import {
  buildMonitorAlerts,
  compareBrandSnapshots,
  createBrandSnapshot,
  persistSnapshot,
} from "./sdk/monitoring/brand-monitor";
import { type BrandSnapshot } from "./sdk/monitoring/monitor.types";
import { type SdkResponse } from "./sdk/response";
import { createSdkMethodRunner } from "./sdk/method-runner";
import {
  extractScreenshotsForUrl,
  type ScreenshotExtractionResult,
} from "./sdk/screenshots/screenshot-extraction";
import {
  isModeExtractResult,
  toModeExtractResult,
  type ExtractMode,
  type ModeExtractResult,
} from "./modes/design-language.mode";

export interface ExtractDesignLanguageOptions {
  ignore?: string[];
  deepInteract?: boolean;
  pages?: number;
  responsive?: boolean;
  interact?: boolean;
  screenshot?: boolean;
  screenshots?: boolean;
  outputDir?: string;
  emitFiles?: boolean;
  platforms?: Array<
    "web" | "ios" | "android" | "flutter" | "wordpress" | "all"
  >;
  mode?: ExtractMode;
  aiInsights?:
    | boolean
    | {
        areas?: Array<
          "layout" | "palette" | "typography" | "voice" | "brand-scaling"
        >;
      };
  [key: string]: unknown;
}

interface CrawlerRoute {
  url: string;
  path?: string;
  computedStylesSample?: unknown[];
}

interface CrawlerSnapshot {
  computedStyles?: unknown[];
  cssVariables?: Record<string, unknown>;
  mediaQueries?: string[];
  keyframes?: unknown[];
  icons?: unknown[];
  fontData?: unknown;
  images?: unknown[];
  stack?: Record<string, unknown>;
  sections?: unknown[];
  componentCandidates?: unknown[];
  cssCoverage?: unknown;
  modernColors?: unknown[];
  interactState?: unknown;
  favicons?: unknown[];
  manifest?: string | null;
  jsonLd?: string[];
  themeColor?: string | null;
  logos?: unknown[];
}

type ExtractableInput = string | DesignLanguageResult | ModeExtractResult;
type BatchableExtractInput = ExtractableInput | ExtractableInput[];

interface CrawlResult {
  url: string;
  title: string;
  pagesAnalyzed?: number;
  light: CrawlerSnapshot;
  dark?: CrawlerSnapshot | null;
  interactState?: unknown;
  componentScreenshots?: Record<string, unknown>;
  routes?: CrawlerRoute[];
}

interface BrandIdentityCueInput {
  url?: string;
  title?: string;
  themeColor?: string | null;
  favicons?: Array<{
    rel?: string | null;
    href?: string;
    sizes?: string;
    type?: string;
  }>;
  manifest?: string | null;
  logos?: Array<{
    src?: string;
    href?: string;
    alt?: string;
    text?: string;
    kind?: string;
    inHeader?: boolean;
    width?: number;
    height?: number;
  }>;
}

interface CompositionCueInput {
  sections?: Array<{
    role?: string;
    heading?: string;
    text?: string;
    children?: unknown[];
  }>;
  layout?: {
    grids?: unknown[];
    flex?: unknown[];
    containerWidths?: Array<{ maxWidth?: string | number }>;
  };
  components?: Record<string, unknown>;
  voice?: {
    sampleHeadings?: string[];
  };
}

interface LayoutCueInput {
  computedStyles?: Array<{
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
  }>;
  sections?: Array<{
    role?: string;
    heading?: string;
    text?: string;
    cardCount?: number;
    buttonCount?: number;
    bounds?: { y?: number; h?: number };
  }>;
  images?: Array<{
    width?: number;
    height?: number;
    format?: string;
  }>;
}

interface ArtDirectionCueInput {
  imageryStyle?: {
    label?: string;
    counts?: {
      icon?: number;
      svg?: number;
      screenshot?: number;
      photoLike?: number;
      total?: number;
    };
  };
  images?: {
    patterns?: Array<{ name?: string; count?: number }>;
    shapes?: Array<{ shape?: string; count?: number }>;
    filters?: Array<{ filter?: string; count?: number }>;
  };
  rawImages?: Array<{
    src?: string;
    width?: number;
    height?: number;
    objectFit?: string;
    filter?: string;
    classList?: string;
  }>;
}

interface MessagingCueInput {
  pageIntent?: { type?: string };
  voice?: {
    sampleHeadings?: string[];
    ctaVerbs?: Array<{ value?: string; count?: number }>;
    buttonPatterns?: Array<{ value?: string; count?: number }>;
  };
  sectionRoles?: {
    sections?: Array<{ role?: string; heading?: string; slots?: { heading?: string } }>;
    readingOrder?: string[];
  };
}

interface InteractionSignatureCueInput {
  interactionStates?: {
    hover?: { sampled?: number; changed?: number; deltas?: unknown[] };
    menusOpened?: number;
    accordionsOpened?: number;
    modals?: unknown[];
  };
  motion?: {
    durations?: string[];
    easings?: Array<{ family?: string; count?: number } | string>;
    feel?: string;
  };
}

interface ThemeRelationshipsCueInput {
  colors?: {
    primary?: { hex?: string } | null;
    secondary?: { hex?: string } | null;
    accent?: { hex?: string } | null;
    backgrounds?: string[];
    text?: string[];
  };
  variables?: Record<string, unknown>;
  darkMode?: {
    colors?: {
      backgrounds?: string[];
      text?: string[];
    };
  } | null;
}

interface AuditSdkInput {
  colors?: {
    all?: Array<{ hex?: string }>;
    primary?: { hex?: string } | null;
  };
  typography?: {
    families?: Array<{ name?: string } | string>;
  };
  brandIdentity?: {
    lockup?: string;
    themeColor?: string | null;
    primaryLogo?: { label?: string } | null;
    alternateLogos?: unknown[];
  };
  composition?: {
    heroPattern?: string;
    density?: string;
    pacing?: string;
  };
  interactionSignature?: {
    hoverTreatment?: string;
    consistency?: string;
  };
  messagingArchitecture?: {
    headlineFormula?: string;
    proofModules?: string[];
  };
  themeRelationships?: {
    hasDarkMode?: boolean;
    themeFamilies?: string[];
  };
}

export interface DesignLanguageResult {
  meta: {
    url: string;
    title: string;
    timestamp: string;
    elementCount: number;
    pagesAnalyzed: number;
  };
  colors: unknown;
  typography: unknown;
  spacing: unknown;
  shadows: unknown;
  borders: unknown;
  variables: Record<string, unknown>;
  breakpoints: unknown[];
  animations: unknown;
  components: unknown;
  accessibility: unknown;
  gradients: unknown;
  zIndex: unknown;
  icons: unknown;
  fonts: unknown;
  images: unknown;
  componentScreenshots: Record<string, unknown>;
  stack: unknown;
  cssHealth: unknown;
  regions: unknown[];
  componentClusters: unknown[];
  layout?: unknown;
  modernCss: unknown;
  wideGamut: unknown;
  tokenSources: unknown[];
  interactionStates: unknown;
  motion: unknown;
  componentAnatomy: unknown[];
  voice: unknown;
  pageIntent?: unknown;
  sectionRoles?: unknown;
  componentLibrary?: unknown;
  materialLanguage?: unknown;
  imageryStyle?: unknown;
  seo?: unknown;
  iconSystem?: unknown;
  backgroundPatterns?: unknown;
  stackIntel?: unknown;
  formStates?: unknown;
  brandIdentity?: unknown;
  assets?: AssetsResult;
  aiInsights?: BrandAiInsightsResult;
  composition?: unknown;
  artDirection?: unknown;
  messagingArchitecture?: unknown;
  interactionSignature?: unknown;
  themeRelationships?: unknown;
  responsive?: unknown;
  interactions?: unknown;
  platforms?: string[];
  multiPage?: unknown;
  warnings: string[];
  darkMode?: { colors: unknown; variables: Record<string, unknown> };
  _raw?: CrawlResult;
  routes?: Array<{ url: string; path?: string; tokens: unknown }>;
  score: unknown;
}

type VoiceInput = NonNullable<Parameters<typeof extractVoice>[0]>;

function safeExtract<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  ...args: TArgs
): TResult | null {
  try {
    return fn(...args);
  } catch {
    return null;
  }
}

export async function extractDesignLanguage(
  url: string,
  options: ExtractDesignLanguageOptions = {},
): Promise<DesignLanguageResult> {
  const normalizedPages =
    typeof options.pages === "number" && options.pages > 0 ? options.pages : 0;
  const normalizedResponsive = Boolean(options.responsive);
  const normalizedInteract =
    Boolean(options.interact) || Boolean(options.deepInteract);
  const normalizedScreenshots =
    typeof options.screenshot === "boolean"
      ? options.screenshot
      : Boolean(options.screenshots);
  const normalizedPlatforms =
    options.platforms && options.platforms.includes("all")
      ? ["web", "ios", "android", "flutter", "wordpress"]
      : options.platforms || ["web"];

  const rawData = (await crawlPage(url, {
    ...options,
    depth: normalizedPages,
    pages: normalizedPages,
    responsive: normalizedResponsive,
    interact: normalizedInteract,
    deepInteract: normalizedInteract,
    screenshots: normalizedScreenshots,
    screenshot: normalizedScreenshots,
    platforms: normalizedPlatforms,
    ignore: options.ignore,
    outDir:
      typeof options.outputDir === "string" ? options.outputDir : undefined,
  })) as CrawlResult;
  const styles = rawData.light?.computedStyles || [];
  const warnings: string[] = [];

  const design: DesignLanguageResult = {
    meta: {
      url: rawData.url,
      title: rawData.title,
      timestamp: new Date().toISOString(),
      elementCount: styles.length,
      pagesAnalyzed: rawData.pagesAnalyzed || 1,
    },
    colors:
      safeExtract(
        extractColors,
        styles as Parameters<typeof extractColors>[0],
      ) || {
      primary: null,
      secondary: null,
      accent: null,
      neutrals: [],
      backgrounds: [],
      text: [],
      gradients: [],
      all: [],
    },
    typography:
      safeExtract(
        extractTypography,
        styles as Parameters<typeof extractTypography>[0],
      ) || {
      families: [],
      scale: [],
    },
    spacing: safeExtract(
      extractSpacing,
      styles as Array<Record<string, string | undefined>>,
    ) || { scale: [], base: null },
    shadows:
      safeExtract(
        extractShadows,
        styles as Parameters<typeof extractShadows>[0],
      ) || { values: [] },
    borders:
      safeExtract(
        extractBorders,
        styles as Parameters<typeof extractBorders>[0],
      ) || { radii: [] },
    variables:
      (safeExtract(
        extractVariables,
        (rawData.light?.cssVariables || {}) as Record<string, string>,
      ) as unknown as Record<string, unknown>) || {},
    breakpoints:
      safeExtract(extractBreakpoints, rawData.light?.mediaQueries || []) || [],
    animations: safeExtract(
      extractAnimations,
      styles as Parameters<typeof extractAnimations>[0],
      (rawData.light?.keyframes || []) as Array<{ name: string; steps: Array<{ offset: string; style: string }> }>,
    ) || { transitions: [], keyframes: [] },
    components:
      safeExtract(
        extractComponents,
        styles as Parameters<typeof extractComponents>[0],
      ) || {},
    accessibility:
      safeExtract(
        extractAccessibility,
        styles as Parameters<typeof extractAccessibility>[0],
      ) || {
      score: 0,
      failCount: 0,
    },
    gradients:
      safeExtract(
        extractGradients,
        styles as Parameters<typeof extractGradients>[0],
      ) || { count: 0 },
    zIndex:
      safeExtract(
        extractZIndex,
        styles as Parameters<typeof extractZIndex>[0],
      ) || { allValues: [], issues: [] },
    icons: rawData.light.icons
      ? safeExtract(
          extractIcons,
          rawData.light.icons as Array<{
            svg: string;
            width?: number;
            height?: number;
            viewBox?: string;
            classList?: string;
            fill?: string;
            stroke?: string;
          }>,
        ) || {
          icons: [],
          count: 0,
        }
      : { icons: [], count: 0 },
    fonts: rawData.light.fontData
      ? safeExtract(extractFonts, rawData.light.fontData) || {
          fonts: [],
          googleFontsUrl: "",
          links: { googleFonts: [], cdn: [], selfHosted: [], all: [] },
          systemFonts: [],
        }
      : {
          fonts: [],
          googleFontsUrl: "",
          links: { googleFonts: [], cdn: [], selfHosted: [], all: [] },
          systemFonts: [],
        },
    images: rawData.light.images
      ? safeExtract(
          extractImageStyles,
          rawData.light.images as Parameters<typeof extractImageStyles>[0],
        ) || {
          patterns: [],
          aspectRatios: [],
        }
      : { patterns: [], aspectRatios: [] },
    componentScreenshots: rawData.componentScreenshots || {},
    stack: safeExtract(extractStackFingerprint, rawData.light.stack) || {
      framework: "unknown",
      css: { layer: "unknown", tailwind: null },
      analytics: [],
      detectedFrom: { globalCount: 0, scriptCount: 0, classSampleSize: 0 },
    },
    cssHealth:
      safeExtract(
        extractCssHealth,
        (rawData.light.cssCoverage || []) as Array<{
          url: string;
          text?: string;
          totalBytes?: number;
          ranges?: Array<{ start: number; end: number }>;
        }>,
      ) || null,
    regions:
      safeExtract(
        extractSemanticRegions,
        rawData.light.sections as Parameters<typeof extractSemanticRegions>[0],
      ) || [],
    componentClusters:
      safeExtract(
        clusterComponents,
        (rawData.light.componentCandidates || []) as Array<{
          kind: string;
          structuralHash: string;
          styleVector?: number[];
          text?: string;
          slots?: unknown[];
          disabled?: boolean;
          variantHint?: string;
          sizeHint?: string;
          css?: Record<string, unknown>;
        }>,
      ) || [],
    modernCss:
      safeExtract(
        extractModernCss,
        rawData as Parameters<typeof extractModernCss>[0],
      ) || {
      pseudoElements: { count: 0, samples: [] },
      variableFonts: { count: 0, axes: [] },
      openTypeFeatures: [],
      textWrap: {
        wrap: [],
        decorationStyle: [],
        decorationThickness: [],
        underlineOffset: [],
      },
      containerQueries: { count: 0, rules: [] },
      envUsage: [],
    },
    wideGamut:
      safeExtract(
        extractWideGamut,
        (rawData.light.modernColors || []) as Parameters<typeof extractWideGamut>[0],
      ) || {
      oklch: { count: 0, samples: [] },
      oklab: { count: 0, samples: [] },
      colorMix: { count: 0, samples: [] },
      lightDark: { count: 0, samples: [] },
      displayP3: { count: 0, samples: [] },
      rec2020: { count: 0, samples: [] },
      totalCount: 0,
    },
    tokenSources: [],
    interactionStates:
      safeExtract(
        extractInteractionStates,
        (rawData.interactState ||
          rawData.light.interactState) as Parameters<
          typeof extractInteractionStates
        >[0],
      ) || {
      scrollSettled: false,
      menusOpened: 0,
      hover: { sampled: 0, changed: 0, deltas: [] },
      accordionsOpened: 0,
      modals: [],
    },
    motion:
      safeExtract(
        extractMotion,
        styles as Parameters<typeof extractMotion>[0],
        (rawData.light.keyframes || []) as Array<{
          name: string;
          steps: Array<{ offset: string; style: string }>;
        }>,
      ) || {
      durations: [],
      easings: [],
      springs: [],
      keyframes: [],
      scrollLinked: { present: false, signals: [] },
      stats: {},
      feel: "unknown",
    },
    componentAnatomy:
      safeExtract(
        extractComponentAnatomy,
        rawData.light.componentCandidates as Parameters<
          typeof extractComponentAnatomy
        >[0],
      ) ||
      [],
    voice: safeExtract(extractVoice, {
      componentCandidates:
        (rawData.light.componentCandidates || []) as VoiceInput["componentCandidates"],
      sections: (rawData.light.sections || []) as VoiceInput["sections"],
    }) || {
      tone: "neutral",
      ctaVerbs: [],
      buttonPatterns: [],
      sampleHeadings: [],
    },
    warnings: [],
    score: null,
  };

  // Track which extractors failed
  const extractorChecks = [
    ["colors", design.colors],
    ["typography", design.typography],
    ["spacing", design.spacing],
    ["shadows", design.shadows],
    ["borders", design.borders],
    ["variables", design.variables],
    ["breakpoints", design.breakpoints],
    ["animations", design.animations],
    ["components", design.components],
    ["accessibility", design.accessibility],
    ["gradients", design.gradients],
    ["zIndex", design.zIndex],
  ] as const;
  for (const [name, result] of extractorChecks) {
    if (result === null) warnings.push(`${name} extractor failed`);
  }
  design.warnings = warnings;

  if (rawData.dark) {
    design.darkMode = {
      colors:
        safeExtract(
          extractColors,
          (rawData.dark.computedStyles || []) as Parameters<typeof extractColors>[0],
        ) || {
        primary: null,
        secondary: null,
        accent: null,
        neutrals: [],
        backgrounds: [],
        text: [],
        gradients: [],
        all: [],
      },
      variables:
        (safeExtract(
          extractVariables,
          (rawData.dark.cssVariables || {}) as Record<string, string>,
        ) as unknown as Record<string, unknown>) || {},
    };
  }

  // A11y remediation: derive failing pairs from accessibility extractor output
  // and propose palette colors that pass the matching WCAG rule.
  try {
    const a11y = (design.accessibility || {}) as {
      pairs?: Array<{
        level?: string;
        foreground?: string;
        background?: string;
        ratio?: number;
        isLargeText?: boolean;
      }>;
    };
    const colorCatalog = (design.colors as { all?: Array<{ hex?: string }> } | undefined)?.all || [];
    const palette = colorCatalog
      .map((c: { hex?: string }) => c.hex)
      .filter((hex): hex is string => typeof hex === "string");
    const failingPairs = (a11y.pairs || [])
      .filter((p) => p.level === "FAIL")
      .map((p) => ({
        fg: p.foreground,
        bg: p.background,
        ratio: p.ratio,
        rule: p.isLargeText ? "AA-large" : "AA-normal",
      }))
      .filter(
        (
          pair,
        ): pair is {
          fg: string;
          bg: string;
          ratio: number;
          rule: string;
        } =>
          typeof pair.fg === "string" &&
          typeof pair.bg === "string" &&
          typeof pair.ratio === "number",
      );
    design.accessibility = {
      ...a11y,
      failingPairs,
      remediation: remediateFailingPairs(failingPairs, palette),
    };
  } catch {
    /* non-fatal */
  }

  design.tokenSources =
    safeExtract(
      extractTokenSources,
      design as unknown as Parameters<typeof extractTokenSources>[0],
      styles,
    ) || [];

  // v10: page intent, section roles, component library, material language,
  // imagery style. All additive — no existing field is modified.
  design.pageIntent =
    safeExtract(
      extractPageIntent,
      rawData as Parameters<typeof extractPageIntent>[0],
      {
    url: rawData.url,
    title: rawData.title,
      },
    ) || { type: "unknown", confidence: 0, signals: [] };
  design.sectionRoles = safeExtract(
    extractSectionRoles,
    (rawData.light?.sections || []) as Parameters<typeof extractSectionRoles>[0],
    design.regions as Parameters<typeof extractSectionRoles>[1],
    design.pageIntent as Parameters<typeof extractSectionRoles>[2],
  ) || { sections: [], counts: {}, readingOrder: [] };
  design.componentLibrary = safeExtract(
    extractComponentLibrary,
    rawData.light?.stack || {},
  ) || { library: "unknown", confidence: 0, evidence: [], alternates: [] };
  design.materialLanguage =
    safeExtract(
      extractMaterialLanguage,
      design as Parameters<typeof extractMaterialLanguage>[0],
    ) || {
    label: "flat",
    confidence: 0,
    signals: [],
    metrics: {},
  };
  design.imageryStyle = safeExtract(
    extractImageryStyle,
    (rawData.light?.images || []) as Parameters<typeof extractImageryStyle>[0],
  ) || { label: "none", confidence: 0, counts: {}, signals: [] };
  design.seo =
    safeExtract(extractSeo, rawData as Parameters<typeof extractSeo>[0]) || {
    openGraph: {},
    twitter: {},
    structuredData: [],
    score: {},
  };
  design.iconSystem = safeExtract(
    extractIconSystem,
    (rawData.light?.icons || []) as Parameters<typeof extractIconSystem>[0],
  ) || { library: "unknown", confidence: 0, stats: {}, signals: [], icons: [] };
  design.backgroundPatterns = safeExtract(
    extractBackgroundPatterns,
    rawData as Parameters<typeof extractBackgroundPatterns>[0],
  ) || { labels: ["plain"], counts: {}, gradientTotals: {}, samples: [] };
  design.stackIntel = safeExtract(
    extractStackIntel,
    rawData.light?.stack || {},
  ) || { cms: [], analytics: [], experimentation: [] };
  design.formStates =
    safeExtract(extractFormStates, rawData as Parameters<typeof extractFormStates>[0]) || {
    flags: [],
    forms: { count: 0, families: [] },
    modals: [],
    toastLibraries: [],
  };
  design.brandIdentity = safeExtract(extractBrandIdentity, {
    url: rawData.url,
    title: rawData.title,
    themeColor: rawData.light?.themeColor || null,
    favicons: (rawData.light?.favicons || []) as BrandIdentityCueInput["favicons"],
    manifest: rawData.light?.manifest || null,
    logos: (rawData.light?.logos || []) as BrandIdentityCueInput["logos"],
  }) || {
    primaryLogo: null,
    alternateLogos: [],
    favicons: [],
    manifest: null,
    themeColor: null,
    lockup: "unknown",
    darkLightVariants: { present: false, evidence: [] },
  };
  design.assets = extractAssetsSlice(
    design as Parameters<typeof extractAssetsSlice>[0],
  );
  design.layout = safeExtract(extractLayout, {
    computedStyles: styles as LayoutCueInput["computedStyles"],
    sections: (rawData.light?.sections || []) as LayoutCueInput["sections"],
    images: (rawData.light?.images || []) as LayoutCueInput["images"],
  }) || {
    pattern: "unknown",
    hero: "unknown",
    density: "balanced",
    alignment: "mixed",
    mediaBalance: "balanced",
    grid: {
      hasGrid: false,
      hasFlex: false,
      multiColumnSections: 0,
      averageColumns: 0,
      commonMaxWidths: [],
    },
    rhythm: {
      sectionCount: 0,
      cardHeavy: false,
      alternatingCadence: false,
    },
    overallFeel: "unknown",
    confidence: 0,
    evidence: [],
  };
  design.composition = safeExtract(extractComposition, {
    sections: (rawData.light?.sections || []) as CompositionCueInput["sections"],
    layout: {
      grids:
        ((design.layout as { grid?: { hasGrid?: boolean } } | undefined)?.grid?.hasGrid
          ? [(design.layout as { grid?: unknown }).grid]
          : []) as CompositionCueInput["layout"] extends { grids?: infer T } ? T : never,
      flex:
        ((design.layout as { grid?: { hasFlex?: boolean } } | undefined)?.grid?.hasFlex
          ? [(design.layout as { grid?: unknown }).grid]
          : []) as CompositionCueInput["layout"] extends { flex?: infer T } ? T : never,
      containerWidths:
        (
          (design.layout as {
            grid?: { commonMaxWidths?: Array<string | number> };
          } | undefined)?.grid?.commonMaxWidths || []
        ).map((maxWidth) => ({ maxWidth })),
    },
    components: (design.components || {}) as CompositionCueInput["components"],
    voice: (design.voice || {}) as CompositionCueInput["voice"],
  }) || {
    heroPattern: "unknown",
    density: "balanced",
    pacing: "balanced",
    emphasisPatterns: [],
    evidence: [],
  };
  design.artDirection = safeExtract(extractArtDirection, {
    imageryStyle: (design.imageryStyle || {}) as ArtDirectionCueInput["imageryStyle"],
    images: (design.images || {}) as ArtDirectionCueInput["images"],
    rawImages: (rawData.light?.images || []) as ArtDirectionCueInput["rawImages"],
  }) || {
    primaryMedium: "mixed",
    treatment: "mixed",
    backgroundTreatment: "mixed",
    evidence: [],
  };
  design.messagingArchitecture = safeExtract(extractMessagingArchitecture, {
    pageIntent: (design.pageIntent || {}) as MessagingCueInput["pageIntent"],
    voice: (design.voice || {}) as MessagingCueInput["voice"],
    sectionRoles: (design.sectionRoles || {}) as MessagingCueInput["sectionRoles"],
  }) || {
    headlineFormula: "unknown",
    ctaHierarchy: { primary: [], secondary: [] },
    proofModules: [],
    persuasionSequence: [],
  };
  design.interactionSignature = safeExtract(extractInteractionSignature, {
    interactionStates:
      (design.interactionStates || {}) as InteractionSignatureCueInput["interactionStates"],
    motion: (design.motion || {}) as InteractionSignatureCueInput["motion"],
  }) || {
    hoverTreatment: "static",
    navigationReveal: "minimal",
    loadingStyle: "unknown",
    consistency: "medium",
  };
  design.themeRelationships = safeExtract(extractThemeRelationships, {
    colors: (design.colors || {}) as ThemeRelationshipsCueInput["colors"],
    variables: (design.variables || {}) as ThemeRelationshipsCueInput["variables"],
    darkMode: (design.darkMode || null) as ThemeRelationshipsCueInput["darkMode"],
  }) || {
    aliases: {},
    themeFamilies: [],
    hasDarkMode: false,
    evidence: [],
  };
  // Stash raw crawler output so downstream orchestration (multipage, smart)
  // can rebuild the digest without re-crawling.
  design._raw = rawData as CrawlResult;

  // Per-route token extraction (Tier 2 multi-page reconciliation).
  if (Array.isArray(rawData.routes) && rawData.routes.length > 0) {
    design.routes = rawData.routes.map((r: CrawlerRoute) => {
      const rStyles = r.computedStylesSample || [];
      const rDesign = {
        meta: { url: r.url },
        colors:
          safeExtract(
            extractColors,
            rStyles as Parameters<typeof extractColors>[0],
          ) || {
          all: [],
          neutrals: [],
          backgrounds: [],
          text: [],
          gradients: [],
        },
        typography:
          safeExtract(
            extractTypography,
            rStyles as Parameters<typeof extractTypography>[0],
          ) || {
          families: [],
          scale: [],
        },
        spacing: safeExtract(
          extractSpacing,
          rStyles as Array<Record<string, string | undefined>>,
        ) || {
          scale: [],
          base: null,
        },
        shadows:
          safeExtract(
            extractShadows,
            rStyles as Parameters<typeof extractShadows>[0],
          ) || { values: [] },
        borders:
          safeExtract(
            extractBorders,
            rStyles as Parameters<typeof extractBorders>[0],
          ) || { radii: [] },
      };
      const tokens =
        safeExtract(
          formatTokens,
          rDesign as unknown as Parameters<typeof formatTokens>[0],
        ) || {
        primitive: {},
        semantic: {},
      };
      return { url: r.url, path: r.path, tokens };
    });
  }

  design.score =
    safeExtract(
      scoreDesignSystem,
      design as unknown as Parameters<typeof scoreDesignSystem>[0],
    ) || null;
  if (design.score === null) warnings.push("scoring failed");

  if (normalizedResponsive) {
    design.responsive = await captureResponsive(url, {
      wait: typeof options.wait === "number" ? options.wait : 0,
    }).catch(() => null);
  }

  if (normalizedInteract) {
    design.interactions = await captureInteractions(url, {
      width: typeof options.width === "number" ? options.width : 1280,
      height: typeof options.height === "number" ? options.height : 800,
      wait: typeof options.wait === "number" ? options.wait : 0,
    }).catch(() => null);
  }

  design.platforms = normalizedPlatforms;

  return design;
}

export interface FlyDesignInitOptions extends ExtractDesignLanguageOptions {
  cache?: boolean;
  screenshots?: boolean;
  outputDir?: string;
  emitFiles?: boolean;
  mode?: ExtractMode;
}

export interface AnalyzeResult {
  design: DesignLanguageResult;
  score: unknown;
  warnings: string[];
}

export interface RemixOptions {
  vocabulary?: "brutalist" | "glass" | "soft" | "minimal";
}

export interface DesignPaletteExtractOptions extends ExtractDesignLanguageOptions {
  includeNeutrals?: boolean;
}

export interface FontFamiliesExtractOptions extends ExtractDesignLanguageOptions {
  includeSystemFonts?: boolean;
}

export interface AssetsExtractOptions extends ExtractDesignLanguageOptions {
  includeImages?: boolean;
  includeFonts?: boolean;
  includeLogos?: boolean;
}

export interface BrandVoiceExtractOptions extends ExtractDesignLanguageOptions {
  includeSamples?: boolean;
}

export interface TechStackExtractOptions extends ExtractDesignLanguageOptions {
  includeEvidence?: boolean;
}

export interface AiInsightsExtractOptions extends ExtractDesignLanguageOptions {
  benchmark?: unknown;
  ai?: boolean;
}

export interface ScreenshotExtractMethodOptions
  extends Omit<ExtractDesignLanguageOptions, "mode"> {
  components?: boolean;
  fullPage?: boolean;
  responsive?: boolean;
  includeDark?: boolean;
  width?: number;
  height?: number;
}

export interface CombinedAiMethodsResult {
  suggestEnhancements: VisualSuggestionResult;
  extractAiInsights: BrandAiInsightsResult;
  suggestPaletteEvolution: PaletteEvolutionResult;
  suggestBrandScaling: BrandScalingResult;
  suggestTypographySystem: TypographySystemResult;
}

export interface FlyDesignClient {
  extract: (
    url: string,
    options?: ExtractDesignLanguageOptions,
  ) => Promise<SdkResponse<DesignLanguageResult | ModeExtractResult>>;
  analyze: (
    input: string | DesignLanguageResult | ModeExtractResult,
  ) => Promise<SdkResponse<AnalyzeResult>>;
  grade: (
    input: string | DesignLanguageResult | ModeExtractResult,
  ) => Promise<SdkResponse<unknown>>;
  remix: (
    input: string | DesignLanguageResult | ModeExtractResult,
    options?: RemixOptions,
  ) => Promise<SdkResponse<DesignLanguageResult>>;
  clone: (
    input: string | DesignLanguageResult | ModeExtractResult,
    options?: { outDir?: string },
  ) => Promise<SdkResponse<unknown>>;
  apply: (
    input: string | DesignLanguageResult | ModeExtractResult,
    options?: Record<string, unknown>,
  ) => Promise<SdkResponse<unknown>>;
  brands: (
    urls: string[],
    options?: ExtractDesignLanguageOptions,
  ) => Promise<SdkResponse<unknown>>;
  benchmark: (
    urls: string[],
    options?: ExtractDesignLanguageOptions,
  ) => Promise<SdkResponse<unknown>>;
  packCategory: (
    urls: string[],
    options?: ExtractDesignLanguageOptions & { outDir?: string },
  ) => Promise<SdkResponse<unknown>>;
  analyzeBrandIdentity: (
    input: string | DesignLanguageResult | ModeExtractResult,
  ) => Promise<SdkResponse<unknown>>;
  analyzeDesignConsistency: (
    input: string | DesignLanguageResult | ModeExtractResult,
  ) => Promise<SdkResponse<unknown>>;
  analyzeVisualSystem: (
    input: string | DesignLanguageResult | ModeExtractResult,
  ) => Promise<SdkResponse<unknown>>;
  suggestEnhancements: (
    input: string | DesignLanguageResult | ModeExtractResult,
    options?: { benchmark?: unknown; ai?: boolean },
  ) => Promise<SdkResponse<unknown>>;
  generateBrandContent: (
    input: string | DesignLanguageResult | ModeExtractResult | { brief?: string },
    options?: { benchmark?: unknown; ai?: boolean },
  ) => Promise<SdkResponse<unknown>>;
  analyzeAssets: (
    input: string | DesignLanguageResult | ModeExtractResult,
  ) => Promise<SdkResponse<unknown>>;
  extractDesignPalette: (
    input: BatchableExtractInput,
    options?: DesignPaletteExtractOptions,
  ) => Promise<SdkResponse<DesignPaletteResult | BatchExtractionResult<DesignPaletteResult>>>;
  extractFontFamilies: (
    input: BatchableExtractInput,
    options?: FontFamiliesExtractOptions,
  ) => Promise<SdkResponse<FontFamiliesResult | BatchExtractionResult<FontFamiliesResult>>>;
  extractAssets: (
    input: BatchableExtractInput,
    options?: AssetsExtractOptions,
  ) => Promise<SdkResponse<AssetsResult | BatchExtractionResult<AssetsResult>>>;
  extractBrandVoice: (
    input: BatchableExtractInput,
    options?: BrandVoiceExtractOptions,
  ) => Promise<SdkResponse<BrandVoiceResult | BatchExtractionResult<BrandVoiceResult>>>;
  extractTechStack: (
    input: BatchableExtractInput,
    options?: TechStackExtractOptions,
  ) => Promise<SdkResponse<TechStackResult | BatchExtractionResult<TechStackResult>>>;
  extractAiInsights: (
    input: BatchableExtractInput,
    options?: AiInsightsExtractOptions,
  ) => Promise<SdkResponse<BrandAiInsightsResult | BatchExtractionResult<BrandAiInsightsResult>>>;
  suggestBrandScaling: (
    input: BatchableExtractInput,
    options?: AiInsightsExtractOptions,
  ) => Promise<SdkResponse<BrandScalingResult | BatchExtractionResult<BrandScalingResult>>>;
  suggestPaletteEvolution: (
    input: BatchableExtractInput,
    options?: AiInsightsExtractOptions,
  ) => Promise<SdkResponse<PaletteEvolutionResult | BatchExtractionResult<PaletteEvolutionResult>>>;
  suggestTypographySystem: (
    input: BatchableExtractInput,
    options?: AiInsightsExtractOptions,
  ) => Promise<SdkResponse<TypographySystemResult | BatchExtractionResult<TypographySystemResult>>>;
  suggestLayoutDirections: (
    input: BatchableExtractInput,
    options?: AiInsightsExtractOptions,
  ) => Promise<SdkResponse<LayoutDirectionsResult | BatchExtractionResult<LayoutDirectionsResult>>>;
  runCombinedAiMethods: (
    input: BatchableExtractInput,
    options?: AiInsightsExtractOptions,
  ) => Promise<SdkResponse<CombinedAiMethodsResult | BatchExtractionResult<CombinedAiMethodsResult>>>;
  extractScreenshots: (
    input: string | DesignLanguageResult,
    options?: ScreenshotExtractMethodOptions,
  ) => Promise<SdkResponse<ScreenshotExtractionResult>>;
  createSnapshot: (
    input: string | DesignLanguageResult | ModeExtractResult,
  ) => Promise<SdkResponse<BrandSnapshot>>;
  compareSnapshots: (
    current: BrandSnapshot,
    previous: BrandSnapshot,
  ) => Promise<SdkResponse<unknown>>;
  monitorBrand: (
    input: string | DesignLanguageResult | ModeExtractResult,
    previous?: BrandSnapshot,
  ) => Promise<SdkResponse<unknown>>;
  drift: (
    url: string,
    options: { tokens: string; tolerance?: number; options?: ExtractDesignLanguageOptions },
  ) => Promise<SdkResponse<unknown>>;
  lint: (file: string) => Promise<SdkResponse<unknown>>;
  diff: (
    left: string | DesignLanguageResult | ModeExtractResult,
    right: string | DesignLanguageResult | ModeExtractResult,
    options?: ExtractDesignLanguageOptions,
  ) => Promise<SdkResponse<unknown>>;
  visualDiff: (
    beforeUrl: string,
    afterUrl: string,
    options?: Record<string, unknown>,
  ) => Promise<SdkResponse<unknown>>;
  makePrompt: (
    input: string | DesignLanguageResult | ModeExtractResult,
    options?: { benchmark?: unknown },
  ) => Promise<SdkResponse<{
    claude: string;
    cursor: string;
    lovable: string;
    v0: string;
    codex: string;
  }>>;
}

export interface SdkUsageMetric {
  method: string;
  durationMs: number;
  ok: boolean;
}

function cloneDesign(design: DesignLanguageResult): DesignLanguageResult {
  return JSON.parse(JSON.stringify(design)) as DesignLanguageResult;
}

function remixDesign(
  design: DesignLanguageResult,
  options: RemixOptions = {},
): DesignLanguageResult {
  const next = cloneDesign(design);
  const mode = options.vocabulary || "minimal";

  if (mode === "brutalist") {
    const borders = next.borders as { radii?: Array<{ value?: number }> };
    if (Array.isArray(borders?.radii)) {
      borders.radii = borders.radii.map((radius) => ({
        ...radius,
        value: 0,
      }));
    }
  }

  if (mode === "glass") {
    next.materialLanguage = { label: "glass", confidence: 0.8 };
  }

  if (mode === "soft") {
    const shadows = next.shadows as { values?: Array<{ raw?: string }> };
    if (Array.isArray(shadows?.values)) {
      shadows.values = shadows.values.map((shadow) => ({
        ...shadow,
        raw: "0 12px 28px rgba(0,0,0,0.14)",
      }));
    }
  }

  return next;
}

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

function writeTextFile(filePath: string, content: string): void {
  writeFileSync(filePath, content, "utf-8");
}

function flattenObject(
  value: unknown,
  prefix = "",
  out: Record<string, string> = {},
): Record<string, string> {
  if (!value || typeof value !== "object") return out;
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    const nextKey = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === "object" && !Array.isArray(child)) {
      flattenObject(child, nextKey, out);
      continue;
    }
    out[nextKey] = JSON.stringify(child);
  }
  return out;
}

function routeSlug(path = "/"): string {
  const cleaned = path.replace(/^\/+|\/+$/g, "");
  return cleaned ? cleaned.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() : "home";
}

function buildRouteReconciliation(
  routes: Array<{ url: string; path?: string; tokens: unknown }>,
): {
  shared: Record<string, unknown>;
  perRoute: Array<{ url: string; path?: string; slug: string; tokens: unknown }>;
  report: string;
} {
  const flattened = routes.map((route) => ({
    route,
    flat: flattenObject(route.tokens),
  }));
  const sharedEntries: Record<string, string> = {};
  const [first, ...rest] = flattened;
  if (first) {
    for (const [key, value] of Object.entries(first.flat)) {
      if (rest.every((candidate) => candidate.flat[key] === value)) {
        sharedEntries[key] = value;
      }
    }
  }
  const shared: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(sharedEntries)) {
    try {
      shared[key] = JSON.parse(value);
    } catch {
      shared[key] = value;
    }
  }
  const reportLines = [
    "# Routes Token Reconciliation Report",
    "",
    `Routes analyzed: ${routes.length}`,
    `Shared token keys: ${Object.keys(sharedEntries).length}`,
    "",
    "| Route | URL | Unique Keys |",
    "|---|---|---|",
  ];
  for (const entry of flattened) {
    const uniqueCount = Object.keys(entry.flat).filter(
      (key) => !(key in sharedEntries),
    ).length;
    reportLines.push(
      `| ${entry.route.path || "/"} | ${entry.route.url} | ${uniqueCount} |`,
    );
  }
  return {
    shared,
    perRoute: routes.map((route) => ({
      ...route,
      slug: routeSlug(route.path),
    })),
    report: reportLines.join("\n"),
  };
}

function persistExtractionArtifacts(
  design: DesignLanguageResult,
  modeResult: DesignLanguageResult | ModeExtractResult,
  opts: { outputDir: string; mode: ExtractMode; pages: number },
): void {
  const outputDir = opts.outputDir || ".flydesign";
  ensureDir(outputDir);
  const prefix = nameFromUrl(design.meta.url);

  const designLanguagePath = join(outputDir, `${prefix}-design-language.md`);
  try {
    writeTextFile(
      designLanguagePath,
      formatMarkdown(design as Parameters<typeof formatMarkdown>[0]),
    );
  } catch (error) {
    design.warnings.push(
      `artifact emission failed for ${prefix}-design-language.md: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  const compactDesignPath = join(outputDir, `${prefix}-DESIGN.md`);
  try {
    writeTextFile(
      compactDesignPath,
      DefaultDesignMdObserver.format(
        design as Parameters<typeof DefaultDesignMdObserver.format>[0],
      ),
    );
  } catch (error) {
    design.warnings.push(
      `artifact emission failed for ${prefix}-DESIGN.md: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }

  writeTextFile(
    join(outputDir, `${prefix}-design-language.json`),
    JSON.stringify(modeResult, null, 2),
  );
  writeTextFile(
    join(outputDir, `${prefix}-stack-intel.json`),
    JSON.stringify(design.stackIntel || {}, null, 2),
  );
  writeTextFile(
    join(outputDir, `${prefix}-voice.json`),
    JSON.stringify(design.voice || {}, null, 2),
  );
  writeTextFile(
    join(outputDir, `${prefix}-visual-dna.json`),
    JSON.stringify(
      {
        materialLanguage: design.materialLanguage || {},
        imageryStyle: design.imageryStyle || {},
        backgroundPatterns: design.backgroundPatterns || {},
      },
      null,
      2,
    ),
  );
  writeTextFile(
    join(outputDir, `${prefix}-library.json`),
    JSON.stringify(design.componentLibrary || {}, null, 2),
  );

  if (opts.pages > 0 && Array.isArray(design.routes) && design.routes.length > 0) {
    const reconciliation = buildRouteReconciliation(design.routes);
    writeTextFile(
      join(outputDir, `${prefix}-tokens-shared.json`),
      JSON.stringify(reconciliation.shared, null, 2),
    );
    const routesDir = join(outputDir, `${prefix}-tokens-routes`);
    ensureDir(routesDir);
    for (const route of reconciliation.perRoute) {
      writeTextFile(
        join(routesDir, `${route.slug}.json`),
        JSON.stringify(route.tokens, null, 2),
      );
    }
    writeTextFile(
      join(outputDir, `${prefix}-routes-report.md`),
      reconciliation.report,
    );
  }
}

export function init(options: SdkInitInput = {}): FlyDesignClient {
  const sdkConfig = normalizeSdkConfig(options);
  const defaults: FlyDesignInitOptions = {
    cache: sdkConfig.extract.cache,
    screenshots: sdkConfig.extract.screenshots,
    screenshot: sdkConfig.extract.screenshot,
    outputDir: sdkConfig.extract.outputDir,
    emitFiles: sdkConfig.extract.emitFiles,
    pages: sdkConfig.extract.pages,
    responsive: sdkConfig.extract.responsive,
    interact: sdkConfig.extract.interact,
    deepInteract: sdkConfig.extract.deepInteract,
    platforms: sdkConfig.extract.platforms,
    mode: sdkConfig.extract.mode as ExtractMode | undefined,
    ignore: sdkConfig.extract.ignore,
  };
  const cache = new Map<string, DesignLanguageResult>();
  const version = "1.0.6";
  const runMethod = createSdkMethodRunner(version, sdkConfig);
  const aiProvider = resolveAiProvider(sdkConfig.ai);

  async function ensureDesign(
    input: string | DesignLanguageResult | ModeExtractResult,
    extractOptions: ExtractDesignLanguageOptions = {},
  ): Promise<DesignLanguageResult> {
    if (typeof input !== "string") {
      if (isModeExtractResult(input)) {
        const modeUrl =
          (input as { meta?: { url?: string } }).meta?.url || "";
        if (modeUrl) {
          return ensureDesign(modeUrl, extractOptions);
        }
        throw new Error(
          "Mode response cannot be used directly for this operation without a source URL.",
        );
      }
      return input;
    }
    const key = JSON.stringify([input, mergeExtractOptions(defaults, extractOptions)]);
    if (defaults.cache && cache.has(key)) {
      return cache.get(key) as DesignLanguageResult;
    }
    const design = await extractDesignLanguage(
      input,
      mergeExtractOptions(defaults, extractOptions),
    );
    if (defaults.cache) cache.set(key, design);
    return design;
  }

  async function resolveSliceInput<TData>(
    input: BatchableExtractInput,
    extractOptions: ExtractDesignLanguageOptions,
    mapDesign: (design: DesignLanguageResult) => TData,
  ): Promise<TData | BatchExtractionResult<TData>> {
    if (!Array.isArray(input)) {
      const design = await ensureDesign(input, extractOptions);
      return mapDesign(design);
    }

    const items: BatchExtractionResult<TData>["items"] = [];
    for (const entry of input) {
      const label =
        typeof entry === "string"
          ? entry
          : entry.meta?.url || "unknown-input";
      try {
        const design = await ensureDesign(entry, extractOptions);
        items.push({
          ok: true,
          input: label,
          data: mapDesign(design),
          error: null,
        });
      } catch (error) {
        items.push({
          ok: false,
          input: label,
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      items,
      count: items.length,
    };
  }

  async function resolveSliceInputAsync<TData>(
    input: BatchableExtractInput,
    extractOptions: ExtractDesignLanguageOptions,
    mapDesign: (design: DesignLanguageResult) => Promise<TData>,
  ): Promise<TData | BatchExtractionResult<TData>> {
    if (!Array.isArray(input)) {
      const design = await ensureDesign(input, extractOptions);
      return mapDesign(design);
    }

    const items: BatchExtractionResult<TData>["items"] = [];
    for (const entry of input) {
      const label =
        typeof entry === "string" ? entry : entry.meta?.url || "unknown-input";
      try {
        const design = await ensureDesign(entry, extractOptions);
        items.push({
          ok: true,
          input: label,
          data: await mapDesign(design),
          error: null,
        });
      } catch (error) {
        items.push({
          ok: false,
          input: label,
          data: null,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      items,
      count: items.length,
    };
  }

  function buildBrandInsightInput(
    design: DesignLanguageResult,
    benchmark?: unknown,
  ) {
    return {
      colors: design.colors,
      typography: design.typography,
      layout: design.layout,
      voice: design.voice,
      composition: design.composition,
      artDirection: design.artDirection,
      assets: design.assets,
      brandIdentity: design.brandIdentity,
      screenshots: design.componentScreenshots,
      stackIntel: design.stackIntel,
      benchmark,
    };
  }

  async function buildAiInsightsResult(
    design: DesignLanguageResult,
    options: AiInsightsExtractOptions = {},
  ): Promise<BrandAiInsightsResult> {
    const payload = buildBrandInsightInput(design, options.benchmark);
    if (options.ai) {
      ensureValue(aiProvider, {
        code: "provider_unavailable",
        source: "sdk.ai.brandInsights",
        message: "AI provider is not configured.",
      });
      return generateAiBrandInsights(aiProvider, payload);
    }
    return buildDeterministicBrandInsights(payload);
  }

  async function buildCombinedAiMethodsResult(
    design: DesignLanguageResult,
    options: AiInsightsExtractOptions = {},
  ): Promise<CombinedAiMethodsResult> {
    const resolvedOptions: AiInsightsExtractOptions = {
      ...options,
      ai: typeof options.ai === "boolean" ? options.ai : Boolean(aiProvider),
    };
    const insights = await buildAiInsightsResult(design, resolvedOptions);
    return {
      suggestEnhancements: toVisualSuggestionsFromInsights(insights),
      extractAiInsights: insights,
      suggestPaletteEvolution: toPaletteEvolutionResult(insights),
      suggestBrandScaling: toBrandScalingResult(insights),
      suggestTypographySystem: toTypographySystemResult(insights),
    };
  }

  return {
    async extract(url: string, extractOptions: ExtractDesignLanguageOptions = {}) {
      return runMethod(
        "extract",
        "sdk.extract",
        async () => {
          const design = await ensureDesign(url, extractOptions);
          if (extractOptions.aiInsights) {
            const insights = await buildAiInsightsResult(design, {
              ...extractOptions,
              ai: Boolean(aiProvider),
            });
            const requestedAreas =
              typeof extractOptions.aiInsights === "object"
                ? extractOptions.aiInsights.areas || []
                : [];
            design.aiInsights =
              requestedAreas.length === 0
                ? insights
                : {
                    ...insights,
                    paletteApproach: requestedAreas.includes("palette")
                      ? insights.paletteApproach
                      : [],
                    typographyApproach: requestedAreas.includes("typography")
                      ? insights.typographyApproach
                      : [],
                    layoutApproach: requestedAreas.includes("layout")
                      ? insights.layoutApproach
                      : [],
                    brandScalingApproach: requestedAreas.includes("brand-scaling")
                      ? insights.brandScalingApproach
                      : [],
                    voiceApproach: requestedAreas.includes("voice")
                      ? insights.voiceApproach
                      : [],
                  };
          }
          const mode = extractOptions.mode || defaults.mode || "standard";
          const modeResult = toModeExtractResult(
            design,
            mode,
          ) as DesignLanguageResult | ModeExtractResult;
          const shouldEmit =
            typeof extractOptions.emitFiles === "boolean"
              ? extractOptions.emitFiles
              : defaults.emitFiles !== false;
          if (shouldEmit) {
            persistExtractionArtifacts(design, modeResult, {
              outputDir:
                typeof extractOptions.outputDir === "string"
                  ? extractOptions.outputDir
                  : defaults.outputDir || ".flydesign",
              mode,
              pages:
                typeof extractOptions.pages === "number"
                  ? extractOptions.pages
                  : typeof defaults.pages === "number"
                    ? defaults.pages
                    : 0,
            });
          }
          return modeResult;
        },
        { code: "crawl_failed", message: "extract failed" },
      );
    },

    async analyze(input: string | DesignLanguageResult | ModeExtractResult) {
      return runMethod("analyze", "sdk.analyze", async () => {
        const design = await ensureDesign(input);
        return {
          design,
          score: design.score,
          warnings: design.warnings || [],
        };
      });
    },

    async grade(input: string | DesignLanguageResult | ModeExtractResult) {
      return runMethod("grade", "sdk.grade", async () => {
        const design = await ensureDesign(input);
        return scoreDesignSystem(
          design as unknown as Parameters<typeof scoreDesignSystem>[0],
        );
      });
    },

    async remix(
      input: string | DesignLanguageResult | ModeExtractResult,
      remixOptions: RemixOptions = {},
    ) {
      return runMethod("remix", "sdk.remix", async () => {
        const design = await ensureDesign(input);
        return remixDesign(design, remixOptions);
      });
    },

    async clone(
      input: string | DesignLanguageResult | ModeExtractResult,
      cloneOptions: { outDir?: string } = {},
    ) {
      return runMethod("clone", "sdk.clone", async () => {
        const design = await ensureDesign(input);
        const outDir = cloneOptions.outDir || defaults.outputDir || ".flydesign";
        const { generateClone } = await import("./actions/clone.action");
        return generateClone(
          design as unknown as Parameters<typeof generateClone>[0],
          outDir,
        );
      });
    },

    async apply(
      input: string | DesignLanguageResult | ModeExtractResult,
      applyOptions: Record<string, unknown> = {},
    ) {
      return runMethod("apply", "sdk.apply", async () => {
        const { applyDesign, applyDesignToProject } = await import(
          "./actions/apply.action"
        );
        if (typeof input === "string") {
          return applyDesign(input, {
            dir: (applyOptions.dir as string) || defaults.outputDir,
            ...applyOptions,
          });
        }
        return applyDesignToProject(input, {
          dir: (applyOptions.dir as string) || defaults.outputDir,
          ...applyOptions,
        });
      });
    },

    async brands(urls: string[], brandOptions: ExtractDesignLanguageOptions = {}) {
      return runMethod("brands", "sdk.brands", async () => {
        const { compareBrands } = await import("./actions/multibrand.action");
        return compareBrands(urls, {
          ...mergeExtractOptions(defaults, {}),
          ...brandOptions,
        });
      });
    },

    async benchmark(
      urls: string[],
      benchmarkOptions: ExtractDesignLanguageOptions = {},
    ) {
      return runMethod("benchmark", "sdk.benchmark", async () => {
        const { compareBrands } = await import("./actions/multibrand.action");
        return compareBrands(urls, mergeExtractOptions(defaults, benchmarkOptions));
      });
    },

    async packCategory(
      urls: string[],
      categoryOptions: ExtractDesignLanguageOptions & { outDir?: string } = {},
    ) {
      return runMethod("packCategory", "sdk.packCategory", async () => {
        const { compareBrands } = await import("./actions/multibrand.action");
        const { buildCategoryPack } = await import("./actions/category-pack.action");
        const benchmark = await compareBrands(
          urls,
          mergeExtractOptions(defaults, categoryOptions),
        );
        return buildCategoryPack(benchmark, {
          outDir: categoryOptions.outDir || defaults.outputDir || ".flydesign",
        });
      });
    },

    async analyzeBrandIdentity(input: string | DesignLanguageResult | ModeExtractResult) {
      return runMethod("analyzeBrandIdentity", "sdk.brandIdentity", async () => {
        const design = await ensureDesign(input);
        return analyzeBrandIdentityAudit(design as unknown as AuditSdkInput);
      });
    },

    async analyzeDesignConsistency(input: string | DesignLanguageResult | ModeExtractResult) {
      return runMethod("analyzeDesignConsistency", "sdk.designConsistency", async () => {
        const design = await ensureDesign(input);
        return analyzeDesignConsistencyAudit(design as unknown as AuditSdkInput);
      });
    },

    async analyzeVisualSystem(input: string | DesignLanguageResult | ModeExtractResult) {
      return runMethod("analyzeVisualSystem", "sdk.visualSystem", async () => {
        const design = await ensureDesign(input);
        return analyzeVisualSystemAudit(design as unknown as AuditSdkInput);
      });
    },

    async suggestEnhancements(
      input: string | DesignLanguageResult | ModeExtractResult,
      options: { benchmark?: unknown; ai?: boolean } = {},
    ) {
      return runMethod(
        "suggestEnhancements",
        "sdk.ai.suggestions",
        async () => {
          const design = await ensureDesign(input);
          const payload = {
            colors: design.colors,
            typography: design.typography,
            composition: design.composition,
            interactionSignature: design.interactionSignature,
            messagingArchitecture: design.messagingArchitecture,
            benchmark: options.benchmark,
          };
          if (options.ai) {
            ensureValue(aiProvider, {
              code: "provider_unavailable",
              source: "sdk.ai.suggestions",
              message: "AI provider is not configured.",
            });
            return generateAiSuggestions(aiProvider, payload);
          }
          return buildDeterministicSuggestions(payload);
        },
        { code: "provider_error", message: "suggestEnhancements failed" },
      );
    },

    async generateBrandContent(
      input:
        | string
        | DesignLanguageResult
        | ModeExtractResult
        | { brief?: string },
      options: { benchmark?: unknown; ai?: boolean } = {},
    ) {
      return runMethod(
        "generateBrandContent",
        "sdk.ai.content",
        async () => {
          if (typeof input === "object" && !("meta" in input) && !isModeExtractResult(input)) {
            const payload = {
              brief: (input as { brief?: string }).brief,
              benchmark: options.benchmark,
            };
            if (options.ai) {
              ensureValue(aiProvider, {
                code: "provider_unavailable",
                source: "sdk.ai.content",
                message: "AI provider is not configured.",
              });
              return generateAiBrandContent(aiProvider, payload);
            }
            return buildDeterministicBrandContent(payload);
          }

          const design = await ensureDesign(
            input as string | DesignLanguageResult | ModeExtractResult,
          );
          const payload = {
            voice: design.voice,
            messagingArchitecture: design.messagingArchitecture,
            brandIdentity: design.brandIdentity,
            benchmark: options.benchmark,
          };
          if (options.ai) {
            ensureValue(aiProvider, {
              code: "provider_unavailable",
              source: "sdk.ai.content",
              message: "AI provider is not configured.",
            });
            return generateAiBrandContent(aiProvider, payload);
          }
          return buildDeterministicBrandContent(payload);
        },
        { code: "provider_error", message: "generateBrandContent failed" },
      );
    },

    async analyzeAssets(input: string | DesignLanguageResult | ModeExtractResult) {
      return runMethod("analyzeAssets", "sdk.assets", async () => {
        const design = await ensureDesign(input);
        return analyzeAssets({
          images: design.images as Parameters<typeof analyzeAssets>[0]["images"],
          imageryStyle: design.imageryStyle as Parameters<typeof analyzeAssets>[0]["imageryStyle"],
          artDirection: design.artDirection as Parameters<typeof analyzeAssets>[0]["artDirection"],
          brandIdentity: design.brandIdentity as Parameters<typeof analyzeAssets>[0]["brandIdentity"],
        });
      });
    },

    async extractDesignPalette(
      input: BatchableExtractInput,
      options: DesignPaletteExtractOptions = {},
    ) {
      return runMethod("extractDesignPalette", "sdk.palette", async () => {
        const result = await resolveSliceInput(input, options, (design) => {
          const palette = extractDesignPaletteSlice(
            design as Parameters<typeof extractDesignPaletteSlice>[0],
          );
          if (options.includeNeutrals === false) {
            palette.palette.neutrals = [];
          }
          return palette;
        });
        return result;
      });
    },

    async extractFontFamilies(
      input: BatchableExtractInput,
      options: FontFamiliesExtractOptions = {},
    ) {
      return runMethod("extractFontFamilies", "sdk.fonts", async () => {
        const result = await resolveSliceInput(input, options, (design) => {
          const fonts = extractFontFamiliesSlice(
            design as Parameters<typeof extractFontFamiliesSlice>[0],
          );
          if (options.includeSystemFonts === false) {
            fonts.systemFonts = [];
          }
          return fonts;
        });
        return result;
      });
    },

    async extractAssets(
      input: BatchableExtractInput,
      options: AssetsExtractOptions = {},
    ) {
      return runMethod("extractAssets", "sdk.assets.extract", async () => {
        const result = await resolveSliceInput(input, options, (design) => {
          const assets = extractAssetsSlice(
            design as Parameters<typeof extractAssetsSlice>[0],
          );
          if (options.includeImages === false) {
            assets.images = [];
          }
          if (options.includeFonts === false) {
            assets.fonts = [];
          }
          if (options.includeLogos === false) {
            assets.logos = [];
          }
          return assets;
        });
        return result;
      });
    },

    async extractBrandVoice(
      input: BatchableExtractInput,
      options: BrandVoiceExtractOptions = {},
    ) {
      return runMethod("extractBrandVoice", "sdk.voice.extract", async () => {
        const result = await resolveSliceInput(input, options, (design) => {
          const voice = extractBrandVoiceSlice(
            design as Parameters<typeof extractBrandVoiceSlice>[0],
          );
          if (options.includeSamples === false) {
            voice.voice.sampleHeadings = [];
          }
          return voice;
        });
        return result;
      });
    },

    async extractTechStack(
      input: BatchableExtractInput,
      options: TechStackExtractOptions = {},
    ) {
      return runMethod("extractTechStack", "sdk.stack.extract", async () => {
        const result = await resolveSliceInput(input, options, (design) => {
          const stack = extractTechStackSlice(
            design as Parameters<typeof extractTechStackSlice>[0],
          );
          if (options.includeEvidence === false) {
            stack.fingerprint = {
              ...stack.fingerprint,
              evidence: undefined,
            };
          }
          return stack;
        });
        return result;
      });
    },

    async extractAiInsights(
      input: BatchableExtractInput,
      options: AiInsightsExtractOptions = {},
    ) {
      return runMethod(
        "extractAiInsights",
        "sdk.ai.brandInsights",
        async () => resolveSliceInputAsync(input, options, (design) => buildAiInsightsResult(design, options)),
        { code: "provider_error", message: "extractAiInsights failed" },
      );
    },

    async suggestBrandScaling(
      input: BatchableExtractInput,
      options: AiInsightsExtractOptions = {},
    ) {
      return runMethod(
        "suggestBrandScaling",
        "sdk.ai.brandScaling",
        async () =>
          resolveSliceInputAsync(input, options, async (design) =>
            toBrandScalingResult(await buildAiInsightsResult(design, options)),
          ),
        { code: "provider_error", message: "suggestBrandScaling failed" },
      );
    },

    async suggestPaletteEvolution(
      input: BatchableExtractInput,
      options: AiInsightsExtractOptions = {},
    ) {
      return runMethod(
        "suggestPaletteEvolution",
        "sdk.ai.paletteEvolution",
        async () =>
          resolveSliceInputAsync(input, options, async (design) =>
            toPaletteEvolutionResult(await buildAiInsightsResult(design, options)),
          ),
        { code: "provider_error", message: "suggestPaletteEvolution failed" },
      );
    },

    async suggestTypographySystem(
      input: BatchableExtractInput,
      options: AiInsightsExtractOptions = {},
    ) {
      return runMethod(
        "suggestTypographySystem",
        "sdk.ai.typographySystem",
        async () =>
          resolveSliceInputAsync(input, options, async (design) =>
            toTypographySystemResult(await buildAiInsightsResult(design, options)),
          ),
        { code: "provider_error", message: "suggestTypographySystem failed" },
      );
    },

    async suggestLayoutDirections(
      input: BatchableExtractInput,
      options: AiInsightsExtractOptions = {},
    ) {
      return runMethod(
        "suggestLayoutDirections",
        "sdk.ai.layoutDirections",
        async () =>
          resolveSliceInputAsync(input, options, async (design) =>
            toLayoutDirectionsResult(await buildAiInsightsResult(design, options)),
          ),
        { code: "provider_error", message: "suggestLayoutDirections failed" },
      );
    },

    async runCombinedAiMethods(
      input: BatchableExtractInput,
      options: AiInsightsExtractOptions = {},
    ) {
      return runMethod(
        "runCombinedAiMethods",
        "sdk.ai.combined",
        async () =>
          resolveSliceInputAsync(input, options, async (design) =>
            buildCombinedAiMethodsResult(design, options),
          ),
        { code: "provider_error", message: "runCombinedAiMethods failed" },
      );
    },

    async extractScreenshots(
      input: string | DesignLanguageResult,
      options: ScreenshotExtractMethodOptions = {},
    ) {
      return runMethod(
        "extractScreenshots",
        "sdk.screenshots",
        async () => {
          const url =
            typeof input === "string" ? input : input.meta?.url || "";
          ensureValue(url, {
            code: "invalid_input",
            source: "sdk.screenshots",
            message: "A URL is required to capture screenshots.",
          });
          return extractScreenshotsForUrl(url, {
            outDir:
              typeof options.outputDir === "string"
                ? options.outputDir
                : defaults.outputDir || ".flydesign",
            components: options.components ?? true,
            fullPage: options.fullPage ?? true,
            responsive: options.responsive ?? false,
            includeDark: options.includeDark,
            width: options.width,
            height: options.height,
          });
        },
        { code: "crawl_failed", message: "extractScreenshots failed" },
      );
    },

    async createSnapshot(input: string | DesignLanguageResult | ModeExtractResult) {
      return runMethod("createSnapshot", "sdk.monitor.snapshot", async () => {
        const design = await ensureDesign(input);
        const snapshot = createBrandSnapshot({
          meta: design.meta,
          colors: design.colors as Parameters<typeof createBrandSnapshot>[0]["colors"],
          typography: design.typography as Parameters<typeof createBrandSnapshot>[0]["typography"],
          brandIdentity:
            design.brandIdentity as Parameters<typeof createBrandSnapshot>[0]["brandIdentity"],
          composition:
            design.composition as Parameters<typeof createBrandSnapshot>[0]["composition"],
          messagingArchitecture:
            design.messagingArchitecture as Parameters<typeof createBrandSnapshot>[0]["messagingArchitecture"],
          interactionSignature:
            design.interactionSignature as Parameters<typeof createBrandSnapshot>[0]["interactionSignature"],
          benchmarkFingerprint: design.stackIntel as Record<string, unknown>,
        });
        if (sdkConfig.monitoring.persistSnapshots) {
          persistSnapshot(snapshot, sdkConfig.monitoring.snapshotDir || ".flydesign");
        }
        return snapshot;
      });
    },

    async compareSnapshots(current: BrandSnapshot, previous: BrandSnapshot) {
      return runMethod("compareSnapshots", "sdk.monitor.compare", async () => {
        return compareBrandSnapshots(current, previous);
      });
    },

    async monitorBrand(
      input: string | DesignLanguageResult | ModeExtractResult,
      previous?: BrandSnapshot,
    ) {
      return runMethod("monitorBrand", "sdk.monitor.run", async () => {
        const design = await ensureDesign(input);
        const current = createBrandSnapshot({
          meta: design.meta,
          colors: design.colors as Parameters<typeof createBrandSnapshot>[0]["colors"],
          typography: design.typography as Parameters<typeof createBrandSnapshot>[0]["typography"],
          brandIdentity:
            design.brandIdentity as Parameters<typeof createBrandSnapshot>[0]["brandIdentity"],
          composition:
            design.composition as Parameters<typeof createBrandSnapshot>[0]["composition"],
          messagingArchitecture:
            design.messagingArchitecture as Parameters<typeof createBrandSnapshot>[0]["messagingArchitecture"],
          interactionSignature:
            design.interactionSignature as Parameters<typeof createBrandSnapshot>[0]["interactionSignature"],
          benchmarkFingerprint: design.stackIntel as Record<string, unknown>,
        });
        if (!previous) {
          return {
            snapshot: current,
            diff: null,
            alerts: [],
          };
        }
        const diff = compareBrandSnapshots(current, previous);
        const alerts = buildMonitorAlerts(diff);
        if (alerts.length > 0) {
          await sdkConfig.monitoring.onAlert?.(alerts[0]);
        }
        if (sdkConfig.monitoring.persistSnapshots) {
          persistSnapshot(current, sdkConfig.monitoring.snapshotDir || ".flydesign");
        }
        return {
          snapshot: current,
          diff,
          alerts,
        };
      });
    },

    async drift(
      url: string,
      driftOptions: {
        tokens: string;
        tolerance?: number;
        options?: ExtractDesignLanguageOptions;
      },
    ) {
      return runMethod("drift", "sdk.drift", async () => {
        const { checkDrift } = await import("./actions/drift.action");
        return checkDrift(url, {
          ...driftOptions,
          options: mergeExtractOptions(defaults, driftOptions.options || {}),
        });
      });
    },

    async lint(file: string) {
      return runMethod("lint", "sdk.lint", async () => {
        const { lintTokens } = await import("./actions/lint.action");
        return lintTokens(file);
      });
    },

    async diff(
      left: string | DesignLanguageResult | ModeExtractResult,
      right: string | DesignLanguageResult | ModeExtractResult,
      extractOptions: ExtractDesignLanguageOptions = {},
    ) {
      return runMethod("diff", "sdk.diff", async () => {
        const [designA, designB] = await Promise.all([
          ensureDesign(left, extractOptions),
          ensureDesign(right, extractOptions),
        ]);
        const { diffDesigns } = await import("./actions/diff.action");
        return diffDesigns(
          designA as Parameters<typeof diffDesigns>[0],
          designB as Parameters<typeof diffDesigns>[1],
        );
      });
    },

    async visualDiff(
      beforeUrl: string,
      afterUrl: string,
      visualOptions: Record<string, unknown> = {},
    ) {
      return runMethod("visualDiff", "sdk.visualDiff", async () => {
        const { visualDiff } = await import("./actions/visual-diff.action");
        return visualDiff({
          beforeUrl,
          afterUrl,
          options: {
            ...mergeExtractOptions(defaults, {}),
            screenshots: true,
            ...visualOptions,
          },
        });
      });
    },

    async makePrompt(
      input: string | DesignLanguageResult | ModeExtractResult,
      promptOptions: { benchmark?: unknown } = {},
    ) {
      return runMethod("makePrompt", "sdk.prompts", async () => {
        const design = await ensureDesign(input);
        const pack = buildPromptPack(
          design as unknown as Parameters<typeof buildPromptPack>[0],
          promptOptions.benchmark as Parameters<typeof buildPromptPack>[1],
        );
        return {
          claude: pack["claude-artifacts.md"],
          cursor: pack["cursor.md"],
          lovable: pack["lovable.txt"],
          v0: pack["v0.txt"],
          codex: pack["codex.md"],
        };
      });
    },
  };
}

export const flydesign = { init };

export async function makePrompt(
  input: string | DesignLanguageResult | ModeExtractResult,
  options: SdkInitInput = {},
): Promise<{
  ok: boolean;
  data: {
    claude: string;
    cursor: string;
    lovable: string;
    v0: string;
    codex: string;
  } | null;
  error: unknown;
  meta: unknown;
}> {
  return init(options).makePrompt(input);
}
