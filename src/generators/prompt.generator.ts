/**
 * @file prompt generator
 * @description POP-oriented prompt pack generator for FlyRank Visual DNA.
 */

interface PromptDesignInput {
  colors?: {
    all?: Array<{ hex?: string }>;
  };
  typography?: {
    families?: Array<{ name?: string } | string>;
  };
  spacing?: {
    scale?: Array<{ value?: string | number; label?: string } | string | number>;
  };
  borders?: {
    radii?: Array<{ value?: string | number } | string | number>;
  };
  shadows?: {
    values?: Array<{ raw?: string; value?: string } | string>;
  };
  materialLanguage?: {
    label?: string;
  };
  pageIntent?: {
    type?: string;
  };
  sectionRoles?: {
    sections?: Array<{
      role?: string;
      slots?: { heading?: string };
    }>;
  };
  voice?: {
    tone?: string;
    headingStyle?: string;
    pronounPosture?: string;
    ctaVerbs?: string[];
  };
  componentLibrary?: {
    library?: string;
  };
  componentClusters?: Array<{ name?: string; kind?: string; [key: string]: unknown }>;
}

interface PromptBrief {
  colors: string[];
  fonts: string[];
  spacing: string;
  radii: string;
  shadows: string;
  material: string;
  intent: string;
  sections: string[];
  voice: string;
  libraryGuidance: string | null;
}

interface PromptFormatter {
  format(design: PromptDesignInput, brief: PromptBrief): string;
}

interface RecipeCard {
  name: string;
  content: string;
}

interface PromptPack {
  "v0.txt": string;
  "lovable.txt": string;
  "cursor.md": string;
  "claude-artifacts.md": string;
  "codex.md": string;
  "copilot.md": string;
  recipes: RecipeCard[];
}

class PromptBriefBuilder {
  private static readonly LIBRARY_GUIDANCE: Record<string, string> = {
    "shadcn/ui":
      "Use shadcn/ui components (Button, Card, Dialog, Input, Sheet, Tabs) with Tailwind.",
    "radix-ui":
      "Use Radix UI primitives for accessibility and style with your CSS system.",
    headlessui: "Use Headless UI primitives styled with Tailwind.",
    mui: "Use MUI v5 components with a custom ThemeProvider mapped to FlyRank Visual DNA tokens.",
    "chakra-ui": "Use Chakra UI components with extendTheme() token mapping.",
    mantine: "Use Mantine components with MantineProvider theme overrides.",
    "ant-design": "Use Ant Design v5 with ConfigProvider theme tokens.",
    bootstrap: "Use Bootstrap 5 utilities and map tokens through CSS custom properties.",
    heroui: "Use HeroUI/NextUI components with token-aligned styling.",
    "tailwind-ui":
      "Use Tailwind UI patterns with Tailwind classes, no runtime UI library.",
    tailwindcss: "Use plain Tailwind CSS without a component runtime.",
    vuetify: "Use Vuetify 3 components with a custom theme object.",
  };

  build(design: PromptDesignInput): PromptBrief {
    return {
      colors: this.collectColors(design),
      fonts: this.collectFonts(design),
      spacing: this.buildScaleSnippet(design.spacing?.scale || []),
      radii: this.buildRadiiSnippet(design.borders?.radii || []),
      shadows: this.buildShadowSnippet(design.shadows?.values || []),
      material: design.materialLanguage?.label || "flat",
      intent: design.pageIntent?.type || "landing",
      sections: this.collectSections(design),
      voice: this.buildVoice(design),
      libraryGuidance: this.resolveLibraryGuidance(design.componentLibrary?.library),
    };
  }

  private collectColors(design: PromptDesignInput): string[] {
    const all = (design.colors?.all || [])
      .map((entry) => entry.hex || "")
      .filter((hex): hex is string => !!hex);
    return [...new Set(all)].slice(0, 14);
  }

  private collectFonts(design: PromptDesignInput): string[] {
    const families = (design.typography?.families || []).map((family) =>
      typeof family === "string" ? family : family.name || "",
    );
    return [...new Set(families.filter(Boolean))].slice(0, 4);
  }

