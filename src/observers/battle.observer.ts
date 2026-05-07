export type Grade = "A" | "B" | "C" | "D" | "F" | "unknown";

export interface DesignScore {
  overall: number;
  grade: Grade;
  scores?: Record<string, number>;
}

export interface DesignMeta {
  url?: string;
  title?: string;
}

export interface DesignInput {
  meta?: DesignMeta;
  score: DesignScore;
}

export interface BattleRow {
  key: string;
  label: string;
  a: number;
  b: number;
  gap: number;
  winner: "a" | "b" | "tie";
}

export interface BattleResult {
  rows: BattleRow[];
  verdict: "a" | "b" | "tie";
}

export interface BattleObserver {
  compare(a: DesignInput, b: DesignInput): BattleResult;
}

export interface BattleRenderer {
  renderHTML(a: DesignInput, b: DesignInput, result: BattleResult): string;
  renderMarkdown(a: DesignInput, b: DesignInput, result: BattleResult): string;
}

export interface Escaper {
  escape(value: string): string;
}

const DIMENSIONS: Array<[string, string]> = [
  ["colorDiscipline", "Color"],
  ["typographyConsistency", "Typography"],
  ["spacingSystem", "Spacing"],
  ["shadowConsistency", "Elevation"],
  ["radiusConsistency", "Radii"],
  ["accessibility", "A11y"],
  ["tokenization", "Tokenization"],
  ["cssHealth", "CSS Health"],
];

function host(url?: string): string {
  try {
    return url ? new URL(url).hostname : "";
  } catch {
    return String(url ?? "");
  }
}

function gradeColor(g: Grade): string {
  return {
    A: "#0a8a52",
    B: "#1f6feb",
    C: "#b08400",
    D: "#d2691e",
    F: "#c43d3d",
    unknown: "#444",
  }[g];
}

export const HtmlEscaper: Escaper = {
  escape(value: string): string {
    return String(value ?? "").replace(/[&<>"']/g, (c) => {
      const map: Record<string, string> = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return map[c] ?? c;
    });
  },
};

export class DefaultBattleObserver implements BattleObserver {
  compare(a: DesignInput, b: DesignInput): BattleResult {
    const rows: BattleRow[] = [];

    for (const [key, label] of DIMENSIONS) {
      const va = a.score.scores?.[key];
      const vb = b.score.scores?.[key];
      if (va == null || vb == null) continue;

      const gap = Math.round(va - vb);

      let winner: BattleRow["winner"] = "tie";

      if (gap >= 3) {
        winner = "a";
      } else if (gap <= -3) {
        winner = "b";
      }

      rows.push({
        key,
        label,
        a: Math.round(va),
        b: Math.round(vb),
        gap,
        winner,
      });
    }

    const diff = a.score.overall - b.score.overall;

    let verdict: BattleResult["verdict"] = "tie";

    if (diff >= 3) verdict = "a";
    else if (diff <= -3) verdict = "b";

    return { rows, verdict };
  }
}

export class DefaultBattleRenderer implements BattleRenderer {
  constructor(private readonly escaper: Escaper) {}

  renderHTML(a: DesignInput, b: DesignInput, result: BattleResult): string {
    const A = host(a.meta?.url);
    const B = host(b.meta?.url);

    const aColor = gradeColor(a.score.grade);
    const bColor = gradeColor(b.score.grade);

    const rows = result.rows
      .map((r) => {
        return `
<tr class="${r.winner}">
  <td>${this.escaper.escape(r.label)}</td>
  <td>${r.a}</td>
  <td>
    <div style="width:${r.a}%;background:${aColor}"></div>
    <div style="width:${r.b}%;background:${bColor}"></div>
  </td>
  <td>${r.b}</td>
  <td>${r.gap > 0 ? "+" : ""}${r.gap}</td>
</tr>`;
      })
      .join("");

    return `
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${A} vs ${B}</title>
<style>
body { font-family: Inter, sans-serif; padding: 40px; background: #0e0e10; color: #eee; }
table { width: 100%; border-collapse: collapse; }
td { padding: 10px; border-bottom: 1px solid #222; }
</style>
</head>
<body>
<h1>${A} vs ${B}</h1>
<table>
${rows}
</table>
</body>
</html>`;
  }

  renderMarkdown(a: DesignInput, b: DesignInput, result: BattleResult): string {
    const A = host(a.meta?.url);
    const B = host(b.meta?.url);

    return [
      `# ${A} vs ${B}`,
      "",
      `| Metric | ${A} | ${B} | Δ |`,
      `|---|---|---|---|`,
      ...result.rows.map((r) => `| ${r.label} | ${r.a} | ${r.b} | ${r.gap} |`),
    ].join("\n");
  }
}

export class BattleService {
  constructor(
    private readonly observer: BattleObserver,
    private readonly renderer: BattleRenderer,
  ) {}

  runHTML(a: DesignInput, b: DesignInput): string {
    const result = this.observer.compare(a, b);
    return this.renderer.renderHTML(a, b, result);
  }

  runMarkdown(a: DesignInput, b: DesignInput): string {
    const result = this.observer.compare(a, b);
    return this.renderer.renderMarkdown(a, b, result);
  }
}
