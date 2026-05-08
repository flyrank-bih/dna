import { createServer } from "http";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { resolve, join, extname } from "path";
import { type ActionHandler } from "./action.protocol";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8",
};

interface StudioExtractionData {
  prefix: string;
  tokens: Record<string, unknown> | null;
  intent: Record<string, unknown> | null;
  visualDna: Record<string, unknown> | null;
  library: Record<string, unknown> | null;
  voice: Record<string, unknown> | null;
  motion: Record<string, unknown> | null;
  mcp: Record<string, unknown> | null;
}

interface StudioOptions {
  dir?: string;
  port?: number | string;
  prefix?: string;
}

interface StudioResult {
  port: number;
  dir: string;
  prefix: string;
  server: ReturnType<typeof createServer>;
}

function pickLatest(dir: string): string | null {
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) =>
    f.endsWith("-design-tokens.json"),
  );
  if (!files.length) return null;
  const picked = files
    .map((f) => ({ f, t: statSync(join(dir, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t)[0];
  return picked.f.replace(/-design-tokens\.json$/, "");
}

function loadExtraction(dir: string, prefix: string): StudioExtractionData {
  const read = (name: string): Record<string, unknown> | null => {
    const p = join(dir, name);
    if (!existsSync(p)) return null;
    try {
      return JSON.parse(readFileSync(p, "utf-8")) as Record<string, unknown>;
    } catch {
      return null;
    }
  };
  return {
    prefix,
    tokens: read(`${prefix}-design-tokens.json`),
    intent: read(`${prefix}-intent.json`),
    visualDna: read(`${prefix}-visual-dna.json`),
    library: read(`${prefix}-library.json`),
    voice: read(`${prefix}-voice.json`),
    motion: read(`${prefix}-motion-tokens.json`),
    mcp: read(`${prefix}-mcp.json`),
  };
}

function esc(v: unknown): string {
  if (v == null) return "";
  const escapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return String(v).replace(
    /[&<>"']/g,
    (c) => escapeMap[c] || c,
  );
}

function studioHtml(data: StudioExtractionData): string {
  const tokens = data.tokens || {};
  const intent = data.intent || {};
  const visualDna = data.visualDna || {};
  const library = data.library || {};
  const voice = data.voice || {};
  const motion = data.motion || {};
  const json = JSON.stringify({
    tokens,
    intent,
    visualDna,
    library,
    voice,
    motion,
  });
  const intentView = intent as { sectionRoles?: { readingOrder?: string[] } ; pageIntent?: { type?: string; confidence?: string | number } };
  const visualDnaView = visualDna as { materialLanguage?: { label?: string; confidence?: string | number }; imageryStyle?: { label?: string } };
  const libraryView = library as { library?: string; confidence?: string | number };
  const voiceView = voice as {
    tone?: string;
    pronoun?: string;
    headingStyle?: string;
    headingLengthClass?: string;
    ctaVerbs?: Array<{ value?: string; count?: number }>;
    sampleHeadings?: string[];
  };
  const readingOrder = (intentView.sectionRoles?.readingOrder || []).join(" → ");
  const ctaList = (voiceView.ctaVerbs || [])
    .slice(0, 5)
    .map((c) => `${c.value || ""} (${c.count || 0})`)
    .join(" · ");
  const sampleHeadings = (voiceView.sampleHeadings || [])
    .slice(0, 4)
    .map((h) => `“${h}”`)
    .join(" · ");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Flyrank Visual DNA studio · ${esc(data.prefix)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root {
    --paper: #f3f1ea; --paper-2: #ece8dd; --paper-3: #d8d3c5;
    --ink: #0a0908; --ink-2: #403c34; --ink-3: #8b8778;
    --accent: #ff4800;
    --mono: 'JetBrains Mono', ui-monospace, monospace;
    --display: 'Fraunces', Georgia, serif;
    --body: 'Instrument Sans', -apple-system, system-ui, sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: var(--paper); color: var(--ink); font-family: var(--body); font-size: 15px; line-height: 1.5; }
  body { padding: 48px clamp(20px, 4vw, 56px); max-width: 1440px; margin: 0 auto; }
  header { display: flex; justify-content: space-between; align-items: baseline; gap: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--ink); }
  .mark { font-family: var(--mono); font-size: 13px; letter-spacing: 0.02em; }
  .mark em { color: var(--accent); font-style: italic; font-family: var(--display); }
  nav { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; display: flex; gap: 24px; }
  nav a { color: var(--ink); text-decoration: none; border-bottom: 1px solid transparent; }
  nav a:hover { color: var(--accent); }
  h1.display { font-family: var(--display); font-size: clamp(40px, 6vw, 72px); letter-spacing: -0.03em; line-height: 1.02; font-weight: 400; margin: 64px 0 24px; max-width: 14ch; }
  h1.display em { font-style: italic; color: var(--accent); }
  h2 { font-family: var(--display); font-size: 28px; letter-spacing: -0.02em; font-weight: 500; }
  .rule { display: flex; align-items: center; gap: 12px; margin: 56px 0 24px; }
  .rule-line { flex: 1; height: 1px; background: var(--ink); }
  .chip { font-family: var(--mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; padding: 4px 10px; border: 1px solid var(--ink); }
  .grid { display: grid; gap: 16px; }
  .swatch { aspect-ratio: 1; border: 1px solid var(--ink); padding: 10px; display: flex; flex-direction: column; justify-content: space-between; font-family: var(--mono); font-size: 10px; letter-spacing: 0.04em; cursor: copy; position: relative; }
  .swatch:hover::after { content: 'click to copy'; position: absolute; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,0.55); color: white; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; }
  .kv { display: grid; grid-template-columns: 180px 1fr; gap: 8px 24px; font-family: var(--mono); font-size: 13px; line-height: 1.8; }
  .kv dt { color: var(--ink-2); letter-spacing: 0.04em; }
  .kv dd em { color: var(--accent); font-style: normal; }
  pre.code { font-family: var(--mono); font-size: 12px; background: var(--ink); color: var(--paper); padding: 16px 20px; overflow-x: auto; white-space: pre; }
  .type-spec { display: grid; gap: 12px; padding: 32px 0; border-top: 1px solid var(--paper-3); border-bottom: 1px solid var(--paper-3); }
  .type-row { display: flex; align-items: baseline; gap: 24px; border-bottom: 1px solid var(--paper-3); padding-bottom: 12px; }
  .type-row:last-child { border-bottom: 0; }
  .type-meta { font-family: var(--mono); font-size: 10px; color: var(--ink-3); letter-spacing: 0.1em; text-transform: uppercase; min-width: 120px; }
  footer { margin-top: 80px; padding-top: 24px; border-top: 1px solid var(--paper-3); font-family: var(--mono); font-size: 11px; letter-spacing: 0.04em; color: var(--ink-3); display: flex; justify-content: space-between; }
  @media (max-width: 700px) { .kv { grid-template-columns: 1fr; } .type-row { flex-direction: column; gap: 4px; } }
</style>
</head>
<body>
  <header>
    <div class="mark">Flyrank Visual DNA <em>studio</em> · ${esc(data.prefix)}</div>
    <nav>
      <a href="#dna">DNA</a>
      <a href="#tokens">Tokens</a>
      <a href="#type">Type</a>
      <a href="#voice">Voice</a>
      <a href="#motion">Motion</a>
      <a href="/raw" target="_blank">Raw JSON</a>
    </nav>
  </header>

  <h1 class="display">An extraction you can <em>read</em>, not just paste.</h1>
  <p style="max-width:48ch;color:var(--ink-2);font-size:17px;line-height:1.55">
    Every swatch is clickable — copy hex or token to your clipboard.
    The studio runs locally; no account, no upload, no telemetry.
  </p>

  <div class="rule" id="dna"><div class="rule-line"></div><div class="chip">§01 — DNA</div></div>
  <dl class="kv">
    <dt>page intent</dt><dd>${intentView.pageIntent?.type ? `<em>${esc(intentView.pageIntent.type)}</em> · ${esc(intentView.pageIntent.confidence ?? "")}` : "—"}</dd>
    <dt>reading order</dt><dd>${esc(readingOrder) || "—"}</dd>
    <dt>material</dt><dd>${visualDnaView.materialLanguage?.label ? `${esc(visualDnaView.materialLanguage.label)} · ${esc(visualDnaView.materialLanguage.confidence ?? "")}` : "—"}</dd>
    <dt>imagery</dt><dd>${esc(visualDnaView.imageryStyle?.label) || "—"}</dd>
    <dt>component library</dt><dd>${libraryView.library ? `${esc(libraryView.library)} · ${esc(libraryView.confidence ?? "")}` : "—"}</dd>
  </dl>

  <div class="rule" id="tokens"><div class="rule-line"></div><div class="chip">§02 — Tokens</div></div>
  <h2>Color</h2>
  <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(120px,1fr));margin-top:24px" id="color-grid"></div>

  <h2 style="margin-top:56px" id="type">Typography</h2>
  <div class="type-spec" id="type-spec"></div>

  <div class="rule" id="voice"><div class="rule-line"></div><div class="chip">§03 — Voice</div></div>
  <dl class="kv">
    <dt>tone</dt><dd><em>${esc(voiceView.tone) || "—"}</em></dd>
    <dt>pronoun</dt><dd>${esc(voiceView.pronoun) || "—"}</dd>
    <dt>heading style</dt><dd>${esc(voiceView.headingStyle) || "—"} · ${esc(voiceView.headingLengthClass) || "—"}</dd>
    <dt>top CTAs</dt><dd>${esc(ctaList) || "—"}</dd>
    <dt>sample headings</dt><dd>${esc(sampleHeadings) || "—"}</dd>
  </dl>

  <div class="rule" id="motion"><div class="rule-line"></div><div class="chip">§04 — Motion</div></div>
  <pre class="code" id="motion-block"></pre>

  <footer>
    <div>Flyrank Visual DNA studio · served from localhost</div>
    <div><a href="/raw" style="color:inherit">raw.json</a></div>
  </footer>

<script id="__data" type="application/json">${json.replace(/</g, "\\u003c")}</script>
<script>
  const DATA = JSON.parse(document.getElementById('__data').textContent);
  document.getElementById('motion-block').textContent = JSON.stringify(DATA.motion || {}, null, 2);

  // Color grid — built with safe DOM APIs only.
  const palette = [];
  const seen = new Set();
  const add = (hex, label) => {
    if (!hex) return;
    const h = String(hex).toLowerCase();
    if (seen.has(h)) return;
    seen.add(h);
    palette.push({ hex: h, label: String(label || '') });
  };
  const walk = (obj, path) => {
    if (!obj || typeof obj !== 'object') return;
    if (obj.$value && typeof obj.$value === 'string' && /^#[0-9a-f]{3,8}$/i.test(obj.$value)) {
      add(obj.$value, path.join('.'));
      return;
    }
    for (const k of Object.keys(obj)) walk(obj[k], path.concat(k));
  };
  walk(DATA.tokens && (DATA.tokens.color || DATA.tokens), []);

  const grid = document.getElementById('color-grid');
  for (const p of palette.slice(0, 48)) {
    const el = document.createElement('div');
    el.className = 'swatch';
    const r = parseInt(p.hex.slice(1, 3), 16) || 0;
    const g = parseInt(p.hex.slice(3, 5), 16) || 0;
    const b = parseInt(p.hex.slice(5, 7), 16) || 0;
    const luminance = r * 0.299 + g * 0.587 + b * 0.114;
    el.style.background = p.hex;
    el.style.color = luminance > 160 ? '#0a0908' : '#f3f1ea';
    if (luminance > 220) el.style.borderColor = '#0a0908';
    const lab = document.createElement('div');
    lab.textContent = p.label.split('.').slice(-2).join('.');
    const val = document.createElement('div');
    val.textContent = p.hex;
    val.style.opacity = '0.85';
    el.appendChild(lab);
    el.appendChild(val);
    el.addEventListener('click', () => {
      navigator.clipboard.writeText(p.hex);
      el.style.outline = '2px solid #ff4800';
      setTimeout(() => { el.style.outline = ''; }, 400);
    });
    grid.appendChild(el);
  }

  // Typography specimens
  const typeSpec = document.getElementById('type-spec');
  const tokensObj = DATA.tokens || {};
  const ff =
    (tokensObj.font && tokensObj.font.family && tokensObj.font.family.sans && tokensObj.font.family.sans.$value) ||
    (tokensObj.fontFamily && tokensObj.fontFamily.sans && tokensObj.fontFamily.sans.$value) ||
    'inherit';
  const sizes = [
    { label: 'display', px: 56, w: 700 },
    { label: 'h1', px: 40, w: 600 },
    { label: 'h2', px: 28, w: 600 },
    { label: 'body', px: 16, w: 400 },
    { label: 'small', px: 13, w: 400 },
  ];
  for (const s of sizes) {
    const row = document.createElement('div');
    row.className = 'type-row';
    const meta = document.createElement('div');
    meta.className = 'type-meta';
    meta.textContent = s.label + ' · ' + s.px + 'px';
    const sample = document.createElement('div');
    sample.style.fontFamily = ff;
    sample.style.fontSize = s.px + 'px';
    sample.style.fontWeight = String(s.w);
    sample.style.lineHeight = '1.1';
    sample.style.letterSpacing = '-0.01em';
    sample.textContent = 'The brown fox leaps.';
    row.appendChild(meta);
    row.appendChild(sample);
    typeSpec.appendChild(row);
  }
</script>
</body>
</html>`;
}

export class StudioAction
  implements ActionHandler<[opts?: StudioOptions], Promise<StudioResult>>
{
  async run(opts: StudioOptions = {}): Promise<StudioResult> {
  const dir = resolve(opts.dir || "./.flydesign");
  const port = Number(opts.port) || 4837;

  if (!existsSync(dir)) {
    throw new Error(
      `No extraction directory found at ${dir}. Run extraction first and pass the same output directory.`,
    );
  }
  const prefix = opts.prefix || pickLatest(dir);
  if (!prefix) {
    throw new Error(
      `No *-design-tokens.json found in ${dir}. Run extraction first and pass the same output directory.`,
    );
  }

  const server = createServer((req, res) => {
    try {
      const url = new URL(req.url || "/", `http://localhost:${port}`);
      const pathname = url.pathname;

      if (pathname === "/" || pathname === "/index.html") {
        const data = loadExtraction(dir, prefix);
        const html = studioHtml(data);
        res.writeHead(200, { "content-type": MIME[".html"] });
        res.end(html);
        return;
      }
      if (pathname === "/raw") {
        const data = loadExtraction(dir, prefix);
        res.writeHead(200, { "content-type": MIME[".json"] });
        res.end(JSON.stringify(data, null, 2));
        return;
      }
      if (pathname === "/api/prefix") {
        res.writeHead(200, { "content-type": MIME[".json"] });
        res.end(JSON.stringify({ prefix, dir }));
        return;
      }

      // Static passthrough — screenshots, preview.html, etc.
      const safe = pathname.replace(/\.\./g, "").replace(/^\//, "");
      const filePath = join(dir, safe);
      // Path-traversal guard: must stay inside dir.
      if (!filePath.startsWith(dir)) {
        res.writeHead(404, { "content-type": "text/plain" });
        res.end("not found");
        return;
      }
      // Race-free read — let readFileSync surface ENOENT / EISDIR / EACCES
      // in one syscall instead of a stat→read pair (which would TOCTOU).
      try {
        const body = readFileSync(filePath);
        const ext = extname(filePath).toLowerCase();
        res.writeHead(200, {
          "content-type": MIME[ext] || "application/octet-stream",
        });
        res.end(body);
        return;
      } catch {
        res.writeHead(404, { "content-type": "text/plain" });
        res.end("not found");
        return;
      }
    } catch (e: unknown) {
      res.writeHead(500, { "content-type": "text/plain" });
      const message = e instanceof Error ? e.message : "unknown error";
      res.end(`error: ${message}`);
    }
  });

  await new Promise<void>((resolveP) => {
    server.listen(port, () => resolveP());
  });
  return { port, dir, prefix, server };
  }
}

export async function runStudio(opts: StudioOptions = {}): Promise<StudioResult> {
  return new StudioAction().run(opts);
}
