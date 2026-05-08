interface AssetAnalysisInput {
  images?: {
    patterns?: Array<{ name?: string; count?: number }>;
    aspectRatios?: Array<{ ratio?: string; count?: number }>;
    shapes?: Array<{ shape?: string; count?: number }>;
    filters?: Array<{ filter?: string; count?: number }>;
    objectFitUsage?: Array<{ value?: string; count?: number }>;
  };
  imageryStyle?: {
    label?: string;
  };
  artDirection?: {
    primaryMedium?: string;
    treatment?: string;
    backgroundTreatment?: string;
  };
  brandIdentity?: {
    primaryLogo?: { label?: string } | null;
    alternateLogos?: unknown[];
  };
}

export interface AssetAnalysisResult {
  summary: string;
  consistencyScore: number;
  findings: string[];
  optimizations: string[];
}

export function analyzeAssets(input: AssetAnalysisInput): AssetAnalysisResult {
  const patterns = input.images?.patterns || [];
  const ratios = input.images?.aspectRatios || [];
  const findings: string[] = [];
  const optimizations: string[] = [];

  if (patterns.length > 0) {
    findings.push(`Dominant asset pattern: ${patterns[0].name || "unknown"}`);
  }
  if (ratios.length > 0) {
    findings.push(`Top aspect ratio: ${ratios[0].ratio || "unknown"}`);
  }
  if (input.imageryStyle?.label) {
    findings.push(`Imagery style: ${input.imageryStyle.label}`);
  }
  if (input.artDirection?.backgroundTreatment) {
    findings.push(`Background treatment: ${input.artDirection.backgroundTreatment}`);
  }

  if ((input.brandIdentity?.alternateLogos || []).length > 4) {
    optimizations.push("Reduce visible logo variants in active use to strengthen brand consistency.");
  }
  if (ratios.length > 3) {
    optimizations.push("Normalize image aspect ratios across hero, card, and gallery surfaces.");
  }
  if ((input.images?.filters || []).length > 2) {
    optimizations.push("Reduce filter variety so image treatment feels more intentional.");
  }
  if ((input.images?.objectFitUsage || []).length > 2) {
    optimizations.push("Standardize object-fit usage for thumbnails and hero media.");
  }

  return {
    summary:
      optimizations.length === 0
        ? "Brand assets appear reasonably consistent."
        : "Brand assets are usable but show opportunities for tighter consistency.",
    consistencyScore: Math.max(0, 1 - optimizations.length * 0.15),
    findings,
    optimizations,
  };
}
