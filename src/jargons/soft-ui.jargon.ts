export const SoftUiJargon = {
  name: "Soft UI Jargon",
  blurb:
    "Neumorphic surface language, low-contrast depth, cushioned interaction model.",
  fonts: {
    display: {
      family: "Manrope",
      weights: [400, 600, 800],
      import:
        "https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;800&display=swap",
    },
    body: {
      family: "Manrope",
      weights: [400, 500, 600],
      import:
        "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600&display=swap",
    },
  },
  tokens: {
    paper: "#eef0f7",
    ink: "#1a1f2e",
    inkSoft: "#6b7280",
    accent: "#6366f1",
    rule: "rgba(26,31,46,0.08)",
    radius: "14px",
    radiusLg: "24px",
    shadow:
      "12px 12px 32px rgba(160,170,200,0.45), -12px -12px 32px rgba(255,255,255,0.9)",
    shadowSm:
      "6px 6px 14px rgba(160,170,200,0.35), -6px -6px 14px rgba(255,255,255,0.85)",
    spacingUnit: 8,
    container: "1100px",
    rhythm: 1.55,
  },
  css: `
    :root {
      --v-display: 'Manrope', system-ui, sans-serif;
      --v-body: 'Manrope', system-ui, sans-serif;
      --paper: #eef0f7;
      --ink: #1a1f2e;
      --ink-soft: #6b7280;
      --accent: #6366f1;
      --radius: 14px;
      --radius-lg: 24px;
      --shadow: 12px 12px 32px rgba(160,170,200,0.45),
                -12px -12px 32px rgba(255,255,255,0.9);
      --shadow-sm: 6px 6px 14px rgba(160,170,200,0.35),
                   -6px -6px 14px rgba(255,255,255,0.85);
    }

    body {
      margin: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: var(--v-body);
      font-size: 15px;
      line-height: 1.6;
      letter-spacing: -0.005em;
    }

    h1, h2, h3, .v-display {
      font-family: var(--v-display);
      font-weight: 800;
      letter-spacing: -0.025em;
      line-height: 1.05;
    }

    .v-card {
      background: var(--paper);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow);
      padding: 28px;
    }

    .v-rule {
      height: 4px;
      border: 0;
      border-radius: 999px;
      background: var(--paper);
      box-shadow:
        inset 2px 2px 4px rgba(160,170,200,0.4),
        inset -2px -2px 4px rgba(255,255,255,0.9);
    }

    .v-cta {
      background: var(--accent);
      color: #fff;
      border-radius: var(--radius);
      padding: 14px 26px;
      font-family: var(--v-display);
      font-weight: 600;
      transition: transform 0.12s ease, box-shadow 0.12s ease;
      box-shadow:
        6px 6px 14px rgba(99,102,241,0.35),
        -2px -2px 8px rgba(255,255,255,0.4);
    }

    .v-cta:hover {
      transform: translateY(-1px);
      box-shadow:
        8px 10px 20px rgba(99,102,241,0.45),
        -3px -3px 10px rgba(255,255,255,0.5);
    }

    .v-cta:active {
      transform: translateY(1px);
      box-shadow: inset 4px 4px 8px rgba(0,0,0,0.15);
    }

    .v-pill {
      display: inline-block;
      padding: 4px 12px;
      font-size: 11px;
      font-weight: 600;
      color: var(--ink-soft);
      border-radius: 999px;
      background: var(--paper);
      box-shadow:
        inset 2px 2px 4px rgba(160,170,200,0.3),
        inset -2px -2px 4px rgba(255,255,255,0.9);
    }

    .v-mark {
      color: var(--accent);
      font-weight: 700;
    }

    a {
      color: var(--accent);
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
      text-underline-offset: 4px;
    }
  `,
};
