import { type CueExtractor } from "./cue.protocol";

interface MetaTag {
  name?: string;
  content?: string;
}

interface RawSeoData {
  light?: {
    stack?: { metas?: MetaTag[] };
    jsonLd?: Array<string | Record<string, unknown>>;
    favicons?: string[];
    manifest?: string | null;
  };
}

interface StructuredDataEntry {
  type: string;
  name: string | null;
  sample: string;
}

interface SeoExtractionResult {
  openGraph: Record<string, string | undefined>;
  twitter: Record<string, string | undefined>;
  description: string | null;
  canonical: string | null;
  themeColor: string | null;
  viewport: string | null;
  favicons: string[];
  manifest: string | null;
  structuredData: StructuredDataEntry[];
  score: {
    hasOg: boolean;
    hasTwitter: boolean;
    hasDescription: boolean;
    hasCanonical: boolean;
    hasStructuredData: boolean;
    hasFavicon: boolean;
    hasThemeColor: boolean;
  };
}

function pickMeta(metas: MetaTag[], name: string): string | null {
  const m = metas.find(
    (m) => (m.name || "").toLowerCase() === name.toLowerCase(),
  );
  return m ? (m.content ?? null) : null;
}

export class SeoCueExtractor
  implements CueExtractor<[rawData?: RawSeoData], SeoExtractionResult>
{
  extract(rawData: RawSeoData = {}): SeoExtractionResult {
    const stack = rawData.light?.stack || {};
    const metas = stack.metas || [];
    const openGraph: Record<string, string | undefined> = {};
    const twitter: Record<string, string | undefined> = {};

    for (const metaTag of metas) {
      const name = (metaTag.name || "").toLowerCase();
      if (name.startsWith("og:")) openGraph[name.slice(3)] = metaTag.content;
      if (name.startsWith("twitter:")) twitter[name.slice(8)] = metaTag.content;
    }

    const description = pickMeta(metas, "description");
    const canonical = pickMeta(metas, "canonical");
    const themeColor = pickMeta(metas, "theme-color");
    const viewport = pickMeta(metas, "viewport");
    const inlineJsonLd = Array.isArray(rawData.light?.jsonLd) ? rawData.light.jsonLd : [];
    const favicons = rawData.light?.favicons || [];
    const manifest = rawData.light?.manifest || null;
    const structured: StructuredDataEntry[] = [];

    for (const block of inlineJsonLd) {
      try {
        const parsed = typeof block === "string" ? JSON.parse(block) : block;
        const entries = Array.isArray(parsed) ? parsed : [parsed];
        for (const entry of entries) {
          const asRecord = (entry || {}) as Record<string, unknown>;
          structured.push({
            type: typeof asRecord["@type"] === "string" ? asRecord["@type"] : "Thing",
            name:
              typeof asRecord.name === "string"
                ? asRecord.name
                : typeof asRecord.headline === "string"
                  ? asRecord.headline
                  : null,
            sample: JSON.stringify(entry).slice(0, 400),
          });
        }
      } catch {
        continue;
      }
    }

    return {
      openGraph,
      twitter,
      description,
      canonical,
      themeColor,
      viewport,
      favicons,
      manifest,
      structuredData: structured,
      score: {
        hasOg: Object.keys(openGraph).length > 0,
        hasTwitter: Object.keys(twitter).length > 0,
        hasDescription: !!description,
        hasCanonical: !!canonical,
        hasStructuredData: structured.length > 0,
        hasFavicon: favicons.length > 0,
        hasThemeColor: !!themeColor,
      },
    };
  }
}

export function extractSeo(rawData: RawSeoData = {}): SeoExtractionResult {
  return new SeoCueExtractor().extract(rawData);
}
