import type { ConversionJob, Result } from "@one-convert/types";
import { err } from "@one-convert/types";

import { convert } from "./pipeline";

export interface BatchProgressEvent {
  readonly jobId: string;
  readonly result: Result<Blob>;
}

export type OnProgress = (event: BatchProgressEvent) => void;

/**
 * Processes all jobs concurrently.
 * Calls onProgress for each completed job (success or failure).
 * Never rejects — all errors are captured in the Result type.
 */
export async function processBatch(
  jobs: readonly ConversionJob[],
  onProgress: OnProgress,
): Promise<void> {
  await Promise.allSettled(
    jobs.map(async (job) => {
      let result: Result<Blob>;
      try {
        result = await convert(job.file, job.targetFormat);
      } catch (cause) {
        result = err({ code: "UNKNOWN", message: "Unexpected batch error", cause });
      }
      onProgress({ jobId: job.id, result });
    }),
  );
}
