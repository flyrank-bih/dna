import { colorDistance, parseColor } from "@/helpers/general.helpers";

interface DesignMetaLike {
  url?: string;
  title?: string;
  timestamp?: string;
  pagesAnalyzed?: number;
}

interface ColorLike {
  hex?: string;
  count?: number;
}

interface DesignLike {
  meta?: DesignMetaLike;
  colors?: {
    primary?: ColorLike | null;
    secondary?: ColorLike | null;
    accent?: ColorLike | null;
    neutrals?: ColorLike[];
    backgrounds?: string[];
    text?: string[];
    all?: ColorLike[];
    gradients?: string[];
  };
  typography?: {
    families?: Array<{ name?: string; count?: number; usage?: string } | string>;
  };
  fonts?: {
    fonts?: Array<{
      family?: string;
      source?: string;
      provider?: string;
      weights?: string[];
      styles?: string[];
      urls?: string[];
      assetUrls?: string[];
      license?: string | null;
    }>;
    googleFontsUrl?: string;
    links?: {
      googleFonts?: string[];
      cdn?: string[];
      selfHosted?: string[];
      all?: string[];
      stylesheets?: string[];
    };
    systemFonts?: string[];
  };
  brandIdentity?: {
    primaryLogo?: { src?: string; kind?: string; label?: string } | null;
    alternateLogos?: Array<{ src?: string; kind?: string; label?: string }>;
    favicons?: Array<{ src?: string; kind?: string; label?: string }>;
    manifest?: string | null;
    themeColor?: string | null;
  };
  voice?: {
    tone?: string;
    pronoun?: string;
    headingStyle?: string;
    headingLengthClass?: string;
    ctaVerbs?: Array<{ value?: string; count?: number }>;
    buttonPatterns?: Array<{ value?: string; count?: number }>;
    sampleHeadings?: string[];
    stats?: { buttons?: number; headings?: number };
  };
  stackIntel?: unknown;
  _raw?: {
    light?: {
      logos?: Array<{
        src?: string;
        href?: string;
        alt?: string;
        text?: string;
        kind?: string;
        format?: string;
        sourceType?: string;
        width?: number;
        height?: number;
      }>;
      images?: Array<{
        src?: string;
        alt?: string;
        width?: number;
        height?: number;
        naturalWidth?: number;
        naturalHeight?: number;
        format?: string;
        loading?: string;
        transferSize?: number | null;
        encodedBodySize?: number | null;
        decodedBodySize?: number | null;
      }>;
      fontData?: {
        stylesheetLinks?: string[];
      };
    };
  };
}

export interface ModularExtractionMeta {
  sourceUrl: string;
  title: string;
  extractedAt: string;
  generatedAt: string;
  pagesAnalyzed: number;
}

export interface DesignPaletteResult {
  meta: ModularExtractionMeta;
  palette: {
    primary: string | null;
    secondary: string | null;
    accent: string | null;
    neutrals: string[];
    backgrounds: string[];
    text: string[];
    all: Array<{ hex: string; count: number }>;
    gradients: string[];
  };
  score: {
    overall: number;
    confidence: number;
    signals: string[];
  };
}

export interface FontFamilyResult {
  family: string;
  usage: string;
  frequency: number;
  source: string;
  weights: string[];
  styles: string[];
  urls: string[];
  license: string | null;
  confidence: number;
}

export interface FontFamiliesResult {
  meta: ModularExtractionMeta;
  families: FontFamilyResult[];
  providers: {
    googleFontsUrl: string;
    stylesheetUrls: string[];
    assetUrls: string[];
  };
  systemFonts: string[];
}

export interface AssetRecord {
  url: string;
  kind: "logo" | "favicon" | "font-file" | "font-stylesheet" | "image";
  label: string;
  format: string;
  width: number | null;
  height: number | null;
  fileSizeBytes: number | null;
  source: string;
  license: string | null;
  alt: string | null;
  confidence: number;
  notes: string[];
}

