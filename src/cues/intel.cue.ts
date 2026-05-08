export const CMS = [
  { id: "webflow", re: /webflow\.com|wf-|\.webflow\./i },
  { id: "framer", re: /framer\.(?:com|website)|__framer|framer-motion\b/i },
  { id: "shopify", re: /cdn\.shopify|shopify\.com|x-shopify/i },
  { id: "ghost", re: /ghost\.io|__ghost_|ghost-url/i },
  { id: "sanity", re: /cdn\.sanity\.io|sanity-studio/i },
  { id: "contentful", re: /cdn\.contentful\.com|ctfassets\.net/i },
  { id: "wix", re: /parastorage\.com|\.wix\.com/i },
  { id: "squarespace", re: /squarespace\.com|sqspcdn\.com|squarespace-cdn/i },
  { id: "wordpress", re: /wp-content|wp-includes|wordpress/i },
  { id: "hashnode", re: /hashnode\.com/i },
  { id: "notion", re: /notion\.so\/image|notion-static/i },
  { id: "bubble", re: /bubble\.io|bubble-cdn/i },
] as const;

export const ANALYTICS = [
  {
    id: "google-analytics",
    re: /google-analytics\.com|googletagmanager\.com|gtag\(/,
  },
  { id: "segment", re: /segment\.com\/analytics|cdn\.segment\.io/i },
  { id: "mixpanel", re: /cdn\.mxpnl\.com|mixpanel\.com\/lib/i },
  { id: "amplitude", re: /amplitude\.com|cdn\.amplitude\.com/i },
  { id: "posthog", re: /posthog\.com|ph\.posthog\.com/i },
  { id: "heap", re: /heapanalytics\.com/i },
  { id: "fullstory", re: /fullstory\.com/i },
  { id: "hotjar", re: /static\.hotjar\.com|hj\.contentsquare/i },
  { id: "vercel-analytics", re: /_vercel\/insights|vercel\/analytics/i },
  { id: "plausible", re: /plausible\.io\/js|plausible\.io\/api/i },
  { id: "fathom", re: /usefathom\.com/i },
  { id: "sentry", re: /sentry\.io|sentry-cdn/i },
  { id: "datadog", re: /datadoghq\.com|datadog-rum/i },
] as const;

export const EXPERIMENTATION = [
  { id: "optimizely", re: /optimizely\.com|cdn\.optimizely\./i },
  { id: "statsig", re: /statsig\.com/i },
  { id: "growthbook", re: /growthbook\.io/i },
  { id: "launchdarkly", re: /launchdarkly\.com/i },
  { id: "split", re: /split\.io|sdk\.split\.io/i },
  { id: "eppo", re: /eppo\.cloud/i },
  { id: "vercel-flags", re: /vercel\/flags|flags\.sdk/i },
] as const;

export const HOSTING = [
  { id: "vercel", re: /vercel\.app|x-vercel|_vercel/i },
  { id: "netlify", re: /netlify\.app|netlify/i },
  { id: "cloudflare", re: /cloudflare|cf-cache-status|cdnjs/i },
  { id: "aws", re: /cloudfront|amazonaws\.com/i },
  { id: "fastly", re: /fastly/i },
] as const;

export const FRONTEND = [
  { id: "next.js", re: /_next\/|next-route-announcer|__next/i },
  { id: "react", re: /react|data-reactroot|__REACT_DEVTOOLS/i },
  { id: "vue", re: /__vue__|vue-router|vuex|vite\/vue/i },
  { id: "nuxt", re: /__nuxt|nuxt/i },
  { id: "svelte", re: /svelte|sveltekit/i },
  { id: "angular", re: /ng-version|angular/i },
  { id: "astro", re: /astro-island|astro/i },
  { id: "remix", re: /_remixContext|remix/i },
  { id: "gatsby", re: /___gatsby|gatsby/i },
  { id: "liquid", re: /\.liquid|shopify-section|shopify-features/i },
  { id: "alpine.js", re: /x-data|alpinejs/i },
  { id: "preact", re: /preact/i },
  { id: "solidjs", re: /solid-start|solidjs/i },
] as const;

export const DESIGN_SYSTEM = [
  { id: "tailwindcss", re: /tailwind/i },
  { id: "bootstrap", re: /bootstrap/i },
  { id: "ant-design", re: /ant[- ]?design|antd/i },
  { id: "shadcn-ui", re: /shadcn/i },
  { id: "radix-ui", re: /radix/i },
  { id: "chakra-ui", re: /chakra/i },
  { id: "mui", re: /mui-|material-ui/i },
  { id: "mantine", re: /mantine/i },
  { id: "material-design", re: /material design|mdc-/i },
] as const;

export const COMMERCE = [
  { id: "shopify", re: /shopify|cdn\.shopify/i },
  { id: "woocommerce", re: /woocommerce|wc-ajax|wp-woocommerce/i },
  { id: "magento", re: /magento|mage\/cookies/i },
  { id: "bigcommerce", re: /bigcommerce|bc-sf-filter/i },
  { id: "saleor", re: /saleor/i },
  { id: "commercetools", re: /commercetools/i },
  { id: "stripe", re: /js\.stripe\.com|stripe/i },
  { id: "paypal", re: /paypal\.com|paypal/i },
  { id: "klarna", re: /klarna/i },
] as const;

export const OBSERVABILITY = [
  { id: "datadog", re: /datadoghq|datadog/i },
  { id: "sentry", re: /sentry/i },
  { id: "new-relic", re: /newrelic/i },
  { id: "logrocket", re: /logrocket/i },
  { id: "grafana", re: /grafana|faro-web-sdk/i },
  { id: "honeycomb", re: /honeycomb/i },
] as const;

export const SUPPORT = [
  { id: "intercom", re: /intercom/i },
  { id: "zendesk", re: /zendesk/i },
  { id: "drift", re: /drift\.com|drift/i },
  { id: "hubspot-chat", re: /hubspot.*chat|hs-banner/i },
  { id: "freshdesk", re: /freshdesk|freshworks/i },
  { id: "crisp", re: /crisp\.chat|crisp/i },
  { id: "helpscout", re: /helpscout|beacon-v2/i },
] as const;

export function fingerprint(haystack: string, list: readonly { id: string; re: RegExp }[]): string[] {
  const hits: string[] = [];
  for (const entry of list) {
    if (entry.re.test(haystack)) hits.push(entry.id);
  }
  return hits;
}

export function extractStackIntel(stack: {
  scripts?: string[];
  metas?: { name?: string; content?: string }[];
  classNameSample?: string[];
  windowGlobals?: string[];
} = {}) {
  const scripts = (stack.scripts || []).join(" \n");
  const metas = (stack.metas || [])
    .map((m) => `${m.name || ""} ${m.content || ""}`)
    .join(" ");
  const classes = (stack.classNameSample || []).join(" ");
  const globals = (stack.windowGlobals || []).join(" ");
  const haystack = `${scripts}\n${metas}\n${classes}\n${globals}`;

  return {
    cms: fingerprint(haystack, CMS),
    analytics: fingerprint(haystack, ANALYTICS),
    experimentation: fingerprint(haystack, EXPERIMENTATION),
    hosting: fingerprint(haystack, HOSTING),
    frontend: fingerprint(haystack, FRONTEND),
    designSystem: fingerprint(haystack, DESIGN_SYSTEM),
    commerce: fingerprint(haystack, COMMERCE),
    observability: fingerprint(haystack, OBSERVABILITY),
    support: fingerprint(haystack, SUPPORT),
    signals: {
      scriptCount: (stack.scripts || []).length,
      metaCount: (stack.metas || []).length,
    },
    evidence: {
      scripts: (stack.scripts || []).slice(0, 12),
      metas: (stack.metas || []).slice(0, 12),
      classes: (stack.classNameSample || []).slice(0, 20),
      windowGlobals: (stack.windowGlobals || []).slice(0, 20),
    },
  };
}
