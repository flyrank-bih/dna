/**
 *
 * Widget Element ( Third Party Widgets that hinder extraction of visuals.)
 *
 * Criteria: 10s of thousands of sites, uses a stable hook n/or would in any way/shape/form hinder extraction of token
 *
 * Flyrank©, 2026
 * Created by: @admirsaheta on 7/5/2026
 *
 *
 */

export enum WidgetSelector {
  // =========================
  // Intercom
  // =========================
  INTERCOM_CONTAINER = "#intercom-container",
  INTERCOM_FRAME = "#intercom-frame",
  INTERCOM_IFRAME = 'iframe[name*="intercom"]',
  INTERCOM_MESSENGER = ".intercom-lightweight-app",

  // =========================
  // Drift
  // =========================
  DRIFT_WIDGET = "#drift-widget",
  DRIFT_FRAME_CONTROLLER = "#drift-frame-controller",
  DRIFT_FRAME_CHAT = "#drift-frame-chat",

  // =========================
  // Hubspot
  // =========================
  HUBSPOT_MESSAGES = "#hubspot-messages-iframe-container",
  HUBSPOT_CHATFLOW = ".hubspot-messages-iframe",

  // =========================
  // Crisp
  // =========================
  CRISP_CHATBOX = "#crisp-chatbox",
  CRISP_CLIENT = ".crisp-client",

  // =========================
  // Zendesk
  // =========================
  ZENDESK_MESSAGING_IFRAME = 'iframe[title*="Messaging"]',
  ZENDESK_LAUNCHER = "#launcher",
  ZENDESK_WIDGET = '[data-product="web_widget"]',
  ZENDESK_CONTAINER = "#webWidget",

  // =========================
  // Tawk
  // =========================
  TAWK_DEFAULT = "#tawk-default",
  CHAT_WINDOW_IFRAME = 'iframe[title*="chat window"]',

  // =========================
  // LiveChat
  // =========================
  LIVECHAT_WIDGET_CONTAINER = "#chat-widget-container",
  LIVECHAT_COMPACT_CONTAINER = "#livechat-compact-container",

  // =========================
  // Helpshift
  // =========================
  HELPSHIFT_IFRAME = "#helpshift-iframe",

  // =========================
  // Freshchat
  // =========================
  FRESHCHAT_IFRAME = 'iframe[src*="freshchat"]',
  FRESHCHAT_FRAME = "#fc_frame",

  // =========================
  // Olark
  // =========================
  OLARK_IFRAME = 'iframe[src*="olark"]',
  OLARK_WRAPPER = "#olark-wrapper",

  // =========================
  // Facebook Messenger
  // =========================
  FACEBOOK_CUSTOMER_CHAT = ".fb-customerchat",
  FACEBOOK_DIALOG = ".fb_dialog",
  FACEBOOK_DIALOG_IFRAME = 'iframe[src*="facebook.com/plugins/customerchat"]',

  // =========================
  // WhatsApp widgets
  // =========================
  WHATSAPP_FLOAT = '[class*="whatsapp"]',
  WHATSAPP_BUTTON = '[href*="wa.me"]',
  WHATSAPP_IFRAME = 'iframe[src*="whatsapp"]',

  // =========================
  // Generic support/chat
  // =========================
  CHAT_WIDGET_ID = '[id^="chat-widget"]',
  CHAT_WIDGET_CLASS = '[class*="chat-widget"]',
  LIVECHAT_CLASS = '[class*="livechat"]',
  SUPPORT_WIDGET = '[class*="support-widget"]',
  HELP_WIDGET = '[class*="help-widget"]',
  MESSENGER_WIDGET = '[class*="messenger"]',
  CUSTOMER_SUPPORT = '[class*="customer-support"]',

  // =========================
  // Cookiebot
  // =========================
  COOKIEBOT_DIALOG = "#CybotCookiebotDialog",
  COOKIEBOT_DIALOG_BODY = "#CybotCookiebotDialogBody",

  // =========================
  // OneTrust
  // =========================
  ONETRUST_BANNER = "#onetrust-banner-sdk",
  ONETRUST_CONSENT = "#onetrust-consent-sdk",
  ONETRUST_PC = "#onetrust-pc-sdk",

  // =========================
  // Termly
  // =========================
  TERMLY_BANNER_TOP = ".termly-banner-top",
  TERMLY_STYLES_BANNER = ".termly-styles-banner",

