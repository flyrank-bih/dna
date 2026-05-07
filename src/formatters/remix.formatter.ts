/**
 * @file remix formatter
 * @description Generated/formatting utilities used by FlyRank Visual DNA.
 */

import {
  REMIX_DEFAULT_TONE_CTAS,
  REMIX_FOOTER_COMMAND_PREFIX,
} from "@/constants/remix/remix.constants";

interface DesignSystem {
  meta?: {
    url?: string;
    title?: string;
  };
  voice?: {
    sampleHeadings?: string[];
    ctaVerbs?: Array<
      string | { verb?: string; text?: string; phrase?: string }
    >;
    tone?: string;
  };
  pageIntent?: {
    type?: string;
    signals?: string[];
  };
  sectionRoles?: {
    sections: Array<{
      role: string;
      heading?: string;
      slots?: {
        heading?: string;
        lede?: string;
      };
      buttonCount?: number;
    }>;
  };
  typography?: {
    families?: Array<{ name: string }>;
  };
}

interface Vocabulary {
  name: string;
  tokens: {
    paper: string;
    ink: string;
    inkSoft: string;
    accent: string;
    rule: string;
    radius: string;
    radiusLg: string;
    shadow: string;
    shadowSm: string;
    container: string;
    rhythm: string;
  };
  fonts?: {
    display?: {
      import?: string;
      family?: string;
    };
    body?: {
      import?: string;
      family?: string;
    };
  };
  css?: string;
  vocabId?: string;
}

interface RemixOptions {
  vocabId?: string;
}

interface SectionContext {
  vocab: Vocabulary;
  headings: string[];
  ctas: string[];
  design: DesignSystem;
}

type SectionRole = NonNullable<DesignSystem["sectionRoles"]>["sections"][number];

class RemixGenerator {
  private design: DesignSystem;
  private vocab: Vocabulary;
  private opts: RemixOptions;
  private headerVersion: string = "7.0.0";

  constructor(
    design: DesignSystem,
    vocab: Vocabulary,
    opts: RemixOptions = {},
  ) {
    if (!design) throw new Error("remix: design is required");
    if (!vocab || !vocab.tokens)
      throw new Error("remix: vocabulary is required");

    this.design = design;
    this.vocab = vocab;
    this.opts = opts;
  }

  private escape(s: string): string {
    const entityMap: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return String(s ?? "").replace(
      /[&<>"']/g,
      (c) => entityMap[c] || c,
    );
  }

  private getHost(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return String(url || "");
    }
  }

  private pickHeadings(count: number = 6): string[] {
    const fromVoice = (this.design.voice?.sampleHeadings || []).filter(Boolean);
    const fromSections = (this.design.sectionRoles?.sections || [])
      .map((s) => s.heading || s.slots?.heading)
      .filter((value): value is string => typeof value === "string" && value.length > 0);
    const merged = [...new Set([...fromVoice, ...fromSections])];
    return merged.slice(0, count);
  }

  private pickCtas(count: number = 4): string[] {
    const verbs = (this.design.voice?.ctaVerbs || []).filter(Boolean);
    const phrases: string[] = verbs
      .map((v) => {
        if (typeof v === "string") return v;
        return v.verb || v.text || v.phrase || "";
      })
      .filter((value): value is string => typeof value === "string" && value.length > 0);

    if (phrases.length >= count) return phrases.slice(0, count);

    const tone = this.design.voice?.tone || "neutral";
    const fallback =
      REMIX_DEFAULT_TONE_CTAS[
        (tone in REMIX_DEFAULT_TONE_CTAS
          ? tone
          : "neutral") as keyof typeof REMIX_DEFAULT_TONE_CTAS
      ];

    return [...phrases, ...fallback].slice(0, count);
  }

  private squeeze(s: string, max: number): string {
    if (!s) return "";
    s = String(s).replace(/\s+/g, " ").trim();
    if (s.length <= max) return s;
    const cut = s.slice(0, max);
    const lastSpace = cut.lastIndexOf(" ");
    return (lastSpace > max * 0.7 ? cut.slice(0, lastSpace) : cut) + "…";
  }

