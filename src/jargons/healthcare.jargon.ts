// Healthcare — calm trust, clinical clarity, soft hierarchy, high readability.
// References: Apple Health UI, NHS design system, Mayo Clinic web UX patterns.

export const HealthcareJargon = {
  name: "Healthcare Jargon",
  blurb: "Calm trust, clinical clarity, soft hierarchy, readable reassurance.",
  fonts: {
    display: {
      family: "Inter",
      weights: [500, 600, 700],
      import:
        "https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap",
    },
    body: {
      family: "Inter",
      weights: [400, 500, 600],
      import:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
    },
  },
  tokens: {
    paper: "#f8fafc",
    ink: "#0f172a",
    inkSoft: "#475569",
    accent: "#0ea5e9",
    accentAlt: "#22c55e",
    rule: "#e2e8f0",
    radius: "12px",
    radiusLg: "18px",
    shadow: "0 8px 24px rgba(2,6,23,0.06)",
    shadowSm: "0 4px 12px rgba(2,6,23,0.05)",
    spacingUnit: 8,
    container: "1160px",
    rhythm: 1.7,
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
      font-size: 15px;
      line-height: 1.7;
      letter-spacing: -0.01em;
    }

    .v-display, h1, h2, h3 {
      font-family: var(--vocab-display);
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1.15;
    }

    .v-card {
      background: #fff;
      border: 1px solid var(--rule);
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
      padding: 20px;
    }

    .v-rule {
      height: 1px;
      border: 0;
      background: linear-gradient(90deg, transparent, var(--rule), transparent);
      margin: 20px 0;
    }

    .v-cta {
      background: var(--accent);
      color: #fff;
      border-radius: var(--radius);
      padding: 12px 18px;
      font-family: var(--vocab-display);
      font-weight: 600;
      letter-spacing: -0.01em;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      box-shadow: var(--shadow-sm);
    }

    .v-cta:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }

    .v-cta.secondary {
      background: var(--accentAlt);
    }

    .v-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(14,165,233,0.08);
      color: var(--accent);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .v-mark {
      color: var(--accent);
      font-weight: 600;
    }

    a {
      color: var(--accent);
      text-decoration: none;
      border-bottom: 1px solid rgba(14,165,233,0.25);
    }

    a:hover {
      border-bottom-color: var(--accentAlt);
      color: var(--accentAlt);
    }

    .status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
    }

    .status::before {
      content: '';
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accentAlt);
      display: inline-block;
    }

    .alert {
      background: rgba(14,165,233,0.06);
      border: 1px solid rgba(14,165,233,0.15);
      padding: 12px 14px;
      border-radius: var(--radius);
    }
  `,
};
