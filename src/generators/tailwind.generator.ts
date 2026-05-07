/**
 * @file tailwind generator
 * @description Generated/formatting utilities used by FlyRank Visual DNA.
 */

import { generateHslScale, type ParsedColor } from "@/helpers/color.helpers";
import type { DesignSystem as BaseDesignSystem } from "@/helpers/token-formatter.helper";

interface Breakpoint {
  label: string;
  value: number | string;
  type?: string;
}

interface AnimationDuration {
  value: string;
}

interface AnimationEasing {
  value: string;
}

interface ContainerWidth {
  maxWidth: string;
  padding?: string;
}

type DesignSystem = Omit<BaseDesignSystem, "typography" | "breakpoints"> & {
  typography: {
    families: Array<{ name: string; usage: string }>;
    scale: Array<{
      size: number;
      lineHeight?: string | number;
      letterSpacing?: string;
    }>;
  };
  breakpoints: Breakpoint[];
  animations?: {
    durations: AnimationDuration[];
    easings: (string | AnimationEasing)[];
  };
  layout?: {
    containerWidths: ContainerWidth[];
  };
};

interface TailwindConfig {
  colors?: Record<string, string | Record<string, string>>;
  fontFamily?: Record<string, string[]>;
  fontSize?: Record<string, [string, Record<string, string | number>?]>;
  spacing?: Record<string, string>;
  borderRadius?: Record<string, string>;
  boxShadow?: Record<string, string>;
  screens?: Record<string, string>;
  transitionDuration?: Record<string, string>;
  transitionTimingFunction?: Record<string, string>;
  container?: Record<string, boolean | string>;
  maxWidth?: Record<string, string>;
}

class TailwindThemeGenerator {
  private config: TailwindConfig;

  constructor(design: DesignSystem) {
    this.config = {
      colors: {},
      fontFamily: {},
      fontSize: {},
      spacing: {},
      borderRadius: {},
      boxShadow: {},
      screens: {},
    };
    this.generate(design);
  }

  private generate(design: DesignSystem): void {
    this.generateColors(design);
    this.generateTypography(design);
    this.generateSpacing(design);
    this.generateBorderRadius(design);
    this.generateShadows(design);
    this.generateBreakpoints(design);
    this.generateAnimations(design);
    this.generateContainer(design);
    this.cleanEmptyObjects();
  }

  private generateColors(design: DesignSystem): void {
    const paletteKeys = ["primary", "secondary", "accent"] as const;
    for (const key of paletteKeys) {
      const color = design.colors[key];
      if (!color) continue;
      this.config.colors![key] = {
        ...generateHslScale(color.hex, color as ParsedColor),
        DEFAULT: color.hex,
      };
    }

    for (let i = 0; i < Math.min(design.colors.neutrals.length, 10); i++) {
      this.config.colors![`neutral-${i * 100 || 50}`] =
        design.colors.neutrals[i].hex;
    }

    if (design.colors.backgrounds.length > 0) {
      this.config.colors!.background = design.colors.backgrounds[0];
    }
    if (design.colors.text.length > 0) {
      this.config.colors!.foreground = design.colors.text[0];
    }
  }

  private generateTypography(design: DesignSystem): void {
    for (let i = 0; i < design.typography.families.length; i++) {
      const f = design.typography.families[i];
      const key = this.getFontFamilyKey(f, i);

      this.config.fontFamily![key] = [f.name, "sans-serif"];
    }

    for (const s of design.typography.scale.slice(0, 15)) {
      const lineHeight = s.lineHeight !== undefined ? s.lineHeight : undefined;
      const letterSpacing =
        s.letterSpacing !== "normal" ? s.letterSpacing : undefined;

      this.config.fontSize![`${s.size}`] = [
        `${s.size}px`,
        letterSpacing || lineHeight ? { lineHeight, letterSpacing } : undefined,
      ];
    }
  }

  private generateSpacing(design: DesignSystem): void {
    for (const [name, value] of Object.entries(design.spacing.tokens)) {
      this.config.spacing![name] = value;
    }
  }

  private generateBorderRadius(design: DesignSystem): void {
    for (const r of design.borders.radii) {
      this.config.borderRadius![r.label] = `${r.value}px`;
    }
  }

  private generateShadows(design: DesignSystem): void {
    for (const s of design.shadows.values) {
      this.config.boxShadow![s.label] = s.raw;
    }
  }

  private generateBreakpoints(design: DesignSystem): void {
    for (const bp of design.breakpoints) {
      if (bp.type === "min-width") {
        this.config.screens![bp.label] = `${bp.value}px`;
      }
    }
  }

  private generateAnimations(design: DesignSystem): void {
    if (!design.animations) return;

    if (design.animations.durations.length > 0) {
      this.config.transitionDuration = {};
      for (const d of design.animations.durations) {
        const ms = d.value.endsWith("ms")
          ? parseInt(d.value)
          : parseFloat(d.value) * 1000;
        this.config.transitionDuration![`${ms}`] = d.value;
      }
    }

    if (design.animations.easings.length > 0) {
      this.config.transitionTimingFunction = {};
      for (const e of design.animations.easings) {
        const val = typeof e === "object" ? e.value : e;
        const name = val.startsWith("cubic-bezier")
          ? "custom"
          : val.replace(/ease-?/g, "").replace(/-/g, "") || "default";
        this.config.transitionTimingFunction![name] = val;
      }
    }
  }

  private generateContainer(design: DesignSystem): void {
    if (!design.layout || design.layout.containerWidths.length === 0) return;

    const container = design.layout.containerWidths[0];
    this.config.container = {
      center: true,
      padding: container.padding || "1rem",
    };
    if (container.maxWidth) {
      this.config.maxWidth = { container: container.maxWidth };
    }
  }

  private cleanEmptyObjects(): void {
    for (const [key, val] of Object.entries(this.config)) {
      if (
        typeof val === "object" &&
        val !== null &&
        Object.keys(val).length === 0
      ) {
        delete this.config[key as keyof TailwindConfig];
      }
    }
  }

  private getFontFamilyKey(
    family: { name: string; usage: string },
    index: number,
  ): string {
    if (family.usage === "headings") return "heading";
    if (family.usage === "body") return "body";
    if (index === 0) return "sans";
    if (family.name.toLowerCase().includes("mono")) return "mono";
    return index === 1 ? "heading" : `font${index}`;
  }

  public format(): string {
    const configStr = JSON.stringify(this.config, null, 4)
      .replace(/"([a-zA-Z_]\w*)":/g, "$1:")
      .replace(/"/g, "'");

    return `/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: ${configStr},
  },
};
`;
  }
}
export function formatTailwind(design: DesignSystem): string {
  const generator = new TailwindThemeGenerator(design);
  return generator.format();
}