  private buildScaleSnippet(scale: Array<{ value?: string | number; label?: string } | string | number>): string {
    if (!scale.length) return "(not detected)";
    return scale
      .slice(0, 8)
      .map((entry) => {
        const value = typeof entry === "object" ? String(entry.value ?? "") : String(entry);
        const label =
          typeof entry === "object" && entry.label ? ` (${entry.label})` : "";
        return `${value}${label}`;
      })
      .join(", ");
  }

  private buildRadiiSnippet(radii: Array<{ value?: string | number } | string | number>): string {
    const values = radii
      .slice(0, 6)
      .map((entry) =>
        typeof entry === "object" ? String(entry.value ?? "") : String(entry),
      )
      .filter(Boolean);
    return values.length ? values.join(", ") : "(none)";
  }

  private buildShadowSnippet(
    shadows: Array<{ raw?: string; value?: string } | string>,
  ): string {
    const values = shadows
      .slice(0, 3)
      .map((entry) => {
        if (typeof entry === "string") return entry;
        return String(entry.raw ?? entry.value ?? "");
      })
      .filter(Boolean);
    return values.length ? values.join(" | ") : "(none)";
  }

  private collectSections(design: PromptDesignInput): string[] {
    const sections = design.sectionRoles?.sections || [];
    return sections
      .filter((section) => section.role && section.role !== "content" && section.role !== "nav")
      .map((section) => {
        const heading = section.slots?.heading
          ? ` - heading: "${section.slots.heading.slice(0, 80)}"`
          : "";
        return `- ${section.role}${heading}`;
      });
  }

  private buildVoice(design: PromptDesignInput): string {
    const voice = design.voice;
    if (!voice) return "";
    const parts: string[] = [];
    if (voice.tone) parts.push(`Tone: ${voice.tone}`);
    if (voice.headingStyle) parts.push(`Headings: ${voice.headingStyle}`);
    if (voice.pronounPosture) parts.push(`Pronoun posture: ${voice.pronounPosture}`);
    if (voice.ctaVerbs?.length) parts.push(`CTA verbs: ${voice.ctaVerbs.slice(0, 6).join(", ")}`);
    return parts.join(" | ");
  }

  private resolveLibraryGuidance(library?: string): string | null {
    if (!library || library === "unknown") return null;
    return PromptBriefBuilder.LIBRARY_GUIDANCE[library] || null;
  }
}

class V0PromptFormatter implements PromptFormatter {
  format(_: PromptDesignInput, brief: PromptBrief): string {
    return [
      `FlyRank Visual DNA brief: build a ${brief.intent} page with strict token fidelity.`,
      "",
      "COLORS:",
      brief.colors.map((color) => `  ${color}`).join("\n"),
      "",
      `FONTS: ${brief.fonts.join(", ") || "system-ui"}`,
      `SPACING: ${brief.spacing}`,
      `RADIUS: ${brief.radii}`,
      `SHADOWS: ${brief.shadows}`,
      `MATERIAL LANGUAGE: ${brief.material}`,
      brief.voice ? `VOICE: ${brief.voice}` : "",
      brief.libraryGuidance ? `LIBRARY: ${brief.libraryGuidance}` : "",
      "",
      "SECTIONS (in order):",
      (brief.sections.length
        ? brief.sections
        : ["- hero", "- features", "- cta", "- footer"]).join("\n"),
      "",
      "Use Tailwind. Keep spacing/radius/shadow vocabulary consistent with FlyRank Visual DNA.",
    ]
      .filter(Boolean)
      .join("\n");
  }
}

class LovablePromptFormatter implements PromptFormatter {
  format(_: PromptDesignInput, brief: PromptBrief): string {
    return [
      `Use FlyRank Visual DNA to recreate this ${brief.intent} page as a fresh equivalent.`,
      "",
      `Visual feel: ${brief.material}. ${brief.voice || ""}`,
      `Primary palette: ${brief.colors.slice(0, 6).join(", ")}`,
      `Typography: ${brief.fonts.join(", ") || "system-ui"}`,
      `Corner radius vocabulary: ${brief.radii}`,
      `Shadow vocabulary: ${brief.shadows}`,
      brief.libraryGuidance ? `Use: ${brief.libraryGuidance}` : "",
      "",
      "Page structure:",
      (brief.sections.length
        ? brief.sections
        : ["- hero", "- features", "- social proof", "- cta", "- footer"]).join("\n"),
    ]
      .filter(Boolean)
      .join("\n");
  }
}

