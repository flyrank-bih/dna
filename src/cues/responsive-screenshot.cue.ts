import { chromium } from "playwright";
import { mkdirSync } from "fs";
import { join } from "path";

const BREAKPOINTS = [
  { slug: "mobile", width: 375, height: 812 },
  { slug: "tablet", width: 768, height: 1024 },
  { slug: "desktop", width: 1280, height: 800 },
  { slug: "wide", width: 1920, height: 1080 },
];

interface Breakpoint {
  slug: string;
  width: number;
  height: number;
}

interface ResponsiveShot {
  breakpoint: string;
  scheme: string;
  width: number;
  path: string;
}

interface ResponsiveShotError {
  breakpoint: string;
  scheme: string;
  error: string;
}

async function captureAt(
  url: string,
  dir: string,
  bp: Breakpoint,
  scheme: "light" | "dark",
  channel?: string,
): Promise<ResponsiveShot> {
  const browser = await chromium.launch({
    headless: true,
    ...(channel && { channel }),
  });
  try {
    const ctx = await browser.newContext({
      viewport: { width: bp.width, height: bp.height },
      deviceScaleFactor: bp.slug === "mobile" ? 2 : 1,
      colorScheme: scheme,
    });
    const page = await ctx.newPage();
    await page
      .goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })
      .catch(() => {});
    await page.waitForLoadState("networkidle").catch(() => {});
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    const file = `${bp.slug}-${scheme}.png`;
    const path = join(dir, file);
    await page.screenshot({ path, fullPage: true });
    return {
      breakpoint: bp.slug,
      scheme,
      width: bp.width,
      path: `screenshots/responsive/${file}`,
    };
  } finally {
    await browser.close();
  }
}

export class ResponsiveScreenshotCueCapture {
  async captureResponsiveScreenshots(
  url: string,
  outDir: string,
  {
    includeDark = true,
    channel,
  }: { includeDark?: boolean; channel?: string } = {},
) {
  const dir = join(outDir, "screenshots", "responsive");
  mkdirSync(dir, { recursive: true });
  const out: Array<ResponsiveShot | ResponsiveShotError> = [];
  const schemes: Array<"light" | "dark"> = includeDark
    ? ["light", "dark"]
    : ["light"];
  for (const bp of BREAKPOINTS) {
    for (const scheme of schemes) {
      try {
        const row = await captureAt(url, dir, bp, scheme, channel);
        out.push(row);
      } catch (error) {
        out.push({
          breakpoint: bp.slug,
          scheme,
          error: error instanceof Error ? error.message : "capture failed",
        });
      }
    }
  }
  return {
    count: out.filter((row): row is ResponsiveShot => !("error" in row)).length,
    shots: out,
  };
  }
}

export async function captureResponsiveScreenshots(
  url: string,
  outDir: string,
  options: { includeDark?: boolean; channel?: string } = {},
) {
  return new ResponsiveScreenshotCueCapture().captureResponsiveScreenshots(
    url,
    outDir,
    options,
  );
}
