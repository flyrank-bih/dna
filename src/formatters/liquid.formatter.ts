/**
 * @file liquid formatter
 * @description Shopify Liquid formatter output for FlyRank Visual DNA packages.
 */

import {
  LIQUID_CSS_TEMPLATE,
  LIQUID_SECTION_NAME,
  LIQUID_SECTION_TEMPLATE,
  LIQUID_WRAPPER_CLASS,
} from "@/constants/shopify/liquid.constants";

interface DesignSystem {
  meta?: {
    url?: string;
    title?: string;
  };
  colors?: {
    primary?: { hex: string };
    secondary?: { hex: string };
    accent?: { hex: string };
    backgrounds?: string[];
    text?: string[];
  };
  typography?: {
    families?: Array<{ name: string }>;
  };
}

interface LiquidFormatterOptions {
  sectionName?: string;
  wrapperClass?: string;
}

class LiquidThemeFormatter {
  constructor(
    private design: DesignSystem,
    private opts: LiquidFormatterOptions = {},
  ) {}

  private get sectionName(): string {
    return this.opts.sectionName || LIQUID_SECTION_NAME;
  }

  private get wrapperClass(): string {
    return this.opts.wrapperClass || LIQUID_WRAPPER_CLASS;
  }

  private buildCss(): string {
    const primary = this.design.colors?.primary?.hex ?? "#3b82f6";
    const bg = this.design.colors?.backgrounds?.[0] ?? "#ffffff";
    const text = this.design.colors?.text?.[0] ?? "#111111";
    const font = `'${this.design.typography?.families?.[0]?.name ?? "Inter"}', sans-serif`;

    return LIQUID_CSS_TEMPLATE
      .replace("{{primary}}", primary)
      .replace("{{background}}", bg)
      .replace("{{text}}", text)
      .replace("{{font}}", font);
  }

  format(): Record<string, string> {
    const css = this.buildCss();
    const section = LIQUID_SECTION_TEMPLATE
      .replaceAll("{{sectionName}}", this.sectionName)
      .replaceAll("{{wrapperClass}}", this.wrapperClass)
      .replace("{{css}}", css);

    return {
      [`sections/${this.sectionName}.liquid`]: section,
      [`snippets/${this.sectionName}.css.liquid`]: css + "\n",
    };
  }
}

export function formatLiquidTheme(
  design: DesignSystem,
  opts: LiquidFormatterOptions = {},
): Record<string, string> {
  return new LiquidThemeFormatter(design, opts).format();
}