class CursorPromptFormatter implements PromptFormatter {
  format(design: PromptDesignInput, brief: PromptBrief): string {
    const radii = (design.borders?.radii || [])
      .slice(0, 6)
      .map((entry) => {
        const value = typeof entry === "object" ? entry.value : entry;
        return `'${String(value ?? "")}'`;
      })
      .join(", ");
    const shadows = (design.shadows?.values || [])
      .slice(0, 3)
      .map((entry) => {
        const raw =
          typeof entry === "string" ? entry : String(entry.raw ?? entry.value ?? "");
        return `'${raw.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
      })
      .join(", ");

    return [
      "# FlyRank Visual DNA Brief",
      "",
      `Page type: **${brief.intent}**.`,
      `Material language: **${brief.material}**.`,
      brief.voice ? `Voice: ${brief.voice}.` : "",
      "",
      "## Tokens",
      "",
      "```ts",
      "export const tokens = {",
      `  colors: [${brief.colors.map((color) => `'${color}'`).join(", ")}],`,
      `  fonts: [${brief.fonts.map((font) => `'${font}'`).join(", ")}],`,
      `  radii: [${radii}],`,
      `  shadows: [${shadows}],`,
      "};",
      "```",
      "",
      "## Sections",
      (brief.sections.length
        ? brief.sections
        : ["- hero", "- features", "- cta", "- footer"]).join("\n"),
      "",
      brief.libraryGuidance ? `## Library\n\n${brief.libraryGuidance}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
}

class ClaudeArtifactPromptFormatter implements PromptFormatter {
  format(_: PromptDesignInput, brief: PromptBrief): string {
    return [
      "Create a React artifact that reproduces this brand using FlyRank Visual DNA.",
      "",
      `Page intent: ${brief.intent}.`,
      `Material language: ${brief.material}.`,
      brief.voice ? `Voice: ${brief.voice}.` : "",
      brief.libraryGuidance ? `Library preference: ${brief.libraryGuidance}` : "",
      "",
      `Colors to use: ${brief.colors.join(", ")}.`,
      `Fonts: ${brief.fonts.join(", ") || "system-ui"}.`,
      `Radius vocabulary: ${brief.radii}.`,
      "",
      "Sections:",
      (brief.sections.length
        ? brief.sections
        : ["- hero", "- features", "- cta", "- footer"]).join("\n"),
      "",
      "Use Tailwind and keep the material language consistent across every section.",
    ]
      .filter(Boolean)
      .join("\n");
  }
}

class CodexPromptFormatter implements PromptFormatter {
  format(_: PromptDesignInput, brief: PromptBrief): string {
    return [
      "Implement a production-grade UI from FlyRank Visual DNA.",
      "",
      "Constraints:",
      "- Keep semantic token fidelity. Do not invent unrelated colors or spacing.",
      "- Preserve visual rhythm, radius, and shadows.",
      "- Keep component hierarchy aligned with section order.",
      "",
      `Intent: ${brief.intent}`,
      `Material: ${brief.material}`,
      brief.voice ? `Voice: ${brief.voice}` : "",
      brief.libraryGuidance ? `Library: ${brief.libraryGuidance}` : "",
      "",
      `Palette: ${brief.colors.join(", ")}`,
      `Fonts: ${brief.fonts.join(", ") || "system-ui"}`,
      `Spacing: ${brief.spacing}`,
      `Radii: ${brief.radii}`,
      `Shadows: ${brief.shadows}`,
      "",
      "Sections:",
      (brief.sections.length
        ? brief.sections
        : ["- hero", "- features", "- cta", "- footer"]).join("\n"),
      "",
      "Output complete, typed code with reusable components and accessible defaults.",
    ]
      .filter(Boolean)
      .join("\n");
  }
}

class CopilotPromptFormatter implements PromptFormatter {
  format(_: PromptDesignInput, brief: PromptBrief): string {
    return [
      "Follow FlyRank Visual DNA to scaffold the UI implementation.",
      "",
      `Intent: ${brief.intent}`,
      `Material: ${brief.material}`,
      `Colors: ${brief.colors.join(", ")}`,
      `Fonts: ${brief.fonts.join(", ") || "system-ui"}`,
      `Radii: ${brief.radii}`,
      `Shadows: ${brief.shadows}`,
      brief.libraryGuidance ? `Library hint: ${brief.libraryGuidance}` : "",
      "",
      "Render sections in this order:",
      (brief.sections.length
        ? brief.sections
        : ["- hero", "- features", "- cta", "- footer"]).join("\n"),
    ]
      .filter(Boolean)
      .join("\n");
  }
}

class PromptPackGenerator {
  private briefBuilder = new PromptBriefBuilder();

  public buildPromptPack(design: PromptDesignInput): PromptPack {
    const brief = this.briefBuilder.build(design);
    return {
      "v0.txt": new V0PromptFormatter().format(design, brief),
      "lovable.txt": new LovablePromptFormatter().format(design, brief),
      "cursor.md": new CursorPromptFormatter().format(design, brief),
      "claude-artifacts.md": new ClaudeArtifactPromptFormatter().format(
        design,
        brief,
      ),
      "codex.md": new CodexPromptFormatter().format(design, brief),
      "copilot.md": new CopilotPromptFormatter().format(design, brief),
      recipes: this.formatRecipeCards(design, brief),
    };
  }

  public formatRecipeCards(
    design: PromptDesignInput,
    brief: PromptBrief,
  ): RecipeCard[] {
    const clusters = design.componentClusters || [];
    if (!clusters.length) return [];

    return clusters.slice(0, 12).map((cluster, index) => {
      const name = cluster.name || cluster.kind || `component-${index + 1}`;
      const signals = [brief.libraryGuidance, `Radius: ${brief.radii}`, `Shadows: ${brief.shadows}`]
        .filter(Boolean)
        .join(" | ");

      return {
        name,
        content: [
          `# FlyRank Visual DNA Recipe: ${name}`,
          "",
          `Build one ${name} component aligned to this brand system.`,
          "",
          `Palette: ${brief.colors.slice(0, 6).join(", ")}`,
          `Typography: ${brief.fonts.join(", ") || "system-ui"}`,
          `Material: ${brief.material}`,
          signals ? `Signals: ${signals}` : "",
          "",
          "## Anatomy (detected)",
          "```json",
          JSON.stringify(cluster, null, 2).slice(0, 1500),
          "```",
        ]
          .filter(Boolean)
          .join("\n"),
      };
    });
  }
}

