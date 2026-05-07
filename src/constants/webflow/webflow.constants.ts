/**
 * @file webflow constants
 * @description Shared generated-code snippets for Webflow formatter output.
 */

export const WEBFLOW_THEME_CLASS = "flyrank-visual-dna";
export const WEBFLOW_EMBED_FILE = "embed.html";

export const WEBFLOW_EMBED_TEMPLATE = `<section class="${WEBFLOW_THEME_CLASS}">
  <div class="${WEBFLOW_THEME_CLASS}__inner">
    <h2 class="${WEBFLOW_THEME_CLASS}__title">{{title}}</h2>
    <p class="${WEBFLOW_THEME_CLASS}__lede">{{lede}}</p>
    <a class="${WEBFLOW_THEME_CLASS}__cta" href="{{ctaUrl}}">{{ctaText}}</a>
  </div>
</section>
<style>
{{css}}
</style>
`;

export const WEBFLOW_CSS_TEMPLATE = `.${WEBFLOW_THEME_CLASS} {
  --fv-primary: {{primary}};
  --fv-bg: {{background}};
  --fv-fg: {{text}};
  --fv-font: {{font}};
  --fv-gap: {{gap}};
  background: var(--fv-bg);
  color: var(--fv-fg);
  font-family: var(--fv-font);
  padding: calc(var(--fv-gap) * 2);
}

.${WEBFLOW_THEME_CLASS}__inner {
  max-width: 960px;
  margin: 0 auto;
}

.${WEBFLOW_THEME_CLASS}__title {
  margin: 0 0 8px;
  font-size: clamp(28px, 4vw, 44px);
}

.${WEBFLOW_THEME_CLASS}__lede {
  margin: 0 0 20px;
  opacity: 0.92;
}

.${WEBFLOW_THEME_CLASS}__cta {
  display: inline-block;
  text-decoration: none;
  background: var(--fv-primary);
  color: #fff;
  padding: 10px 16px;
  border-radius: 10px;
}
`;
