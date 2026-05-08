import { type SdkResponseMeta } from "./response";

export interface SdkMetricEvent {
  method: string;
  ok: boolean;
  meta: SdkResponseMeta;
  tags?: Record<string, string | number | boolean>;
}

export interface SdkAnalyticsHooks {
  onMetric?(event: SdkMetricEvent): void | Promise<void>;
}
