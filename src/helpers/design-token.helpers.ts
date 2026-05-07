/**
 *
 * Design Token Helpers
 *
 * Internal ( Resolves Reference Strings )
 *
 * Flyrank©, 2026
 * Created by: @admirsaheta on 7/5/2026
 *
 */

// Protocols
// ! Uses POP principle for now.
export interface TokenNode {
  $value?: unknown;
  [key: string]: unknown;
}

export interface ReferenceResolver {
  resolve(path: string): unknown;
}

export interface TokenTree {
  getNode(path: string): TokenNode | undefined;
}

export class ReferenceParser {
  private static readonly REF_PATTERN = /^\{([^}]+)\}$/;

  static parse(value: unknown): string | null {
    if (typeof value !== "string") return null;
    const match = value.match(ReferenceParser.REF_PATTERN);
    return match?.[1] || null;
  }
}

export class DefaultTokenTree implements TokenTree {
  constructor(private tokens: Record<string, TokenNode | undefined>) {}
  getNode(path: string): TokenNode | undefined {
    const parts = path.split(".");
    let node: unknown = this.tokens;
    for (const part of parts) {
      if (node == null || typeof node !== "object") return undefined;
      node = (node as Record<string, unknown>)[part];
    }

    return node as TokenNode | undefined;
  }
}

export class DefaultReferenceResolver implements ReferenceResolver {
  private seen: Set<string>;

  constructor(private tokenTree: TokenTree) {
    this.seen = new Set();
  }

  resolve(path: string): unknown {
    if (this.seen.has(path)) return undefined; // Cycle detection
    this.seen.add(path);

    const node = this.tokenTree.getNode(path);
    if (node == null) return undefined;

    // If node has $value
    if (typeof node === "object" && "$value" in node) {
      const inner = node.$value;
      const refPath = ReferenceParser.parse(inner);
      if (refPath) return this.resolve(refPath);
      return inner;
    }

    // If node is a reference string
    const refPath = ReferenceParser.parse(node);
    if (refPath) return this.resolve(refPath);

    return node;
  }
}

export function createReferenceResolver(tokens: Record<string, TokenNode | undefined>): ReferenceResolver {
  return new DefaultReferenceResolver(new DefaultTokenTree(tokens));
}