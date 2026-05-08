import { type SdkAnalyticsHooks } from "./analytics";
import { type SdkLogger } from "./logging";

export interface SdkAiAdapterLike {
  name: string;
}

export interface SdkAiConfig {
  enabled?: boolean;
  provider?: "openai";
  apiKey?: string;
  model?: string;
  adapter?: SdkAiAdapterLike;
}

export interface SdkMonitoringThresholds {
  colorChange?: number;
  typographyChange?: number;
  identityChange?: boolean;
  benchmarkChange?: number;
}

export interface SdkMonitoringConfig {
  enabled?: boolean;
  snapshotDir?: string;
  thresholds?: SdkMonitoringThresholds;
  onAlert?: (alert: unknown) => void | Promise<void>;
  webhookUrl?: string;
  persistSnapshots?: boolean;
}

export interface SdkHookConfig extends SdkAnalyticsHooks {
  logger?: SdkLogger;
  onRequest?(
    event: { method: string; requestId: string; input?: unknown },
  ): void | Promise<void>;
  onResponse?(
    event: { method: string; requestId: string; output?: unknown },
  ): void | Promise<void>;
  onError?(
    event: { method: string; requestId: string; error?: unknown },
  ): void | Promise<void>;
}

export interface SdkExtractDefaults {
  cache?: boolean;
  screenshots?: boolean;
  screenshot?: boolean;
  outputDir?: string;
  emitFiles?: boolean;
  pages?: number;
  responsive?: boolean;
  interact?: boolean;
  deepInteract?: boolean;
  platforms?: Array<
    "web" | "ios" | "android" | "flutter" | "wordpress" | "all"
  >;
  mode?: string;
  ignore?: string[];
}

export interface SdkInitInput extends SdkExtractDefaults {
  crawl?: Partial<SdkExtractDefaults>;
  artifacts?: {
    outputDir?: string;
    emitFiles?: boolean;
  };
  ai?: SdkAiConfig;
  monitoring?: SdkMonitoringConfig;
  logging?: SdkHookConfig;
  analytics?: SdkAnalyticsHooks;
}

export interface NormalizedSdkConfig {
  extract: SdkExtractDefaults;
  ai: SdkAiConfig;
  monitoring: SdkMonitoringConfig;
  logging: SdkHookConfig;
  analytics: SdkAnalyticsHooks;
}

export function normalizeSdkConfig(
  input: SdkInitInput = {},
): NormalizedSdkConfig {
  const extract: SdkExtractDefaults = {
    cache: input.cache ?? true,
    screenshots:
      typeof input.screenshots === "boolean"
        ? input.screenshots
        : input.crawl?.screenshots ?? false,
    screenshot:
      typeof input.screenshot === "boolean"
        ? input.screenshot
        : input.crawl?.screenshot,
    outputDir:
      input.outputDir ||
      input.artifacts?.outputDir ||
      input.crawl?.outputDir ||
      ".flydesign",
    emitFiles:
      typeof input.emitFiles === "boolean"
        ? input.emitFiles
        : input.artifacts?.emitFiles ?? true,
    pages:
      typeof input.pages === "number"
        ? input.pages
        : input.crawl?.pages,
    responsive:
      typeof input.responsive === "boolean"
        ? input.responsive
        : input.crawl?.responsive,
    interact:
      typeof input.interact === "boolean"
        ? input.interact
        : input.crawl?.interact,
    deepInteract:
      typeof input.deepInteract === "boolean"
        ? input.deepInteract
        : input.crawl?.deepInteract,
    platforms: input.platforms || input.crawl?.platforms,
    mode: input.mode || input.crawl?.mode,
    ignore: input.ignore || input.crawl?.ignore,
  };

  return {
    extract,
    ai: {
      enabled: input.ai?.enabled ?? Boolean(input.ai?.adapter || input.ai?.apiKey),
      provider: input.ai?.provider || "openai",
      apiKey: input.ai?.apiKey,
      model: input.ai?.model,
      adapter: input.ai?.adapter,
    },
    monitoring: {
      enabled: input.monitoring?.enabled ?? false,
      snapshotDir:
        input.monitoring?.snapshotDir || extract.outputDir || ".flydesign",
      thresholds: {
        colorChange: input.monitoring?.thresholds?.colorChange ?? 0.2,
        typographyChange: input.monitoring?.thresholds?.typographyChange ?? 0.2,
        identityChange: input.monitoring?.thresholds?.identityChange ?? true,
        benchmarkChange: input.monitoring?.thresholds?.benchmarkChange ?? 0.25,
      },
      onAlert: input.monitoring?.onAlert,
      webhookUrl: input.monitoring?.webhookUrl,
      persistSnapshots: input.monitoring?.persistSnapshots ?? true,
    },
    logging: input.logging || {},
    analytics: input.analytics || {},
  };
}
