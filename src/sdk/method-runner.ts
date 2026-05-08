import { type NormalizedSdkConfig } from "./config";
import { normalizeSdkError, type SdkErrorCode } from "./errors";
import { type SdkAnalyticsHooks } from "./analytics";
import {
  logError,
  logInfo,
  type SdkLogger,
} from "./logging";
import {
  createResponseMeta,
  errorResponse,
  successResponse,
  type SdkResponse,
} from "./response";

export type SdkFallbackErrorCode = SdkErrorCode;

export function createSdkMethodRunner(
  version: string,
  config: NormalizedSdkConfig,
): <TData>(
  method: string,
  source: string,
  action: () => Promise<TData>,
  fallbackError?: { code: SdkFallbackErrorCode; message: string },
) => Promise<SdkResponse<TData>> {
  const logger: SdkLogger | undefined = config.logging.logger;
  const analytics: SdkAnalyticsHooks = config.analytics;

  return async function runMethod<TData>(
    method: string,
    source: string,
    action: () => Promise<TData>,
    fallbackError: { code: SdkFallbackErrorCode; message: string } = {
      code: "analysis_failed",
      message: `${method} failed`,
    },
  ): Promise<SdkResponse<TData>> {
    const startedAt = Date.now();
    const requestId = `${method}-${startedAt}`;
    await config.logging.onRequest?.({ method, requestId });
    logInfo(logger, `flydesign:${method}:start`, { requestId });

    try {
      const data = await action();
      const meta = createResponseMeta({
        requestId,
        durationMs: Date.now() - startedAt,
        version,
        source,
      });
      const response = successResponse(data, meta);
      await config.logging.onResponse?.({ method, requestId, output: data });
      await analytics.onMetric?.({
        method,
        ok: true,
        meta,
      });
      logInfo(logger, `flydesign:${method}:success`, {
        requestId,
        durationMs: meta.durationMs,
      });
      return response;
    } catch (error) {
      const sdkError = normalizeSdkError(error, {
        code: fallbackError.code,
        source,
        message: fallbackError.message,
      });
      const meta = createResponseMeta({
        requestId,
        durationMs: Date.now() - startedAt,
        version,
        source,
      });
      await config.logging.onError?.({ method, requestId, error: sdkError });
      await analytics.onMetric?.({
        method,
        ok: false,
        meta,
      });
      logError(logger, `flydesign:${method}:error`, {
        requestId,
        error: sdkError,
      });
      return errorResponse(sdkError, meta);
    }
  };
}
