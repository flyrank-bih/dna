// Historical tracking — save and compare design snapshots over time

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const HISTORY_DIR = join(homedir(), ".flydesign");

function ensureDir() {
  mkdirSync(HISTORY_DIR, { recursive: true });
}

interface HistorySnapshot {
  timestamp: string;
  url: string;
  colors: { count: number; primary: string | null; secondary: string | null; accent: string | null };
  typography: { families: string[]; scaleCount: number };
  spacing: { base: number | null; count: number };
  shadows: number;
  radii: number;
  breakpoints: number;
  components: string[];
  a11yScore: number | null;
  cssVarCount: number;
}

interface HistoryDesignInput {
  meta: { url: string; timestamp: string };
  colors: { all: unknown[]; primary?: { hex?: string }; secondary?: { hex?: string }; accent?: { hex?: string } };
  typography: { families: Array<{ name: string }>; scale: unknown[] };
  spacing: { base: number | null; scale: unknown[] };
  shadows: { values: unknown[] };
  borders: { radii: unknown[] };
  breakpoints: unknown[];
  components: Record<string, unknown>;
  accessibility?: { score?: number };
  variables: Record<string, Record<string, unknown>>;
}

function historyFile(hostname: string): string {
  return join(HISTORY_DIR, `${hostname}.json`);
}

export function saveSnapshot(design: unknown) {
  ensureDir();
  const d = design as HistoryDesignInput;
  const hostname = new URL(d.meta.url).hostname.replace(/^www\./, "");
  const file = historyFile(hostname);

  // Read directly inside try/catch — no existsSync race.
  let history: HistorySnapshot[] = [];
  try {
    history = JSON.parse(readFileSync(file, "utf-8")) as HistorySnapshot[];
  } catch {
    history = [];
  }

  // Compact snapshot — only store key metrics, not full data
  const snapshot = {
    timestamp: d.meta.timestamp,
    url: d.meta.url,
    colors: {
      count: d.colors.all.length,
      primary: d.colors.primary?.hex || null,
      secondary: d.colors.secondary?.hex || null,
      accent: d.colors.accent?.hex || null,
    },
    typography: {
      families: d.typography.families.map((f) => f.name),
      scaleCount: d.typography.scale.length,
    },
    spacing: {
      base: d.spacing.base,
      count: d.spacing.scale.length,
    },
    shadows: d.shadows.values.length,
    radii: d.borders.radii.length,
    breakpoints: d.breakpoints.length,
    components: Object.keys(d.components),
    a11yScore: d.accessibility?.score || null,
    cssVarCount: Object.values(d.variables).reduce(
      (s: number, v) => s + Object.keys(v || {}).length,
      0,
    ),
  } satisfies HistorySnapshot;

  history.push(snapshot);

  // Prune oldest entries if history exceeds 50 snapshots
  if (history.length > 50) {
    history = history.slice(history.length - 50);
  }

  writeFileSync(file, JSON.stringify(history, null, 2), "utf-8");
  return { hostname, snapshotCount: history.length, file };
}

export function getHistory(url: string): HistorySnapshot[] {
  ensureDir();
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  const file = historyFile(hostname);
  try {
    return JSON.parse(readFileSync(file, "utf-8")) as HistorySnapshot[];
  } catch {
    return [];
  }
}

export function formatHistoryMarkdown(url: string, history: HistorySnapshot[]): string {
  if (history.length === 0) return `No history found for ${url}.\n`;

  const hostname = new URL(url).hostname;
  const lines = [
    `# Design History: ${hostname}`,
    "",
    `${history.length} snapshots recorded.`,
    "",
  ];

  lines.push("| Date | Colors | Fonts | Spacing | A11y | CSS Vars |");
  lines.push("|------|--------|-------|---------|------|----------|");

  for (const snap of history.reverse()) {
    const date = new Date(snap.timestamp).toLocaleDateString();
    lines.push(
      `| ${date} | ${snap.colors.count} (primary: \`${snap.colors.primary}\`) | ${snap.typography.families.join(", ")} | ${snap.spacing.count} vals | ${snap.a11yScore ?? "n/a"}% | ${snap.cssVarCount} |`,
    );
  }
  lines.push("");

  // Detect changes between first and last snapshot
  if (history.length >= 2) {
    const first = history[history.length - 1]; // oldest (reversed)
    const last = history[0]; // newest

    lines.push("## Changes Over Time");
    lines.push("");
    if (first.colors.primary !== last.colors.primary) {
      lines.push(
        `- **Primary color changed:** \`${first.colors.primary}\` → \`${last.colors.primary}\``,
      );
    }
    if (
      first.typography.families.join(",") !== last.typography.families.join(",")
    ) {
      lines.push(
        `- **Fonts changed:** ${first.typography.families.join(", ")} → ${last.typography.families.join(", ")}`,
      );
    }
    if (first.colors.count !== last.colors.count) {
      lines.push(
        `- **Color count:** ${first.colors.count} → ${last.colors.count}`,
      );
    }
    if (first.a11yScore !== last.a11yScore) {
      lines.push(`- **A11y score:** ${first.a11yScore}% → ${last.a11yScore}%`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
