interface DesignSystem {
  colors?: {
    primary?: { hex: string };
    secondary?: { hex: string };
    accent?: { hex: string };
    neutrals?: Array<{ hex: string }>;
    backgrounds?: string[];
    text?: string[];
  };
  typography?: {
    families?: Array<{ name: string; usage?: string }>;
    scale?: Array<{ size: number }>;
  };
  spacing?: {
    tokens?: Record<string, number | string>;
  };
  borders?: {
    radii?: Array<{ label: string; value: number }>;
  };
  shadows?: {
    values?: Array<{ label: string; raw: string }>;
  };
  breakpoints?: Array<{ label: string; value: number }>;
}

type TokenType = "color" | "fontFamily" | "dimension" | "shadow";

interface TokenValue {
  $value: string;
  $type: TokenType;
}

interface TokenTree {
  color?: Record<string, TokenValue>;
  fontFamily?: Record<string, TokenValue>;
  fontSize?: Record<string, TokenValue>;
  spacing?: Record<string, TokenValue>;
  borderRadius?: Record<string, TokenValue>;
  shadow?: Record<string, TokenValue>;
  breakpoint?: Record<string, TokenValue>;
}

function asColorToken(value?: string): TokenValue | null {
  if (!value) return null;
  return { $value: value, $type: "color" };
}

function asDimension(value?: string | number): TokenValue | null {
  if (value === undefined || value === null) return null;
  return {
    $value: typeof value === "number" ? `${value}px` : value,
    $type: "dimension",
  };
}

function slug(input: string): string {
  return input
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function formatTokens(design: DesignSystem): string {
  const tokens: TokenTree = {};

  const colors = design.colors || {};
  const typography = design.typography || {};
  const spacing = design.spacing || {};
  const borders = design.borders || {};
  const shadows = design.shadows || {};
  const breakpoints = design.breakpoints || [];

  tokens.color = {};

  const assignColor = (key: string, value?: string) => {
    const token = asColorToken(value);
    if (token) tokens.color![key] = token;
  };

  assignColor("primary", colors.primary?.hex);
  assignColor("secondary", colors.secondary?.hex);
  assignColor("accent", colors.accent?.hex);

  (colors.neutrals || []).slice(0, 10).forEach((c, i) => {
    assignColor(`neutral-${i}`, c.hex);
  });

  (colors.backgrounds || []).forEach((c, i) => {
    assignColor(`background-${i}`, c);
  });

  (colors.text || []).slice(0, 5).forEach((c, i) => {
    assignColor(`text-${i}`, c);
  });

  tokens.fontFamily = {};

  (typography.families || []).forEach((f) => {
    const name = typeof f === "string" ? f : f.name;
    if (!name) return;

    const key =
      typeof f === "object" && f.usage
        ? f.usage === "headings"
          ? "heading"
          : f.usage === "body"
            ? "body"
            : slug(name)
        : slug(name);

    tokens.fontFamily![key] = {
      $value: name,
      $type: "fontFamily",
    };
  });

  tokens.fontSize = {};

  (typography.scale || []).slice(0, 15).forEach((s) => {
    const key = String(s.size);
    const token = asDimension(s.size);
    if (!token) return;

    tokens.fontSize![key] = token;
  });

  tokens.spacing = {};

  Object.entries(spacing.tokens || {}).forEach(([k, v]) => {
    const token = asDimension(v);
    if (!token) return;
    tokens.spacing![k] = token;
  });

  tokens.borderRadius = {};

  (borders.radii || []).forEach((r) => {
    const token = asDimension(r.value);
    if (!token) return;
    tokens.borderRadius![r.label] = token;
  });

  tokens.shadow = {};

  (shadows.values || []).forEach((s) => {
    tokens.shadow![s.label] = {
      $value: s.raw,
      $type: "shadow",
    };
  });

  tokens.breakpoint = {};

  breakpoints.forEach((bp) => {
    const token = asDimension(bp.value);
    if (!token) return;
    tokens.breakpoint![bp.label] = token;
  });

  return JSON.stringify(tokens, null, 2);
}
