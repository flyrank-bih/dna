import { mkdirSync } from "fs";
import { join } from "path";
import { launchChromium } from "@/helpers/playwright-runtime.helper";

const CANDIDATE_SELECTOR =
  'button, a[role="button"], .btn, [class*="button"], input[type="text"], input[type="email"], input[type="search"], textarea, [class*="card"]';

const FALLBACK_GROUPS = [
  {
    slug: "button",
    selector:
      'button:not(:empty), a[role="button"], [class*="btn"]:not(:empty)',
  },
  { slug: "card", selector: '[class*="card"]:not(:empty)' },
  {
    slug: "input",
    selector:
      'input[type="text"], input[type="email"], input[type="search"], textarea',
  },
  { slug: "nav", selector: 'nav, [role="navigation"]' },
  { slug: "hero", selector: '[class*="hero"], section:first-of-type' },
];

interface ClusterEntry {
  ix: number;
  w: number;
  h: number;
  kind: string;
  variant: string;
  size: string;
}

interface ScreenshotRecord {
  cluster: string;
  variant: number;
  path: string;
  bounds: { w: number; h: number };
  kind?: string;
  variantHint?: string;
  sizeHint?: string;
  retina: boolean;
  fallback?: boolean;
}

interface ElementHandleLike {
  screenshot(options: { path: string; omitBackground?: boolean }): Promise<unknown>;
  boundingBox(): Promise<{ width: number; height: number } | null>;
}

interface PageLike {
  evaluate<T>(fn: () => T | Promise<T>): Promise<T>;
  evaluate<T, A>(fn: (arg: A) => T | Promise<T>, arg: A): Promise<T>;
  $(selector: string): Promise<ElementHandleLike | null>;
  $$(selector: string): Promise<ElementHandleLike[]>;
  goto(
    url: string,
    options?: { waitUntil?: "domcontentloaded" | "load" | "networkidle" | "commit"; timeout?: number },
  ): Promise<unknown>;
  waitForLoadState(state: "domcontentloaded" | "load" | "networkidle"): Promise<void>;
  waitForTimeout(ms: number): Promise<void>;
  screenshot(options: { path: string; fullPage?: boolean }): Promise<unknown>;
}

function slugify(s: string) {
  return (
    (s || "component")
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "component"
  );
}

async function collectClusteredHandles(
  page: PageLike,
): Promise<Record<string, ClusterEntry[]>> {
  // In-page classification mirrors what the crawler does for candidates but
  // returns enough to screenshot (unique index so we can re-find handles).
  const groups = await page.evaluate((sel) => {
    const out: Record<string, ClusterEntry[]> = {};
    let ix = 0;
    for (const el of document.querySelectorAll(sel)) {
      const r = el.getBoundingClientRect();
      if (r.width < 20 || r.height < 10) continue;
      if (r.width > window.innerWidth || r.height > window.innerHeight * 2)
        continue;
      const cs = getComputedStyle(el);
      if (
        cs.visibility === "hidden" ||
        cs.display === "none" ||
        parseFloat(cs.opacity) < 0.1
      )
        continue;

      const tag = el.tagName.toLowerCase();
      const cls =
        typeof el.className === "string" ? el.className.toLowerCase() : "";
      let kind = "other";
      if (
        tag === "button" ||
        el.getAttribute("role") === "button" ||
        /\bbtn\b|button/.test(cls)
      )
        kind = "button";
      else if (tag === "input" || tag === "textarea") kind = "input";
      else if (/card/.test(cls)) kind = "card";
      else if (tag === "a") kind = "link";

      const variant =
        (cls.match(
          /\b(primary|secondary|tertiary|ghost|outline|solid|destructive|danger|success|warning|subtle)\b/,
        ) || [])[1] || "default";
      const size =
        (cls.match(/\b(xs|sm|md|lg|xl|small|medium|large)\b/) || [])[1] || "";

      const key = [kind, variant, size].filter(Boolean).join("--");
      if (!out[key]) out[key] = [];
      el.setAttribute("data-dl-shot", String(ix));
      out[key].push({
        ix,
        w: Math.round(r.width),
        h: Math.round(r.height),
        kind,
        variant,
        size,
      });
      ix++;
    }
    return out;
  }, CANDIDATE_SELECTOR);
  return groups;
}

