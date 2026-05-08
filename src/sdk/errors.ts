export type SdkErrorCode =
  | "invalid_input"
  | "crawl_failed"
  | "provider_unavailable"
  | "provider_error"
  | "analysis_failed"
  | "monitor_threshold_exceeded"
  | "io_error"
  | "unknown_error";

export interface SdkError {
  code: SdkErrorCode;
  message: string;
  source: string;
  retryable: boolean;
  details?: unknown;
  cause?: string;
}

export interface SdkErrorInit {
  code: SdkErrorCode;
  message: string;
  source: string;
  retryable?: boolean;
  details?: unknown;
  cause?: string;
}

export class FlyDesignSdkError extends Error {
  readonly sdkError: SdkError;

  constructor(init: SdkErrorInit) {
    super(init.message);
    this.name = "FlyDesignSdkError";
    this.sdkError = {
      code: init.code,
      message: init.message,
      source: init.source,
      retryable: Boolean(init.retryable),
      details: init.details,
      cause: init.cause,
    };
  }
}

export function createSdkError(init: SdkErrorInit): SdkError {
  return {
    code: init.code,
    message: init.message,
    source: init.source,
    retryable: Boolean(init.retryable),
    details: init.details,
    cause: init.cause,
  };
}

export function normalizeSdkError(
  error: unknown,
  fallback: { code: SdkErrorCode; source: string; message: string },
): SdkError {
  if (error instanceof FlyDesignSdkError) {
    return error.sdkError;
  }
  if (error instanceof Error) {
    return createSdkError({
      code: fallback.code,
      source: fallback.source,
      message: error.message || fallback.message,
      cause: error.name,
    });
  }
  return createSdkError({
    code: fallback.code,
    source: fallback.source,
    message: fallback.message,
    details: error,
  });
}

export function ensureValue(
  condition: unknown,
  init: SdkErrorInit,
): asserts condition {
  if (!condition) {
    throw new FlyDesignSdkError(init);
  }
}
