/**
 * @file wordpress constants
 * @description Shared generated-code snippets for WordPress formatter output.
 */

export const WORDPRESS_SCHEMA_URL = "https://schemas.wp.org/trunk/theme.json";
export const WORDPRESS_THEME_NAME = "FlyRank Visual DNA extracted theme";

export const WORDPRESS_FUNCTIONS_PHP_SNIPPET = `<?php
if (!function_exists('flyrank_theme_support')) {
  function flyrank_theme_support() {
    add_theme_support('wp-block-styles');
    add_theme_support('editor-styles');
    add_theme_support('responsive-embeds');
  }
  add_action('after_setup_theme', 'flyrank_theme_support');
}
`;

export const WORDPRESS_INDEX_PHP_SNIPPET = `<?php get_header(); get_template_part('template-parts/content'); get_footer(); ?>
`;

export const WORDPRESS_INDEX_HTML_SNIPPET = `<!-- wp:template-part {"slug":"header"} /-->
<!-- wp:group {"tagName":"main","layout":{"type":"constrained"}} -->
<main class="wp-block-group"><!-- wp:post-content /--></main>
<!-- /wp:group -->
<!-- wp:template-part {"slug":"footer"} /-->
`;
