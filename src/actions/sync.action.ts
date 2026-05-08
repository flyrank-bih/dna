import { formatTokens } from "@/helpers/token-formatter.helper";
import { formatTailwind } from "@/generators/tailwind.generator";
import { formatCssVars } from "@/formatters/css.formatter.js";
import { saveSnapshot, getHistory } from "@/actions/history.action";
import { openSync, closeSync, ftruncateSync, writeSync } from "fs";
import { join } from "path";
import { extractDesignLanguage } from "@/index";
import { type ActionHandler } from "./action.protocol";

interface SyncOptions {
  out?: string;
  interval?: number;
  extractionOptions?: Record<string, unknown>;
}

interface SyncChange {
  type: "color" | "typography" | "accessibility";
  property: string;
  from: string;
  to: string;
}

interface SyncResult {
  changes: SyncChange[];
  updatedFiles: string[];
  isFirstRun: boolean;
  design: unknown;
}

interface HistorySnapshot {
  colors: { primary: string; secondary: string; count: number };
  typography: { families: string[] };
  a11yScore: number;
}

interface DesignView {
  colors?: {
    primary?: { hex?: string };
    secondary?: { hex?: string };
    all?: unknown[];
  };
  typography?: {
    families?: Array<{ name?: string }>;
  };
  accessibility?: {
    score?: number;
  };
}

function updateIfExists(path: string, content: string): boolean {
  let fd: number | undefined;
  try {
    fd = openSync(path, "r+");
    ftruncateSync(fd, 0);
    writeSync(fd, content, 0, "utf-8");
    return true;
  } catch {
    return false;
  } finally {
    if (fd !== undefined) {
      try {
        closeSync(fd);
      } catch {
        /* best-effort close */
      }
    }
  }
}

function toDesignView(input: unknown): DesignView {
  return (input || {}) as DesignView;
}

function familyNames(view: DesignView): string[] {
  return (view.typography?.families || []).map((family) => family.name || "").filter(Boolean);
}

export class SyncDesignAction
  implements ActionHandler<[url: string, options?: SyncOptions], Promise<SyncResult>>
{
  async run(url: string, options: SyncOptions = {}): Promise<SyncResult> {
  const { out = ".", extractionOptions = {} } = options;

  const current = await extractDesignLanguage(url, extractionOptions);
  const currentView = toDesignView(current);
  const history = getHistory(url);
  const previous = (history.length > 1 ? history[history.length - 2] : null) as HistorySnapshot | null;

  const changes: SyncChange[] = [];
  const currentFamilies = familyNames(currentView);
  const currentColorCount = currentView.colors?.all?.length || 0;
  const currentA11y = currentView.accessibility?.score;

  if (previous) {
    if (previous.colors.primary !== (currentView.colors?.primary?.hex || "")) {
      changes.push({
        type: "color",
        property: "primary",
        from: previous.colors.primary,
        to: currentView.colors?.primary?.hex || "",
      });
    }
    if (previous.colors.secondary !== (currentView.colors?.secondary?.hex || "")) {
      changes.push({
        type: "color",
        property: "secondary",
        from: previous.colors.secondary,
        to: currentView.colors?.secondary?.hex || "",
      });
    }
    if (previous.typography.families.join(",") !== currentFamilies.join(",")) {
      changes.push({
        type: "typography",
        property: "fonts",
        from: previous.typography.families.join(", "),
        to: currentFamilies.join(", "),
      });
    }
    if (previous.colors.count !== currentColorCount) {
      changes.push({
        type: "color",
        property: "count",
        from: String(previous.colors.count),
        to: String(currentColorCount),
      });
    }
    if (previous.a11yScore !== currentA11y) {
      changes.push({
        type: "accessibility",
        property: "score",
        from: `${previous.a11yScore}%`,
        to: `${currentA11y}%`,
      });
    }
  }

  saveSnapshot(current);

  const updates: string[] = [];

  if (updateIfExists(join(out, "design-tokens.json"), formatTokens(current as Parameters<typeof formatTokens>[0])))
    updates.push("design-tokens.json");
  if (updateIfExists(join(out, "tailwind.config.js"), formatTailwind(current as Parameters<typeof formatTailwind>[0])))
    updates.push("tailwind.config.js");
  if (updateIfExists(join(out, "variables.css"), formatCssVars(current as Parameters<typeof formatCssVars>[0])))
    updates.push("variables.css");

  return {
    changes,
    updatedFiles: updates,
    isFirstRun: !previous,
    design: current,
  };
  }
}

export async function syncDesign(url: string, options: SyncOptions = {}): Promise<SyncResult> {
  return new SyncDesignAction().run(url, options);
}
