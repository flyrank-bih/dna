import { isLightHex, toHslParts, toHslString } from "@/helpers/color.helpers";

interface Color {
  hex: string;
}

interface DesignSystem {
  meta: { url: string };
  colors: {
    primary?: Color;
    secondary?: Color;
    accent?: Color;
    neutrals: Color[];
    backgrounds: string[];
    text: string[];
  };
  typography: {
    families: Array<{
      name: string;
      usage: string;
      weight?: number;
      lineHeight?: number;
    }>;
    scale: Array<{ size: number; weight?: number; lineHeight?: number }>;
  };
  spacing: {
    scale: number[];
  };
  borders: {
    radii: Array<{ label: string; value: number }>;
  };
  shadows: {
    values: Array<{ label: string; raw: string }>;
  };
  darkMode?: {
    colors: {
      backgrounds: string[];
      text: string[];
      primary?: Color;
    };
  };
}

interface Theme {
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  fontSizes?: Record<string, string>;
  space?: Record<string, string>;
  radii?: Record<string, string>;
  shadows?: Record<string, string>;
  states?: Record<string, Record<string, number>>;
}

interface MuiTheme {
  palette: {
    primary?: { main: string; light?: string; dark?: string };
    secondary?: { main: string; light?: string; dark?: string };
    background?: { default?: string; paper?: string };
    text?: { primary?: string; secondary?: string };
  };
  typography: MuiTypography;
  shape?: { borderRadius?: number };
  shadows?: string[];
}

type MuiTypography = Record<
  string,
  {
    fontSize: string;
    fontWeight?: number;
    lineHeight?: number;
    fontFamily?: string;
  }
>;

interface ThemeGenerator {
  generate(design: DesignSystem): string;
}



// ========== Base Theme Generator ==========
abstract class BaseThemeGenerator implements ThemeGenerator {
  protected design: DesignSystem;

  constructor(design: DesignSystem) {
    this.design = design;
  }

  abstract generate(): string;

  protected buildTypeComment(theme: Theme): string {
    const colorKeys = Object.keys(theme.colors || {})
      .map((k) => `    ${k}: string;`)
      .join("\n");
    const fontKeys = Object.keys(theme.fonts || {})
      .map((k) => `    ${k}: string;`)
      .join("\n");
    const sizeKeys = Object.keys(theme.fontSizes || {})
      .map((k) => `    '${k}': string;`)
      .join("\n");
    const spaceKeys = Object.keys(theme.space || {})
      .map((k) => `    '${k}': string;`)
      .join("\n");
    const radiiKeys = Object.keys(theme.radii || {})
      .map((k) => `    ${k}: string;`)
      .join("\n");
    const shadowKeys = Object.keys(theme.shadows || {})
      .map((k) => `    ${k}: string;`)
      .join("\n");

    return `/**
 * TypeScript type definition for this theme:
 *
 * interface Theme {
 *   colors: {
${colorKeys}
 *   };
 *   fonts: {
${fontKeys}
 *   };
 *   fontSizes: {
${sizeKeys}
 *   };
 *   space: {
${spaceKeys}
 *   };
 *   radii: {
${radiiKeys}
 *   };
 *   shadows: {
${shadowKeys}
 *   };
 *   states: {
 *     hover: { opacity: number };
 *     focus: { opacity: number };
 *     active: { opacity: number };
 *     disabled: { opacity: number };
 *   };
 * }
 */`;
  }
}

// ========== React Theme Generator ==========
class ReactThemeGenerator extends BaseThemeGenerator {
  constructor(design: DesignSystem) {
    super(design);
  }