  // =========================
  // Generic cookie banners
  // =========================
  COOKIE_BANNER = "#cookiebanner",
  COOKIE_BANNER_ALT = "#cookie-banner",
  COOKIE_NOTICE = "#cookie-notice",
  COOKIE_POPUP = ".cookie-popup",
  COOKIE_MODAL = ".cookie-modal",
  COOKIE_CONSENT = '[class*="cookie-consent"]',
  COOKIE_DIALOG = '[aria-label*="cookie" i][role="dialog"]',
  GDPR_BANNER = '[class*="gdpr"]',
  CONSENT_BANNER = '[class*="consent-banner"]',

  // =========================
  // CookieConsent
  // =========================
  COOKIECONSENT_WINDOW = ".cc-window",
  COOKIECONSENT_BANNER = ".cc-banner",

  // =========================
  // Usercentrics / Iubenda
  // =========================
  USERCENTRICS_ROOT = "#usercentrics-root",
  IUBENDA_BANNER = "#iubenda-cs-banner",

  // =========================
  // Accessibility overlays
  // =========================
  ACCESSIBE = "#acsb-root",
  USERWAY = "#userwayAccessibilityIcon",
  ACCESSIBILITY_WIDGET = '[class*="accessibility"]',
  ACCESSIBILITY_OVERLAY = '[id*="accessibility"]',

  // =========================
  // reCAPTCHA / anti-bot
  // =========================
  GRECAPTCHA_BADGE = ".grecaptcha-badge",
  RECAPTCHA_IFRAME = 'iframe[src*="recaptcha"]',
  HCAPTCHA_IFRAME = 'iframe[src*="hcaptcha"]',

  // =========================
  // Analytics / trackers
  // =========================
  DOUBLECLICK_IFRAME = 'iframe[src*="doubleclick"]',
  GTM_IFRAME = 'iframe[src*="googletagmanager"]',
  FACEBOOK_PIXEL_IFRAME = 'iframe[src*="facebook.com/tr"]',

  // =========================
  // Newsletter / popups
  // =========================
  KLAVIYO_FORM = '[class*="klaviyo"]',
  MAILCHIMP_POPUP = "#mc_embed_signup",
  PRIVY_CONTAINER = "#privy-container",
  ATTENTIVE_MODAL = '[class*="attentive"]',
  POPUP_MODAL = '[class*="popup"]',
  NEWSLETTER_MODAL = '[class*="newsletter"]',
  SUBSCRIBE_MODAL = '[class*="subscribe"]',

  // =========================
  // Promo / discount overlays
  // =========================
  PROMO_BAR = '[class*="promo-bar"]',
  ANNOUNCEMENT_BAR = '[class*="announcement-bar"]',
  DISCOUNT_MODAL = '[class*="discount-modal"]',
  SPIN_WHEEL = '[class*="spin-wheel"]',
  EXIT_INTENT = '[class*="exit-intent"]',

  // =========================
  // Social share bars
  // =========================
  ADDTHIS_FLOATING = ".addthis_floating_style",
  ADDTHIS_SMARTLAYERS = "#addthis-smartlayers",
  SHARETHIS_INLINE = ".sharethis-inline-share-buttons",
  SOCIAL_FLOATING_BAR = '[class*="social-share"]',

  // =========================
  // Sticky UI
  // =========================
  STICKY_HEADER = '[class*="sticky-header"]',
  STICKY_FOOTER = '[class*="sticky-footer"]',
  FLOATING_BUTTON = '[class*="floating-button"]',
  BACK_TO_TOP = '[class*="back-to-top"]',

  // =========================
  // Video overlays
  // =========================
  VIDEO_MODAL = '[class*="video-modal"]',
  YOUTUBE_EMBED = 'iframe[src*="youtube.com/embed"]',
  VIMEO_EMBED = 'iframe[src*="player.vimeo.com"]',

  // =========================
  // Generic modals / overlays
  // =========================
  MODAL = '[role="dialog"]',
  OVERLAY = '[class*="overlay"]',
  DRAWER = '[class*="drawer"]',
  POPOVER = '[class*="popover"]',
  LIGHTBOX = '[class*="lightbox"]',
  PORTAL = "#portal-root",
  REACT_PORTAL = "#headlessui-portal-root",

  // =========================
  // Mobile nav / app banners
  // =========================
  MOBILE_MENU = '[class*="mobile-menu"]',
  APP_BANNER = '[class*="app-banner"]',
  SMART_BANNER = ".smartbanner",

  // =========================
  // A/B testing / personalization
  // =========================
  OPTIMIZELY = '[id*="optimizely"]',
  VWO = '[class*="vwo"]',
  DYNAMIC_YIELD = '[class*="dy-"]',

  // =========================
  // Generic catch-alls
  // =========================
  FIXED_ELEMENT = '[style*="position: fixed"]',
  HIGH_Z_INDEX = '[style*="z-index"]',
}