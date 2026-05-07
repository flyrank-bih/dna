/**
 * @file wordpress formatter
 * @description Generated/formatting utilities used by FlyRank Visual DNA.
 */

import { createReferenceResolver } from "@/helpers/design-token.helpers";
import {
  WORDPRESS_FUNCTIONS_PHP_SNIPPET,
  WORDPRESS_INDEX_HTML_SNIPPET,
  WORDPRESS_INDEX_PHP_SNIPPET,
  WORDPRESS_SCHEMA_URL,
  WORDPRESS_THEME_NAME,
} from "@/constants/wordpress/wordpress.constants";
import {
  type TokenNode,
  type TokenRef,
  walkTokenLeaves,
} from "@/helpers/formatter-token.helpers";
import { type ReferenceResolver } from "@/helpers/design-token.helpers";

interface DesignSystem {
  meta?: { url?: string };
  colors?: {
    primary?: { hex: string };
    secondary?: { hex: string };
    accent?: { hex: string };
    neutrals?: { hex: string }[];
    backgrounds?: string[];
    text?: string[];
  };
  typography?: {
    families?: Array<{ name: string; tags?: string[] } | string>;
    scale?: Array<{ size: number | string; tags?: string[] }>;
    body?: { size: number; lineHeight: string };
  };
  spacing?: {
    scale?: number[];
  };
  layout?: {
    containerWidths?: Array<{ maxWidth: string }>;
  };
  gradients?: {
    gradients?: Array<{ raw: string }>;
  };
  semantic?: {
    color?: TokenNode;
  };
  primitive?: {
    spacing?: TokenNode;
  };
  $metadata?: {
    source?: string;
  };
}

interface WpColorEntry {
  slug: string;
  color: string;
  name: string;
}

interface WpSpacingEntry {
  slug: string;
  size: string;
  name: string;
}

interface WpFontSizeEntry {
  slug: string;
  size: string;
  name: string;
}

interface WpFontFamilyEntry {
  slug: string;
  fontFamily: string;
  name: string;
}

interface ThemeJson {
  $schema: string;
  version: number;
  settings: {
    color: {
      palette: WpColorEntry[];
      gradients?: Array<{ slug: string; gradient: string; name: string }>;
    };
    typography: {
      fontFamilies: WpFontFamilyEntry[];
      fontSizes: WpFontSizeEntry[];
    };
    spacing: {
      spacingSizes: WpSpacingEntry[];
    };
    layout?: {
      contentSize?: string;
      wideSize?: string;
    };
  };
  styles: {
    color?: {
      background?: string;
      text?: string;
    };
    typography?: {
      fontSize?: string;
      lineHeight?: string;
      fontFamily?: string;
    };
    spacing?: Record<string, unknown>;
  };
}

class WordPressThemeGenerator {
  private tokens: TokenNode;
  private design: DesignSystem;
  private tokenResolver: ReferenceResolver;
  private headerVersion: string;

  constructor(
    tokens: TokenNode,
    design: DesignSystem = {},
    headerVersion: string = "7.0.0",
  ) {
    this.tokens = tokens;
    this.design = design;
    this.headerVersion = headerVersion;
    this.tokenResolver = createReferenceResolver(this.tokens);
  }

