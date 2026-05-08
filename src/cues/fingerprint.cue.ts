export interface StackSignals {
  windowGlobals?: string[];
  scripts?: string[];
  classNameSample?: string[];
}

interface TailwindFingerprint {
  detected: true;
  utilities: Array<{ utility: string; count: number }>;
}

const FRAMEWORK_BY_GLOBAL: Record<string, string> = {
  __NEXT_DATA__: "next",
  __NUXT__: "nuxt",
  ___gatsby: "gatsby",
  _remixContext: "remix",
  React: "react",
  Vue: "vue",
  Shopify: "shopify",
  wp: "wordpress",
};

const SCRIPT_PATTERNS: Array<[RegExp, string]> = [
  [/_next\/static/, "next"],
  [/\/nuxt\//, "nuxt"],
  [/\/astro\//, "astro"],
  [/\/sveltekit\//, "sveltekit"],
  [/shopify\./, "shopify"],
  [/wp-(content|includes)/, "wordpress"],
  [/webflow\.com/, "webflow"],
  [/framerusercontent/, "framer"],
];

const ANALYTICS: Record<string, RegExp> = {
  gtag: /googletagmanager\.com|google-analytics/,
  plausible: /plausible\.io/,
  posthog: /posthog\.com/,
  segment: /segment\.(io|com)/,
  mixpanel: /mixpanel/,
  amplitude: /amplitude/,
  hotjar: /hotjar/,
  vercelInsights: /\/_vercel\/insights/,
};

const TAILWIND_UTIL =
  /(^|\s)(flex|grid|block|inline|hidden|text-(xs|sm|base|lg|xl|\d+xl)|text-(gray|slate|zinc|red|blue|green|amber|neutral|stone)-\d+|bg-(gray|slate|zinc|red|blue|green|amber|neutral|stone)-\d+|p[xy]?-\d+|m[xy]?-\d+|gap-\d+|rounded(-\w+)?|shadow(-\w+)?|items-(start|center|end|baseline|stretch)|justify-(start|center|end|between|around|evenly)|grid-cols-\d+|col-span-\d+)(\s|$)/;

export class StackFingerprintExtractor {
  private detectFramework(signals: StackSignals): string {
    for (const g of signals.windowGlobals || []) {
      if (FRAMEWORK_BY_GLOBAL[g]) return FRAMEWORK_BY_GLOBAL[g];
    }
    for (const script of signals.scripts || []) {
      for (const [re, name] of SCRIPT_PATTERNS) if (re.test(script)) return name;
    }
    return "unknown";
  }

  private detectTailwind(signals: StackSignals): TailwindFingerprint | null {
    const classes = (signals.classNameSample || []).filter(
      (value): value is string => typeof value === "string",
    );
    const hits = classes.filter((value) => TAILWIND_UTIL.test(value));
    if (hits.length < Math.max(5, classes.length * 0.1)) return null;
    const utilFreq = new Map<string, number>();
    for (const className of hits) {
      for (const utility of className.split(/\s+/).filter(Boolean)) {
        utilFreq.set(utility, (utilFreq.get(utility) || 0) + 1);
      }
    }
    return {
      detected: true,
      utilities: [...utilFreq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 100)
        .map(([utility, count]) => ({ utility, count })),
    };
  }

  private detectAnalytics(signals: StackSignals): string[] {
    const found: string[] = [];
    for (const [name, re] of Object.entries(ANALYTICS)) {
      if ((signals.scripts || []).some((script) => re.test(script))) found.push(name);
    }
    return found;
  }

  extract(signals: StackSignals = {}) {
    const tailwind = this.detectTailwind(signals);
    return {
      framework: this.detectFramework(signals),
      css: {
        layer: tailwind ? "tailwind" : "unknown",
        tailwind: tailwind || null,
      },
      analytics: this.detectAnalytics(signals),
      detectedFrom: {
        globalCount: (signals.windowGlobals || []).length,
        scriptCount: (signals.scripts || []).length,
        classSampleSize: (signals.classNameSample || []).length,
      },
    };
  }
}

export function extractStackFingerprint(signals: StackSignals = {}) {
  return new StackFingerprintExtractor().extract(signals);
}
