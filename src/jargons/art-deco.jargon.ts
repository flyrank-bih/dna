export const ArtDecoJargon = {
  name: "Art Deco Jargon",
  blurb:
    "Geometric luxury encoded as a visual protocol — metallic restraint, vertical rhythm, ornamental precision.",

  fonts: {
    display: {
      family: "Playfair Display",
      weights: [400, 700, 900],
      import:
        "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap",
    },
    body: {
      family: "Cormorant Garamond",
      weights: [400, 500, 700],
      import:
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;700&display=swap",
    },
  },

  tokens: {
    color: {
      paper: "#0d1117",
      ink: "#e8d4a0",
      muted: "#a89968",
      accent: "#d4af37",
      rule: "#a89968",
    },

    radius: {
      none: "0px",
      sm: "2px",
    },

    shadow: {
      none: "none",
    },

    spacing: {
      unit: 8,
    },

    layout: {
      container: "1080px",
      rhythm: 1.55,
    },
  },

  css: `
:root {
  --font-display: 'Playfair Display', serif;
  --font-body: 'Cormorant Garamond', serif;

  --paper: #0d1117;
  --ink: #e8d4a0;
  --muted: #a89968;
  --accent: #d4af37;
  --rule: #a89968;

  --radius-none: 0px;
  --radius-sm: 2px;
}

/* Base Protocol Layer */
body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);

  font-family: var(--font-body);
  font-size: 18px;
  line-height: 1.6;

  background-image:
    radial-gradient(ellipse at top, rgba(212,175,55,0.06) 0%, transparent 70%),
    linear-gradient(135deg, rgba(232,212,160,0.05) 0%, transparent 45%);
}

/* Typography Protocol */
h1, h2, h3, .v-display {
  font-family: var(--font-display);
  font-weight: 900;
  color: var(--accent);

  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 1.05;
}

/* Ornamental Frame Primitive */
.v-frame {
  position: relative;
  border: 1px solid var(--rule);
  padding: 28px;
}

.v-frame::before,
.v-frame::after {
  content: "";
  position: absolute;
  width: 10px;
  height: 10px;
  border: 1px solid var(--accent);
}

.v-frame::before {
  top: -1px;
  left: -1px;
  border-right: 0;
  border-bottom: 0;
}

.v-frame::after {
  bottom: -1px;
  right: -1px;
  border-left: 0;
  border-top: 0;
}

/* Divider Primitive */
.v-rule {
  height: 1px;
  border: 0;
  margin: 32px auto;
  max-width: 240px;

  background: linear-gradient(
    90deg,
    transparent,
    var(--accent),
    transparent
  );
}

/* Interaction Primitive */
.v-button {
  display: inline-block;

  padding: 14px 32px;

  border: 1.5px solid var(--accent);
  background: transparent;

  color: var(--accent);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12px;

  letter-spacing: 0.22em;
  text-transform: uppercase;

  transition: all 180ms ease;
}

.v-button:hover {
  background: var(--accent);
  color: var(--paper);
}

/* Semantic Text Layers */
.v-kicker {
  font-style: italic;
  color: var(--muted);
  letter-spacing: 0.06em;
}

.v-accent {
  color: var(--accent);
  font-style: italic;
}

/* Link Protocol */
a {
  color: var(--accent);
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  padding-bottom: 1px;
}

a:hover {
  opacity: 0.85;
}

/* Micro Component */
.v-pill {
  display: inline-block;
  font-style: italic;
  color: var(--accent);
  letter-spacing: 0.04em;
}
`,
};