  private slugFromPath(path: string): string {
    const parts = path.split(".");
    const trimmed = parts.slice(1);
    let segs: string[];

    if (trimmed[0] === "color" && trimmed.length >= 3) {
      segs = trimmed.slice(1);
    } else if (trimmed[0] === "spacing" || trimmed[0] === "radius") {
      segs = trimmed.slice(1);
    } else {
      segs = trimmed;
    }

    return segs
      .map((s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase())
      .join("-")
      .replace(/[^a-z0-9-]/g, "");
  }

  private titleFromPath(path: string): string {
    return this.slugFromPath(path)
      .split("-")
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  }

  private collectWpColors(): WpColorEntry[] {
    const entries: WpColorEntry[] = [];
    const sem = this.tokens?.semantic?.color;

    if (sem) {
      for (const leaf of walkTokenLeaves(sem, "semantic.color")) {
        if (leaf.token.$type !== "color") continue;
        const resolved = this.tokenResolver.resolve(leaf.path);
        if (typeof resolved !== "string") continue;
        entries.push({
          slug: this.slugFromPath(leaf.path),
          color: resolved,
          name: this.titleFromPath(leaf.path),
        });
      }
    }
    return entries;
  }

  private collectWpSpacing(): WpSpacingEntry[] {
    const entries: WpSpacingEntry[] = [];
    const spacing = (this.tokens?.primitive?.spacing || {}) as Record<string, TokenNode | TokenRef>;

    for (const key of Object.keys(spacing)) {
      const tok = spacing[key];
      if (!tok || (tok as TokenRef).$type !== "dimension") continue;
      const resolved = this.tokenResolver.resolve(`primitive.spacing.${key}`);
      if (typeof resolved !== "string") continue;
      entries.push({
        slug: key,
        size: resolved,
        name: key.toUpperCase(),
      });
    }
    return entries;
  }

  private collectWpFontSizes(): WpFontSizeEntry[] {
    const entries: WpFontSizeEntry[] = [];
    const scale = this.design?.typography?.scale || [];

    const labelFor = (s: {
      size: number | string;
      tags?: string[];
    }): string => {
      return (s.tags && s.tags[0]) || `fs-${s.size}`;
    };

    for (const s of scale) {
      const size = typeof s.size === "number" ? `${s.size}px` : s.size;
      const label = String(labelFor(s));
      entries.push({
        slug: label.toLowerCase(),
        size,
        name: label,
      });
    }
    return entries;
  }

  private collectWpFontFamilies(): WpFontFamilyEntry[] {
    const entries: WpFontFamilyEntry[] = [];
    const fams = this.design?.typography?.families || [];

    for (const f of fams) {
      const name = typeof f === "string" ? f : f?.name;
      if (!name) continue;
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      entries.push({
        slug,
        fontFamily: `${name}, sans-serif`,
        name,
      });
    }
    return entries;
  }

  private buildThemeJson(): string {
    const palette = this.collectWpColors();
    const spacingSizes = this.collectWpSpacing();
    const fontSizes = this.collectWpFontSizes();
    const fontFamilies = this.collectWpFontFamilies();

    const surfaceDefault =
      this.tokenResolver.resolve("semantic.color.surface.default") || "#ffffff";
    const textBody =
      this.tokenResolver.resolve("semantic.color.text.body") || "#111111";

    const theme: ThemeJson = {
      $schema: WORDPRESS_SCHEMA_URL,
      version: 3,
      settings: {
        color: { palette },
        typography: { fontSizes, fontFamilies },
        spacing: { spacingSizes },
      },
      styles: {
        color: {
          background: `var(--wp--preset--color--surface-default, ${surfaceDefault})`,
          text: `var(--wp--preset--color--text-body, ${textBody})`,
        },
      },
    };
    return JSON.stringify(theme, null, 2) + "\n";
  }

  private buildStyleCss(): string {
    const source =
      this.tokens?.$metadata?.source || (this.design?.meta?.url ?? "");
    const header = `/*
Theme Name: ${WORDPRESS_THEME_NAME}
Theme URI: https://github.com/flyrank-bih/visualdna
Description: Block theme generated from ${source} by FlyRank's Visual Design System v${this.headerVersion}
Version: 1.0.0
Author: FlyRank
License: MIT
Text Domain: flyrank-theme
*/
`;
    const lines = [header, ":root {"];

    for (const c of this.collectWpColors()) {
      lines.push(`  --${c.slug}: ${c.color};`);
    }
    for (const s of this.collectWpSpacing()) {
      lines.push(`  --spacing-${s.slug}: ${s.size};`);
    }
    lines.push("}");
    return lines.join("\n") + "\n";
  }

  private buildFunctionsPhp(): string {
    return WORDPRESS_FUNCTIONS_PHP_SNIPPET;
  }

  private buildIndexPhp(): string {
    return WORDPRESS_INDEX_PHP_SNIPPET;
  }

  private buildIndexHtml(): string {
    return WORDPRESS_INDEX_HTML_SNIPPET;
  }

  private buildSimpleTheme(): ThemeJson {
    const theme: ThemeJson = {
      $schema: WORDPRESS_SCHEMA_URL,
      version: 3,
      settings: {
        color: {
          palette: [],
          gradients: [],
        },
        typography: {
          fontFamilies: [],
          fontSizes: [],
        },
        spacing: {
          spacingSizes: [],
        },
        layout: {
          contentSize: "1200px",
          wideSize: "1400px",
        },
      },
      styles: {
        color: {},
        typography: {},
        spacing: {},
      },
    };

    // Colors
    if (this.design.colors?.primary) {
      theme.settings.color.palette.push({
        slug: "primary",
        color: this.design.colors.primary.hex,
        name: "Primary",
      });
    }
    if (this.design.colors?.secondary) {
      theme.settings.color.palette.push({
        slug: "secondary",
        color: this.design.colors.secondary.hex,
        name: "Secondary",
      });
    }
    if (this.design.colors?.accent) {
      theme.settings.color.palette.push({
        slug: "accent",
        color: this.design.colors.accent.hex,
        name: "Accent",
      });
    }
    if (this.design.colors?.neutrals) {
      for (
        let i = 0;
        i < Math.min(this.design.colors.neutrals.length, 5);
        i++
      ) {
        theme.settings.color.palette.push({
          slug: `neutral-${i + 1}`,
          color: this.design.colors.neutrals[i].hex,
          name: `Neutral ${i + 1}`,
        });
      }
    }
    if (this.design.colors?.backgrounds) {
      for (const bg of this.design.colors.backgrounds.slice(0, 3)) {
        theme.settings.color.palette.push({
          slug: `bg-${bg.replace("#", "")}`,
          color: bg,
          name: `Background ${bg}`,
        });
      }
    }

    // Typography
    if (this.design.typography?.families) {
      for (const fam of this.design.typography.families) {
        const name = typeof fam === "string" ? fam : fam.name;
        theme.settings.typography.fontFamilies.push({
          fontFamily: name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
          name: name,
        });
      }
    }
    if (this.design.typography?.scale) {
      for (const s of this.design.typography.scale.slice(0, 8)) {
        theme.settings.typography.fontSizes.push({
          size: `${s.size}px`,
          slug: `size-${s.size}`,
          name: `${s.size}px`,
        });
      }
    }

    // Spacing
    if (this.design.spacing?.scale) {
      for (let i = 0; i < Math.min(this.design.spacing.scale.length, 8); i++) {
        const val = this.design.spacing.scale[i];
        theme.settings.spacing.spacingSizes.push({
          size: `${val}px`,
          slug: `spacing-${val}`,
          name: `${val}px`,
        });
      }
    }

    // Layout
    const containerWidths = this.design.layout?.containerWidths;
    if (theme.settings.layout && containerWidths && containerWidths.length > 0) {
      theme.settings.layout.contentSize =
        containerWidths[0].maxWidth;
    }

    // Body styles
    if (this.design.typography?.body) {
      theme.styles.typography = {
        fontSize: `${this.design.typography.body.size}px`,
        lineHeight: this.design.typography.body.lineHeight,
      };
    }
    const families = this.design.typography?.families;
    if (families && families.length > 0) {
      theme.styles.typography = theme.styles.typography || {};
      theme.styles.typography.fontFamily =
        typeof families[0] === "string" ? families[0] : families[0].name;
    }
    const backgrounds = this.design.colors?.backgrounds;
    if (backgrounds && backgrounds.length > 0) {
      theme.styles.color = theme.styles.color || {};
      theme.styles.color.background = backgrounds[0];
    }
    const textColors = this.design.colors?.text;
    if (textColors && textColors.length > 0) {
      theme.styles.color = theme.styles.color || {};
      theme.styles.color.text = textColors[0];
    }

    // Gradients
    if (this.design.gradients?.gradients) {
      for (const g of this.design.gradients.gradients.slice(0, 5)) {
        theme.settings.color.gradients?.push({
          slug: `gradient-${theme.settings.color.gradients.length + 1}`,
          gradient: g.raw,
          name: `Gradient ${theme.settings.color.gradients.length + 1}`,
        });
      }
    }

    return theme;
  }

  public formatBlockTheme(): Record<string, string> {
    return {
      "theme.json": this.buildThemeJson(),
      "style.css": this.buildStyleCss(),
      "functions.php": this.buildFunctionsPhp(),
      "index.php": this.buildIndexPhp(),
      "templates/index.html": this.buildIndexHtml(),
    };
  }

  public formatSimpleTheme(): string {
    const theme = this.buildSimpleTheme();
    return JSON.stringify(theme, null, 2);
  }
}

export function formatWordPressTheme(
  tokens: TokenNode,
  design: DesignSystem = {},
): Record<string, string> {
  const generator = new WordPressThemeGenerator(tokens, design);
  return generator.formatBlockTheme();
}

export function formatWordPress(design: DesignSystem): string {
  const generator = new WordPressThemeGenerator({}, design);
  return generator.formatSimpleTheme();
}
