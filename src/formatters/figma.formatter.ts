/**
 * @file figma formatter
 * @description Generates Figma Variables import JSON from FlyRank Visual DNA output.
 */

interface FigmaDesignInput {
  colors: {
    primary?: { hex: string };
    secondary?: { hex: string };
    accent?: { hex: string };
    neutrals: Array<{ hex: string }>;
    backgrounds: string[];
    text: string[];
  };
  darkMode?: {
    colors: {
      primary?: { hex: string };
      secondary?: { hex: string };
      accent?: { hex: string };
      neutrals: Array<{ hex: string }>;
      backgrounds: string[];
      text: string[];
    };
  };
  typography: {
    scale: Array<{ size: number; weight?: string; lineHeight?: string }>;
  };
  spacing: {
    scale: number[];
  };
  borders: {
    radii: Array<{ label: string; value: number }>;
  };
}

type FigmaColor = { r: number; g: number; b: number; a: number };
type FigmaVariable = {
  name: string;
  type: "COLOR" | "FLOAT";
  values: Record<string, FigmaColor | number>;
};

class FigmaFormatter {
  constructor(private readonly design: FigmaDesignInput) {}

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  private colorVal(hex: string): FigmaColor {
    const rgb = this.hexToRgb(hex);
    return { r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255, a: 1 };
  }

  private pushColorVar(
    vars: FigmaVariable[],
    name: string,
    light: string,
    dark?: string,
    hasDarkMode?: boolean,
  ): void {
    const variable: FigmaVariable = {
      name,
      type: "COLOR",
      values: { light: this.colorVal(light) },
    };
    if (hasDarkMode) variable.values.dark = this.colorVal(dark || light);
    vars.push(variable);
  }

  private buildBrandCollection(): { name: string; modes: string[]; variables: FigmaVariable[] } {
    const hasDarkMode = !!this.design.darkMode;
    const modes = hasDarkMode ? ["light", "dark"] : ["light"];
    const variables: FigmaVariable[] = [];

    const light = this.design.colors;
    const dark = this.design.darkMode?.colors;

    if (light.primary) this.pushColorVar(variables, "color/primary", light.primary.hex, dark?.primary?.hex, hasDarkMode);
    if (light.secondary) this.pushColorVar(variables, "color/secondary", light.secondary.hex, dark?.secondary?.hex, hasDarkMode);
    if (light.accent) this.pushColorVar(variables, "color/accent", light.accent.hex, dark?.accent?.hex, hasDarkMode);

    for (let i = 0; i < Math.min(light.neutrals.length, 10); i++) {
      const label = i * 100 || 50;
      this.pushColorVar(variables, `color/neutral/${label}`, light.neutrals[i].hex, dark?.neutrals?.[i]?.hex, hasDarkMode);
    }
    for (let i = 0; i < light.backgrounds.length; i++) {
      const label = i === 0 ? "default" : `${i}`;
      this.pushColorVar(variables, `color/background/${label}`, light.backgrounds[i], dark?.backgrounds?.[i], hasDarkMode);
    }
    for (let i = 0; i < Math.min(light.text.length, 5); i++) {
      const label = i === 0 ? "default" : `${i}`;
      this.pushColorVar(variables, `color/text/${label}`, light.text[i], dark?.text?.[i], hasDarkMode);
    }

    return { name: "Brand", modes, variables };
  }

  private buildTypographyCollection(): { name: string; modes: string[]; variables: FigmaVariable[] } | null {
    const variables: FigmaVariable[] = [];
    for (const scale of this.design.typography.scale.slice(0, 12)) {
      variables.push({ name: `font/size/${scale.size}`, type: "FLOAT", values: { default: scale.size } });
      if (scale.weight) {
        variables.push({
          name: `font/weight/${scale.size}`,
          type: "FLOAT",
          values: { default: parseInt(scale.weight, 10) || 400 },
        });
      }
      if (scale.lineHeight && scale.lineHeight !== "normal") {
        const lineHeight = parseFloat(scale.lineHeight);
        if (!Number.isNaN(lineHeight)) {
          variables.push({ name: `font/lineHeight/${scale.size}`, type: "FLOAT", values: { default: lineHeight } });
        }
      }
    }
    if (!variables.length) return null;
    return { name: "Typography", modes: ["default"], variables };
  }

  private buildSpacingCollection(): { name: string; modes: string[]; variables: FigmaVariable[] } | null {
    const variables: FigmaVariable[] = [];
    for (const value of this.design.spacing.scale.slice(0, 20)) {
      variables.push({ name: `spacing/${value}`, type: "FLOAT", values: { default: value } });
    }
    for (const radius of this.design.borders.radii) {
      variables.push({ name: `radius/${radius.label}`, type: "FLOAT", values: { default: radius.value } });
    }
    if (!variables.length) return null;
    return { name: "Spacing", modes: ["default"], variables };
  }

  public format(): string {
    const collections: Array<{ name: string; modes: string[]; variables: FigmaVariable[] }> = [];
    collections.push(this.buildBrandCollection());
    const typography = this.buildTypographyCollection();
    const spacing = this.buildSpacingCollection();
    if (typography) collections.push(typography);
    if (spacing) collections.push(spacing);
    return JSON.stringify({ collections }, null, 2);
  }
}

export function formatFigma(design: FigmaDesignInput): string {
  return new FigmaFormatter(design).format();
}
