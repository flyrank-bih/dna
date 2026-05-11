# @flyrank/dna

`@flyrank/dna` is a code-first visual intelligence package for extracting and operating on website design systems.

Use it to:
- extract design language (colors, type, spacing, motion, components, voice, intent, stack intel),
- return focused outputs by mode (`overview`, `stack`, `dna`, `voice`, `design-language`),
- compare brands, benchmark a category, export competitive packs, diff designs, drift-check tokens, lint token files,
- generate prompt packs for Claude, Cursor, Lovable, v0, and Codex.

## Install

```bash
npm i @flyrank/dna
```

or

```bash
bun add @flyrank/dna
```

## Runtime Requirements

- Node.js runtime (server-side only).
- Playwright is used internally for crawling/screenshot extraction.
- Not intended for browser/client-side execution.

For Next.js, call it in:
- route handlers (`app/api/.../route.ts`)
- server actions
- backend jobs/workers

## Quick Start

```ts
import { init } from "@flyrank/dna";

const dl = init({
  cache: true,
  screenshots: true,
  outputDir: ".flydesign",
  emitFiles: true,
  pages: 5,
  responsive: true,
  interact: true,
  platforms: ["web", "ios"],
});

const design = await dl.extract("https://stripe.com");

if (design.ok) {
  console.log(design.data);
}

const overview = await dl.extract("https://stripe.com", { mode: "overview" });
const dna = await dl.extract("https://stripe.com", { mode: "dna" });
const layout = await dl.extract("https://stripe.com", {
  mode: "layout",
  aiInsights: true,
});
```

All public SDK methods now return a standardized envelope:

```ts
type SdkResponse<T> =
  | { ok: true; data: T; error: null; meta: { requestId: string; durationMs: number; version: string; source: string } }
  | { ok: false; data: null; error: { code: string; message: string; source: string; retryable: boolean }; meta: { requestId: string; durationMs: number; version: string; source: string } };
```

## Init Options

```ts
interface FlyDesignInitOptions {
  cache?: boolean;          // default: true
  screenshots?: boolean;    // capture component screenshots
  screenshot?: boolean;     // alias of screenshots
  outputDir?: string;       // default: ".flydesign"
  emitFiles?: boolean;      // default: true (write md/json artifacts)
  pages?: number;           // crawl N internal pages for reconciliation
  responsive?: boolean;     // capture multiple breakpoints
  interact?: boolean;       // auto-interaction pass
  deepInteract?: boolean;   // alias of interact
  platforms?: ("web" | "ios" | "android" | "flutter" | "wordpress" | "all")[];
  mode?: ExtractMode;       // default extract mode
  aiInsights?: boolean | {
    areas?: ("layout" | "palette" | "typography" | "voice" | "brand-scaling")[];
  };
  ignore?: string[];
}
```

Per-call overrides are supported:

```ts
const result = await dl.extract("https://flyrank.com", {
  mode: "design-language",
  pages: 6,
  responsive: true,
  interact: true,
  screenshot: true,
  platforms: ["all"],
  outputDir: ".flydesign",
  emitFiles: true,
});
```

## Extract Modes

Pass mode on `extract(url, { mode })` to get focused payloads.

- `standard`: full design extraction object
- `overview`: concise DESIGN-style summary (intent/material/library/tokens/score)
- `stack`: CMS/analytics/experimentation intel
- `dna`: material language + imagery style + background patterns
- `voice`: tone/pronoun/CTA verbs/button patterns/headings
- `layout`: layout pattern, hero treatment, grid structure, rhythm, and overall feel
- `palette`: palette-only response with brand palette score
- `fonts`: font-family response with usage/source/provider links
- `assets`: logo/font/image asset links with metadata
- `design-language`: rich structured design-language response for deep UI/documentation use

Example:

```ts
const stack = await dl.extract("https://flyrank.com", { mode: "stack" });
const voice = await dl.extract("https://flyrank.com", { mode: "voice" });
const layout = await dl.extract("https://flyrank.com", { mode: "layout" });
const deep = await dl.extract("https://flyrank.com", { mode: "design-language" });
```

## AI Insights In Extract

AI insights are optional and additive. When enabled, `extract()` uses the deterministic extraction as the baseline and appends an `aiInsights` field.

```ts
const result = await dl.extract("https://stripe.com", {
  mode: "design-language",
  aiInsights: true,
});
```

You can also scope AI enrichment to specific areas:

```ts
const result = await dl.extract("https://stripe.com", {
  aiInsights: {
    areas: ["layout", "palette", "typography", "brand-scaling"],
  },
});
```

## Output Artifacts

When `emitFiles` is enabled (default), extraction writes files into `outputDir`:

