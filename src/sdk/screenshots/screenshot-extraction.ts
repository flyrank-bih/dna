import { captureResponsiveScreenshots } from "@/cues/responsive-screenshot.cue";
import { captureComponentScreenshotsV10 } from "@/cues/screenshot.cue";

export interface ScreenshotExtractOptions {
  outDir: string;
  components?: boolean;
  fullPage?: boolean;
  responsive?: boolean;
  includeDark?: boolean;
  width?: number;
  height?: number;
}

export interface ScreenshotAsset {
  kind: "component" | "full-page" | "responsive";
  path: string;
  label: string;
  viewport?: {
    width?: number;
    height?: number;
    breakpoint?: string;
    scheme?: string;
  };
  cluster?: string;
  variant?: number;
  retina?: boolean;
  fallback?: boolean;
}

export interface ScreenshotExtractionResult {
  generatedAt: string;
  outputDir: string;
  count: number;
  components: ScreenshotAsset[];
  fullPage: ScreenshotAsset[];
  responsive: ScreenshotAsset[];
}

interface ComponentScreenshotEntry {
  cluster: string;
  variant: number;
  path: string;
  bounds?: { w?: number; h?: number };
  retina?: boolean;
  fallback?: boolean;
}

interface ResponsiveShotEntry {
  breakpoint: string;
  scheme: string;
  width: number;
  path: string;
}

export function mapComponentScreenshotAssets(
  entries: ComponentScreenshotEntry[],
): ScreenshotAsset[] {
  return entries.map((entry) => ({
    kind: "component",
    path: entry.path,
    label: entry.cluster,
    viewport: {
      width: entry.bounds?.w,
      height: entry.bounds?.h,
    },
    cluster: entry.cluster,
    variant: entry.variant,
    retina: entry.retina,
    fallback: entry.fallback,
  }));
}

export function mapResponsiveScreenshotAssets(
  shots: ResponsiveShotEntry[],
): ScreenshotAsset[] {
  return shots.map((shot) => ({
    kind: "responsive",
    path: shot.path,
    label: `${shot.breakpoint} ${shot.scheme}`,
    viewport: {
      width: shot.width,
      breakpoint: shot.breakpoint,
      scheme: shot.scheme,
    },
  }));
}

export async function extractScreenshotsForUrl(
  url: string,
  options: ScreenshotExtractOptions,
): Promise<ScreenshotExtractionResult> {
  const result: ScreenshotExtractionResult = {
    generatedAt: new Date().toISOString(),
    outputDir: options.outDir,
    count: 0,
    components: [],
    fullPage: [],
    responsive: [],
  };

  if (options.components || options.fullPage) {
    const componentResult = await captureComponentScreenshotsV10(url, options.outDir, {
      width: options.width,
      height: options.height,
    });
    if (options.components) {
      result.components = mapComponentScreenshotAssets(componentResult.components);
    }
    if (options.fullPage && componentResult.fullPage) {
      result.fullPage = [
        {
          kind: "full-page",
          path: componentResult.fullPage.path,
          label: "Full Page",
          retina: componentResult.fullPage.retina,
        },
      ];
    }
  }

  if (options.responsive) {
    const responsiveResult = await captureResponsiveScreenshots(url, options.outDir, {
      includeDark: options.includeDark ?? true,
    });
    result.responsive = mapResponsiveScreenshotAssets(
      responsiveResult.shots.filter(
        (shot): shot is ResponsiveShotEntry => "path" in shot,
      ),
    );
  }

  result.count =
    result.components.length + result.fullPage.length + result.responsive.length;
  return result;
}
