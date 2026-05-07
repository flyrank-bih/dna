import { escapeHtml, take } from "@/helpers/render.helpers";

export interface PreviewObserver<T = unknown, R = string> {
  format(design: T): R;
}

interface ColorToken {
  hex?: string;
}

interface PreviewDesign {
  meta?: { title?: string; url?: string; timestamp?: string | number | Date };
  colors?: { all?: Array<string | ColorToken> };
  typography?: { families?: Array<string | { name?: string }> };
  spacing?: { scale?: Array<number | { value?: number }> };
  components?: Record<string, unknown>;
  componentScreenshots?: Record<string, { label?: string; path?: string }>;
}

const toHex = (value: string | ColorToken): string =>
  typeof value === "string" ? value : value.hex || "#000000";

const toSpacingValue = (value: number | { value?: number }): number =>
  typeof value === "number" ? value : value.value || 0;

const isLight = (hex: string): boolean => {
  const normalized = hex.replace("#", "");
  const safe = normalized.length >= 6 ? normalized : normalized.padEnd(6, "0");
  const r = parseInt(safe.slice(0, 2), 16);
  const g = parseInt(safe.slice(2, 4), 16);
  const b = parseInt(safe.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 > 150;
};

const swatch = (hex: string, label?: string, meta?: string) => {
  const txt = isLight(hex) ? "#000" : "#fff";
  return `
  <div class="fr-swatch">
    <div class="fr-swatch-color" style="background:${hex};color:${txt}"></div>
    <div class="fr-swatch-body">
      <div class="hex">${hex}</div>
      ${label ? `<div class="label">${escapeHtml(label)}</div>` : ""}
      ${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ""}
    </div>
  </div>`;
};

export const FlyRankVisualDNAPreviewObserver: PreviewObserver<
  PreviewDesign,
  string
> = {
  format(design: PreviewDesign): string {
    const {
      meta,
      colors,
      typography,
      spacing,
      components,
      componentScreenshots,
    } = design;

    return `<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet"/>

<style>
:root{
  --bg:#0b0c0f;
  --card:#14161b;
  --text:#eaeaea;
  --muted:#9aa0aa;
  --line:#22262f;
  --accent:#7c5cff;
}

body{
  margin:0;
  font-family:Inter,system-ui;
  background:var(--bg);
  color:var(--text);
}

.wrap{
  max-width:1200px;
  margin:0 auto;
  padding:48px 24px;
}

header{
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  border-bottom:1px solid var(--line);
  padding-bottom:24px;
}

h1{
  font-size:34px;
  margin:0;
}

.meta{
  font-size:13px;
  color:var(--muted);
}

section{
  margin-top:48px;
}

h2{
  font-size:18px;
  margin-bottom:16px;
  color:#fff;
}

.grid{
  display:grid;
  gap:12px;
}

.grid-4{grid-template-columns:repeat(4,1fr);}
.grid-3{grid-template-columns:repeat(3,1fr);}
.grid-2{grid-template-columns:repeat(2,1fr);}

.fr-swatch{
  background:var(--card);
  border:1px solid var(--line);
  border-radius:12px;
  overflow:hidden;
}

.fr-swatch-color{
  height:72px;
}

.fr-swatch-body{
  padding:10px;
  font-size:12px;
}

.hex{font-weight:600}
.label{color:var(--muted)}
.meta{color:#666;font-size:11px}

.card{
  background:var(--card);
  border:1px solid var(--line);
  border-radius:12px;
  padding:16px;
}

.stat{
  font-size:28px;
  font-weight:700;
}

.small{
  font-size:12px;
  color:var(--muted);
}
</style>
</head>

<body>
<div class="wrap">

<header>
  <div>
    <h1>${escapeHtml(meta?.title || "Design Preview")}</h1>
    <div class="meta">${escapeHtml(meta?.url || "")}</div>
  </div>
  <div class="meta">${meta?.timestamp ? new Date(meta.timestamp).toLocaleDateString() : ""}</div>
</header>

<section>
  <h2>System Snapshot</h2>
  <div class="grid grid-4">
    <div class="card"><div class="stat">${colors?.all?.length || 0}</div><div class="small">Colors</div></div>
    <div class="card"><div class="stat">${typography?.families?.length || 0}</div><div class="small">Fonts</div></div>
    <div class="card"><div class="stat">${spacing?.scale?.length || 0}</div><div class="small">Spacing</div></div>
    <div class="card"><div class="stat">${Object.keys(components || {}).length}</div><div class="small">Components</div></div>
  </div>
</section>

<section>
  <h2>Color System</h2>
  <div class="grid grid-4">
    ${take(colors?.all, 16)
      .map((color) => swatch(toHex(color)))
      .join("")}
  </div>
</section>

<section>
  <h2>Typography</h2>
  <div class="card">
    ${(typography?.families || [])
      .map((family) =>
        `<div class="small">${escapeHtml(typeof family === "string" ? family : family.name || "")}</div>`,
      )
      .join("")}
  </div>
</section>

<section>
  <h2>Spacing</h2>
  <div class="card">
    ${take(spacing?.scale, 12)
      .map((space) => `<div class="small">${toSpacingValue(space)}px</div>`)
      .join("")}
  </div>
</section>

<section>
  <h2>Components</h2>
  <div class="grid grid-3">
    ${Object.keys(components || {})
      .map((key) => `<div class="card"><div>${escapeHtml(key)}</div></div>`)
      .join("")}
  </div>
</section>

${
  componentScreenshots
    ? `
<section>
  <h2>Component Screenshots</h2>
  <div class="grid grid-2">
    ${Object.entries(componentScreenshots)
      .map(([key, screenshot]) => `
      <div class="card">
        <div class="small">${escapeHtml(screenshot.label || key)}</div>
        <img src="${escapeHtml(screenshot.path || "")}" style="width:100%;border-radius:8px;margin-top:8px"/>
      </div>`,
      ).join("")}
  </div>
</section>`
    : ""
}

</div>
</body>
</html>`;
  },
};
