/**
 * @file formatter token helpers
 * @description Shared token types and traversal helpers for formatter modules.
 */

export interface TokenRef {
  $value?: unknown;
  $type?: string;
  [key: string]: unknown;
}

export interface TokenNode {
  [key: string]: TokenNode | TokenRef;
}

export interface DesignTokensBase {
  $metadata?: {
    source?: string;
  };
  semantic?: {
    color?: TokenNode;
    typography?: TokenNode;
  };
  primitive?: {
    color?: TokenNode;
    spacing?: TokenNode;
    radius?: TokenNode;
  };
}

export function* walkTokenLeaves(
  node: unknown,
  prefix = "",
): Generator<{ path: string; token: TokenRef }> {
  if (node == null || typeof node !== "object") return;
  if ("$value" in node && "$type" in node) {
    yield { path: prefix, token: node as TokenRef };
    return;
  }

  for (const key of Object.keys(node as object)) {
    yield* walkTokenLeaves(
      (node as Record<string, unknown>)[key],
      prefix ? `${prefix}.${key}` : key,
    );
  }
}
