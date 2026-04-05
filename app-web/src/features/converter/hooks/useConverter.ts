import { processBatch } from "@one-convert/core";
import type { ConversionJob, JobId } from "@one-convert/types";

import { useConverterStore } from "../store/converterStore";

export function useConverter() {
  async function convertAll(): Promise<void> {
    const state = useConverterStore.getState();
    const { jobs, order, globalFormat, quality, updateJob } = state;

    const pendingJobs: ConversionJob[] = order
      .map((id) => jobs[id])
      .filter(
        (job): job is ConversionJob =>
          job !== undefined && job.status === "pending",
      )
      .map((job) => ({ ...job, targetFormat: globalFormat }));

    if (pendingJobs.length === 0) return;

    for (const job of pendingJobs) {
      updateJob(job.id, {
        status: "running",
        progress: 0,
        targetFormat: globalFormat,
      });
    }

    await processBatch(
      pendingJobs,
      ({ jobId, result }) => {
        const id = jobId as JobId;
        const currentJob = useConverterStore.getState().jobs[id];
        if (!currentJob) return;

        if (result.ok) {
          const baseName = currentJob.file.name.replace(/\.[^/.]+$/, "");
          useConverterStore.getState().updateJob(id, {
            status: "done",
            progress: 100,
            outputBlob: result.value,
            outputFileName: `${baseName}.${currentJob.targetFormat}`,
            completedAt: Date.now(),
          });
        } else {
          useConverterStore.getState().updateJob(id, {
            status: "error",
            progress: 0,
            error: result.error,
            completedAt: Date.now(),
          });
        }
      },
      quality,
    );
  }

  return { convertAll };
}
