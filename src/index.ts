import { crawlPage } from "./actions/crawl.action";
import { extractComponentAnatomy } from "./cues/anatomy.cue";
import { extractAnimations } from "./cues/animation.cue";
import { extractBackgroundPatterns } from "./cues/background.cue";
import { extractBorders } from "./cues/border.cue";
import { extractBreakpoints } from "./cues/breakpoint.cue";
import { clusterComponents } from "./cues/cluster.cue";
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
import { extractComponentLibrary } from "./cues/library.cue";
import { extractMaterialLanguage } from "./cues/logo";
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
import { extractTypography } from "./cues/typography.cue";
import { extractVariables } from "./cues/variable.cue";
import { extractVoice } from "./cues/voice.cue";
import { extractWideGamut } from "./cues/wide.cue";
import { extractZIndex } from "./cues/zindex.cue";
import { remediateFailingPairs } from "./helpers/a11y.helpers";
import { extractAccessibility } from "./helpers/accessibility.helpers";
import { formatTokens } from "./helpers/token-formatter.helper";
import { buildPromptPack } from "./generators/prompt.generator";
import {
  isModeExtractResult,
  toModeExtractResult,
  type ExtractMode,
  type ModeExtractResult,
} from "./modes/design-language.mode";

export interface ExtractDesignLanguageOptions {
  ignore?: string[];
  deepInteract?: boolean;
  mode?: ExtractMode;
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
}

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
  const rawData = (await crawlPage(url, {
    ...options,
    ignore: options.ignore,
    deepInteract: options.deepInteract,
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
          systemFonts: [],
        }
      : { fonts: [], systemFonts: [] },
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

  return design;
}

export interface FlyDesignInitOptions extends ExtractDesignLanguageOptions {
  cache?: boolean;
  screenshots?: boolean;
  outputDir?: string;
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

export interface FlyDesignClient {
  extract: (
    url: string,
    options?: ExtractDesignLanguageOptions,
  ) => Promise<DesignLanguageResult | ModeExtractResult>;
  analyze: (
    input: string | DesignLanguageResult | ModeExtractResult,
  ) => Promise<AnalyzeResult>;
  grade: (
    input: string | DesignLanguageResult | ModeExtractResult,
  ) => Promise<unknown>;
  remix: (
    input: string | DesignLanguageResult | ModeExtractResult,
    options?: RemixOptions,
  ) => Promise<DesignLanguageResult>;
  clone: (
    input: string | DesignLanguageResult | ModeExtractResult,
    options?: { outDir?: string },
  ) => Promise<unknown>;
  apply: (
    input: string | DesignLanguageResult | ModeExtractResult,
    options?: Record<string, unknown>,
  ) => Promise<unknown>;
  brands: (urls: string[], options?: Record<string, unknown>) => Promise<unknown>;
  drift: (
    url: string,
    options: { tokens: string; tolerance?: number; options?: ExtractDesignLanguageOptions },
  ) => Promise<unknown>;
  lint: (file: string) => Promise<unknown>;
  diff: (
    left: string | DesignLanguageResult | ModeExtractResult,
    right: string | DesignLanguageResult | ModeExtractResult,
    options?: ExtractDesignLanguageOptions,
  ) => Promise<unknown>;
  visualDiff: (
    beforeUrl: string,
    afterUrl: string,
    options?: Record<string, unknown>,
  ) => Promise<unknown>;
  makePrompt: (
    input: string | DesignLanguageResult | ModeExtractResult,
  ) => Promise<{
    claude: string;
    cursor: string;
    lovable: string;
    v0: string;
    codex: string;
  }>;
}

function mergeExtractOptions(
  base: FlyDesignInitOptions,
  options: ExtractDesignLanguageOptions = {},
): ExtractDesignLanguageOptions {
  return {
    ...base,
    ...options,
    screenshots:
      typeof options.screenshots === "boolean"
        ? options.screenshots
        : base.screenshots,
  };
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

export function init(options: FlyDesignInitOptions = {}): FlyDesignClient {
  const defaults: FlyDesignInitOptions = {
    cache: true,
    screenshots: false,
    outputDir: ".flydesign",
    ...options,
  };
  const cache = new Map<string, DesignLanguageResult>();

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

  return {
    async extract(url: string, extractOptions: ExtractDesignLanguageOptions = {}) {
      const design = await ensureDesign(url, extractOptions);
      const mode = extractOptions.mode || defaults.mode || "standard";
      return toModeExtractResult(
        design,
        mode,
      ) as DesignLanguageResult | ModeExtractResult;
    },

    async analyze(input: string | DesignLanguageResult | ModeExtractResult) {
      const design = await ensureDesign(input);
      return {
        design,
        score: design.score,
        warnings: design.warnings || [],
      };
    },

    async grade(input: string | DesignLanguageResult | ModeExtractResult) {
      const design = await ensureDesign(input);
      return scoreDesignSystem(
        design as unknown as Parameters<typeof scoreDesignSystem>[0],
      );
    },

    async remix(
      input: string | DesignLanguageResult | ModeExtractResult,
      remixOptions: RemixOptions = {},
    ) {
      const design = await ensureDesign(input);
      return remixDesign(design, remixOptions);
    },

    async clone(
      input: string | DesignLanguageResult | ModeExtractResult,
      cloneOptions: { outDir?: string } = {},
    ) {
      const design = await ensureDesign(input);
      const outDir = cloneOptions.outDir || defaults.outputDir || ".flydesign";
      const { generateClone } = await import("./actions/clone.action");
      return generateClone(
        design as unknown as Parameters<typeof generateClone>[0],
        outDir,
      );
    },

    async apply(
      input: string | DesignLanguageResult | ModeExtractResult,
      applyOptions: Record<string, unknown> = {},
    ) {
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
    },

    async brands(urls: string[], brandOptions: Record<string, unknown> = {}) {
      const { compareBrands } = await import("./actions/multibrand.action");
      return compareBrands(urls, {
        ...mergeExtractOptions(defaults, {}),
        ...brandOptions,
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
      const { checkDrift } = await import("./actions/drift.action");
      return checkDrift(url, {
        ...driftOptions,
        options: mergeExtractOptions(defaults, driftOptions.options || {}),
      });
    },

    async lint(file: string) {
      const { lintTokens } = await import("./actions/lint.action");
      return lintTokens(file);
    },

    async diff(
      left: string | DesignLanguageResult | ModeExtractResult,
      right: string | DesignLanguageResult | ModeExtractResult,
      extractOptions: ExtractDesignLanguageOptions = {},
    ) {
      const [designA, designB] = await Promise.all([
        ensureDesign(left, extractOptions),
        ensureDesign(right, extractOptions),
      ]);
      const { diffDesigns } = await import("./actions/diff.action");
      return diffDesigns(
        designA as Parameters<typeof diffDesigns>[0],
        designB as Parameters<typeof diffDesigns>[1],
      );
    },

    async visualDiff(
      beforeUrl: string,
      afterUrl: string,
      visualOptions: Record<string, unknown> = {},
    ) {
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
    },

    async makePrompt(input: string | DesignLanguageResult | ModeExtractResult) {
      const design = await ensureDesign(input);
      const pack = buildPromptPack(
        design as unknown as Parameters<typeof buildPromptPack>[0],
      );
      return {
        claude: pack["claude-artifacts.md"],
        cursor: pack["cursor.md"],
        lovable: pack["lovable.txt"],
        v0: pack["v0.txt"],
        codex: pack["codex.md"],
      };
    },
  };
}

export const flydesign = { init };

export async function makePrompt(
  input: string | DesignLanguageResult | ModeExtractResult,
  options: FlyDesignInitOptions = {},
): Promise<{
  claude: string;
  cursor: string;
  lovable: string;
  v0: string;
  codex: string;
}> {
  return init(options).makePrompt(input);
}
