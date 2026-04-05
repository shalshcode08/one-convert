import type { OutputFormat } from "./formats";

/** Unique identifier for a conversion job */
export type JobId = string & { readonly __brand: "JobId" };

export function createJobId(): JobId {
  return crypto.randomUUID() as JobId;
}

/** All possible states a job can be in */
export type JobStatus = "pending" | "running" | "done" | "error";

/** A single file conversion job */
export interface ConversionJob {
  readonly id: JobId;
  readonly file: File;
  readonly targetFormat: OutputFormat;
  readonly status: JobStatus;
  readonly progress: number; // 0–100
  readonly outputBlob: Blob | null;
  readonly outputFileName: string | null;
  readonly error: ConversionError | null;
  readonly createdAt: number; // Date.now()
  readonly completedAt: number | null;
}

/** Typed conversion error — never a plain string */
export type ConversionErrorCode =
  | "UNSUPPORTED_FORMAT"
  | "FILE_TOO_LARGE"
  | "INVALID_FILE"
  | "CANVAS_UNAVAILABLE"
  | "SVG_TRACE_FAILED"
  | "GIF_ENCODE_FAILED"
  | "UNKNOWN";

export interface ConversionError {
  readonly code: ConversionErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}

/** Result type — no throwing, typed outcomes only */
export type Result<T, E = ConversionError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}
