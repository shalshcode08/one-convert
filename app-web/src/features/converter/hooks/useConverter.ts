import { processBatch } from "@one-convert/core";
import type { JobId } from "@one-convert/types";

import { useConverterStore } from "../store/converterStore";

/**
 * Orchestrates the conversion pipeline with the Zustand store.
 * Starts all pending jobs concurrently and updates job state via onProgress.
 */
export function useConverter() {
  const { jobs, order, updateJob } = useConverterStore();

  async function convertAll(): Promise<void> {
    const pendingJobs = order
      .map((id) => jobs.get(id))
      .filter((job): job is NonNullable<typeof job> => job?.status === "pending");

    if (pendingJobs.length === 0) return;

    // Mark all as running
    for (const job of pendingJobs) {
      updateJob(job.id, { status: "running", progress: 0 });
    }

    await processBatch(pendingJobs, ({ jobId, result }) => {
      const id = jobId as JobId;
      const job = jobs.get(id);
      if (!job) return;

      if (result.ok) {
        const ext = job.targetFormat;
        const baseName = job.file.name.replace(/\.[^/.]+$/, "");
        updateJob(id, {
          status: "done",
          progress: 100,
          outputBlob: result.value,
          outputFileName: `${baseName}.${ext}`,
          completedAt: Date.now(),
        });
      } else {
        updateJob(id, {
          status: "error",
          progress: 0,
          error: result.error,
          completedAt: Date.now(),
        });
      }
    });
  }

  return { convertAll };
}
