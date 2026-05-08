export interface ComponentClusterCandidate {
  kind: string;
  structuralHash: string;
  styleVector?: number[];
  css?: Record<string, unknown>;
}

export interface ComponentClusterVariant {
  css?: Record<string, unknown>;
  instanceCount: number;
}

export interface ComponentClusterResult {
  kind: string;
  structuralHash: string;
  instanceCount: number;
  variants: ComponentClusterVariant[];
}

interface VariantBucket {
  example: ComponentClusterCandidate;
  instanceCount: number;
}

export class ComponentClusterer {
  constructor(private readonly threshold: number = 0.95) {}

  private cosine(a: number[] = [], b: number[] = []): number {
    const n = Math.min(a.length, b.length);
    let dot = 0;
    let na = 0;
    let nb = 0;
    for (let i = 0; i < n; i++) {
      dot += a[i] * b[i];
      na += a[i] * a[i];
      nb += b[i] * b[i];
    }
    if (na && nb) return dot / (Math.sqrt(na) * Math.sqrt(nb));
    return na === nb ? 1 : 0;
  }

  cluster(elements: ComponentClusterCandidate[] = []): ComponentClusterResult[] {
    const byKind: Record<string, ComponentClusterCandidate[]> = {};
    for (const element of elements) {
      const key = `${element.kind}|${element.structuralHash}`;
      (byKind[key] ||= []).push(element);
    }

    const output: ComponentClusterResult[] = [];
    for (const group of Object.values(byKind)) {
      const variants: VariantBucket[] = [];
      for (const element of group) {
        const match = variants.find(
          (variant) =>
            this.cosine(variant.example.styleVector || [], element.styleVector || []) >=
            this.threshold,
        );
        if (match) match.instanceCount++;
        else variants.push({ example: element, instanceCount: 1 });
      }

      const first = group[0];
      output.push({
        kind: first.kind,
        structuralHash: first.structuralHash,
        instanceCount: group.length,
        variants: variants.map((variant) => ({
          css: variant.example.css,
          instanceCount: variant.instanceCount,
        })),
      });
    }
    return output;
  }
}

export function clusterComponents(
  elements: ComponentClusterCandidate[] = [],
  { threshold = 0.95 }: { threshold?: number } = {},
): ComponentClusterResult[] {
  return new ComponentClusterer(threshold).cluster(elements);
}
