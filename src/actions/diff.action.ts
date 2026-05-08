import { type ActionHandler } from "./action.protocol";

interface DiffColor {
  hex?: string;
}

interface DiffDesign {
  meta?: { url?: string };
  colors?: {
    all?: DiffColor[];
    primary?: { hex?: string };
    secondary?: { hex?: string };
  };
  typography?: { families?: Array<{ name?: string }> };
  spacing?: { base?: number; scale?: unknown[] };
  accessibility?: { score?: number };
  components?: Record<string, unknown>;
}

interface SectionChange {
  property: string;
  a: string;
  b: string;
}

interface DiffSection {
  name: string;
  onlyA?: string[];
  onlyB?: string[];
  shared?: string[];
  changed?: SectionChange[];
  countA?: number;
  countB?: number;
}

export interface DesignDiffResult {
  urlA: string;
  urlB: string;
  sections: DiffSection[];
}

function toText(value: unknown): string {
  return value == null ? "" : String(value);
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-f]{3,8}$/i.test(value);
}

function compareSets(valuesA: string[], valuesB: string[]) {
  const setA = new Set(valuesA);
  const setB = new Set(valuesB);
  const onlyA = valuesA.filter((value) => !setB.has(value));
  const onlyB = valuesB.filter((value) => !setA.has(value));
  const shared = valuesA.filter((value) => setB.has(value));
  return { onlyA, onlyB, shared };
}

export class DesignDiffAction
  implements ActionHandler<[designA: DiffDesign, designB: DiffDesign], DesignDiffResult>
{
  run(designA: DiffDesign = {}, designB: DiffDesign = {}): DesignDiffResult {
    const diff: DesignDiffResult = {
      urlA: designA.meta?.url || "",
      urlB: designB.meta?.url || "",
      sections: [],
    };

    const colorValuesA = (designA.colors?.all || [])
      .map((color) => color.hex)
      .filter((hex): hex is string => !!hex);
    const colorValuesB = (designB.colors?.all || [])
      .map((color) => color.hex)
      .filter((hex): hex is string => !!hex);
    const colorSetDiff = compareSets(colorValuesA, colorValuesB);
    const colorDiff: DiffSection = {
      name: "Colors",
      ...colorSetDiff,
      changed: [],
    };

    const primaryA = designA.colors?.primary?.hex;
    const primaryB = designB.colors?.primary?.hex;
    if (primaryA && primaryB && primaryA !== primaryB) {
      colorDiff.changed?.push({ property: "primary", a: primaryA, b: primaryB });
    }
    const secondaryA = designA.colors?.secondary?.hex;
    const secondaryB = designB.colors?.secondary?.hex;
    if (secondaryA && secondaryB && secondaryA !== secondaryB) {
      colorDiff.changed?.push({ property: "secondary", a: secondaryA, b: secondaryB });
    }
    diff.sections.push(colorDiff);

    const fontsA = (designA.typography?.families || [])
      .map((family) => family.name)
      .filter((name): name is string => !!name);
    const fontsB = (designB.typography?.families || [])
      .map((family) => family.name)
      .filter((name): name is string => !!name);
    diff.sections.push({
      name: "Typography",
      ...compareSets(fontsA, fontsB),
      changed: [],
    });

    const spacingDiff: DiffSection = { name: "Spacing", changed: [] };
    const spacingBaseA = designA.spacing?.base;
    const spacingBaseB = designB.spacing?.base;
    if (spacingBaseA !== spacingBaseB) {
      spacingDiff.changed?.push({
        property: "base unit",
        a: `${toText(spacingBaseA)}px`,
        b: `${toText(spacingBaseB)}px`,
      });
    }
    spacingDiff.countA = designA.spacing?.scale?.length || 0;
    spacingDiff.countB = designB.spacing?.scale?.length || 0;
    diff.sections.push(spacingDiff);

    if (designA.accessibility && designB.accessibility) {
      diff.sections.push({
        name: "Accessibility",
        changed: [
          {
            property: "WCAG score",
            a: `${toText(designA.accessibility.score)}%`,
            b: `${toText(designB.accessibility.score)}%`,
          },
        ],
      });
    }

    const componentsA = Object.keys(designA.components || {});
    const componentsB = Object.keys(designB.components || {});
    diff.sections.push({
      name: "Components",
      ...compareSets(componentsA, componentsB),
    });
    return diff;
  }
}

export function diffDesigns(designA: DiffDesign, designB: DiffDesign): DesignDiffResult {
  return new DesignDiffAction().run(designA, designB);
}

