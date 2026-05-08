export interface SdkLogger {
  debug?(message: string, payload?: unknown): void;
  info?(message: string, payload?: unknown): void;
  warn?(message: string, payload?: unknown): void;
  error?(message: string, payload?: unknown): void;
}

export interface SdkLogEvent {
  method: string;
  requestId: string;
  payload?: unknown;
}

export function logDebug(
  logger: SdkLogger | undefined,
  message: string,
  payload?: unknown,
): void {
  logger?.debug?.(message, payload);
}

export function logInfo(
  logger: SdkLogger | undefined,
  message: string,
  payload?: unknown,
): void {
  logger?.info?.(message, payload);
}

export function logWarn(
  logger: SdkLogger | undefined,
  message: string,
  payload?: unknown,
): void {
  logger?.warn?.(message, payload);
}

export function logError(
  logger: SdkLogger | undefined,
  message: string,
  payload?: unknown,
): void {
  logger?.error?.(message, payload);
}