export interface AssetsResult {
  meta: ModularExtractionMeta;
  logos: AssetRecord[];
  fonts: AssetRecord[];
  images: AssetRecord[];
  manifest: string | null;
  themeColor: string | null;
}

export interface BrandVoiceResult {
  meta: ModularExtractionMeta;
  voice: {
    tone: string;
    pronoun: string;
    headingStyle: string;
    headingLengthClass: string;
    ctaVerbs: Array<{ value: string; count: number }>;
    messagingPatterns: Array<{ value: string; count: number }>;
    sampleHeadings: string[];
  };
  confidence: number;
}

export interface TechStackResult {
  meta: ModularExtractionMeta;
  fingerprint: Record<string, unknown>;
  confidence: number;
  summary: string[];
}

function toMeta(design: DesignLike): ModularExtractionMeta {
  return {
    sourceUrl: design.meta?.url || "",
    title: design.meta?.title || "Unknown Site",
    extractedAt: design.meta?.timestamp || new Date().toISOString(),
    generatedAt: new Date().toISOString(),
    pagesAnalyzed: design.meta?.pagesAnalyzed || 1,
  };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function uniqueStrings(values: Array<string | undefined | null>): string[] {
  return [...new Set(values.map((value) => (value || "").trim()).filter(Boolean))];
}

function detectFormat(url: string): string {
  const match = url.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
  return match?.[1]?.toLowerCase() || "unknown";
}

function confidenceFromPresence(values: unknown[]): number {
  return clampScore((values.filter(Boolean).length / Math.max(1, values.length)) * 100);
}

function inferAssetSizeNotes(
  fileSizeBytes: number | null,
  width: number | null,
  height: number | null,
): string[] {
  const notes: string[] = [];
  if (fileSizeBytes && fileSizeBytes > 400_000) {
    notes.push("Large transfer size");
  }
  if (width && height && width * height > 2_000_000) {
    notes.push("High pixel count");
  }
  if (notes.length === 0) {
    notes.push("No immediate optimization flag");
  }
  return notes;
}

export function extractDesignPaletteSlice(design: DesignLike): DesignPaletteResult {
  const colors = design.colors || {};
  const primary = colors.primary?.hex || null;
  const secondary = colors.secondary?.hex || null;
  const accent = colors.accent?.hex || null;
  const backgrounds = uniqueStrings(colors.backgrounds || []);
  const text = uniqueStrings(colors.text || []);
  const all = (colors.all || [])
    .map((entry) => ({
      hex: entry.hex || "",
      count: typeof entry.count === "number" ? entry.count : 0,
    }))
    .filter((entry) => Boolean(entry.hex));
  const signals: string[] = [];
  let score = 40;

  if (primary) {
    score += 18;
    signals.push("Primary brand color detected");
  }
  if (secondary) {
    score += 12;
    signals.push("Secondary palette color detected");
  }
  if (accent) {
    score += 10;
    signals.push("Accent color detected");
  }
  if (backgrounds.length > 0 && text.length > 0) {
    score += 12;
    signals.push("Foreground and background colors detected");
  }
  if (all.length >= 3 && all.length <= 12) {
    score += 10;
    signals.push("Palette size is focused");
  }
  if (primary && secondary) {
    const a = parseColor(primary);
    const b = parseColor(secondary);
    if (a && b && colorDistance(a, b) > 35) {
      score += 8;
      signals.push("Primary and secondary colors are visually distinct");
    }
  }
  if (all.length > 18) {
    score -= 10;
    signals.push("Palette appears overly fragmented");
  }

  return {
    meta: toMeta(design),
    palette: {
      primary,
      secondary,
      accent,
      neutrals: uniqueStrings((colors.neutrals || []).map((entry) => entry.hex || "")),
      backgrounds,
      text,
      all,
      gradients: uniqueStrings(colors.gradients || []),
    },
    score: {
      overall: clampScore(score),
      confidence: confidenceFromPresence([primary, secondary, accent, ...all.map((entry) => entry.hex)]),
      signals,
    },
  };
}

export function extractFontFamiliesSlice(design: DesignLike): FontFamiliesResult {
  const typographyFamilies = design.typography?.families || [];
  const fontMap = new Map<string, FontFamilyResult>();
  const fonts = design.fonts?.fonts || [];

  for (const familyEntry of typographyFamilies) {
    const family =
      typeof familyEntry === "string" ? familyEntry : (familyEntry.name || "").trim();
    if (!family) continue;
    fontMap.set(family, {
      family,
      usage:
        typeof familyEntry === "string"
          ? "unspecified"
          : familyEntry.usage || "unspecified",
      frequency:
        typeof familyEntry === "string"
          ? 1
          : typeof familyEntry.count === "number"
            ? familyEntry.count
            : 1,
      source: "detected",
      weights: [],
      styles: [],
      urls: [],
      license: null,
      confidence: 70,
    });
  }

  for (const font of fonts) {
    const family = (font.family || "").trim();
    if (!family) continue;
    const existing = fontMap.get(family);
    const urls = uniqueStrings([...(font.assetUrls || []), ...(font.urls || [])]);
    fontMap.set(family, {
      family,
      usage: existing?.usage || "detected",
      frequency: existing?.frequency || 1,
      source: font.provider || font.source || "detected",
      weights: uniqueStrings(font.weights || []),
      styles: uniqueStrings(font.styles || []),
      urls,
      license: font.license || null,
      confidence: urls.length > 0 ? 95 : existing?.confidence || 80,
    });
  }

  return {
    meta: toMeta(design),
    families: [...fontMap.values()].sort((a, b) => b.frequency - a.frequency),
    providers: {
      googleFontsUrl: design.fonts?.googleFontsUrl || "",
      stylesheetUrls: uniqueStrings([
        ...(design.fonts?.links?.googleFonts || []),
        ...(design.fonts?.links?.stylesheets || []),
        ...(design._raw?.light?.fontData?.stylesheetLinks || []),
      ]),
      assetUrls: uniqueStrings([
        ...(design.fonts?.links?.cdn || []),
        ...(design.fonts?.links?.selfHosted || []),
        ...(design.fonts?.fonts || []).flatMap((font) => font.assetUrls || []),
      ]),
    },
    systemFonts: uniqueStrings(design.fonts?.systemFonts || []),
  };
}

export function extractAssetsSlice(design: DesignLike): AssetsResult {
  const rawLogos = design._raw?.light?.logos || [];
  const rawImages = design._raw?.light?.images || [];
  const fontFamilies = extractFontFamiliesSlice(design);

  const logos: AssetRecord[] = [
    ...(design.brandIdentity?.primaryLogo ? [design.brandIdentity.primaryLogo] : []),
    ...(design.brandIdentity?.alternateLogos || []),
    ...(design.brandIdentity?.favicons || []),
  ]
    .map((asset) => {
      const matchedRaw = rawLogos.find((logo) => logo.src === asset.src);
      const kind: AssetRecord["kind"] =
        asset.kind === "favicon" || asset.kind === "touch-icon"
          ? "favicon"
          : "logo";
      return {
        url: asset.src || "",
        kind,
        label: asset.label || asset.kind || "asset",
        format: matchedRaw?.format || detectFormat(asset.src || ""),
        width:
          typeof matchedRaw?.width === "number" ? matchedRaw.width : null,
        height:
          typeof matchedRaw?.height === "number" ? matchedRaw.height : null,
        fileSizeBytes: null,
        source: matchedRaw?.sourceType || "brand-identity",
        license: null,
        alt: matchedRaw?.alt || asset.label || null,
        confidence: asset.src ? 95 : 55,
        notes: asset.src ? ["Absolute asset URL detected"] : ["Inline asset without direct URL"],
      };
    })
    .filter((asset) => Boolean(asset.url || asset.label));

  const fonts: AssetRecord[] = [
    ...fontFamilies.providers.stylesheetUrls.map((url) => ({
      url,
      kind: "font-stylesheet" as const,
      label: "font stylesheet",
      format: "css",
      width: null,
      height: null,
      fileSizeBytes: null,
      source: url.includes("googleapis") ? "google-fonts" : "font-provider",
      license: url.includes("googleapis")
        ? "open-source (provider-dependent)"
        : null,
      alt: null,
      confidence: 90,
      notes: ["Stylesheet provider URL"],
    })),
    ...fontFamilies.families.flatMap((family) =>
      family.urls.map((url) => ({
        url,
        kind: "font-file" as const,
        label: family.family,
        format: detectFormat(url),
        width: null,
        height: null,
        fileSizeBytes: null,
        source: family.source,
        license: family.license,
        alt: null,
        confidence: family.confidence,
        notes: ["Font asset URL"],
      })),
    ),
  ];

  const images: AssetRecord[] = rawImages
    .map((image) => ({
      url: image.src || "",
      kind: "image" as const,
      label: image.alt || "image asset",
      format: image.format || detectFormat(image.src || ""),
      width: typeof image.width === "number" ? image.width : null,
      height: typeof image.height === "number" ? image.height : null,
      fileSizeBytes:
        typeof image.transferSize === "number"
          ? image.transferSize
          : typeof image.encodedBodySize === "number"
            ? image.encodedBodySize
            : null,
      source: "page-image",
      license: null,
      alt: image.alt || null,
      confidence: image.src ? 90 : 40,
      notes: inferAssetSizeNotes(
        typeof image.transferSize === "number" ? image.transferSize : null,
        typeof image.naturalWidth === "number" ? image.naturalWidth : null,
        typeof image.naturalHeight === "number" ? image.naturalHeight : null,
      ),
    }))
    .filter((image) => Boolean(image.url));

  return {
    meta: toMeta(design),
    logos,
    fonts,
    images,
    manifest: design.brandIdentity?.manifest || null,
    themeColor: design.brandIdentity?.themeColor || null,
  };
}

export function extractBrandVoiceSlice(design: DesignLike): BrandVoiceResult {
  const voice = design.voice || {};
  const confidence = clampScore(
    45 +
      (voice.sampleHeadings?.length || 0) * 5 +
      (voice.ctaVerbs?.length || 0) * 6 +
      (voice.buttonPatterns?.length || 0) * 4,
  );
  return {
    meta: toMeta(design),
    voice: {
      tone: voice.tone || "neutral",
      pronoun: voice.pronoun || "unknown",
      headingStyle: voice.headingStyle || "unknown",
      headingLengthClass: voice.headingLengthClass || "unknown",
      ctaVerbs: (voice.ctaVerbs || []).map((entry) => ({
        value: entry.value || "",
        count: typeof entry.count === "number" ? entry.count : 0,
      })),
      messagingPatterns: (voice.buttonPatterns || []).map((entry) => ({
        value: entry.value || "",
        count: typeof entry.count === "number" ? entry.count : 0,
      })),
      sampleHeadings: voice.sampleHeadings || [],
    },
    confidence,
  };
}

export function extractTechStackSlice(design: DesignLike): TechStackResult {
  const fingerprint = (design.stackIntel || {}) as Record<string, unknown>;
  const summary: string[] = [];
  for (const key of [
    "cms",
    "frontend",
    "designSystem",
    "commerce",
    "observability",
    "support",
  ]) {
    const values = fingerprint[key];
    if (Array.isArray(values) && values.length > 0) {
      summary.push(`${key}: ${values.join(", ")}`);
    }
  }
  return {
    meta: toMeta(design),
    fingerprint,
    confidence: clampScore(
      35 +
        (summary.length * 10) +
        ((fingerprint.signals as { scriptCount?: number } | undefined)?.scriptCount || 0) /
          10,
    ),
    summary,
  };
}

export interface BatchExtractionItem<TData> {
  ok: boolean;
  input: string;
  data: TData | null;
  error: string | null;
}

export interface BatchExtractionResult<TData> {
  items: BatchExtractionItem<TData>[];
  count: number;
}