  generate(): string {
    const { colors, typography, spacing, shadows, borders } = this.design;
    const theme: Theme = {};

    // Colors
    theme.colors = {};
    if (colors.primary) theme.colors.primary = colors.primary.hex;
    if (colors.secondary) theme.colors.secondary = colors.secondary.hex;
    if (colors.accent) theme.colors.accent = colors.accent.hex;
    if (colors.backgrounds.length)
      theme.colors.background = colors.backgrounds[0];
    if (colors.text.length) theme.colors.foreground = colors.text[0];
    for (let i = 0; i < Math.min(colors.neutrals.length, 10); i++) {
      theme.colors[`neutral${i * 100 || 50}`] = colors.neutrals[i].hex;
    }

    // Typography
    theme.fonts = {};
    for (const f of typography.families) {
      const key = f.name.toLowerCase().includes("mono")
        ? "mono"
        : f.usage === "headings"
          ? "heading"
          : "body";
      theme.fonts[key] =
        `'${f.name}', ${f.name.toLowerCase().includes("mono") ? "monospace" : "sans-serif"}`;
    }

    theme.fontSizes = {};
    for (const s of typography.scale.slice(0, 12)) {
      theme.fontSizes[`${s.size}`] = `${s.size}px`;
    }

    // Spacing
    theme.space = {};
    for (const v of spacing.scale.slice(0, 16)) {
      theme.space[`${v}`] = `${v}px`;
    }

    // Radii
    theme.radii = {};
    for (const r of borders.radii) {
      theme.radii[r.label] = `${r.value}px`;
    }

    // Shadows
    theme.shadows = {};
    for (const s of shadows.values) {
      theme.shadows[s.label] = s.raw;
    }

    // States
    theme.states = {
      hover: { opacity: 0.08 },
      focus: { opacity: 0.12 },
      active: { opacity: 0.16 },
      disabled: { opacity: 0.38 },
    };

    // MUI Theme
    const muiTheme = this.buildMuiTheme();

    // Type Comment
    const tsType = this.buildTypeComment(theme);

    return `// React Theme — extracted from ${this.design.meta.url}
// Compatible with: Chakra UI, Stitches, Vanilla Extract, or any CSS-in-JS

${tsType}

export const theme = ${JSON.stringify(theme, null, 2)};

// MUI v5 theme
export const muiTheme = ${JSON.stringify(muiTheme, null, 2)};

export default theme;
`;
  }

  private buildMuiTheme(): MuiTheme {
    const { colors, typography, borders, shadows } = this.design;
    const mui: MuiTheme = {
      palette: {},
      typography: {},
      shape: {},
      shadows: [],
    };

    // Palette
    if (colors.primary) {
      mui.palette.primary = { main: colors.primary.hex };
      const pHsl = toHslParts(colors.primary.hex);
      if (pHsl) {
        mui.palette.primary.light = `hsl(${pHsl.h}, ${pHsl.s}%, ${Math.min(pHsl.l + 15, 95)}%)`;
        mui.palette.primary.dark = `hsl(${pHsl.h}, ${pHsl.s}%, ${Math.max(pHsl.l - 15, 10)}%)`;
      }
    }
    if (colors.secondary) {
      mui.palette.secondary = { main: colors.secondary.hex };
      const sHsl = toHslParts(colors.secondary.hex);
      if (sHsl) {
        mui.palette.secondary.light = `hsl(${sHsl.h}, ${sHsl.s}%, ${Math.min(sHsl.l + 15, 95)}%)`;
        mui.palette.secondary.dark = `hsl(${sHsl.h}, ${sHsl.s}%, ${Math.max(sHsl.l - 15, 10)}%)`;
      }
    }
    mui.palette.background = {};
    if (colors.backgrounds.length > 0)
      mui.palette.background.default = colors.backgrounds[0];
    if (colors.backgrounds.length > 1)
      mui.palette.background.paper = colors.backgrounds[1];
    else if (colors.backgrounds.length > 0)
      mui.palette.background.paper = colors.backgrounds[0];
    mui.palette.text = {};
    if (colors.text.length > 0) mui.palette.text.primary = colors.text[0];
    if (colors.text.length > 1) mui.palette.text.secondary = colors.text[1];

    // Typography
    const bodyFont = typography.families.find((f) => f.usage === "body");
    const headingFont = typography.families.find((f) => f.usage === "headings");
    if (bodyFont) {
      mui.typography.body1 = {
        fontSize: "1rem",
        ...(mui.typography.body1 || {}),
        fontFamily: `'${bodyFont.name}', sans-serif`,
      };
      mui.typography.body2 = {
        fontSize: "1rem",
        ...(mui.typography.body2 || {}),
        fontFamily: `'${bodyFont.name}', sans-serif`,
      };
    }
    for (const s of typography.scale.slice(0, 6)) {
      const level =
        s.size >= 32
          ? "h1"
          : s.size >= 24
            ? "h2"
            : s.size >= 20
              ? "h3"
              : s.size >= 16
                ? "body1"
                : "body2";
      mui.typography[level] = {
        fontSize: `${s.size}px`,
        fontWeight: s.weight || 400,
        lineHeight: s.lineHeight || 1.5,
      };
      if (headingFont && level.startsWith("h"))
        mui.typography[level].fontFamily = `'${headingFont.name}', sans-serif`;
    }

    // Shape
    if (borders.radii.length > 0) {
      const md =
        borders.radii.find((r) => r.label === "md") || borders.radii[0];
      mui.shape = { borderRadius: md.value };
    }

    // Shadows
    mui.shadows = shadows.values.slice(0, 5).map((s) => s.raw);

    return mui;
  }
}

