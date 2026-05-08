import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";


import { buildPromptPack } from "@/generators/prompt.generator";
import { formatTokens } from "@/helpers/token-formatter.helper";
import { formatTailwind } from "@/generators/tailwind.generator";
import { formatCssVars } from "@/formatters/css.formatter";
import { formatFigma } from "@/formatters/figma.formatter";
import { formatReactTheme } from "@/generators/theme.generators";
import { formatStorybook } from "@/formatters/storybook.formatter";
import { formatAnatomyStubs } from "@/cues/anatomy.cue";
import { generateClone } from "./clone.action";
import { type ActionHandler } from "./action.protocol";

interface PackDesign {
  meta?: { url?: string; timestamp?: string };
  score?: { grade?: string; overall?: number };
  typography?: { families?: Array<string | { name?: string }> };
  colors?: { all?: unknown[] };
  spacing?: { base?: number | string };
  componentLibrary?: { library?: string };
  stack?: { framework?: string };
  voice?: { sampleHeadings?: string[] };
  motion?: unknown;
  componentAnatomy?: unknown[];
  [key: string]: unknown;
}

function nameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();
  } catch {
    return "design-system";
  }
}

function host(url?: string): string {
  if (!url) return "";
  try {
    return new URL(url).hostname;
  } catch {
    return String(url || "");
  }
}

interface PackOptions {
  outDir: string;
  version?: string;
  withClone?: boolean;
}

interface BuildPackResult {
  dir: string;
  files: string[];
}

function toText(content: unknown, fallback = ""): string {
  if (content == null) return fallback;
  if (typeof content === "string") return content;
  if (Buffer.isBuffer(content)) return content.toString("utf-8");
  return JSON.stringify(content, null, 2);
}

function writeFile(path: string, content: unknown): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, toText(content), "utf-8");
}

function buildReadme(design: PackDesign, opts: PackOptions): string {
  const meta = design.meta || {};
  const hostName = host(meta.url);
  const grade = design.score?.grade || "—";
  const overall = design.score?.overall ?? "—";
  const families = (design.typography?.families || [])
    .map((f) => (typeof f === "string" ? f : f?.name))
    .filter(Boolean)
    .slice(0, 3);
  const colorCount = (design.colors?.all || []).length;
  const spacingBase = design.spacing?.base ?? "—";
  const componentLib = design.componentLibrary?.library || "unknown";
  const stack = design.stack?.framework || "unknown";

  return `# ${hostName} — design system pack

> Built from \`${meta.url || ""}\` on ${new Date(meta.timestamp || Date.now()).toISOString().slice(0, 10)} by flydesign v${opts.version || ""}.

A single, polished bundle of extracted design artifacts for ${hostName}: tokens, components, a runnable Storybook, a minimal starter, and paste-ready prompts for v0 / Lovable / Cursor / Claude Artifacts.

## At a glance

- **Grade:** ${grade} (${overall}/100)
- **Stack:** ${stack} · component library: ${componentLib}
- **Type families:** ${families.length ? families.join(", ") : "—"}
- **Palette:** ${colorCount} colors
- **Spacing base:** ${spacingBase}

## What's in this pack

\`\`\`
${nameFromUrl(meta.url || "")}-design-system/
├── README.md           ← you are here
├── LICENSE.txt
├── tokens/             ← DTCG + Tailwind + CSS vars + Figma vars + motion + theme.js
├── components/         ← typed React stubs (anatomy.tsx)
├── storybook/          ← runnable Storybook project
├── starter/            ← minimal starter app
├── prompts/            ← v0 · Lovable · Cursor · Claude Artifacts
└── extras/             ← voice fingerprint + recipe cards
\`\`\`

## Install the tokens

### Tailwind

\`\`\`js
// tailwind.config.js
import config from './tokens/tailwind.config.js';
export default config;
\`\`\`

### CSS variables

\`\`\`html
<link rel="stylesheet" href="tokens/variables.css">
\`\`\`

### Figma

In Figma → Variables panel → import \`tokens/figma-variables.json\`.

### Storybook

\`\`\`bash
cd storybook && npm install && npm run storybook
\`\`\`

## Provenance

This pack was extracted from a publicly-accessible URL and represents the *observable design language* of that site at the time of capture. Token values are inferred from computed styles — no source files were accessed. See \`LICENSE.txt\` for usage guidance.

Re-pack at any time:

\`\`\`bash
// use package API: init().pack(...)
\`\`\`
`;
}

