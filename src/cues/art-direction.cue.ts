import { type CueExtractor } from "./cue.protocol";

interface ImageLike {
  src?: string;
  width?: number;
  height?: number;
  objectFit?: string;
  filter?: string;
  classList?: string;
}

interface ArtDirectionInput {
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
  rawImages?: ImageLike[];
}

interface ArtDirectionResult {
  primaryMedium:
    | "icons-and-graphics"
    | "screenshots-and-product"
    | "photography"
    | "mixed";
  treatment:
    | "clean-product"
    | "graphic"
    | "editorial"
    | "utility"
    | "mixed";
  backgroundTreatment: "isolated" | "environmental" | "mixed";
  evidence: string[];
}

export class ArtDirectionCueExtractor
  implements CueExtractor<[input: ArtDirectionInput], ArtDirectionResult>
{
  extract(input: ArtDirectionInput = {}): ArtDirectionResult {
    const counts = input.imageryStyle?.counts || {};
    const evidence: string[] = [];

    let primaryMedium: ArtDirectionResult["primaryMedium"] = "mixed";
    if ((counts.icon || 0) + (counts.svg || 0) > (counts.photoLike || 0) + (counts.screenshot || 0)) {
      primaryMedium = "icons-and-graphics";
      evidence.push("Graphic/icon usage outweighs photos/screenshots");
    } else if ((counts.screenshot || 0) > 0) {
      primaryMedium = "screenshots-and-product";
      evidence.push("Screenshot/product imagery detected");
    } else if ((counts.photoLike || 0) > 0) {
      primaryMedium = "photography";
      evidence.push("Photo-like imagery detected");
    }

    const hasFilters = (input.images?.filters || []).length > 0;
    const heroLike = (input.rawImages || []).some(
      (image) => (image.width || 0) >= 900 && (image.height || 0) >= 320,
    );

    const treatment: ArtDirectionResult["treatment"] =
      primaryMedium === "icons-and-graphics"
        ? "graphic"
        : primaryMedium === "screenshots-and-product"
          ? "clean-product"
          : heroLike
            ? "editorial"
            : hasFilters
              ? "mixed"
              : "utility";

    const backgroundTreatment: ArtDirectionResult["backgroundTreatment"] =
      (input.rawImages || []).some((image) => image.objectFit === "cover")
        ? "environmental"
        : primaryMedium === "icons-and-graphics"
          ? "isolated"
          : "mixed";

    return {
      primaryMedium,
      treatment,
      backgroundTreatment,
      evidence,
    };
  }
}

export function extractArtDirection(
  input: ArtDirectionInput = {},
): ArtDirectionResult {
  return new ArtDirectionCueExtractor().extract(input);
}