  private renderSection(
    section: SectionRole,
    ctx: SectionContext,
  ): string {
    const { vocab, headings, ctas, design } = ctx;
    const sectionHeading =
      section.heading ||
      section.slots?.heading ||
      headings.shift() ||
      vocab.name;
    const lede = section.slots?.lede || "";
    const role = section.role;
    const buttonCount = Math.max(1, section.buttonCount || 1);

    switch (role) {
      case "nav":
      case "footer":
        return "";

      case "hero": {
        const ctaSet = ctas.slice(0, Math.max(1, Math.min(2, buttonCount)));
        return `
          <section class="v-hero">
            <p class="v-pill">${this.escape((design.pageIntent?.type || "landing").toUpperCase())}</p>
            <h1 class="v-display v-h1">${this.escape(sectionHeading)}</h1>
            ${lede ? `<p class="v-lede">${this.escape(lede)}</p>` : ""}
            <div class="v-cta-row">
              ${ctaSet.map((c, i) => `<a href="#" class="v-cta${i > 0 ? " v-cta-ghost" : ""}">${this.escape(c)}</a>`).join("")}
            </div>
          </section>`;
      }

      case "feature-grid":
      case "bento": {
        const items = headings.splice(0, 3);
        while (items.length < 3) items.push("Feature");
        return `
          <section class="v-section">
            <h2 class="v-display v-h2">${this.escape(sectionHeading)}</h2>
            ${lede ? `<p class="v-lede">${this.escape(lede)}</p>` : ""}
            <div class="v-grid v-grid-3">
              ${items
                .map(
                  (t) => `
                <div class="v-card">
                  <div class="v-card-num">·</div>
                  <h3 class="v-display v-h3">${this.escape(t)}</h3>
                  <p class="v-body">${this.escape(this.squeeze(lede || sectionHeading, 90))}</p>
                </div>`,
                )
                .join("")}
            </div>
          </section>`;
      }

      case "stats": {
        const numbers = ["10×", "99.9%", "< 50ms", "500K+"];
        return `
          <section class="v-section v-section-rule">
            <h2 class="v-display v-h2">${this.escape(sectionHeading)}</h2>
            <div class="v-grid v-grid-4">
              ${numbers
                .map(
                  (n, i) => `
                <div class="v-stat">
                  <div class="v-display v-stat-num">${this.escape(n)}</div>
                  <div class="v-pill">${this.escape((headings[i] || ["speed", "uptime", "latency", "users"][i]).toUpperCase())}</div>
                </div>`,
                )
                .join("")}
            </div>
          </section>`;
      }

      case "testimonial": {
        return `
          <section class="v-section v-section-quiet">
            <blockquote class="v-quote">
              <p class="v-display v-quote-text">"${this.escape(lede || sectionHeading)}"</p>
              <footer class="v-quote-attrib">— ${this.escape(headings.shift() || "A satisfied user")}</footer>
            </blockquote>
          </section>`;
      }

      case "pricing-table": {
        const tiers = headings.splice(0, 3);
        while (tiers.length < 3) tiers.push("Plan");
        const prices = ["$0", "$29", "$99"];
        return `
          <section class="v-section">
            <h2 class="v-display v-h2">${this.escape(sectionHeading)}</h2>
            <div class="v-grid v-grid-3">
              ${tiers
                .map(
                  (t, i) => `
                <div class="v-card${i === 1 ? " v-card-emphasis" : ""}">
                  <p class="v-pill">${this.escape(t.toUpperCase())}</p>
                  <div class="v-display v-price">${this.escape(prices[i])}</div>
                  <a href="#" class="v-cta">${this.escape(ctas[i] || "Choose")}</a>
                </div>`,
                )
                .join("")}
            </div>
          </section>`;
      }

      case "faq": {
        const qs = headings.splice(0, 4);
        while (qs.length < 3) qs.push("A common question");
        return `
          <section class="v-section">
            <h2 class="v-display v-h2">${this.escape(sectionHeading)}</h2>
            <div class="v-faq">
              ${qs
                .map(
                  (q) => `
                <details class="v-faq-item">
                  <summary class="v-faq-q">${this.escape(q)}</summary>
                  <p class="v-body">${this.escape(this.squeeze(lede || "A short, useful answer in the voice of the original site.", 240))}</p>
                </details>`,
                )
                .join("")}
            </div>
          </section>`;
      }

      case "logo-wall": {
        return `
          <section class="v-section v-section-quiet">
            <p class="v-pill v-pill-center">${this.escape(sectionHeading || "Trusted by")}</p>
            <div class="v-logos">
              ${Array.from({ length: 6 })
                .map(
                  (_, i) =>
                    `<div class="v-logo">${this.escape((headings[i] || `BRAND ${i + 1}`).toUpperCase())}</div>`,
                )
                .join("")}
            </div>
          </section>`;
      }

      case "steps": {
        const steps = headings.splice(0, 3);
        while (steps.length < 3) steps.push("Step");
        return `
          <section class="v-section">
            <h2 class="v-display v-h2">${this.escape(sectionHeading)}</h2>
            <ol class="v-steps">
              ${steps
                .map(
                  (s, i) => `
                <li class="v-step">
                  <span class="v-display v-step-num">${String(i + 1).padStart(2, "0")}</span>
                  <h3 class="v-display v-h3">${this.escape(s)}</h3>
                  <p class="v-body">${this.escape(this.squeeze(lede || s, 120))}</p>
                </li>`,
                )
                .join("")}
            </ol>
          </section>`;
      }

      case "cta": {
        const ctaSet = ctas.slice(0, 2);
        return `
          <section class="v-section v-section-cta">
            <h2 class="v-display v-h2">${this.escape(sectionHeading)}</h2>
            ${lede ? `<p class="v-lede">${this.escape(lede)}</p>` : ""}
            <div class="v-cta-row">
              ${ctaSet.map((c, i) => `<a href="#" class="v-cta${i > 0 ? " v-cta-ghost" : ""}">${this.escape(c)}</a>`).join("")}
            </div>
          </section>`;
      }

      default: {
        return `
          <section class="v-section">
            <h2 class="v-display v-h2">${this.escape(sectionHeading)}</h2>
            ${lede ? `<p class="v-body">${this.escape(lede)}</p>` : ""}
          </section>`;
      }
    }
  }

