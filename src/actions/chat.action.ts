import { createInterface } from "readline";
import { stdin as input, stdout as output } from "process";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import chalk from "chalk";
import { extractDesignLanguage } from "@/index.js";
import { nameFromUrl } from "@/helpers/general.helpers";
import { formatTokens } from "@/helpers/token-formatter.helper";
import { formatTailwind } from "@/generators/tailwind.generator";
import { formatCssVars } from "@/formatters/css.formatter";
import { DefaultDesignMdObserver } from "@/observers/design-markdown.observer";
import { type ActionHandler } from "./action.protocol";

interface ChatDesign {
  meta?: { url?: string; title?: string };
  colors?: {
    primary?: { hex?: string; count?: number };
    secondary?: { hex?: string; count?: number };
    accent?: { hex?: string; count?: number };
    backgrounds?: string[];
    text?: string[];
    neutrals?: Array<{ hex?: string }>;
    [key: string]: unknown;
  };
  typography?: {
    families?: Array<{ name?: string; count?: number; weights?: number[] }>;
    headings?: Array<{ size?: number; weight?: number; lineHeight?: string }>;
    body?: { size?: number };
  };
  borders?: { radii?: Array<{ label?: string; value?: number }> };
  shadows?: { values?: Array<{ raw?: string; value?: string; label?: string }> };
  materialLanguage?: { label?: string; confidence?: number };
  spacing?: { base?: number; scale?: number[] };
  breakpoints?: unknown[];
  components?: Record<string, unknown>;
  variables?: Record<string, unknown>;
  [key: string]: unknown;
}

interface ChatOpResult {
  design: ChatDesign;
  changes: string[];
}

function isHex(s: unknown): boolean {
  return typeof s === "string" && /^#[0-9a-f]{3,8}$/i.test(s.trim());
}

function opSharpenRadii(design: ChatDesign, factor = 0.5): ChatOpResult {
  const radii = design.borders?.radii || [];
  const next = radii.map((r) => ({
    ...r,
    value: Math.max(0, Math.round((r.value || 0) * factor)),
  }));
  const changes = next.map(
    (r, i) => `${r.label || "r" + i}: ${radii[i]?.value || 0}px → ${r.value || 0}px`,
  );
  return {
    design: { ...design, borders: { ...(design.borders || {}), radii: next } },
    changes: ["radii sharpened", ...changes],
  };
}

function opSoftenRadii(design: ChatDesign, factor = 2): ChatOpResult {
  const radii = design.borders?.radii || [];
  const next = radii.map((r) => ({
    ...r,
    value: Math.min(64, Math.round((r.value || 0) * factor) || 4),
  }));
  const changes = next.map(
    (r, i) => `${r.label || "r" + i}: ${radii[i]?.value || 0}px → ${r.value || 0}px`,
  );
  return {
    design: { ...design, borders: { ...(design.borders || {}), radii: next } },
    changes: ["radii softened", ...changes],
  };
}

function opDarkMode(design: ChatDesign): ChatOpResult {
  const colors = design.colors || {};
  const bgs = colors.backgrounds || ["#ffffff"];
  const txt = colors.text || ["#171717"];
  const swapped = { ...colors, backgrounds: txt.slice(), text: bgs.slice() };
  return {
    design: { ...design, colors: swapped },
    changes: [
      `background: ${bgs[0]} → ${txt[0]}`,
      `foreground: ${txt[0]} → ${bgs[0]}`,
    ],
  };
}

function opMakeBrutalist(design: ChatDesign): ChatOpResult {
  const radii = (design.borders?.radii || []).map((r) => ({ ...r, value: 0 }));
  const shadows = (design.shadows?.values || []).map((s) => ({
    ...s,
    raw: "4px 4px 0 0 currentColor",
    value: "4px 4px 0 0 currentColor",
  }));
  const families = (design.typography?.families || []).slice();
  const monoFam = families.find((f) =>
    /mono|consol|courier|jet|sf-mono|geist mono/i.test(f.name || ""),
  ) || { name: "JetBrains Mono", count: 1, weights: [400] };
  return {
    design: {
      ...design,
      borders: { ...(design.borders || {}), radii },
      shadows: { ...(design.shadows || {}), values: shadows },
      typography: {
        ...(design.typography || {}),
        families: [monoFam, ...families.filter((f) => f !== monoFam)].slice(
          0,
          3,
        ),
      },
      materialLanguage: {
        ...(design.materialLanguage || {}),
        label: "brutalist",
        confidence: 1.0,
      },
    },
    changes: [
      "radii → 0 (sharp corners)",
      "shadows → hard offset (4px 4px 0 0)",
      "primary font → mono",
      "material → brutalist",
    ],
  };
}

