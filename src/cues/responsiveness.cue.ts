import { launchChromium } from "@/helpers/playwright-runtime.helper";

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
  { name: "wide", width: 1920, height: 1080 },
];

interface ResponsiveSnapshot {
  name: string;
  width: number;
  height: number;
  bodyFontSize: string;
  headings: Record<string, { fontSize: string; lineHeight: string }>;
  navVisible: boolean;
  navHeight: number;
  gridCount: number;
  flexCount: number;
  maxColumns: number;
  hasHamburger: boolean;
  scrollHeight: number;
}

interface ResponsiveViewData {
  bodyFontSize: string;
  headings: Record<string, { fontSize: string; lineHeight: string }>;
  navVisible: boolean;
  navHeight: number;
  gridCount: number;
  flexCount: number;
  maxColumns: number;
  hasHamburger: boolean;
  scrollHeight: number;
}

interface ResponsiveErrorSnapshot {
  name: string;
  width: number;
  height: number;
  error: true;
}

function isResponsiveSnapshot(
  value: ResponsiveSnapshot | ResponsiveErrorSnapshot,
): value is ResponsiveSnapshot {
  return !("error" in value);
}

interface ResponsiveCaptureResult {
  viewports: ResponsiveSnapshot[];
  changes: Array<{
    from: string;
    to: string;
    breakpoint: string;
    diffs: Array<{ property: string; from: string; to: string }>;
  }>;
}

export class ResponsivenessCueCapture {
  async captureResponsive(
    url: string,
    options: { wait?: number } = {},
  ): Promise<ResponsiveCaptureResult> {
    const { wait = 0 } = options;
    const browser = await launchChromium({ headless: true });

    const snapshots: Array<ResponsiveSnapshot | ResponsiveErrorSnapshot> = [];

    for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
      await page.waitForLoadState("networkidle").catch(() => {});
      if (wait > 0) await page.waitForTimeout(wait);
      await page.evaluate(() => document.fonts.ready).catch(() => {});

      const data = await page.evaluate<ResponsiveViewData>(() => {
        const body = document.body;
        const cs = getComputedStyle(body);
        const html = document.documentElement;
        void html;

        // Collect key metrics at this viewport
        const headings: Record<string, { fontSize: string; lineHeight: string }> = {};
        for (let i = 1; i <= 3; i++) {
          const h = document.querySelector(`h1, h2, h3`.split(",")[i - 1]);
          if (h) {
            const hcs = getComputedStyle(h);
            headings[`h${i}`] = {
              fontSize: hcs.fontSize,
              lineHeight: hcs.lineHeight,
            };
          }
        }

        // Body font size
        const bodyFontSize = cs.fontSize;

        // Navigation visibility
        const nav = document.querySelector('nav, [role="navigation"]');
        const navVisible = nav
          ? getComputedStyle(nav).display !== "none"
          : false;
        const navHeight = nav ? nav.getBoundingClientRect().height : 0;

        // Count visible grid/flex containers
        let gridCount = 0,
          flexCount = 0;
        const allEls = document.querySelectorAll("*");
        const sample = Array.from(allEls).slice(0, 2000);
        for (const el of sample) {
          const d = getComputedStyle(el).display;
          if (d === "grid" || d === "inline-grid") gridCount++;
          if (d === "flex" || d === "inline-flex") flexCount++;
        }

        // Count columns in grids
        const grids = document.querySelectorAll("*");
        let maxColumns = 0;
        for (const el of Array.from(grids).slice(0, 1000)) {
          const gcs = getComputedStyle(el);
          if (
            gcs.display === "grid" &&
            gcs.gridTemplateColumns &&
            gcs.gridTemplateColumns !== "none"
          ) {
            const cols = gcs.gridTemplateColumns.split(/\s+/).length;
            if (cols > maxColumns) maxColumns = cols;
          }
        }

        // Check for hamburger menu
        const hamburger = document.querySelector(
          '[class*="hamburger"], [class*="menu-toggle"], [aria-label*="menu"], button[class*="mobile"]',
        );
        const hasHamburger = hamburger
          ? getComputedStyle(hamburger).display !== "none"
          : false;

        return {
          bodyFontSize,
          headings,
          navVisible,
          navHeight,
          gridCount,
          flexCount,
          maxColumns,
          hasHamburger,
          scrollHeight: document.documentElement.scrollHeight,
        };
      });

      snapshots.push({ ...vp, ...data });
    } catch {
      snapshots.push({ ...vp, error: true });
    }

    await context.close();
    }

    await browser.close();

  // Build responsive map — what changes between breakpoints
    const changes: Array<{
      from: string;
      to: string;
      breakpoint: string;
      diffs: Array<{ property: string; from: string; to: string }>;
    }> = [];
    for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];
    if (!isResponsiveSnapshot(prev) || !isResponsiveSnapshot(curr)) continue;

    const diffs: Array<{ property: string; from: string; to: string }> = [];
    if (prev.bodyFontSize !== curr.bodyFontSize) {
      diffs.push({
        property: "Body font size",
        from: prev.bodyFontSize,
        to: curr.bodyFontSize,
      });
    }
    if (prev.headings?.h1?.fontSize !== curr.headings?.h1?.fontSize) {
      diffs.push({
        property: "H1 size",
        from: prev.headings?.h1?.fontSize || "n/a",
        to: curr.headings?.h1?.fontSize || "n/a",
      });
    }
    if (prev.navVisible !== curr.navVisible) {
      diffs.push({
        property: "Nav visibility",
        from: prev.navVisible ? "visible" : "hidden",
        to: curr.navVisible ? "visible" : "hidden",
      });
    }
    if (prev.hasHamburger !== curr.hasHamburger) {
      diffs.push({
        property: "Hamburger menu",
        from: prev.hasHamburger ? "shown" : "hidden",
        to: curr.hasHamburger ? "shown" : "hidden",
      });
    }
    if (prev.maxColumns !== curr.maxColumns) {
      diffs.push({
        property: "Max grid columns",
        from: String(prev.maxColumns),
        to: String(curr.maxColumns),
      });
    }
    if (Math.abs(prev.scrollHeight - curr.scrollHeight) > 200) {
      diffs.push({
        property: "Page height",
        from: `${prev.scrollHeight}px`,
        to: `${curr.scrollHeight}px`,
      });
    }

    if (diffs.length > 0) {
      changes.push({
        from: prev.name,
        to: curr.name,
        breakpoint: `${prev.width}px → ${curr.width}px`,
        diffs,
      });
    }
    }

    return { viewports: snapshots.filter(isResponsiveSnapshot), changes };
  }
}

export async function captureResponsive(
  url: string,
  options: { wait?: number } = {},
): Promise<ResponsiveCaptureResult> {
  return new ResponsivenessCueCapture().captureResponsive(url, options);
}
