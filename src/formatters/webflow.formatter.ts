/**
 * @file webflow formatter
 * @description Webflow embed formatter output for FlyRank Visual DNA packages.
 */

import {
  WEBFLOW_CSS_TEMPLATE,
  WEBFLOW_EMBED_FILE,
  WEBFLOW_EMBED_TEMPLATE,
} from "@/constants/webflow/webflow.constants";

interface DesignSystem {
  meta?: {
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
  spacing?: {
    scale?: number[];
  };
}

interface WebflowFormatterOptions {
  title?: string;
  lede?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export function formatWebflowTheme(
  design: DesignSystem,
  opts: WebflowFormatterOptions = {},
): Record<string, string> {
  const primary = design.colors?.primary?.hex ?? "#2563eb";
  const bg = design.colors?.backgrounds?.[0] ?? "#ffffff";
  const fg = design.colors?.text?.[0] ?? "#111827";
  const font = `'${design.typography?.families?.[0]?.name ?? "Inter"}', sans-serif`;
  const gap = design.spacing?.scale?.[2] ?? 16;
  const title = opts.title ?? design.meta?.title ?? "FlyRank Visual DNA Webflow Block";
  const lede = opts.lede ?? "Generated embed that maps extracted design tokens for Webflow.";
  const ctaText = opts.ctaText ?? "Read more";
  const ctaUrl = opts.ctaUrl ?? "#";

  const css = WEBFLOW_CSS_TEMPLATE
    .replace("{{primary}}", primary)
    .replace("{{background}}", bg)
    .replace("{{text}}", fg)
    .replace("{{font}}", font)
    .replace("{{gap}}", `${gap}px`);

  const html = WEBFLOW_EMBED_TEMPLATE
    .replace("{{title}}", title)
    .replace("{{lede}}", lede)
    .replace("{{ctaText}}", ctaText)
    .replace("{{ctaUrl}}", ctaUrl)
    .replace("{{css}}", css);

  return {
    [WEBFLOW_EMBED_FILE]: html + "\n",
    "variables.css": css + "\n",
  };
}
