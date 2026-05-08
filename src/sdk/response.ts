import { randomUUID } from "crypto";
import { type SdkError } from "./errors";

export interface SdkResponseMeta {
  requestId: string;
  timestamp: string;
  durationMs: number;
  version: string;
  source: string;
  cached?: boolean;
  usage?: Record<string, number | string | boolean | null>;
}

export interface SdkSuccessResponse<TData> {
  ok: true;
  data: TData;
  error: null;
  meta: SdkResponseMeta;
}

export interface SdkErrorResponse {
  ok: false;
  data: null;
  error: SdkError;
  meta: SdkResponseMeta;
}

export type SdkResponse<TData> = SdkSuccessResponse<TData> | SdkErrorResponse;

export interface ResponseMetaInit {
  requestId?: string;
  durationMs: number;
  version: string;
  source: string;
  cached?: boolean;
  usage?: Record<string, number | string | boolean | null>;
}

export function createResponseMeta(init: ResponseMetaInit): SdkResponseMeta {
  return {
    requestId: init.requestId || randomUUID(),
    timestamp: new Date().toISOString(),
    durationMs: init.durationMs,
    version: init.version,
    source: init.source,
    cached: init.cached,
    usage: init.usage,
  };
}

export function successResponse<TData>(
  data: TData,
  meta: SdkResponseMeta,
): SdkSuccessResponse<TData> {
  return {
    ok: true,
    data,
    error: null,
    meta,
  };
}

export function errorResponse(
  error: SdkError,
  meta: SdkResponseMeta,
): SdkErrorResponse {
  return {
    ok: false,
    data: null,
    error,
    meta,
  };
}
