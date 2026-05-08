import { type CueExtractor } from "./cue.protocol";

type FontSource = "system" | "google-fonts" | "cdn" | "self-hosted";

interface FontFaceInput {
  family?: string;
  src?: string;
  weight?: string | number;
  style?: string;
}

interface DocumentFontInput {
  family?: string;
  weight?: string | number;
  style?: string;
}

interface ExtractFontsInput {
  fontFaces?: FontFaceInput[];
  googleFontsLinks?: string[];
  documentFonts?: DocumentFontInput[];
}

interface FontEntry {
  family: string;
  source: FontSource;
  weights: Set<string>;
  styles: Set<string>;
  urls: string[];
}

interface FontOutputItem {
  family: string;
  source: Exclude<FontSource, "system">;
  weights: string[];
  styles: string[];
  urls: string[];
  fontFaceCSS: string;
}

interface FontExtractionResult {
  fonts: FontOutputItem[];
  googleFontsUrl: string;
  systemFonts: string[];
}

export class FontCueExtractor
  implements CueExtractor<[input: ExtractFontsInput], FontExtractionResult>
{
  private cleanFamilyName(value?: string): string {
    return (value || "").replace(/["']/g, "").trim();
  }

  private detectSource(
    family: string,
    src: string,
    googleFamilies: Map<string, string[]>,
  ): FontSource {
    if (googleFamilies.has(family)) return "google-fonts";
    if (src && /url\(/.test(src)) {
      return /fonts\.(googleapis|gstatic|cdnfonts|bunny)/.test(src)
        ? "cdn"
        : "self-hosted";
    }
    return "system";
  }

  private getOrCreate(fontMap: Map<string, FontEntry>, family: string): FontEntry {
    if (!fontMap.has(family)) {
      fontMap.set(family, {
        family,
        source: "system",
        weights: new Set<string>(),
        styles: new Set<string>(),
        urls: [],
      });
    }
    return fontMap.get(family)!;
  }

  extract({
    fontFaces = [],
    googleFontsLinks = [],
    documentFonts = [],
  }: ExtractFontsInput = {}): FontExtractionResult {
    const fontMap = new Map<string, FontEntry>();
    const googleFamilies = new Map<string, string[]>();

    for (const url of googleFontsLinks) {
      const params = new URL(url).searchParams;
      for (const familyParam of params.getAll("family")) {
        const [name, spec] = familyParam.split(":");
        const family = name.replace(/\+/g, " ");
        const weights = spec?.match(/\d{3}/g) || ["400"];
        googleFamilies.set(family, [
          ...new Set([...(googleFamilies.get(family) || []), ...weights]),
        ]);
      }
    }

    for (const fontFace of fontFaces) {
      const family = this.cleanFamilyName(fontFace.family);
      if (!family) continue;
      const entry = this.getOrCreate(fontMap, family);
      entry.source = this.detectSource(family, fontFace.src || "", googleFamilies);
      if (fontFace.weight != null) entry.weights.add(String(fontFace.weight));
      if (fontFace.style) entry.styles.add(fontFace.style);
      if (fontFace.src) entry.urls.push(fontFace.src);
    }

    for (const docFont of documentFonts) {
      const family = this.cleanFamilyName(docFont.family);
      if (!family) continue;
      const entry = this.getOrCreate(fontMap, family);
      if (entry.source === "system") {
        entry.source = this.detectSource(family, "", googleFamilies);
      }
      if (docFont.weight != null) entry.weights.add(String(docFont.weight));
      if (docFont.style) entry.styles.add(docFont.style);
    }

    for (const [family, weights] of googleFamilies) {
      const entry = this.getOrCreate(fontMap, family);
      entry.source = "google-fonts";
      for (const weight of weights) entry.weights.add(weight);
    }

    const fonts: FontOutputItem[] = [];
    const systemFonts: string[] = [];

    for (const entry of fontMap.values()) {
      const weights = [...entry.weights].sort();
      const styles = [...entry.styles];
      if (!weights.length) weights.push("400");
      if (!styles.length) styles.push("normal");

      const fontFaceCSS =
        entry.source === "self-hosted"
          ? entry.urls
              .map(
                (src, i) =>
                  `@font-face {\n  font-family: '${entry.family}';\n  font-weight: ${weights[i] || weights[0]};\n  font-style: ${styles[i] || styles[0]};\n  src: ${src};\n}`,
              )
              .join("\n\n")
          : "";

      if (entry.source === "system") {
        systemFonts.push(entry.family);
        continue;
      }

      fonts.push({
        family: entry.family,
        source: entry.source,
        weights,
        styles,
        urls: entry.urls,
        fontFaceCSS,
      });
    }

    const googleFontsUrl =
      googleFontsLinks[0] ||
      (googleFamilies.size
        ? `https://fonts.googleapis.com/css2?${[...googleFamilies]
            .map(
              ([family, weights]) =>
                `family=${family.replace(/ /g, "+")}:wght@${weights.join(";")}`,
            )
            .join("&")}&display=swap`
        : "");

    return { fonts, googleFontsUrl, systemFonts };
  }
}

export function extractFonts(input: ExtractFontsInput = {}): FontExtractionResult {
  return new FontCueExtractor().extract(input);
}
