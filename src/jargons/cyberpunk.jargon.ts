export const CyberpunkJargon = {
  name: "Cyberpunk Jargon",
  blurb:
    "Neon-noir interface language, glitch typography, electric contrast, digital haze.",
  fonts: {
    display: {
      family: "Space Grotesk",
      weights: [500, 700],
      import:
        "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap",
    },
    body: {
      family: "JetBrains Mono",
      weights: [400, 500, 700],
      import:
        "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap",
    },
  },
  tokens: {
    paper: "#0a0815",
    ink: "#e0e0ff",
    inkSoft: "#7d80b0",
    accent: "#ff2bd6",
    accentAlt: "#00f0ff",
    rule: "#2a2050",
    radius: "2px",
    radiusLg: "4px",
    shadow: "0 0 28px rgba(255,43,214,0.4), 0 0 0 1px rgba(255,43,214,0.6)",
    shadowSm: "0 0 14px rgba(0,240,255,0.3)",
    spacingUnit: 8,
    container: "1140px",
    rhythm: 1.5,
  },
  css: `
    :root {
      --v-display: 'Space Grotesk', system-ui, sans-serif;
      --v-body: 'JetBrains Mono', ui-monospace, monospace;
      --paper: #0a0815;
      --ink: #e0e0ff;
      --accent: #ff2bd6;
      --accent-alt: #00f0ff;
      --rule: #2a2050;
      --glow-pink: rgba(255,43,214,0.4);
      --glow-cyan: rgba(0,240,255,0.3);
    }

    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: var(--v-body);
      font-size: 14px;
      line-height: 1.55;
      letter-spacing: 0.01em;
      background-image:
        radial-gradient(ellipse at top right, rgba(255,43,214,0.08), transparent 55%),
        radial-gradient(ellipse at bottom left, rgba(0,240,255,0.08), transparent 55%),
        repeating-linear-gradient(
          0deg,
          transparent 0 2px,
          rgba(255,255,255,0.012) 2px 3px
        );
    }

    h1, h2, h3, .v-display {
      font-family: var(--v-display);
      font-weight: 700;
      letter-spacing: -0.02em;
      line-height: 1;
      text-shadow:
        2px 0 0 var(--glow-pink),
        -2px 0 0 var(--glow-cyan);
    }

    h1::before {
      content: '> ';
      color: var(--accent-alt);
    }

    .v-card {
      position: relative;
      padding: 24px;
      background: linear-gradient(
        160deg,
        rgba(40, 30, 80, 0.5),
        rgba(20, 15, 40, 0.5)
      );
      border: 1px solid var(--rule);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .v-card::after {
      content: '';
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        90deg,
        transparent 0 2px,
        rgba(255, 255, 255, 0.02) 2px 3px
      );
      pointer-events: none;
      mix-blend-mode: overlay;
    }

    .v-rule {
      height: 1px;
      border: 0;
      background: linear-gradient(
        90deg,
        transparent,
        var(--accent),
        var(--accent-alt),
        transparent
      );
    }

    .v-cta {
      background: transparent;
      color: var(--accent);
      border: 1px solid var(--accent);
      padding: 14px 26px;
      font-family: var(--v-body);
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-size: 12px;
      transition: 0.15s ease;
    }

    .v-cta:hover {
      color: var(--paper);
      box-shadow:
        0 0 24px var(--accent),
        inset 0 0 0 2em var(--accent);
    }

    .v-pill {
      display: inline-block;
      font-size: 10px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--accent-alt);
      border: 1px solid var(--accent-alt);
      padding: 3px 8px;
      box-shadow: 0 0 10px var(--glow-cyan);
    }

    .v-mark {
      color: var(--accent);
    }

    a {
      color: var(--accent-alt);
      text-decoration: none;
      border-bottom: 1px dashed currentColor;
    }

    a:hover {
      color: var(--accent);
    }
  `,
};
