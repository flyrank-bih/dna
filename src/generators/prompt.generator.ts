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
  brandIdentity?: {
    primaryLogo?: { label?: string; src?: string } | null;
    lockup?: string;
    themeColor?: string | null;
  };
  composition?: {
    heroPattern?: string;
    density?: string;
    pacing?: string;
    emphasisPatterns?: string[];
  };
  artDirection?: {
    primaryMedium?: string;
    treatment?: string;
    backgroundTreatment?: string;
  };
  messagingArchitecture?: {
    headlineFormula?: string;
    proofModules?: string[];
    persuasionSequence?: string[];
  };
  interactionSignature?: {
    hoverTreatment?: string;
    navigationReveal?: string;
    consistency?: string;
  };
  themeRelationships?: {
    aliases?: Record<string, string | null>;
    themeFamilies?: string[];
  };
  componentLibrary?: {
    library?: string;
  };
  componentClusters?: Array<{ name?: string; kind?: string; [key: string]: unknown }>;
}

interface BenchmarkContextInput {
  baseline?: {
    dominantPatterns?: Record<string, string>;
    crowdedLanes?: string[];
  };
  whitespace?: {
    opportunities?: Array<{
      lane?: string;
      rationale?: string;
      suggestedMoves?: string[];
    }>;
  };
  topSharedPatterns?: string[];
  topUniqueSignals?: Array<{ hostname?: string; signals?: string[] }>;
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
  identity: string;
  composition: string;
  messaging: string;
  interaction: string;
  libraryGuidance: string | null;
  benchmarkSummary: string;
  whitespace: string[];
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
      identity: this.buildIdentity(design),
      composition: this.buildComposition(design),
      messaging: this.buildMessaging(design),
      interaction: this.buildInteraction(design),
      libraryGuidance: this.resolveLibraryGuidance(design.componentLibrary?.library),
      benchmarkSummary: "",
      whitespace: [],
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

  private buildIdentity(design: PromptDesignInput): string {
    const parts: string[] = [];
    if (design.brandIdentity?.lockup) parts.push(`Lockup: ${design.brandIdentity.lockup}`);
    if (design.brandIdentity?.primaryLogo?.label) {
      parts.push(`Primary logo: ${design.brandIdentity.primaryLogo.label}`);
    }
    if (design.brandIdentity?.themeColor) {
      parts.push(`Theme color: ${design.brandIdentity.themeColor}`);
    }
    return parts.join(" | ");
  }

  private buildComposition(design: PromptDesignInput): string {
    const composition = design.composition;
    const artDirection = design.artDirection;
    const parts: string[] = [];
    if (composition?.heroPattern) parts.push(`Hero: ${composition.heroPattern}`);
    if (composition?.density) parts.push(`Density: ${composition.density}`);
    if (composition?.pacing) parts.push(`Pacing: ${composition.pacing}`);
    if (artDirection?.primaryMedium) parts.push(`Medium: ${artDirection.primaryMedium}`);
    if (artDirection?.treatment) parts.push(`Treatment: ${artDirection.treatment}`);
    return parts.join(" | ");
  }

  private buildMessaging(design: PromptDesignInput): string {
    const messaging = design.messagingArchitecture;
    const parts: string[] = [];
    if (messaging?.headlineFormula) parts.push(`Headline formula: ${messaging.headlineFormula}`);
    if (messaging?.proofModules?.length) {
      parts.push(`Proof: ${messaging.proofModules.slice(0, 4).join(", ")}`);
    }
    return parts.join(" | ");
  }

