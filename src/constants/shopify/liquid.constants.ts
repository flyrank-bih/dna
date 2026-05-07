/**
 * @file liquid constants
 * @description Shared generated-code snippets for Shopify Liquid formatter output.
 */

export const LIQUID_SECTION_NAME = "flyrank-visual-dna";
export const LIQUID_WRAPPER_CLASS = "flyrank-visual-dna";

export const LIQUID_SECTION_TEMPLATE = `{%- style -%}
{{css}}
{%- endstyle -%}

<section class="{{wrapperClass}}">
  <div class="{{wrapperClass}}__inner">
    <h2 class="{{wrapperClass}}__title">{{ section.settings.title }}</h2>
    <p class="{{wrapperClass}}__lede">{{ section.settings.lede }}</p>
    <a class="{{wrapperClass}}__cta" href="{{ section.settings.cta_url }}">
      {{ section.settings.cta_text }}
    </a>
  </div>
</section>

{% schema %}
{
  "name": "{{sectionName}}",
  "settings": [
    { "type": "text", "id": "title", "label": "Title", "default": "FlyRank Visual DNA" },
    { "type": "textarea", "id": "lede", "label": "Lede", "default": "Generated Shopify section from extracted design tokens." },
    { "type": "text", "id": "cta_text", "label": "CTA Text", "default": "Explore" },
    { "type": "url", "id": "cta_url", "label": "CTA URL", "default": "/" }
  ],
  "presets": [
    { "name": "{{sectionName}}", "category": "FlyRank" }
  ]
}
{% endschema %}
`;

export const LIQUID_CSS_TEMPLATE = `.${LIQUID_WRAPPER_CLASS} {
  --fv-primary: {{primary}};
  --fv-bg: {{background}};
  --fv-fg: {{text}};
  --fv-font: {{font}};
  padding: 32px 20px;
  color: var(--fv-fg);
  background: var(--fv-bg);
  font-family: var(--fv-font);
}

.${LIQUID_WRAPPER_CLASS}__inner {
  max-width: 960px;
  margin: 0 auto;
}

.${LIQUID_WRAPPER_CLASS}__title {
  margin: 0 0 8px;
  font-size: 2rem;
  line-height: 1.2;
}

.${LIQUID_WRAPPER_CLASS}__lede {
  margin: 0 0 20px;
  opacity: 0.9;
}

.${LIQUID_WRAPPER_CLASS}__cta {
  display: inline-block;
  background: var(--fv-primary);
  color: #fff;
  text-decoration: none;
  padding: 10px 16px;
  border-radius: 8px;
}
`;