async function captureGroup(
  page: PageLike,
  key: string,
  entries: ClusterEntry[],
  screenshotDir: string,
  maxPerGroup = 3,
): Promise<ScreenshotRecord[]> {
  const out: ScreenshotRecord[] = [];
  const slug = slugify(key);
  let variant = 0;
  for (const info of entries.slice(0, maxPerGroup)) {
    const handle = await page.$(`[data-dl-shot="${info.ix}"]`);
    if (!handle) continue;
    const file = `${slug}-${variant}.png`;
    const path = join(screenshotDir, file);
    try {
      await handle.screenshot({ path, omitBackground: false });
    } catch {
      continue;
    }
    out.push({
      cluster: key,
      variant,
      path: `screenshots/${file}`,
      bounds: { w: info.w, h: info.h },
      kind: info.kind,
      variantHint: info.variant,
      sizeHint: info.size,
      retina: true,
    });
    variant++;
  }
  return out;
}

async function captureFallbacks(
  page: PageLike,
  screenshotDir: string,
): Promise<ScreenshotRecord[]> {
  const out: ScreenshotRecord[] = [];
  for (const g of FALLBACK_GROUPS) {
    try {
      const handles = await page.$$(g.selector);
      for (const h of handles.slice(0, 2)) {
        const box = await h.boundingBox();
        if (!box || box.width < 20 || box.height < 10) continue;
        const path = join(
          screenshotDir,
          `${g.slug}-${out.filter((x) => x.cluster === g.slug).length}.png`,
        );
        await h.screenshot({ path });
        out.push({
          cluster: g.slug,
          variant: out.filter((x) => x.cluster === g.slug).length,
          path: `screenshots/${path.split("screenshots/")[1]}`,
          bounds: { w: Math.round(box.width), h: Math.round(box.height) },
          retina: true,
          fallback: true,
        });
      }
    } catch {
      continue;
    }
  }
  return out;
}

interface ScreenshotCaptureResult {
  components: ScreenshotRecord[];
  fullPage: { path: string; retina: boolean } | null;
  count: number;
}

export class ComponentScreenshotCueCapture {
  async captureComponentScreenshotsV10(
    url: string,
    outDir: string,
    {
      width = 1280,
      height = 800,
    }: { width?: number; height?: number } = {},
  ): Promise<ScreenshotCaptureResult> {
    const screenshotDir = join(outDir, "screenshots");
    mkdirSync(screenshotDir, { recursive: true });

    const browser = await launchChromium({
      headless: true,
    });
    try {
      const context = await browser.newContext({
        viewport: { width, height },
        deviceScaleFactor: 2,
        colorScheme: "light",
      });
      const page = await context.newPage();
      await page
        .goto(url, { waitUntil: "domcontentloaded", timeout: 30000 })
        .catch(() => {});
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.evaluate(() => document.fonts.ready).catch(() => {});

      const groups = await collectClusteredHandles(page);
      let components: ScreenshotRecord[] = [];
      for (const [key, entries] of Object.entries(groups)) {
        if (!entries.length) continue;
        const rows = await captureGroup(page, key, entries, screenshotDir);
        components.push(...rows);
      }

      if (!components.length) {
        components = await captureFallbacks(page, screenshotDir);
      }

      let fullPage = null;
      try {
        const p = join(screenshotDir, "full-page.png");
        await page.screenshot({ path: p, fullPage: true });
        fullPage = { path: "screenshots/full-page.png", retina: true };
      } catch {
        void 0;
      }

      return { components, fullPage, count: components.length };
    } finally {
      await browser.close();
    }
  }
}

export async function captureComponentScreenshotsV10(
  url: string,
  outDir: string,
  options: { width?: number; height?: number } = {},
): Promise<ScreenshotCaptureResult> {
  return new ComponentScreenshotCueCapture().captureComponentScreenshotsV10(
    url,
    outDir,
    options,
  );
  }
