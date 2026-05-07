// Ecommerce — conversion-first UI language, trust cues, urgency layering, clean product focus.
// References: Shopify default themes, Amazon PDP patterns, Stripe checkout UX.

export const EcommerceJargon = {
  name: "Ecommerce Jargon",
  blurb:
    "Conversion-first layouts, trust signals, product clarity, subtle urgency.",
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
    paper: "#ffffff",
    ink: "#0b0f19",
    inkSoft: "#5b6475",
    accent: "#111827",
    accentAlt: "#16a34a",
    rule: "#e5e7eb",
    radius: "12px",
    radiusLg: "18px",
    shadow: "0 12px 30px rgba(17,24,39,0.08)",
    shadowSm: "0 6px 16px rgba(17,24,39,0.06)",
    spacingUnit: 8,
    container: "1240px",
    rhythm: 1.55,
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
      letter-spacing: -0.02em;
      line-height: 1.1;
    }

    .v-card {
      background: #fff;
      border: 1px solid var(--rule);
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
      padding: 20px;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
    }

    .v-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow);
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
      letter-spacing: -0.01em;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      box-shadow: var(--shadow-sm);
      cursor: pointer;
    }

    .v-cta:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow);
    }

    .v-cta.primary {
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
      background: rgba(22,163,74,0.08);
      color: var(--accentAlt);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .v-mark {
      color: var(--accentAlt);
      font-weight: 700;
    }

    a {
      color: var(--accent);
      text-decoration: none;
      border-bottom: 1px solid rgba(17,24,39,0.2);
    }

    a:hover {
      border-bottom-color: var(--accentAlt);
      color: var(--accentAlt);
    }

    .price {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .compare-price {
      text-decoration: line-through;
      color: var(--inkSoft);
      font-size: 13px;
    }

    .badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(22,163,74,0.1);
      color: var(--accentAlt);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
  `,
};