function opMakeGlass(design: ChatDesign): ChatOpResult {
  const radii = (design.borders?.radii || []).map((r) => ({
    ...r,
    value: Math.max(r.value || 8, 16),
  }));
  const shadows = (design.shadows?.values || []).map((s, i) => ({
    ...s,
    raw: `0 ${8 + i * 4}px ${24 + i * 8}px rgba(0,0,0,0.08)`,
    value: `0 ${8 + i * 4}px ${24 + i * 8}px rgba(0,0,0,0.08)`,
  }));
  return {
    design: {
      ...design,
      borders: { ...(design.borders || {}), radii },
      shadows: { ...(design.shadows || {}), values: shadows },
      materialLanguage: {
        ...(design.materialLanguage || {}),
        label: "glass",
        confidence: 1.0,
      },
    },
    changes: [
      "radii ≥ 16px (rounded)",
      "shadows → soft, depth-stacked",
      "material → glass",
    ],
  };
}

function opSwapColor(design: ChatDesign, role: string, hex: string): ChatOpResult {
  if (!isHex(hex))
    return { design, changes: [`error: ${hex} is not a hex color`] };
  const colors = { ...(design.colors || {}) };
  const before = (colors[role] as { hex?: string } | undefined)?.hex;
  if (!before) {
    return {
      design,
      changes: [
        `error: no ${role} color in this extraction (try primary, secondary, accent)`,
      ],
    };
  }
  const next = {
    ...((colors[role] as Record<string, unknown> | undefined) || {}),
    hex,
  };
  return {
    design: { ...design, colors: { ...colors, [role]: next } },
    changes: [`${role}: ${before} → ${hex}`],
  };
}

function opSwapFont(design: ChatDesign, name: string): ChatOpResult {
  const families = (design.typography?.families || []).slice();
  const before = families[0]?.name || "—";
  const replaced = [
    {
      name,
      count: families[0]?.count || 0,
      weights: families[0]?.weights || [400, 600],
    },
    ...families.slice(1),
  ];
  return {
    design: {
      ...design,
      typography: { ...(design.typography || {}), families: replaced },
    },
    changes: [`primary font: ${before} → ${name}`],
  };
}

function opReset(_design: ChatDesign, original: ChatDesign): ChatOpResult {
  return {
    design: structuredClone(original),
    changes: ["reset to original extraction"],
  };
}