function buildLicense(design: PackDesign): string {
  const hostName = host(design.meta?.url);
  const date = new Date(design.meta?.timestamp || Date.now())
    .toISOString()
    .slice(0, 10);
  return `Design System Pack — Provenance
================================

Source: ${design.meta?.url || hostName}
Captured: ${date}
Tool: Flyrank Visual DNA (https://flyrank.visual-dna.app, MIT)

The token values, type scale, spacing system, and component anatomy in
this pack were inferred from the publicly-accessible computed styles of
the source URL via a headless browser. No source files, proprietary
assets, or copyrighted media were accessed or included.

You are free to use these values as a starting point, reference, or
inspiration. The packaging itself (this README, the bundle layout, the
emitter output formats) is released under MIT by the flydesign project.

Trademarks, logos, brand names, and other identifiable assets of the
source remain the property of their respective owners and are not
licensed by this pack. Do not pass off this pack as the original site's
official design system without permission.
`;
}

function buildStarter(design: PackDesign): string {
  // Simple, dependency-free HTML starter that consumes tokens/variables.css
  // and emits a hero + button preview. The full clone (Next.js) is left as
  // an opt-in via --with-clone.
  const hostName = host(design.meta?.url);
  const families = (design.typography?.families || [])
    .map((f) => (typeof f === "string" ? f : f?.name))
    .filter(Boolean);
  const display = families[0] || "system-ui";
  const heading =
    (design.voice?.sampleHeadings || [])[0] || `Built from ${hostName}`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${hostName} starter</title>
<link rel="stylesheet" href="../tokens/variables.css">
<style>
  body {
    margin: 0;
    font-family: ${JSON.stringify(display)}, -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--color-background, #fff);
    color: var(--color-text, #111);
    line-height: 1.5;
  }
  main { max-width: 840px; margin: 0 auto; padding: 64px 32px; }
  h1 { font-size: clamp(40px, 6vw, 72px); line-height: 1.05; margin: 0 0 18px; }
  p { font-size: 18px; max-width: 56ch; color: var(--color-text-secondary, #555); }
  .cta {
    display: inline-block;
    padding: 14px 28px;
    margin-top: 28px;
    background: var(--color-primary, #0a0a0a);
    color: var(--color-on-primary, #fff);
    border-radius: var(--radius-md, 8px);
    text-decoration: none;
    font-weight: 600;
  }
  .cta:hover { opacity: 0.9; }
  .meta { margin-top: 64px; font-size: 12px; color: #888; }
  .meta a { color: inherit; }
</style>
</head>
<body>
  <main>
    <h1>${heading}</h1>
    <p>This starter is wired to the tokens in <code>tokens/variables.css</code>. Edit the variables and watch this page change. Drop in your own components and use the same tokens to keep the visual language consistent.</p>
    <a class="cta" href="#">Get started</a>
    <p class="meta">Generated by flydesign package API.</p>
  </main>
</body>
</html>
`;
}

function buildPromptPackDocument(design: PackDesign): string {
  const pack = buildPromptPack(
    design as Parameters<typeof buildPromptPack>[0],
  ) as unknown as Record<string, unknown>;
  const lines = [
    "# Prompt pack",
    "",
    `Paste-ready prompts for ${host(design.meta?.url)}. Use the variant that matches your tool.`,
    "",
  ];
  for (const [name, body] of Object.entries(pack)) {
    if (name === "recipes") continue;
    const text =
      typeof body === "string" ? body : JSON.stringify(body, null, 2);
    lines.push(`## ${name}\n`, "```", text.trim(), "```\n");
  }
  const recipes = (pack.recipes || []) as Array<{ name?: string; content?: unknown }>;
  if (Array.isArray(recipes) && recipes.length) {
    lines.push("## Recipes\n");
    for (const recipe of recipes) {
      const text =
        typeof recipe.content === "string"
          ? recipe.content
          : JSON.stringify(recipe.content, null, 2);
      lines.push(`### ${recipe.name || "recipe"}\n`, text.trim(), "\n");
    }
  }
  return lines.join("\n");
}

function buildPackRuntime(design: PackDesign, opts: PackOptions): BuildPackResult {
  const outDir = opts.outDir;
  if (!outDir) throw new Error("pack: outDir is required");
  const written: string[] = [];

  mkdirSync(outDir, { recursive: true });

  const readmePath = join(outDir, "README.md");
  writeFile(readmePath, buildReadme(design, opts));
  written.push(readmePath);

  const licensePath = join(outDir, "LICENSE.txt");
  writeFile(licensePath, buildLicense(design));
  written.push(licensePath);

  const tokensDir = join(outDir, "tokens");
  mkdirSync(tokensDir, { recursive: true });

  const tokenWrites: Array<[string, unknown]> = [
    [
      "design-tokens.json",
      formatTokens(design as unknown as Parameters<typeof formatTokens>[0]),
    ],
    [
      "tokens.flat.json",
      formatTokens(design as unknown as Parameters<typeof formatTokens>[0]),
    ],
    [
      "tailwind.config.js",
      formatTailwind(design as Parameters<typeof formatTailwind>[0]),
    ],
    [
      "variables.css",
      formatCssVars(design as unknown as Parameters<typeof formatCssVars>[0]),
    ],
    [
      "figma-variables.json",
      formatFigma(design as unknown as Parameters<typeof formatFigma>[0]),
    ],
    [
      "motion-tokens.json",
      formatTokens((design.motion || {}) as Parameters<typeof formatTokens>[0]),
    ],
    [
      "theme.js",
      formatReactTheme(design as unknown as Parameters<typeof formatReactTheme>[0]),
    ],
  ];
  for (const [name, content] of tokenWrites) {
    const p = join(tokensDir, name);
    writeFile(p, content);
    written.push(p);
  }

  const componentsDir = join(outDir, "components");
  mkdirSync(componentsDir, { recursive: true });
  const anatomyPath = join(componentsDir, "anatomy.tsx");
  writeFile(
    anatomyPath,
    formatAnatomyStubs(
      (design.componentAnatomy || []) as Parameters<typeof formatAnatomyStubs>[0],
    ),
  );
  written.push(anatomyPath);

  const sbFiles = formatStorybook(design as Parameters<typeof formatStorybook>[0]) as Record<string, unknown>;
  for (const [relPath, content] of Object.entries(sbFiles)) {
    const p = join(outDir, "storybook", relPath);
    mkdirSync(join(p, ".."), { recursive: true });
    writeFile(p, content);
    written.push(p);
  }

  const starterDir = join(outDir, "starter");
  if (opts.withClone) {
    try {
      generateClone(
        design as unknown as Parameters<typeof generateClone>[0],
        starterDir,
      );
      written.push(starterDir);
    } catch {
      mkdirSync(starterDir, { recursive: true });
      writeFile(join(starterDir, "index.html"), buildStarter(design));
      written.push(join(starterDir, "index.html"));
    }
  } else {
    mkdirSync(starterDir, { recursive: true });
    const starterPath = join(starterDir, "index.html");
    writeFile(starterPath, buildStarter(design));
    written.push(starterPath);
  }

  const pack = buildPromptPack(
    design as Parameters<typeof buildPromptPack>[0],
  ) as unknown as Record<string, unknown>;
  const promptsDir = join(outDir, "prompts");
  mkdirSync(promptsDir, { recursive: true });
  for (const [name, content] of Object.entries(pack)) {
    if (name === "recipes") continue;
    const p = join(promptsDir, name);
    writeFile(p, content);
    written.push(p);
  }
  const recipes = (pack.recipes || []) as Array<{ name?: string; content?: unknown }>;
  if (Array.isArray(recipes) && recipes.length) {
    const recipesDir = join(promptsDir, "recipes");
    mkdirSync(recipesDir, { recursive: true });
    for (const recipe of recipes) {
      const safeName = String(recipe.name || "recipe")
        .replace(/[^a-z0-9-_]+/gi, "-")
        .toLowerCase();
      const p = join(recipesDir, `${safeName}.md`);
      writeFile(p, recipe.content);
      written.push(p);
    }
  }

  const extrasDir = join(outDir, "extras");
  mkdirSync(extrasDir, { recursive: true });
  if (design.voice) {
    const p = join(extrasDir, "voice.json");
    writeFile(p, JSON.stringify(design.voice, null, 2));
    written.push(p);
  }
  const promptDocPath = join(extrasDir, "prompt-pack.md");
  writeFile(promptDocPath, buildPromptPackDocument(design));
  written.push(promptDocPath);

  return { dir: outDir, files: written };
}

export class BuildPackAction
  implements ActionHandler<[design: unknown, opts: PackOptions], BuildPackResult>
{
  run(design: unknown, opts: PackOptions): BuildPackResult {
    return buildPackRuntime(design as PackDesign, opts);
  }
}

export function buildPack(design: unknown, opts: PackOptions): BuildPackResult {
  return new BuildPackAction().run(design as PackDesign, opts);
}
