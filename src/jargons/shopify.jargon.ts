// Shopify — modular commerce system UI, theme-driven typography, liquid flexibility.
// References: Shopify Dawn theme, Online Store 2.0 architecture, modern DTC storefronts.

export const ShopifyJargon = {
  name: "Shopify Jargon",
  blurb:
    "Theme-driven commerce UI with modular typography and flexible brand voice.",
  fonts: {
    display: {
      family: "var(--font-display, Inter)",
      weights: [500, 600, 700, 800],
      import:
        "https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap",
    },
    body: {
      family: "var(--font-body, Inter)",
      weights: [400, 500, 600],
      import:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
    },
  },
  tokens: {
    paper: "#ffffff",
    ink: "#0b0f19",
    inkSoft: "#5b6475",
    accent: "#5a31f4",
    accentAlt: "#16a34a",
    rule: "#e5e7eb",
    radius: "12px",
    radiusLg: "18px",
    shadow: "0 10px 28px rgba(11,15,25,0.08)",
    shadowSm: "0 6px 14px rgba(11,15,25,0.06)",
    spacingUnit: 8,
    container: "1240px",
    rhythm: 1.6,
  },
  css: `
    :root {
      --vocab-display: var(--font-display, 'Inter', system-ui, sans-serif);
      --vocab-body: var(--font-body, 'Inter', system-ui, sans-serif);
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
      background: rgba(90,49,244,0.08);
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
      border-bottom: 1px solid rgba(90,49,244,0.25);
    }

    a:hover {
      border-bottom-color: var(--accentAlt);
      color: var(--accentAlt);
    }

    .badge {
      display: inline-flex;
      align-items: center;
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 999px;
      background: rgba(22,163,74,0.08);
      color: var(--accentAlt);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .price {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
    }

    .compare {
      font-size: 13px;
      color: var(--inkSoft);
      text-decoration: line-through;
    }

    @media (max-width: 640px) {
      body {
        font-size: 13.5px;
      }
    }
  `,
};
