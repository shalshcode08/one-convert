import type { ConversionJob, JobId } from "./job";

/** The full batch state managed by the store */
export interface BatchState {
  readonly jobs: ReadonlyMap<JobId, ConversionJob>;
  readonly order: readonly JobId[]; // insertion order for stable rendering
}

/** Summary computed from a completed batch */
export interface BatchSummary {
  readonly total: number;
  readonly done: number;
  readonly failed: number;
  readonly pending: number;
  readonly running: number;
}

export function computeBatchSummary(
  jobs: ReadonlyMap<JobId, ConversionJob>,
): BatchSummary {
  let done = 0;
  let failed = 0;
  let pending = 0;
  let running = 0;

  for (const job of jobs.values()) {
    if (job.status === "done") done++;
    else if (job.status === "error") failed++;
    else if (job.status === "pending") pending++;
    else if (job.status === "running") running++;
  }

  return { total: jobs.size, done, failed, pending, running };
}
