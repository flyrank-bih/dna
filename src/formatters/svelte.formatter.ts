/**
 * @file svelte formatter
 * @description Generated/formatting utilities used by FlyRank Visual DNA.
 */

import {
  SVELTE_HEADER_COMMENT,
  SVELTE_ROOT_SELECTOR,
} from "@/constants/svelte/svelte.constants";

interface Color {
  hex: string;
}

interface FontFamily {
  name: string;
}

interface FontSize {
  size: number | string;
}

interface BorderRadius {
  label: string;
  value: number;
}

interface Spacing {
  base?: number;
  scale: number[];
}

interface Typography {
  families: FontFamily[];
  scale: FontSize[];
  body?: { size: number };
}

interface DesignSystem {
  colors: {
    primary?: Color;
    secondary?: Color;
    accent?: Color;
    neutrals: Color[];
    backgrounds: string[];
    text: string[];
  };
  typography: Typography;
  spacing: Spacing;
  borders: {
    radii: BorderRadius[];
  };
}

class SvelteThemeGenerator {
  private design: DesignSystem;

  constructor(design: DesignSystem) {
    this.design = design;
  }

  private generateColorLines(): string[] {
    const lines: string[] = [];
    lines.push("  /* Colors */");

    if (this.design.colors.primary) {
      lines.push(`  --color-primary: ${this.design.colors.primary.hex};`);
    }
    if (this.design.colors.secondary) {
      lines.push(`  --color-secondary: ${this.design.colors.secondary.hex};`);
    }
    if (this.design.colors.accent) {
      lines.push(`  --color-accent: ${this.design.colors.accent.hex};`);
    }

    this.design.colors.neutrals.slice(0, 10).forEach((n, i) => {
      lines.push(`  --color-neutral-${(i + 1) * 100}: ${n.hex};`);
    });

    if (this.design.colors.backgrounds.length > 0) {
      lines.push(`  --color-background: ${this.design.colors.backgrounds[0]};`);
    }
    if (this.design.colors.text.length > 0) {
      lines.push(`  --color-text: ${this.design.colors.text[0]};`);
    }

    return lines;
  }

  private generateTypographyLines(): string[] {
    const lines: string[] = [];
    lines.push("  /* Typography */");

    if (this.design.typography.families.length > 0) {
      lines.push(
        `  --font-primary: '${this.design.typography.families[0].name}', sans-serif;`,
      );
    }
    if (this.design.typography.families.length > 1) {
      lines.push(
        `  --font-secondary: '${this.design.typography.families[1].name}', sans-serif;`,
      );
    }
    if (this.design.typography.body) {
      lines.push(`  --font-size-base: ${this.design.typography.body.size}px;`);
    }

    this.design.typography.scale.slice(0, 8).forEach((s) => {
      lines.push(`  --font-size-${s.size}: ${s.size}px;`);
    });

    return lines;
  }

  private generateSpacingLines(): string[] {
    const lines: string[] = [];
    lines.push("  /* Spacing */");

    if (this.design.spacing.base) {
      lines.push(`  --spacing-base: ${this.design.spacing.base}px;`);
    }

    this.design.spacing.scale.slice(0, 12).forEach((val, i) => {
      lines.push(`  --spacing-${i + 1}: ${val}px;`);
    });

    return lines;
  }

  private generateBorderRadiusLines(): string[] {
    const lines: string[] = [];
    lines.push("  /* Border Radii */");

    this.design.borders.radii.forEach((r) => {
      lines.push(`  --radius-${r.label}: ${r.value}px;`);
    });

    return lines;
  }

  public format(): string {
    const lines: string[] = [];

    lines.push(SVELTE_HEADER_COMMENT);
    lines.push("/* Import in +layout.svelte or app.css */");
    lines.push("");
    lines.push(SVELTE_ROOT_SELECTOR);

    lines.push(...this.generateColorLines());
    lines.push("");
    lines.push(...this.generateTypographyLines());
    lines.push("");
    lines.push(...this.generateSpacingLines());
    lines.push("");
    lines.push(...this.generateBorderRadiusLines());

    lines.push("}");

    return lines.join("\n");
  }
}

export function formatSvelteTheme(design: DesignSystem): string {
  const generator = new SvelteThemeGenerator(design);
  return generator.format();
}
