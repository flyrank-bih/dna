import { escapeHtml, safeHost, take } from "@/helpers/render.helpers";

interface DesignMarkdownInput {
  meta?: { title?: string; url?: string };
  colors?: {
    primary?: { hex?: string };
    secondary?: { hex?: string };
    accent?: { hex?: string };
    neutrals?: Array<{ hex?: string }>;
  };
  typography?: {
    families?: Array<{ name?: string; usage?: string }>;
    body?: { size?: number; lineHeight?: string | number };
    scale?: Array<{ size?: number }>;
  };
  spacing?: { base?: number; scale?: Array<{ value?: number } | number> };
  borders?: { radii?: Array<{ label?: string; value?: number }> };
  shadows?: { values?: Array<{ label?: string; raw?: string }> };
  voice?: { tone?: string; headingStyle?: string; headingLengthClass?: string };
  pageIntent?: { type?: string };
  materialLanguage?: { label?: string };
  layout?: { gridCount?: number; flexCount?: number };
  components?: Record<string, unknown>;
  componentAnatomy?: Array<{
    kind?: string;
    props?: { variant?: string[] };
    totalInstances?: number;
  }>;
  regions?: Array<{ role?: string }>;
}

export interface DesignMdObserver {
  format(design: DesignMarkdownInput): string;
}

const section = (title: string, body: string) =>
  `# ${title}\n\n${body || "_—_"}\n`;


export const DefaultDesignMdObserver: DesignMdObserver = {
  format(design: DesignMarkdownInput): string {
    const meta = design.meta || {};
    const colors = design.colors || {};
    const type = design.typography || {};
    const spacing = design.spacing || {};
    const borders = design.borders || {};
    const shadows = design.shadows || {};
    const voice = design.voice || {};
    const intent = design.pageIntent || {};
    const material = design.materialLanguage || {};
    const layout = design.layout || {};
    const components = design.components || {};
    const anatomy = design.componentAnatomy || [];

    const overview = [
      `A **${intent.type || "unknown"}** interface for ${safeHost(meta.url)}.`,
      material.label
        ? `Material system: **${material.label}**.`
        : `_No material system detected._`,
      "",
      `Voice: **${voice.tone || "neutral"}** · Headings: **${voice.headingStyle || "sentence"}** · Length: **${voice.headingLengthClass || "balanced"}**.`,
      "",
      meta.title ? `> "${meta.title}"` : "",
    ].join("\n");

    const colorsSection = [
      "| Role | Value |",
      "|---|---|",
      colors.primary?.hex && `| Primary | \`${colors.primary.hex}\` |`,
      colors.secondary?.hex && `| Secondary | \`${colors.secondary.hex}\` |`,
      colors.accent?.hex && `| Accent | \`${colors.accent.hex}\` |`,
      "",
      "Neutrals:",
      ...(colors.neutrals || [])
        .slice(0, 6)
        .map((c) => `- \`${c.hex}\``),
    ]
      .filter(Boolean)
      .join("\n");

    const typographySection = [
      "**Families**",
      ...(type.families || [])
        .slice(0, 5)
        .map((f) => `- \`${f.name}\` ${f.usage ? `(${f.usage})` : ""}`),
      "",
      type.body?.size &&
        `Body: \`${type.body.size}px / ${type.body.lineHeight || 1.5}\``,
      "",
      "**Scale**",
      ...take(type.scale, 10).map((s) => `- \`${s.size}px\``),
    ]
      .filter(Boolean)
      .join("\n");

    const layoutSection = [
      spacing.base && `Base spacing: \`${spacing.base}px\``,
      "",
      "**Scale**",
      ...(spacing.scale || [])
        .slice(0, 10)
        .map((s) => `- \`${typeof s === "number" ? s : s.value}px\``),
      "",
      layout.gridCount != null && `Grid systems: ${layout.gridCount}`,
      layout.flexCount != null && `Flex systems: ${layout.flexCount}`,
    ]
      .filter(Boolean)
      .join("\n");

    const elevationSection = [
      "**Shadows**",
      ...(shadows.values || [])
        .slice(0, 6)
        .map((s) => `- \`${s.label}\` → \`${s.raw}\``),
    ].join("\n");

    const shapeSection = [
      "**Radii**",
      ...(borders.radii || [])
        .slice(0, 6)
        .map((r) => `- \`${r.label}\` → \`${r.value}px\``),
    ].join("\n");

    const componentSection = [
      "**Detected Components**",
      ...Object.keys(components || {})
        .slice(0, 10)
        .map((c) => `- \`${c}\``),
      "",
      "**Anatomy**",
      "| Kind | Variants | Instances |",
      "|---|---|---|",
      ...take(anatomy, 8).map(
        (a) =>
          `| ${a.kind} | ${(a.props?.variant || []).join(", ") || "—"} | ${a.totalInstances || 0} |`,
      ),
    ].join("\n");

    const dosDonts = [
      "## Do’s",
      "- Reuse existing design tokens instead of introducing new ones",
      "- Maintain spacing rhythm from extracted scale",
      "- Respect detected material system",
      "",
      "## Don’ts",
      "- Don’t introduce new color primitives",
      "- Don’t break typography scale hierarchy",
      "- Don’t mix material systems",
    ].join("\n");

    const frontmatter = `---\nsite: ${escapeHtml(meta.title || meta.url)}\nurl: ${escapeHtml(meta.url)}\nengine: FlyRank Visual DNA\n---`;

    return [
      frontmatter,
      section("Overview", overview),
      section("Colors", colorsSection),
      section("Typography", typographySection),
      section("Layout", layoutSection),
      section("Elevation", elevationSection),
      section("Shapes", shapeSection),
      section("Components", componentSection),
      section("Do's & Don'ts", dosDonts),
    ].join("\n");
  },
};
