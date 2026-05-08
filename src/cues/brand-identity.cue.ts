import { type CueExtractor } from "./cue.protocol";

interface BrandIdentityInput {
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

interface BrandAsset {
  src: string;
  kind: "favicon" | "touch-icon" | "logo" | "wordmark" | "mark";
  label: string;
}

interface BrandIdentityResult {
  primaryLogo: BrandAsset | null;
  alternateLogos: BrandAsset[];
  favicons: BrandAsset[];
  manifest: string | null;
  themeColor: string | null;
  lockup: "wordmark" | "mark" | "combination" | "unknown";
  darkLightVariants: {
    present: boolean;
    evidence: string[];
  };
}

function cleanLabel(value?: string): string {
  return (value || "").replace(/\s+/g, " ").trim();
}

export class BrandIdentityCueExtractor
  implements CueExtractor<[input: BrandIdentityInput], BrandIdentityResult>
{
  extract(input: BrandIdentityInput = {}): BrandIdentityResult {
    const faviconAssets: BrandAsset[] = (input.favicons || [])
      .filter((entry): entry is NonNullable<typeof entry> => !!entry && !!entry.href)
      .map((entry) => ({
        src: entry.href || "",
        kind:
          entry.rel?.includes("apple-touch") ? "touch-icon" : "favicon",
        label: cleanLabel(entry.rel || entry.sizes || entry.type || "icon"),
      }));

    const logoAssets: BrandAsset[] = (input.logos || [])
      .filter((logo): logo is NonNullable<typeof logo> => !!logo)
      .map((logo): BrandAsset => {
        const label = cleanLabel(logo.alt || logo.text || logo.kind || "logo");
        const kind: BrandAsset["kind"] =
          /wordmark/i.test(label) || (!!logo.text && !logo.src)
            ? "wordmark"
            : /mark|icon/i.test(label) || logo.kind === "svg"
              ? "mark"
              : "logo";
        return {
          src: logo.src || logo.href || "",
          kind,
          label,
        };
      })
      .filter((asset) => Boolean(asset.src || asset.label));

    const primaryLogo =
      logoAssets.find((asset) => asset.kind === "logo") ||
      logoAssets.find((asset) => asset.kind === "wordmark") ||
      logoAssets[0] ||
      null;

    const lockup: BrandIdentityResult["lockup"] =
      logoAssets.some((asset) => asset.kind === "mark") &&
      logoAssets.some((asset) => asset.kind === "wordmark")
        ? "combination"
        : logoAssets.some((asset) => asset.kind === "wordmark")
          ? "wordmark"
          : logoAssets.some((asset) => asset.kind === "mark")
            ? "mark"
            : "unknown";

    const darkLightEvidence = [
      ...(input.themeColor ? [`theme-color:${input.themeColor}`] : []),
      ...logoAssets
        .map((asset) => asset.label)
        .filter((label) => /dark|light|mono|white|black/i.test(label)),
    ];

    return {
      primaryLogo,
      alternateLogos: primaryLogo
        ? logoAssets.filter((asset) => asset !== primaryLogo).slice(0, 8)
        : logoAssets.slice(0, 8),
      favicons: faviconAssets.slice(0, 8),
      manifest: input.manifest || null,
      themeColor: input.themeColor || null,
      lockup,
      darkLightVariants: {
        present: darkLightEvidence.length > 0,
        evidence: darkLightEvidence,
      },
    };
  }
}

export function extractBrandIdentity(
  input: BrandIdentityInput = {},
): BrandIdentityResult {
  return new BrandIdentityCueExtractor().extract(input);
}