  private prepareSections(): SectionRole[] {
    const seenHeadings = new Set();
    return (this.design.sectionRoles?.sections || [])
      .filter((s) => s.role !== "nav" && s.role !== "footer")
      .filter((s) => {
        const h = (s.heading || s.slots?.heading || "")
          .trim()
          .toLowerCase()
          .slice(0, 80);
        if (!h) return true;
        if (seenHeadings.has(h)) return false;
        seenHeadings.add(h);
        return true;
      })
      .slice(0, 8);
  }

  private prepareHeadings(): string[] {
    const claimed = new Set(
      this.prepareSections()
        .map((s) => (s.heading || s.slots?.heading || "").trim().toLowerCase())
        .filter(Boolean),
    );
    return this.pickHeadings(16).filter(
      (h) => !claimed.has(h.trim().toLowerCase()),
    );
  }

  private generateHtml(): string {
    const url = this.design.meta?.url || "";
    const hostName = this.getHost(url);
    const title = this.design.meta?.title || hostName;
    const ctas = this.pickCtas(6);
    const sections = this.prepareSections();
    const headings = this.prepareHeadings();

    if (sections.length === 0) {
      sections.push(
        {
          role: "hero",
          heading: headings[0] || hostName,
          slots: { lede: this.design.pageIntent?.signals?.[0] },
          buttonCount: 2,
        },
        {
          role: "feature-grid",
          heading: headings[1] || "What it does",
          slots: {},
        },
        { role: "cta", heading: headings[2] || "Get started", slots: {} },
      );
    }

    const ctx: SectionContext = {
      vocab: this.vocab,
      headings: [...headings],
      ctas,
      design: this.design,
    };

    const sectionsHtml = sections
      .map((s) => this.renderSection(s, ctx))
      .join("");

    const t = this.vocab.tokens;
    const fontImports = [
      this.vocab.fonts?.display?.import,
      this.vocab.fonts?.body?.import,
    ]
      .filter((value): value is string => typeof value === "string" && value.length > 0)
      .filter((v, i, a) => a.indexOf(v) === i);

    const ogTitle = `${hostName} · remixed as ${this.vocab.name.toLowerCase()}`;
    const ogDesc = `${title} reimagined in the ${this.vocab.name} vocabulary by FlyRank Visual DNA.`;

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${this.escape(ogTitle)}</title>
<meta name="description" content="${this.escape(ogDesc)}">
<meta property="og:title" content="${this.escape(ogTitle)}">
<meta property="og:description" content="${this.escape(ogDesc)}">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
${fontImports.map((href) => `<link href="${this.escape(href)}" rel="stylesheet">`).join("")}
<style>
  :root {
    --paper: ${t.paper};
    --ink: ${t.ink};
    --ink-soft: ${t.inkSoft};
    --accent: ${t.accent};
    --rule: ${t.rule};
    --radius: ${t.radius};
    --radius-lg: ${t.radiusLg};
    --shadow: ${t.shadow};
    --shadow-sm: ${t.shadowSm};
    --container: ${t.container};
    --rhythm: ${t.rhythm};
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  ${this.vocab.css || ""}
  .v-wrap { max-width: var(--container); margin: 0 auto; padding: 40px 32px 80px; }
  @media (max-width: 640px) { .v-wrap { padding: 28px 20px 56px; } }
  .v-topbar { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 18px; border-bottom: 1px solid var(--rule); margin-bottom: 64px; }
  .v-topbar .v-brand { font-family: var(--vocab-display); font-size: 22px; }
  .v-topbar .v-meta { font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-soft); }

  .v-hero { padding: 32px 0 80px; }
  .v-h1 { font-size: clamp(40px, 7vw, 88px); margin: 18px 0 22px; }
  .v-h2 { font-size: clamp(28px, 4vw, 48px); margin: 0 0 18px; }
  .v-h3 { font-size: 20px; margin: 12px 0 8px; }
  .v-lede { font-size: clamp(17px, 1.6vw, 22px); line-height: 1.5; max-width: 56ch; margin: 0 0 28px; color: var(--ink-soft); }
  .v-body { font-size: 14px; line-height: var(--rhythm); margin: 0; color: var(--ink-soft); }
  .v-cta-row { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; margin-top: 8px; }
  .v-cta-ghost { background: transparent !important; color: var(--ink) !important; border-color: var(--ink) !important; box-shadow: none !important; }

  section.v-section { padding: 64px 0; border-top: 1px solid var(--rule); }
  section.v-section-quiet { background: rgba(0,0,0,0.015); border-radius: var(--radius-lg); padding: 56px 48px; margin: 32px 0; }
  section.v-section-cta { text-align: center; padding: 96px 0; border-top: 1px solid var(--rule); }
  section.v-section-cta .v-cta-row { justify-content: center; }
  section.v-section-rule .v-grid { padding-top: 28px; border-top: 1px solid var(--rule); }

  .v-grid { display: grid; gap: 28px; margin-top: 28px; }
  .v-grid-3 { grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .v-grid-4 { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
  .v-card { padding: 24px; }
  .v-card-num { font-family: var(--vocab-display); font-size: 32px; opacity: .35; margin-bottom: 8px; }
  .v-card-emphasis { transform: translateY(-8px); }

  .v-stat { padding: 12px 0; }
  .v-stat-num { font-size: clamp(36px, 4vw, 56px); line-height: 1; margin-bottom: 8px; }

  .v-quote { margin: 0; padding: 0; }
  .v-quote-text { font-size: clamp(22px, 3vw, 38px); line-height: 1.25; margin: 0 0 24px; }
  .v-quote-attrib { font-size: 14px; color: var(--ink-soft); }

  .v-price { font-size: clamp(40px, 5vw, 72px); line-height: 1; margin: 14px 0 22px; }

  .v-faq { margin-top: 28px; }
  .v-faq-item { padding: 20px 0; border-top: 1px solid var(--rule); }
  .v-faq-item[open] { padding-bottom: 24px; }
  .v-faq-q { font-family: var(--vocab-display); font-size: 20px; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
  .v-faq-q::after { content: '+'; font-size: 24px; color: var(--ink-soft); transition: transform .2s; }
  .v-faq-item[open] .v-faq-q::after { transform: rotate(45deg); }
  .v-faq-q::-webkit-details-marker { display: none; }

  .v-pill-center { display: inline-block; }
  .v-logos { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 24px; margin-top: 28px; }
  .v-logo { font-family: var(--vocab-display); font-weight: 700; opacity: .55; padding: 12px 0; text-align: center; letter-spacing: .04em; }

  .v-steps { list-style: none; padding: 0; margin: 32px 0 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 32px; counter-reset: step; }
  .v-step { padding-top: 12px; border-top: 2px solid var(--ink); }
  .v-step-num { font-size: 32px; opacity: .25; margin-bottom: 10px; display: block; }

  footer.v-footer { margin-top: 96px; padding-top: 32px; border-top: 1px solid var(--rule); display: flex; justify-content: space-between; align-items: end; flex-wrap: wrap; gap: 16px; font-size: 12px; }
  footer.v-footer .v-sig { font-family: var(--vocab-display); font-size: 22px; }
  footer.v-footer code { font-family: ${this.vocab.fonts?.body?.family ? `'${this.vocab.fonts.body.family}'` : "ui-monospace"}, monospace; font-size: 11px; }
</style>
</head>
<body>
  <main class="v-wrap">
    <header class="v-topbar">
      <div class="v-brand">${this.escape(hostName)}</div>
      <div class="v-meta">remixed · ${this.escape(this.vocab.name)}</div>
    </header>

    ${sectionsHtml}

    <footer class="v-footer">
      <div>
        <div class="v-sig">${this.escape(hostName)} <span class="v-mark">×</span> ${this.escape(this.vocab.name)}</div>
        <div class="v-meta" style="margin-top:6px">${this.escape(title)}</div>
      </div>
      <div>
        <code>${REMIX_FOOTER_COMMAND_PREFIX} && use formatRemix() for ${this.escape(hostName)} (${this.escape(this.opts.vocabId || "default")})</code>
      </div>
    </footer>
  </main>
</body>
</html>`;
  }

  public generate(): string {
    return this.generateHtml();
  }
}

export function formatRemix(
  design: DesignSystem,
  vocab: Vocabulary,
  opts: RemixOptions = {},
): string {
  const generator = new RemixGenerator(design, vocab, opts);
  return generator.generate();
}