// ========== shadcn Theme Generator ==========
class ShadcnThemeGenerator extends BaseThemeGenerator {
  constructor(design: DesignSystem) {
    super(design);
  }

  generate(): string {
    const { colors, borders, darkMode } = this.design;
    const lines = ["@layer base {", "  :root {"];

    // Light mode
    if (colors.backgrounds.length)
      lines.push(`    --background: ${toHslString(colors.backgrounds[0])};`);
    if (colors.text.length)
      lines.push(`    --foreground: ${toHslString(colors.text[0])};`);
    if (colors.primary) {
      lines.push(`    --primary: ${toHslString(colors.primary.hex)};`);
      lines.push(
        `    --primary-foreground: ${isLightHex(colors.primary.hex) ? "0 0% 0%" : "0 0% 100%"};`,
      );
    }
    if (colors.secondary) {
      lines.push(`    --secondary: ${toHslString(colors.secondary.hex)};`);
      lines.push(
        `    --secondary-foreground: ${isLightHex(colors.secondary.hex) ? "0 0% 0%" : "0 0% 100%"};`,
      );
    }
    if (colors.accent) {
      lines.push(`    --accent: ${toHslString(colors.accent.hex)};`);
      lines.push(
        `    --accent-foreground: ${isLightHex(colors.accent.hex) ? "0 0% 0%" : "0 0% 100%"};`,
      );
    }
    if (colors.neutrals.length > 0) {
      lines.push(
        `    --muted: ${toHslString(colors.neutrals[colors.neutrals.length - 1]?.hex || "#888")};`,
      );
      lines.push(
        `    --muted-foreground: ${toHslString(colors.neutrals[0]?.hex || "#333")};`,
      );
      lines.push(
        `    --border: ${toHslString(colors.neutrals[Math.min(4, colors.neutrals.length - 1)]?.hex || "#e5e5e5")};`,
      );
    }
    if (borders.radii.length > 0) {
      const md =
        borders.radii.find((r) => r.label === "md") || borders.radii[0];
      lines.push(`    --radius: ${md.value}px;`);
    }

    lines.push("  }");

    // Dark mode
    if (darkMode) {
      lines.push("  .dark {");
      const dc = darkMode.colors;
      if (dc.backgrounds.length)
        lines.push(`    --background: ${toHslString(dc.backgrounds[0])};`);
      if (dc.text.length)
        lines.push(`    --foreground: ${toHslString(dc.text[0])};`);
      if (dc.primary)
        lines.push(`    --primary: ${toHslString(dc.primary.hex)};`);
      lines.push("  }");
    }

    lines.push("}");

    return `/* shadcn/ui Theme — extracted from ${this.design.meta.url} */
/* Paste into your globals.css */

${lines.join("\n")}
`;
  }
}

export function formatReactTheme(design: DesignSystem): string {
  const generator = new ReactThemeGenerator(design);
  return generator.generate();
}

export function formatShadcnTheme(design: DesignSystem): string {
  const generator = new ShadcnThemeGenerator(design);
  return generator.generate();
}
