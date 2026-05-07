// Corporate Jargon — enterprise gloss, KPI blue, structured hierarchy, confident opacity.
// References: Fortune 500 dashboards, SaaS admin panels, McKinsey slides, SAP UI.

export const CorporateJargon = {
  name: "Corporate Jargon",
  blurb:
    "Enterprise blues, KPI grids, structured confidence, subtle authority.",
  fonts: {
    display: {
      family: "Inter",
      weights: [500, 600, 700, 800],
      import:
        "https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap",
    },
    body: {
      family: "Inter",
      weights: [400, 500, 600],
      import:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
    },
  },
  tokens: {
    paper: "#f6f8fc",
    ink: "#0f172a",
    inkSoft: "#475569",
    accent: "#2563eb",
    accentAlt: "#0ea5e9",
    rule: "#e2e8f0",
    radius: "10px",
    radiusLg: "16px",
    shadow: "0 10px 30px rgba(2, 6, 23, 0.08)",
    shadowSm: "0 4px 12px rgba(2, 6, 23, 0.06)",
    spacingUnit: 8,
    container: "1200px",
    rhythm: 1.6,
  },
  css: `
    :root {
      --vocab-display: 'Inter', system-ui, -apple-system, sans-serif;
      --vocab-body: 'Inter', system-ui, -apple-system, sans-serif;
    }

    body {
      background: var(--paper);
      color: var(--ink);
      font-family: var(--vocab-body);
      font-size: 14px;
      line-height: 1.6;
      letter-spacing: -0.01em;
    }

    .v-display, h1, h2, h3 {
      font-family: var(--vocab-display);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }

    .v-card {
      background: #fff;
      border: 1px solid var(--rule);
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
      padding: 24px;
    }

    .v-rule {
      height: 1px;
      border: 0;
      background: linear-gradient(90deg, transparent, var(--rule), transparent);
      margin: 24px 0;
    }

    .v-cta {
      background: var(--accent);
      color: #fff;
      border-radius: var(--radius);
      padding: 12px 18px;
      font-family: var(--vocab-display);
      font-weight: 700;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      box-shadow: var(--shadow-sm);
    }

    .v-cta:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }

    .v-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(37,99,235,0.08);
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .v-mark {
      color: var(--accent);
      font-weight: 700;
    }

    a {
      color: var(--accent);
      text-decoration: none;
      border-bottom: 1px solid rgba(37,99,235,0.3);
    }

    a:hover {
      border-bottom-color: var(--accent);
    }
  `,
};