function parseCommand(line: string): Record<string, unknown> | null {
  const s = String(line).trim().toLowerCase();
  if (!s) return null;

  if (s === "help" || s === "?") return { kind: "help" };
  if (s === "quit" || s === "exit" || s === ":q") return { kind: "quit" };
  if (s === "reset" || s === "undo all") return { kind: "reset" };
  if (s === "save" || s === "export" || s === "write") return { kind: "save" };
  if (s === "show" || s === "print" || s === "state") return { kind: "state" };
  if (s.startsWith("show ") || s.startsWith("print ")) {
    return { kind: "show", what: s.split(/\s+/)[1] };
  }

  if (/(make it |make this |go )?brutalist/.test(s))
    return { kind: "op", op: "brutalist" };
  if (/(make it |make this |go )?glass(morph)?/.test(s))
    return { kind: "op", op: "glass" };
  if (/(dark mode|dark theme|invert|go dark)/.test(s))
    return { kind: "op", op: "dark" };
  if (/sharp(en)?( radii| corners)?/.test(s))
    return { kind: "op", op: "sharpen" };
  if (/(soft|round)(en)?( radii| corners)?/.test(s))
    return { kind: "op", op: "soften" };

  const colorRe =
    /(primary|secondary|accent)\s*(?:to|=|:)?\s*(#[0-9a-f]{3,8})/i;
  const cm = colorRe.exec(line);
  if (cm)
    return {
      kind: "op",
      op: "swap-color",
      role: cm[1].toLowerCase(),
      hex: cm[2],
    };

  const fontRe = /(?:font|typeface)\s*(?:to|=|:)?\s*([A-Za-z][\w\s-]{1,40})/i;
  const fm = fontRe.exec(line);
  if (fm) return { kind: "op", op: "swap-font", name: fm[1].trim() };

  return { kind: "unknown", input: line };
}

function printHelp() {
  console.log("");
  console.log(chalk.bold("  Commands:"));
  const rows = [
    ["sharpen / soften", "halve / double every radius"],
    ["dark mode", "swap background ↔ foreground"],
    ["brutalist", "radii → 0, hard shadows, mono font"],
    ["glass", "rounded radii, soft layered shadows"],
    ["primary #ff4800", "swap a role color (primary | secondary | accent)"],
    ["font Inter", "swap the primary font family"],
    ["show / state", "print current palette + tokens"],
    ["reset", "restore the original extraction"],
    ["save", "write DTCG, Tailwind, CSS vars, DESIGN.md to ./chat-output"],
    ["quit", "exit"],
  ];
  for (const [cmd, desc] of rows) {
    console.log("  " + chalk.cyan(cmd.padEnd(28)) + chalk.gray(desc));
  }
  console.log("");
}

function printState(design: ChatDesign): void {
  const c = design.colors || {};
  const t = design.typography || {};
  const r = design.borders?.radii || [];
  console.log("");
  console.log(chalk.bold("  Current state"));
  console.log(
    "  " +
      chalk.gray("palette:".padEnd(14)) +
      [
        c.primary?.hex,
        c.secondary?.hex,
        c.accent?.hex,
        c.backgrounds?.[0],
        c.text?.[0],
      ]
        .filter(Boolean)
        .join(" · "),
  );
  console.log(
    "  " + chalk.gray("font:".padEnd(14)) + (t.families?.[0]?.name || "—"),
  );
  console.log(
    "  " +
      chalk.gray("radii:".padEnd(14)) +
      (r.map((x) => `${x.label || "?"}=${x.value}`).join(" · ") || "—"),
  );
  console.log(
    "  " +
      chalk.gray("material:".padEnd(14)) +
      (design.materialLanguage?.label || "flat"),
  );
  console.log("");
}

function applyOp(parsed: Record<string, unknown>, current: ChatDesign): ChatOpResult {
  switch (parsed.op) {
    case "sharpen":
      return opSharpenRadii(current);
    case "soften":
      return opSoftenRadii(current);
    case "dark":
      return opDarkMode(current);
    case "brutalist":
      return opMakeBrutalist(current);
    case "glass":
      return opMakeGlass(current);
    case "swap-color":
      return opSwapColor(current, String(parsed.role || ""), String(parsed.hex || ""));
    case "swap-font":
      return opSwapFont(current, String(parsed.name || ""));
    default:
      return { design: current, changes: ["no-op"] };
  }
}

function saveDesign(design: ChatDesign, outDir: string): string[] {
  mkdirSync(outDir, { recursive: true });
  const url = design.meta?.url || "extraction";
  const prefix = nameFromUrl(url);
  const dtcg = formatTokens(design as unknown as Parameters<typeof formatTokens>[0]);
  const written: string[] = [];
  const write = (name: string, content: string): void => {
    const p = join(outDir, name);
    writeFileSync(p, content, "utf-8");
    written.push(p);
  };
  write(`${prefix}-design-tokens.json`, JSON.stringify(dtcg, null, 2));
  write(
    `${prefix}-tailwind.config.js`,
    formatTailwind(design as unknown as Parameters<typeof formatTailwind>[0]),
  );
  write(
    `${prefix}-variables.css`,
    formatCssVars(design as unknown as Parameters<typeof formatCssVars>[0]),
  );
  write(`${prefix}-DESIGN.md`, DefaultDesignMdObserver.format(design as never));
  return written;
}

function synthesizeDesignFromTokens(tokens: Record<string, unknown>, sourcePath: string): ChatDesign {
  const findHex = (...paths: string[]): string | null => {
    for (const p of paths) {
      const parts = p.split(".");
      let v: unknown = tokens;
      for (const k of parts) {
        v = (v as Record<string, unknown> | undefined)?.[k];
        if (!v) break;
      }
      if (
        v &&
        typeof (v as { $value?: unknown }).$value === "string"
      ) {
        return (v as { $value: string }).$value;
      }
    }
    return null;
  };
  const primary = findHex(
    "color.primary",
    "primitive.color.brand.primary",
    "primitive.color.primary",
  );
  const secondary = findHex("color.secondary");
  const accent = findHex("color.accent", "primitive.color.brand.accent");
  const bg = findHex(
    "color.background",
    "primitive.color.background.bg0",
    "primitive.color.neutral.n100",
  );
  const fg = findHex(
    "color.foreground",
    "primitive.color.text.text0",
    "primitive.color.foreground",
  );
  return {
    meta: { url: `file://${sourcePath}`, title: "imported tokens" },
    colors: {
      primary: primary ? { hex: primary, count: 1 } : undefined,
      secondary: secondary ? { hex: secondary, count: 1 } : undefined,
      accent: accent ? { hex: accent, count: 1 } : undefined,
      backgrounds: bg ? [bg] : ["#ffffff"],
      text: fg ? [fg] : ["#171717"],
      neutrals: [],
      all: [],
    },
    typography: {
      families: [{ name: "system-ui", count: 1, weights: [400, 600] }],
      headings: [],
      body: { size: 16 },
    },
    spacing: { base: 4, scale: [4, 8, 12, 16, 24, 32, 48, 64] },
    shadows: {
      values: [
        {
          label: "md",
          raw: "0 4px 6px rgba(0,0,0,0.1)",
          value: "0 4px 6px rgba(0,0,0,0.1)",
        },
      ],
    },
    borders: { radii: [{ label: "md", value: 8 }] },
    breakpoints: [],
    components: {},
    variables: {},
    materialLanguage: { label: "flat", confidence: 0.5 },
  };
}

async function runChatSession(target: string, opts: Record<string, unknown> = {}): Promise<void> {
  const outDir = resolve(typeof opts.out === "string" ? opts.out : "./chat-output");

  let design: ChatDesign;
  if (target && /\.json$/.test(target) && existsSync(target)) {
    console.log(chalk.gray(`  Loading tokens from ${target}…`));
    const tokens = JSON.parse(readFileSync(target, "utf-8"));
    design = synthesizeDesignFromTokens(tokens, target);
  } else {
    let url = String(target);
    if (!url.startsWith("http")) url = `https://${url}`;
    console.log(chalk.gray(`  Extracting ${url}…  (this takes a few seconds)`));
    design = (await extractDesignLanguage(url)) as unknown as ChatDesign;
  }

  const original = structuredClone(design);

  console.log("");
  console.log(chalk.bold("  Flyrank Visual DNA chat"));
  console.log(chalk.gray('  type "help" for commands · Ctrl+D to quit'));
  printState(design);

  const rl = createInterface({ input, output, prompt: chalk.gray("> ") });
  rl.prompt();

  for await (const line of rl) {
    const parsed = parseCommand(line);
    if (!parsed) {
      rl.prompt();
      continue;
    }

    if (parsed.kind === "help") {
      printHelp();
      rl.prompt();
      continue;
    }
    if (parsed.kind === "quit") {
      rl.close();
      break;
    }
    if (parsed.kind === "state" || parsed.kind === "show") {
      printState(design);
      rl.prompt();
      continue;
    }
    if (parsed.kind === "reset") {
      const r = opReset(design, original);
      design = r.design;
      r.changes.forEach((c) => console.log("  " + chalk.gray("•") + " " + c));
      printState(design);
      rl.prompt();
      continue;
    }
    if (parsed.kind === "save") {
      const files = saveDesign(design, outDir);
      console.log("");
      for (const f of files) console.log("  " + chalk.green("✓") + " " + f);
      console.log("");
      rl.prompt();
      continue;
    }
    if (parsed.kind === "unknown") {
      console.log(
        chalk.yellow(`  Didn't catch that. Try "help" for commands.`),
      );
      rl.prompt();
      continue;
    }

    if (parsed.kind === "op") {
      const r = applyOp(parsed, design);
      design = r.design;
      console.log("");
      r.changes.forEach((c) => console.log("  " + chalk.green("•") + " " + c));
      console.log("");
      rl.prompt();
    }
  }

  console.log("");
  console.log(chalk.gray("  bye"));
}

export class ChatAction
  implements ActionHandler<[target: string, opts?: Record<string, unknown>], Promise<void>>
{
  async run(target: string, opts: Record<string, unknown> = {}): Promise<void> {
    await runChatSession(target, opts);
  }
}

export async function runChat(
  target: string,
  opts: Record<string, unknown> = {},
): Promise<void> {
  await new ChatAction().run(String(target), opts);
}
