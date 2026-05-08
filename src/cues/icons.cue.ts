import { type CueExtractor } from "./cue.protocol";

export type IconSizeClass = "xs" | "sm" | "md" | "lg" | "xl";
export type IconVisualStyle = "outlined" | "filled" | "duo-tone";

export interface IconRawInput {
  svg: string;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
}

export interface IconExtractedItem {
  svg: string;
  size: { width?: number; height?: number };
  sizeClass: IconSizeClass;
  style: IconVisualStyle;
  colors: string[];
}

export interface IconExtractionResult {
  icons: IconExtractedItem[];
  sizeDistribution: Record<IconSizeClass, number>;
  dominantStyle: IconVisualStyle | "none";
  colorPalette: string[];
  count: number;
}

export class IconsCueExtractor
  implements CueExtractor<[iconData: IconRawInput[]], IconExtractionResult>
{
  private classifySize(width?: number, height?: number): IconSizeClass {
    const size = Math.max(width || 0, height || 0);
    if (size < 16) return "xs";
    if (size < 20) return "sm";
    if (size < 28) return "md";
    if (size < 40) return "lg";
    return "xl";
  }

  private cleanSvg(svg: string): string {
    return svg
      .replace(/\s*(data-[a-z-]*|class|id)="[^"]*"/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  private detectStyle(svg: string): IconVisualStyle {
    const hasStroke =
      /stroke="(?!none)[^"]+"|stroke-width="[^0"][^"]*"/.test(svg);
    const hasFill =
      /fill="(?!none|transparent)[^"]+"|<(rect|circle|path)[^>]*(?!fill="none")/.test(
        svg,
      );
    const fillNone = /fill="none"/.test(svg);
    if (hasStroke && (fillNone || !hasFill)) return "outlined";
    if (hasStroke && hasFill) return "duo-tone";
    return "filled";
  }

  private extractColors(svg: string): string[] {
    const colors = new Set<string>();
    for (const match of svg.matchAll(/(?:fill|stroke)="([^"]+)"/g)) {
      if (match[1] !== "none" && match[1] !== "transparent") colors.add(match[1]);
    }
    return [...colors];
  }

  extract(iconData: IconRawInput[] = []): IconExtractionResult {
    if (!iconData.length) {
      return {
        icons: [],
        sizeDistribution: { xs: 0, sm: 0, md: 0, lg: 0, xl: 0 },
        dominantStyle: "none",
        colorPalette: [],
        count: 0,
      };
    }

    const seen = new Map<string, IconRawInput>();
    for (const icon of iconData) {
      const key = this.cleanSvg(icon.svg || "");
      if (!seen.has(key)) seen.set(key, icon);
    }

    const sizeDistribution: Record<IconSizeClass, number> = {
      xs: 0,
      sm: 0,
      md: 0,
      lg: 0,
      xl: 0,
    };
    const styleCounts: Record<IconVisualStyle, number> = {
      outlined: 0,
      filled: 0,
      "duo-tone": 0,
    };
    const palette = new Set<string>();
    const icons: IconExtractedItem[] = [];

    for (const icon of seen.values()) {
      const cleanedSvg = this.cleanSvg(icon.svg || "");
      const sizeClass = this.classifySize(icon.width, icon.height);
      const style = this.detectStyle(icon.svg || "");
      const colors = this.extractColors(icon.svg || "");
      if (icon.fill && icon.fill !== "none") colors.push(icon.fill);
      if (icon.stroke && icon.stroke !== "none") colors.push(icon.stroke);
      const uniqueColors = [...new Set(colors)];

      sizeDistribution[sizeClass]++;
      styleCounts[style]++;
      uniqueColors.forEach((color) => palette.add(color));

      icons.push({
        svg: cleanedSvg,
        size: { width: icon.width, height: icon.height },
        sizeClass,
        style,
        colors: uniqueColors,
      });
    }

    const dominantStyle =
      ([...Object.entries(styleCounts)].sort((a, b) => b[1] - a[1])[0]?.[0] as
        | IconVisualStyle
        | undefined) || "none";

    return {
      icons,
      sizeDistribution,
      dominantStyle,
      colorPalette: [...palette],
      count: icons.length,
    };
  }
}

export function extractIcons(iconData: IconRawInput[] = []): IconExtractionResult {
  return new IconsCueExtractor().extract(iconData);
}
