interface ImageData {
  width?: number;
  height?: number;
  borderRadius?: string;
  objectFit?: string;
  filter?: string;
}

type CountEntry = { count: number } & Record<string, unknown>;

export class ImageStyleExtractor {
  private readonly knownRatios: Array<[number, number, string]> = [
    [1, 1, "1:1"],
    [4, 3, "4:3"],
    [3, 4, "3:4"],
    [16, 9, "16:9"],
    [9, 16, "9:16"],
    [3, 2, "3:2"],
    [2, 3, "2:3"],
    [21, 9, "21:9"],
  ];

  private closestRatio(w?: number, h?: number): string | null {
    if (!w || !h) return null;
    const ratio = w / h;
    let best: string | null = null;
    let bestDiff = 0.15;
    for (const [rw, rh, label] of this.knownRatios) {
      const diff = Math.abs(ratio - rw / rh);
      if (diff < bestDiff) {
        best = label;
        bestDiff = diff;
      }
    }
    return best || `${Math.round(ratio * 100) / 100}:1`;
  }

  private classifyShape(borderRadius?: string): string {
    const radius = Number.parseFloat(borderRadius || "") || 0;
    if (radius >= 50) return "circular";
    if (radius >= 20) return "pill";
    if (radius > 0) return "rounded";
    return "square";
  }

  private classifyPattern(image: ImageData, shape: string): string {
    const w = image.width || 0;
    const h = image.height || 0;
    const area = w * h;
    if (shape === "circular" && area <= 22500) return "avatar";
    if (w >= 600 && h >= 200 && image.objectFit === "cover") return "hero";
    if (area <= 40000 && (shape === "rounded" || shape === "square")) return "thumbnail";
    if (w >= 400 && h >= 400 && shape === "square") return "gallery";
    return "general";
  }

  private incrementMap<T extends string>(
    map: Map<T, CountEntry>,
    key: T,
    extra: Record<string, unknown> = {},
  ): void {
    if (!map.has(key)) map.set(key, { count: 0, ...extra });
    const current = map.get(key);
    if (!current) return;
    current.count++;
  }

  private toArray<T extends string>(map: Map<T, CountEntry>, keyName: string) {
    return [...map.entries()]
      .map(([key, value]) => ({ [keyName]: key, ...value }))
      .sort((a, b) => b.count - a.count);
  }

  extract(imageData: ImageData[] = []) {
    const ratioCount = new Map<string, CountEntry>();
    const shapeCount = new Map<string, CountEntry>();
    const filterCount = new Map<string, CountEntry>();
    const fitCount = new Map<string, CountEntry>();
    const patternCount = new Map<string, CountEntry>();

    for (const image of imageData) {
      const ratio = this.closestRatio(image.width, image.height);
      if (ratio) this.incrementMap(ratioCount, ratio);

      const shape = this.classifyShape(image.borderRadius);
      this.incrementMap(shapeCount, shape, { borderRadius: image.borderRadius || "0" });

      if (image.filter && image.filter !== "none") {
        for (const filterName of image.filter.match(/[a-z-]+\(/g) || [image.filter]) {
          this.incrementMap(filterCount, filterName.replace("(", ""));
        }
      }

      if (image.objectFit && image.objectFit !== "initial") {
        this.incrementMap(fitCount, image.objectFit);
      }

      const pattern = this.classifyPattern(image, shape);
      this.incrementMap(patternCount, pattern, {
        styles: {
          objectFit: image.objectFit,
          borderRadius: image.borderRadius,
          shape,
        },
      });
    }

    return {
      patterns: this.toArray(patternCount, "name"),
      aspectRatios: this.toArray(ratioCount, "ratio"),
      shapes: this.toArray(shapeCount, "shape"),
      filters: this.toArray(filterCount, "filter"),
      objectFitUsage: this.toArray(fitCount, "value"),
    };
  }
}

export function extractImageStyles(imageData: ImageData[]) {
  return new ImageStyleExtractor().extract(imageData);
}
