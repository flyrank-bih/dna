import { chromium } from "playwright";

const THIRD_PARTY_HOSTS = [
  "google-analytics",
  "googletagmanager",
  "analytics.google",
  "segment.",
  "mixpanel",
  "amplitude",
  "posthog",
  "intercom",
  "hotjar",
  "fullstory",
  "sentry",
  "datadog",
  "cloudflare",
  "fastly",
  "doubleclick",
  "facebook.net",
  "adservice.google",
  "hs-analytics",
  "stripe.com",
  "recaptcha",
  "hcaptcha",
  "sentry-cdn",
  "optimizely",
  "statsig",
];

type RequestType = "js" | "css" | "font" | "image" | "document" | "other";

interface NetworkRequestRow {
  url: string;
  method: string;
  status: number;
  type: RequestType;
  bytes: number;
  fromCache: boolean;
}

function categorize(url: string): RequestType {
  if (!url) return "other";
  if (/\.(js|mjs)(?:\?|$)/i.test(url)) return "js";
  if (/\.(css)(?:\?|$)/i.test(url)) return "css";
  if (/\.(woff2?|ttf|otf|eot)(?:\?|$)/i.test(url)) return "font";
  if (/\.(png|jpe?g|webp|avif|gif|svg|ico)(?:\?|$)/i.test(url)) return "image";
  if (/fonts\.gstatic|fonts\.googleapis/.test(url)) return "font";
  if (/\.(html?)(?:\?|$)/i.test(url)) return "document";
  return "other";
}

function isThirdParty(resUrl: string, pageHost: string) {
  try {
    const u = new URL(resUrl);
    if (u.hostname === pageHost) return false;
    if (THIRD_PARTY_HOSTS.some((h) => u.hostname.includes(h))) return true;
    return u.hostname !== pageHost;
  } catch {
    return false;
  }
}

function fontLoadingStrategy(
  stack: { classNameSample?: string[]; metas?: Array<{ name?: string; content?: string }> } = {},
) {
  const classes = (stack.classNameSample || []).join(" ");
  const metas = (stack.metas || [])
    .map((m) => `${m.name || ""}=${m.content || ""}`)
    .join(" ");
  const preloadCount = (
    (metas + classes).match(/preload|rel=["']preload/g) || []
  ).length;
  return { preloadCount };
}

interface CoreWebVitalOptions {
  width?: number;
  height?: number;
  channel?: string;
  timeout?: number;
}

interface FontLoadingInput {
  classNameSample?: string[];
  metas?: Array<{ name?: string; content?: string }>;
}

export class PerformanceCueCapture {
  async captureCoreWebVitals(
    url: string,
    {
      width = 1280,
      height = 800,
      channel,
      timeout = 30000,
    }: CoreWebVitalOptions = {},
  ) {
    const browser = await chromium.launch({
      headless: true,
      ...(channel && { channel }),
    });
    try {
      const ctx = await browser.newContext({
        viewport: { width, height },
        colorScheme: "light",
      });
      const page = await ctx.newPage();

      const requests: NetworkRequestRow[] = [];
      page.on("response", async (res) => {
        try {
          const req = res.request();
          const headers = res.headers();
          const contentLength = Number(headers["content-length"] || 0);
          requests.push({
            url: res.url(),
            method: req.method(),
            status: res.status(),
            type: categorize(res.url()),
            bytes: contentLength,
            fromCache:
              res.fromServiceWorker() || /hit/i.test(headers["x-cache"] || ""),
          });
        } catch {
          return;
        }
      });

      await page.addInitScript(() => {
      const win = window as unknown as Window & {
        __dlVitals: { lcp: number; cls: number; inp: number };
      };
      win.__dlVitals = { lcp: 0, cls: 0, inp: 0 };
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) win.__dlVitals.lcp = e.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        void 0;
      }
      try {
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            const layoutShift = e as PerformanceEntry & {
              hadRecentInput?: boolean;
              value?: number;
            };
            if (!layoutShift.hadRecentInput) cls += layoutShift.value || 0;
          }
          win.__dlVitals.cls = cls;
        }).observe({ type: "layout-shift", buffered: true });
      } catch {
        void 0;
      }
      try {
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            const eventTiming = e as PerformanceEntry & { duration?: number };
            if ((eventTiming.duration || 0) > win.__dlVitals.inp)
              win.__dlVitals.inp = eventTiming.duration || 0;
          }
        }).observe({
          type: "event",
          buffered: true,
        } as PerformanceObserverInit & { durationThreshold?: number });
      } catch {
        void 0;
      }
      });

      const start = Date.now();
      await page
        .goto(url, { waitUntil: "domcontentloaded", timeout })
        .catch(() => {});
      await page.waitForLoadState("networkidle").catch(() => {});
      await page.mouse.move(100, 100);
      await page.mouse.click(100, 100).catch(() => {});
      await page.waitForTimeout(1200);

      const ttfbish = Date.now() - start;
      const vitals = await page.evaluate(() => {
      const win = window as unknown as Window & {
        __dlVitals?: { lcp?: number; cls?: number; inp?: number };
      };
      return { ...(win.__dlVitals || {}) };
      });
      const lcpValue = vitals.lcp || 0;
      const clsValue = vitals.cls || 0;
      const inpValue = vitals.inp || 0;
      const pageHost = new URL(url).hostname;

      const totals = { js: 0, css: 0, font: 0, image: 0, document: 0, other: 0 };
      const counts = { js: 0, css: 0, font: 0, image: 0, document: 0, other: 0 };
      let thirdPartyCount = 0;
      let thirdPartyBytes = 0;
      for (const r of requests) {
      totals[r.type] = (totals[r.type] || 0) + (r.bytes || 0);
      counts[r.type] = (counts[r.type] || 0) + 1;
      if (isThirdParty(r.url, pageHost)) {
        thirdPartyCount++;
        thirdPartyBytes += r.bytes || 0;
      }
      }

      return {
      vitals: {
        lcp: Math.round(lcpValue),
        cls: Number(clsValue.toFixed(4)),
        inp: Math.round(inpValue),
        // Rough classification vs Google's good/needs-improvement thresholds.
        lcpGrade:
          lcpValue < 2500
            ? "good"
            : lcpValue < 4000
              ? "needs-improvement"
              : "poor",
        clsGrade:
          clsValue < 0.1
            ? "good"
            : clsValue < 0.25
              ? "needs-improvement"
              : "poor",
      },
      ttfbApprox: ttfbish,
      bytes: totals,
      counts,
      thirdParty: { count: thirdPartyCount, bytes: thirdPartyBytes },
      requestsTotal: requests.length,
      };
    } finally {
      await browser.close();
    }
  }

  extractFontLoading(stack: FontLoadingInput = {}) {
    return fontLoadingStrategy(stack);
  }
}

export function captureCoreWebVitals(url: string, options: CoreWebVitalOptions = {}) {
  return new PerformanceCueCapture().captureCoreWebVitals(url, options);
}

export function extractFontLoading(stack: FontLoadingInput = {}) {
  return new PerformanceCueCapture().extractFontLoading(stack);
}