- `<site>-design-language.md`
- `<site>-DESIGN.md`
- `<site>-design-language.json`
- `<site>-stack-intel.json`
- `<site>-visual-dna.json`
- `<site>-voice.json`
- `<site>-library.json`

When `pages > 0`, it also emits route reconciliation artifacts:

- `<site>-tokens-shared.json`
- `<site>-tokens-routes/<slug>.json`
- `<site>-routes-report.md`

Disable file emission:

```ts
const dl = init({ emitFiles: false });
const inMemory = await dl.extract("https://stripe.com", { emitFiles: false });
```

## Core API

Create a client:

```ts
import { init } from "@flyrank/dna";
const dl = init();
```

Methods:

- `extract(url, options?)`
- `analyze(input)`
- `grade(input)`
- `remix(input, options?)`
- `clone(input, options?)`
- `apply(input, options?)`
- `brands(urls, options?)`
- `benchmark(urls, options?)`
- `packCategory(urls, options?)`
- `analyzeBrandIdentity(input)`
- `analyzeDesignConsistency(input)`
- `analyzeVisualSystem(input)`
- `suggestEnhancements(input, options?)`
- `generateBrandContent(input, options?)`
- `analyzeAssets(input)`
- `extractDesignPalette(input, options?)`
- `extractFontFamilies(input, options?)`
- `extractAssets(input, options?)`
- `extractBrandVoice(input, options?)`
- `extractTechStack(input, options?)`
- `extractAiInsights(input, options?)`
- `suggestBrandScaling(input, options?)`
- `suggestPaletteEvolution(input, options?)`
- `suggestTypographySystem(input, options?)`
- `suggestLayoutDirections(input, options?)`
- `runCombinedAiMethods(input, options?)`
- `extractScreenshots(input, options?)`
- `createSnapshot(input)`
- `compareSnapshots(current, previous)`
- `monitorBrand(input, previous?)`
- `drift(url, { tokens, tolerance?, options? })`
- `lint(file)`
- `diff(left, right, options?)`
- `visualDiff(beforeUrl, afterUrl, options?)`
- `makePrompt(input)`

`input` can be:
- a URL string, or
- a previously extracted standard design object.

## Prompt Generation

Generate cloning/build prompts for multiple coding agents:

```ts
const prompts = await dl.makePrompt("https://apple.com");

if (prompts.ok) {
  console.log(prompts.data.claude);
  console.log(prompts.data.cursor);
  console.log(prompts.data.lovable);
  console.log(prompts.data.v0);
  console.log(prompts.data.codex);
}
```

Top-level helper is also exported:

```ts
import { makePrompt } from "@flyrank/dna";

const prompts = await makePrompt("https://linear.app", {
  cache: true,
  screenshots: true,
});
```

## Modular Mini Methods

Use focused methods when you do not need the full design dossier:

```ts
const palette = await dl.extractDesignPalette("https://stripe.com");
const fonts = await dl.extractFontFamilies("https://stripe.com");
const assets = await dl.extractAssets("https://stripe.com");
const voice = await dl.extractBrandVoice("https://stripe.com");
const stack = await dl.extractTechStack("https://stripe.com");
const ai = await dl.extractAiInsights("https://stripe.com", { ai: true });
```

AI-focused mini methods:

```ts
const scaling = await dl.suggestBrandScaling("https://stripe.com", { ai: true });
const paletteEvolution = await dl.suggestPaletteEvolution("https://stripe.com", { ai: true });
const typographySystem = await dl.suggestTypographySystem("https://stripe.com", { ai: true });
const layoutDirections = await dl.suggestLayoutDirections("https://stripe.com", { ai: true });
const aiBundle = await dl.runCombinedAiMethods("https://stripe.com", { ai: true });
```

`runCombinedAiMethods(...)` performs a single AI insights generation pass and returns merged method-shaped results for:
- `suggestEnhancements`
- `extractAiInsights`
- `suggestPaletteEvolution`
- `suggestBrandScaling`
- `suggestTypographySystem`

## Screenshot Extraction

Capture reusable screenshots for downstream prompting, auditing, or cloning:

```ts
const shots = await dl.extractScreenshots("https://stripe.com", {
  components: true,
  fullPage: true,
  responsive: true,
  includeDark: true,
  outputDir: ".flydesign",
});
```

The screenshot response includes:

- component screenshots with cluster labels and size metadata
- full-page screenshots
- responsive screenshots by breakpoint and color scheme

## Next.js Example (Route Handler)

```ts
// app/api/design/route.ts
import { init } from "@flyrank/dna";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { url, mode = "overview" } = await req.json();

  const dl = init({
    cache: true,
    screenshot: true,
    outputDir: ".flydesign",
    emitFiles: true,
  });

  const result = await dl.extract(url, {
    mode,
    pages: 5,
    responsive: true,
    interact: true,
    platforms: ["web", "ios", "android"],
  });
  const prompts = await dl.makePrompt(url);

  return Response.json({ result, prompts });
}
```

