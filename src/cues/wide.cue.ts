import { parseColor, rgbToHex } from "@/helpers/general.helpers";
import { type CueExtractor } from "./cue.protocol";


interface ModernColorEntry {
  type?: string;
  raw?: string;
  property?: string;
  selector?: string;
}

interface WideGamutSample {
  raw: string | undefined;
  property: string;
  selector: string;
  value?: string;
}

interface WideGamutCatalogEntry {
  count: number;
  samples: WideGamutSample[];
}

interface WideGamutExtractionResult {
  oklch: WideGamutCatalogEntry;
  oklab: WideGamutCatalogEntry;
  colorMix: WideGamutCatalogEntry;
  lightDark: WideGamutCatalogEntry;
  displayP3: WideGamutCatalogEntry;
  rec2020: WideGamutCatalogEntry;
  totalCount: number;
}

export class WideGamutCueExtractor
  implements CueExtractor<[modernColors?: ModernColorEntry[]], WideGamutExtractionResult>
{
  extract(modernColors: ModernColorEntry[] = []): WideGamutExtractionResult {
    const catalog: Omit<WideGamutExtractionResult, "totalCount"> = {
      oklch: { count: 0, samples: [] },
      oklab: { count: 0, samples: [] },
      colorMix: { count: 0, samples: [] },
      lightDark: { count: 0, samples: [] },
      displayP3: { count: 0, samples: [] },
      rec2020: { count: 0, samples: [] },
    };
    const bucket = {
      oklch: catalog.oklch,
      oklab: catalog.oklab,
      "color-mix": catalog.colorMix,
      "light-dark": catalog.lightDark,
      "display-p3": catalog.displayP3,
      rec2020: catalog.rec2020,
    } as const;

    for (const entry of modernColors) {
      const target = bucket[(entry.type || "") as keyof typeof bucket];
      if (!target) continue;
      target.count++;
      if (target.samples.length >= 10) continue;

      const sample: WideGamutSample = {
        raw: entry.raw,
        property: entry.property || "",
        selector: entry.selector || "",
      };
      if (entry.type === "oklch" || entry.type === "oklab") {
        const parsed = parseColor(entry.raw);
        const hex = parsed ? rgbToHex(parsed) : null;
        if (hex) {
          sample.value = hex;
        }
      }
      target.samples.push(sample);
    }

    const totalCount = Object.values(catalog).reduce((sum, entry) => sum + entry.count, 0);
    return { ...catalog, totalCount };
  }
}

export function extractWideGamut(
  modernColors: ModernColorEntry[] = [],
): WideGamutExtractionResult {
  return new WideGamutCueExtractor().extract(modernColors);
}
