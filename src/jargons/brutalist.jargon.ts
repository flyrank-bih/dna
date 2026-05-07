export const BrutalistJargon = {
  name: "Brutalist Jargon",
  blurb: "Raw structure, mono voice, aggressive contrast, zero softness.",
  fonts: {
    display: {
      family: "Space Grotesk",
      weights: [500, 700],
      import:
        "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap",
    },
    body: {
      family: "IBM Plex Mono",
      weights: [400, 500, 700],
      import:
        "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&display=swap",
    },
  },
  tokens: {
    paper: "#f4f1ea",
    ink: "#0a0a0a",
    inkSoft: "#3a3a3a",
    accent: "#ff4800",
    rule: "#0a0a0a",
    radius: "0px",
    radiusLg: "0px",
    shadow: "6px 6px 0 #0a0a0a",
    shadowSm: "3px 3px 0 #0a0a0a",
    spacingUnit: 8,
    container: "1100px",
    rhythm: 1.45,
  },
  css: `
    :root {
      --v-display: 'Space Grotesk', system-ui, sans-serif;
      --v-body: 'IBM Plex Mono', ui-monospace, monospace;
      --paper: #f4f1ea;
      --ink: #0a0a0a;
      --accent: #ff4800;
      --shadow: 6px 6px 0 #0a0a0a;
      --shadow-sm: 3px 3px 0 #0a0a0a;
    }

    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: var(--v-body);
      font-size: 15px;
      line-height: 1.55;
      text-transform: uppercase;
      letter-spacing: 0.02em;
    }

    h1, h2, h3, .v-display {
      font-family: var(--v-display);
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 0.95;
      text-transform: none;
    }

    .v-card {
      border: 2px solid var(--ink);
      background: var(--paper);
      box-shadow: var(--shadow);
      position: relative;
    }

    .v-card::before,
    .v-card::after {
      content: "";
      position: absolute;
      width: 10px;
      height: 10px;
      border: 2px solid var(--accent);
    }

    .v-card::before {
      top: -2px;
      left: -2px;
      border-right: 0;
      border-bottom: 0;
    }

    .v-card::after {
      bottom: -2px;
      right: -2px;
      border-left: 0;
      border-top: 0;
    }

    .v-rule {
      height: 2px;
      border: 0;
      background: var(--ink);
    }

    .v-cta {
      background: var(--accent);
      color: var(--ink);
      border: 2px solid var(--ink);
      box-shadow: var(--shadow-sm);
      padding: 14px 22px;
      font-family: var(--v-display);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      transition: transform 0.08s ease, box-shadow 0.08s ease;
    }

    .v-cta:hover {
      transform: translate(-2px, -2px);
      box-shadow: 8px 8px 0 var(--ink);
    }

    .v-pill {
      display: inline-block;
      padding: 4px 10px;
      border: 2px solid var(--ink);
      background: var(--paper);
    }

    .v-mark {
      background: var(--accent);
      padding: 0 4px;
    }

    .v-noise {
      background-image: repeating-linear-gradient(
        45deg,
        transparent 0 6px,
        rgba(0, 0, 0, 0.04) 6px 7px
      );
    }

    a {
      color: var(--ink);
      text-decoration: none;
      border-bottom: 2px solid var(--accent);
    }

    a:hover {
      background: var(--accent);
    }
  `,
};
