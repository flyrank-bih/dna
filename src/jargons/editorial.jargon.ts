export const EditorialJargon = {
  name: "Editorial Jargon",
  blurb:
    "Ink-led typography system, broadsheet spacing, restrained serif authority.",
  fonts: {
    display: {
      family: "Instrument Serif",
      weights: [400],
      import:
        "https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap",
    },
    body: {
      family: "EB Garamond",
      weights: [400, 500, 700],
      import:
        "https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400;500;700&display=swap",
    },
  },
  tokens: {
    paper: "#f7f5ef",
    ink: "#141414",
    inkSoft: "#555049",
    accent: "#a52a2a",
    rule: "#d8d3c4",
    radius: "0px",
    radiusLg: "0px",
    shadow: "none",
    shadowSm: "none",
    spacingUnit: 8,
    container: "760px",
    rhythm: 1.7,
  },
  css: `
    :root {
      --v-display: 'Instrument Serif', Georgia, serif;
      --v-body: 'EB Garamond', Garamond, serif;
      --paper: #f7f5ef;
      --ink: #141414;
      --ink-soft: #555049;
      --accent: #a52a2a;
      --rule: #d8d3c4;
    }

    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: var(--v-body);
      font-size: 19px;
      line-height: 1.65;
      letter-spacing: 0.005em;
    }

    h1, h2, h3, .v-display {
      font-family: var(--v-display);
      font-weight: 400;
      line-height: 1.05;
      letter-spacing: -0.005em;
    }

    h1 em, h2 em, h3 em,
    .v-display em {
      font-style: italic;
      color: var(--accent);
    }

    .v-card {
      padding-top: 28px;
      border-top: 1px solid var(--rule);
    }

    .v-rule {
      height: 1px;
      border: 0;
      background: var(--rule);
      margin: 32px 0;
    }

    .v-cta {
      display: inline-block;
      background: transparent;
      color: var(--ink);
      border-bottom: 2px solid var(--accent);
      padding: 4px 0;
      font-family: var(--v-display);
      font-style: italic;
      font-size: 22px;
      transition: color 0.15s ease;
    }

    .v-cta:hover {
      color: var(--accent);
    }

    .v-pill {
      font-size: 11px;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--ink-soft);
    }

    .v-mark {
      font-style: italic;
      color: var(--accent);
    }

    a {
      color: var(--ink);
      text-decoration: none;
      border-bottom: 1px solid var(--rule);
    }

    a:hover {
      color: var(--accent);
      border-bottom-color: var(--accent);
    }
  `,
};
