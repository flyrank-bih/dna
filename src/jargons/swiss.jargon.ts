export const SwissJargon = {
  name: "Swiss Jargon",
  blurb:
    "International typographic system language. Grid-first, neutral, disciplined.",
  fonts: {
    display: {
      family: "Inter",
      weights: [400, 700, 900],
      import:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap",
    },
    body: {
      family: "Inter",
      weights: [400, 500],
      import:
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap",
    },
  },
  tokens: {
    paper: "#ffffff",
    ink: "#111111",
    inkSoft: "#5b5b5b",
    accent: "#d62828",
    rule: "#111111",
    radius: "0px",
    radiusLg: "0px",
    shadow: "none",
    shadowSm: "none",
    spacingUnit: 8,
    container: "1180px",
    rhythm: 1.5,
  },
  css: `
    :root {
      --v-display: Inter, system-ui, -apple-system, Helvetica, Arial, sans-serif;
      --v-body: Inter, system-ui, -apple-system, Helvetica, Arial, sans-serif;
      --paper: #ffffff;
      --ink: #111111;
      --ink-soft: #5b5b5b;
      --accent: #d62828;
    }

    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: var(--v-body);
      font-size: 15px;
      line-height: 1.5;
      letter-spacing: -0.005em;
    }

    h1, h2, h3, .v-display {
      font-family: var(--v-display);
      font-weight: 900;
      letter-spacing: -0.025em;
      line-height: 1;
    }

    .v-card {
      border-top: 1px solid var(--ink);
      padding-top: 24px;
    }

    .v-rule {
      height: 1px;
      border: 0;
      background: var(--ink);
    }

    .v-cta {
      display: inline-block;
      background: var(--ink);
      color: var(--paper);
      padding: 14px 22px;
      font-family: var(--v-display);
      font-weight: 700;
      letter-spacing: -0.005em;
      transition: background 0.15s ease;
    }

    .v-cta:hover {
      background: var(--accent);
    }

    .v-pill {
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--ink-soft);
    }

    .v-mark {
      color: var(--accent);
    }

    a {
      color: var(--ink);
      text-decoration: underline;
      text-underline-offset: 3px;
      text-decoration-thickness: 1px;
    }

    a:hover {
      color: var(--accent);
    }
  `,
};

