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

export function tokenPathToCamel(path: string, skipPrefixCount = 1): string {
  const parts = path.split(".");
  const trimmed = parts.slice(skipPrefixCount);
  let segs: string[];

  if (trimmed[0] === "color" && trimmed.length >= 3) segs = trimmed.slice(1);
  else segs = trimmed;

  return segs
    .map((segment, index) =>
      index === 0 ? segment : segment.charAt(0).toUpperCase() + segment.slice(1),
    )
    .join("")
    .replace(/[^a-zA-Z0-9]/g, "");
}