export class DiffMarkdownFormatter implements ActionHandler<[diff: DesignDiffResult], string> {
  run(diff: DesignDiffResult): string {
    const lines: string[] = [];
    lines.push("# Design Comparison");
    lines.push("");
    lines.push("| | Site A | Site B |");
    lines.push("|---|--------|--------|");
    lines.push(`| URL | ${diff.urlA} | ${diff.urlB} |`);
    lines.push("");

    for (const section of diff.sections) {
      lines.push(`## ${section.name}`);
      lines.push("");
      if (section.changed && section.changed.length > 0) {
        lines.push("### Differences");
        lines.push("");
        lines.push("| Property | Site A | Site B |");
        lines.push("|----------|--------|--------|");
        for (const change of section.changed) {
          lines.push(`| ${change.property} | \`${change.a}\` | \`${change.b}\` |`);
        }
        lines.push("");
      }
      if (section.onlyA && section.onlyA.length > 0) {
        lines.push(`**Only in Site A:** ${section.onlyA.map((v) => `\`${v}\``).join(", ")}`);
        lines.push("");
      }
      if (section.onlyB && section.onlyB.length > 0) {
        lines.push(`**Only in Site B:** ${section.onlyB.map((v) => `\`${v}\``).join(", ")}`);
        lines.push("");
      }
      if (section.shared && section.shared.length > 0) {
        lines.push(`**Shared:** ${section.shared.map((v) => `\`${v}\``).join(", ")}`);
        lines.push("");
      }
    }
    return lines.join("\n");
  }
}

export function formatDiffMarkdown(diff: DesignDiffResult): string {
  return new DiffMarkdownFormatter().run(diff);
}

function renderValueCell(value: string): string {
  if (!isHexColor(value)) return value;
  return `<span class="swatch-inline" style="background:${value}"></span>${value}`;
}

export function formatDiffHtml(diff: DesignDiffResult): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Design Comparison</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,sans-serif; background:#0a0a0a; color:#e5e5e5; padding:40px; }
  h1 { font-size:32px; color:#fff; margin-bottom:24px; }
  h2 { font-size:20px; color:#fff; margin:32px 0 16px; border-bottom:1px solid #222; padding-bottom:8px; }
  .urls { display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:32px; }
  .url-card { background:#141414; border:1px solid #222; border-radius:12px; padding:16px; }
  .url-card h3 { font-size:12px; color:#666; margin-bottom:4px; }
  .url-card a { color:#3b82f6; font-size:14px; }
  .diff-row { display:grid; grid-template-columns:120px 1fr 1fr; gap:12px; padding:10px 16px; border-radius:8px; margin-bottom:4px; }
  .diff-row:nth-child(odd) { background:#111; }
  .diff-label { color:#888; font-size:13px; }
  .diff-val { font-family:monospace; font-size:13px; }
  .swatch-inline { display:inline-block; width:14px; height:14px; border-radius:3px; vertical-align:middle; margin-right:6px; border:1px solid #333; }
  .only-a { color:#f97316; } .only-b { color:#8b5cf6; } .shared { color:#22c55e; }
  .tag { display:inline-block; font-size:12px; padding:2px 8px; border-radius:4px; margin:2px; }
  .tag-a { background:#f9731620; color:#f97316; }
  .tag-b { background:#8b5cf620; color:#8b5cf6; }
  .tag-shared { background:#22c55e20; color:#22c55e; }
</style></head><body>
<h1>Design Comparison</h1>
<div class="urls">
  <div class="url-card"><h3>Site A</h3><a href="${diff.urlA}">${diff.urlA}</a></div>
  <div class="url-card"><h3>Site B</h3><a href="${diff.urlB}">${diff.urlB}</a></div>
</div>
${diff.sections
  .map(
    (s) => `
<h2>${s.name}</h2>
${
  s.changed && s.changed.length > 0
    ? s.changed
        .map(
          (c) => `
<div class="diff-row">
  <span class="diff-label">${c.property}</span>
  <span class="diff-val">${renderValueCell(c.a)}</span>
  <span class="diff-val">${renderValueCell(c.b)}</span>
</div>`,
        )
        .join("")
    : ""
}
${
  s.onlyA && s.onlyA.length > 0
    ? `<p style="margin:8px 0"><span class="only-a">Only in A:</span> ${s.onlyA
        .slice(0, 15)
        .map((v) => `<span class="tag tag-a">${renderValueCell(v)}</span>`)
        .join("")}</p>`
    : ""
}
${
  s.onlyB && s.onlyB.length > 0
    ? `<p style="margin:8px 0"><span class="only-b">Only in B:</span> ${s.onlyB
        .slice(0, 15)
        .map((v) => `<span class="tag tag-b">${renderValueCell(v)}</span>`)
        .join("")}</p>`
    : ""
}
${
  s.shared && s.shared.length > 0
    ? `<p style="margin:8px 0"><span class="shared">Shared:</span> ${s.shared
        .slice(0, 15)
        .map((v) => `<span class="tag tag-shared">${renderValueCell(v)}</span>`)
        .join("")}</p>`
    : ""
}
`,
  )
  .join("")}
</body></html>`;
}