## Common Workflows

### 1) Grade one site

```ts
const dl = init();
const grade = await dl.grade("https://stripe.com");
```

### 2) Compare two sites

```ts
const dl = init();
const diff = await dl.diff("https://apple.com", "https://linear.app");
```

### 3) Multi-brand matrix

```ts
const dl = init();
const brands = await dl.brands([
  "https://stripe.com",
  "https://apple.com",
  "https://linear.app",
]);
```

### 4) Competitive benchmark

```ts
const dl = init({ outputDir: ".flydesign" });
const benchmark = await dl.benchmark([
  "https://stripe.com",
  "https://linear.app",
  "https://vercel.com",
  "https://supabase.com",
]);

if (benchmark.ok) {
  console.log(benchmark.data.baseline);
  console.log(benchmark.data.whitespace);
  console.log(benchmark.data.topUniqueSignals);
}
```

### 5) Brand audit

```ts
const audit = await dl.analyzeBrandIdentity("https://stripe.com");

if (audit.ok) {
  console.log(audit.data.summary);
  console.log(audit.data.strengths);
  console.log(audit.data.risks);
}
```

### 6) AI suggestions with optional OpenAI adapter

The core package keeps AI optional. Configure it only when needed:

```ts
const dl = init({
  ai: {
    enabled: true,
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-5-mini",
  },
});

const suggestions = await dl.suggestEnhancements("https://stripe.com", {
  ai: true,
});
```

Without an AI provider, the SDK still returns deterministic non-AI suggestions.

### 7) Asset analysis

```ts
const assets = await dl.analyzeAssets("https://linear.app");

if (assets.ok) {
  console.log(assets.data.findings);
  console.log(assets.data.optimizations);
}
```

### 8) Scheduled monitoring snapshot flow

```ts
const previous = await dl.createSnapshot("https://stripe.com");
const current = await dl.monitorBrand("https://stripe.com", previous.ok ? previous.data : undefined);

if (current.ok) {
  console.log(current.data.diff);
  console.log(current.data.alerts);
}
```

This monitoring model is intended for cron jobs, workers, or route-triggered backend tasks, not a persistent in-process service.

The benchmark result includes:

- `brands`: per-brand summaries, archetypes, positioning, fingerprints, distinctiveness
- `similarityMatrix`: pairwise similarity scores
- `baseline`: category dominant patterns and crowded lanes
- `whitespace`: underused lanes and differentiation opportunities
- `topSharedPatterns`: patterns common across the category
- `topUniqueSignals`: strongest brand-specific signals

### 9) Export a category pack

```ts
const dl = init({ outputDir: ".flydesign" });
const pack = await dl.packCategory(
  [
    "https://stripe.com",
    "https://linear.app",
    "https://vercel.com",
  ],
  { outDir: ".flydesign/category-benchmark" },
);

console.log(pack.dir);
console.log(pack.files);
```

This writes:

- `benchmark-overview.json`
- `similarity-matrix.json`
- `category-baseline.json`
- `whitespace-opportunities.json`
- `brand-positioning-map.json`
- `competitive-summary.md`
- `competitive-summary.html`
- `brand-cards/<brand>.json`

### 6) Token drift check

```ts
const dl = init();
const drift = await dl.drift("https://flyrank.com", {
  tokens: "./tokens.json",
  tolerance: 8,
});
```

## Build, Lint, Test (Contributors)

```bash
bun install
bun run lint
bun run build
bun run test
```

## Open Source

- License: MIT (see `LICENSE`)
- Contribution guide: `CONTRIBUTING.md`
- Code of Conduct: `CODE_OF_CONDUCT.md`
- Security policy: `SECURITY.md`
- Support guide: `SUPPORT.md`

## Stack Intel

`stack` mode now surfaces broader deterministic detection categories including:

- CMS
- analytics
- experimentation
- hosting/deployment
- frontend/runtime
- design system hints
- commerce tooling
- observability
- support/chat tooling
- evidence snippets from scripts, metas, and class samples

## Notes

- Keep calls on backend/server runtime.
- If using mode outputs, prefer passing URLs into downstream operations (`grade`, `diff`, `clone`) for best compatibility.
- Use `outputDir` to isolate artifacts per project/environment.
- Competitive benchmark flows are package-first and build on the same extraction pipeline as `extract()`, so they inherit `pages`, `responsive`, `interact`, and screenshot options.
- OpenAI integration is optional by design; standard extraction and analysis workflows do not require it.<mccoremem id="03g35nwenue6gk9yt1uxc89vr" />
