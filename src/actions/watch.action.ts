import { extractDesignLanguage } from "..";
import { saveSnapshot, getHistory } from "./history.action";
import { type ActionHandler } from "./action.protocol";

interface WatchOptions {
  intervalMs?: number;
  extractionOptions?: Record<string, unknown>;
}

interface WatchChange {
  type: "color" | "typography" | "accessibility" | "spacing" | "tokens";
  what: string;
  from: string;
  to: string;
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
  spacing?: {
    base?: number;
  };
  variables?: Record<string, Record<string, unknown>>;
}

interface HistorySnapshot {
  colors: { primary: string; secondary: string; count: number };
  typography: { families: string[] };
  a11yScore: number;
  spacing: { base: number };
  cssVarCount: number;
}

interface WatchResult {
  changes: WatchChange[];
  isFirstRun: boolean;
  snapshot: unknown;
  design: unknown;
}

function toDesignView(input: unknown): DesignView {
  return (input || {}) as DesignView;
}

function getCssVarCount(view: DesignView): number {
  const groups = Object.values(view.variables || {});
  return groups.reduce((sum, group) => sum + Object.keys(group).length, 0);
}

function getTypographyFamilies(view: DesignView): string[] {
  return (view.typography?.families || []).map((family) => family.name || "").filter(Boolean);
}

export class WatchSiteAction
  implements ActionHandler<[url: string, options?: WatchOptions], Promise<WatchResult>>
{
  async run(url: string, options: WatchOptions = {}): Promise<WatchResult> {
  const { extractionOptions = {} } = options;

  const design = await extractDesignLanguage(url, extractionOptions);
  const view = toDesignView(design);
  const history = getHistory(url);
  const previous = (history.length > 0 ? history[history.length - 1] : null) as HistorySnapshot | null;

  const snapshot = saveSnapshot(design);
  const changes: WatchChange[] = [];
  const currentFamilies = getTypographyFamilies(view);
  const currentColorCount = view.colors?.all?.length || 0;
  const currentA11y = view.accessibility?.score;
  const currentSpacing = view.spacing?.base;
  const currentVarCount = getCssVarCount(view);

  if (previous) {
    if (previous.colors.primary !== (view.colors?.primary?.hex || "")) {
      changes.push({
        type: "color",
        what: "Primary color",
        from: previous.colors.primary,
        to: view.colors?.primary?.hex || "",
      });
    }
    if (previous.colors.secondary !== (view.colors?.secondary?.hex || "")) {
      changes.push({
        type: "color",
        what: "Secondary color",
        from: previous.colors.secondary,
        to: view.colors?.secondary?.hex || "",
      });
    }
    if (previous.colors.count !== currentColorCount) {
      changes.push({
        type: "color",
        what: "Color count",
        from: String(previous.colors.count),
        to: String(currentColorCount),
      });
    }
    if (previous.typography.families.join(",") !== currentFamilies.join(",")) {
      changes.push({
        type: "typography",
        what: "Font families",
        from: previous.typography.families.join(", "),
        to: currentFamilies.join(", "),
      });
    }
    if (previous.a11yScore !== currentA11y) {
      changes.push({
        type: "accessibility",
        what: "A11y score",
        from: `${previous.a11yScore}%`,
        to: `${currentA11y}%`,
      });
    }
    if (previous.spacing.base !== currentSpacing) {
      changes.push({
        type: "spacing",
        what: "Spacing base",
        from: `${previous.spacing.base}px`,
        to: `${currentSpacing}px`,
      });
    }
    if (Math.abs(previous.cssVarCount - currentVarCount) > 10) {
      changes.push({
        type: "tokens",
        what: "CSS var count",
        from: String(previous.cssVarCount),
        to: String(currentVarCount),
      });
    }
  }

  return {
    changes,
    isFirstRun: !previous,
    snapshot,
    design,
  };
  }
}

export async function watchSite(url: string, options: WatchOptions = {}): Promise<WatchResult> {
  return new WatchSiteAction().run(url, options);
}