  private buildInteraction(design: PromptDesignInput): string {
    const interaction = design.interactionSignature;
    const parts: string[] = [];
    if (interaction?.hoverTreatment) parts.push(`Hover: ${interaction.hoverTreatment}`);
    if (interaction?.navigationReveal) parts.push(`Navigation: ${interaction.navigationReveal}`);
    if (interaction?.consistency) parts.push(`Consistency: ${interaction.consistency}`);
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
      brief.identity ? `IDENTITY: ${brief.identity}` : "",
      brief.composition ? `COMPOSITION: ${brief.composition}` : "",
      brief.messaging ? `MESSAGING: ${brief.messaging}` : "",
      brief.interaction ? `INTERACTION: ${brief.interaction}` : "",
      brief.libraryGuidance ? `LIBRARY: ${brief.libraryGuidance}` : "",
      brief.benchmarkSummary ? `BENCHMARK: ${brief.benchmarkSummary}` : "",
      "",
      "SECTIONS (in order):",
      (brief.sections.length
        ? brief.sections
        : ["- hero", "- features", "- cta", "- footer"]).join("\n"),
      "",
      "Use Tailwind. Keep spacing/radius/shadow vocabulary consistent with FlyRank Visual DNA.",
      brief.whitespace.length
        ? `Differentiate by: ${brief.whitespace.join(" | ")}`
        : "",
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
      brief.identity ? `Identity: ${brief.identity}` : "",
      brief.composition ? `Composition: ${brief.composition}` : "",
      brief.messaging ? `Messaging: ${brief.messaging}` : "",
      brief.benchmarkSummary ? `Category context: ${brief.benchmarkSummary}` : "",
      `Primary palette: ${brief.colors.slice(0, 6).join(", ")}`,
      `Typography: ${brief.fonts.join(", ") || "system-ui"}`,
      `Corner radius vocabulary: ${brief.radii}`,
      `Shadow vocabulary: ${brief.shadows}`,
      brief.libraryGuidance ? `Use: ${brief.libraryGuidance}` : "",
      brief.whitespace.length
        ? `Whitespace moves: ${brief.whitespace.join(" | ")}`
        : "",
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
      brief.identity ? `Identity: ${brief.identity}.` : "",
      brief.composition ? `Composition: ${brief.composition}.` : "",
      brief.messaging ? `Messaging: ${brief.messaging}.` : "",
      brief.benchmarkSummary ? `Benchmark context: ${brief.benchmarkSummary}.` : "",
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
      brief.whitespace.length
        ? `## Differentiation\n\n- ${brief.whitespace.join("\n- ")}`
        : "",
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
      brief.identity ? `Identity: ${brief.identity}.` : "",
      brief.composition ? `Composition: ${brief.composition}.` : "",
      brief.messaging ? `Messaging: ${brief.messaging}.` : "",
      brief.benchmarkSummary ? `Benchmark context: ${brief.benchmarkSummary}.` : "",
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
      brief.whitespace.length
        ? `Differentiate with: ${brief.whitespace.join(" | ")}`
        : "",
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
      brief.identity ? `Identity: ${brief.identity}` : "",
      brief.composition ? `Composition: ${brief.composition}` : "",
      brief.messaging ? `Messaging: ${brief.messaging}` : "",
      brief.interaction ? `Interaction: ${brief.interaction}` : "",
      brief.benchmarkSummary ? `Benchmark: ${brief.benchmarkSummary}` : "",
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
      brief.whitespace.length
        ? `Differentiate by: ${brief.whitespace.join(" | ")}`
        : "",
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
      brief.identity ? `Identity: ${brief.identity}` : "",
      brief.composition ? `Composition: ${brief.composition}` : "",
      brief.messaging ? `Messaging: ${brief.messaging}` : "",
      brief.benchmarkSummary ? `Benchmark: ${brief.benchmarkSummary}` : "",
      `Colors: ${brief.colors.join(", ")}`,
      `Fonts: ${brief.fonts.join(", ") || "system-ui"}`,
      `Radii: ${brief.radii}`,
      `Shadows: ${brief.shadows}`,
      brief.libraryGuidance ? `Library hint: ${brief.libraryGuidance}` : "",
      brief.whitespace.length
        ? `Differentiation hints: ${brief.whitespace.join(" | ")}`
        : "",
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

  public buildPromptPack(
    design: PromptDesignInput,
    benchmark?: BenchmarkContextInput,
  ): PromptPack {
    const brief = this.buildBrief(design, benchmark);
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

  public buildBrief(
    design: PromptDesignInput,
    benchmark?: BenchmarkContextInput,
  ): PromptBrief {
    const brief = this.briefBuilder.build(design);
    if (!benchmark) return brief;

    const dominantPatterns = benchmark.baseline?.dominantPatterns || {};
    const crowdedLanes = benchmark.baseline?.crowdedLanes || [];
    const whitespace = benchmark.whitespace?.opportunities || [];
    const topUnique = benchmark.topUniqueSignals?.[0];
    const summaryParts = [
      dominantPatterns.compositionStyle
        ? `Category composition leans ${dominantPatterns.compositionStyle}`
        : "",
      dominantPatterns.messagingPosture
        ? `messaging trends ${dominantPatterns.messagingPosture}`
        : "",
      crowdedLanes.length ? `crowded lanes: ${crowdedLanes.slice(0, 3).join(", ")}` : "",
      topUnique?.hostname && topUnique.signals?.length
        ? `${topUnique.hostname} owns ${topUnique.signals.slice(0, 2).join(", ")}`
        : "",
    ].filter(Boolean);

    return {
      ...brief,
      benchmarkSummary: summaryParts.join(" | "),
      whitespace: whitespace
        .map((entry) =>
          [entry.lane, entry.rationale].filter(Boolean).join(": "),
        )
        .slice(0, 3),
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

export function buildPromptPack(
  design: PromptDesignInput,
  benchmark?: BenchmarkContextInput,
): PromptPack {
  return promptPackGenerator.buildPromptPack(design, benchmark);
}

export function buildBenchmarkPromptPack(
  design: PromptDesignInput,
  benchmark: BenchmarkContextInput,
): PromptPack {
  return promptPackGenerator.buildPromptPack(design, benchmark);
}