const promptPackGenerator = new PromptPackGenerator();

export function formatV0Prompt(design: PromptDesignInput): string {
  return new V0PromptFormatter().format(design, new PromptBriefBuilder().build(design));
}

export function formatLovablePrompt(design: PromptDesignInput): string {
  return new LovablePromptFormatter().format(design, new PromptBriefBuilder().build(design));
}

export function formatCursorPrompt(design: PromptDesignInput): string {
  return new CursorPromptFormatter().format(design, new PromptBriefBuilder().build(design));
}

export function formatClaudeArtifactPrompt(design: PromptDesignInput): string {
  return new ClaudeArtifactPromptFormatter().format(design, new PromptBriefBuilder().build(design));
}

export function formatCodexPrompt(design: PromptDesignInput): string {
  return new CodexPromptFormatter().format(design, new PromptBriefBuilder().build(design));
}

export function formatCopilotPrompt(design: PromptDesignInput): string {
  return new CopilotPromptFormatter().format(design, new PromptBriefBuilder().build(design));
}

export function formatRecipeCards(design: PromptDesignInput): RecipeCard[] {
  const brief = new PromptBriefBuilder().build(design);
  return new PromptPackGenerator().formatRecipeCards(design, brief);
}

export function buildPromptPack(design: PromptDesignInput): PromptPack {
  return promptPackGenerator.buildPromptPack(design);
}
