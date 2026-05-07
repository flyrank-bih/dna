<?php
/**
 * FlyRank Visual DNA WordPress snippets.
 * Placeholders:
 * - {{themeName}}
 * - {{source}}
 * - {{version}}
 */

/* style.css header
Theme Name: {{themeName}}
Theme URI: https://github.com/flyrank-bih/visualdna
Description: Block theme generated from {{source}} by FlyRank Visual DNA v{{version}}
Version: 1.0.0
Author: FlyRank
License: MIT
Text Domain: flyrank-theme
*/

if (!function_exists('flyrank_theme_support')) {
  function flyrank_theme_support() {
    add_theme_support('wp-block-styles');
    add_theme_support('editor-styles');
    add_theme_support('responsive-embeds');
  }
  add_action('after_setup_theme', 'flyrank_theme_support');
}

// index.php
// <?php get_header(); get_template_part('template-parts/content'); get_footer(); ?>
