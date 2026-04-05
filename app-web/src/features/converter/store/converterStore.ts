import type { ConversionJob, JobId, OutputFormat } from "@one-convert/types";
import { createJobId } from "@one-convert/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type JobRecord = Record<JobId, ConversionJob>;

interface ConverterState {
  jobs: JobRecord;
  order: JobId[];
  globalFormat: OutputFormat;
  quality: number; // 0–1, only applies to jpg/webp
}

interface ConverterActions {
  setGlobalFormat: (format: OutputFormat) => void;
  setQuality: (quality: number) => void;
  addFiles: (files: readonly File[]) => void;
  updateJob: (id: JobId, patch: Partial<ConversionJob>) => void;
  removeJob: (id: JobId) => void;
  clearAll: () => void;
  clearCompleted: () => void;
}

export type ConverterStore = ConverterState & ConverterActions;

export const useConverterStore = create<ConverterStore>()(
  devtools(
    immer((set) => ({
      jobs: {} as JobRecord,
      order: [],
      globalFormat: "png" satisfies OutputFormat,
      quality: 0.92,

      setGlobalFormat: (format) => {
        set((state) => {
          state.globalFormat = format;
          for (const id of state.order) {
            const job = state.jobs[id];
            if (job && job.status === "pending") {
              state.jobs[id] = { ...job, targetFormat: format };
            }
          }
        });
      },

      setQuality: (quality) => {
        set((state) => {
          state.quality = quality;
        });
      },

      addFiles: (files) => {
        set((state) => {
          for (const file of files) {
            const id = createJobId();
            state.jobs[id] = {
              id,
              file,
              targetFormat: state.globalFormat,
              status: "pending",
              progress: 0,
              outputBlob: null,
              outputFileName: null,
              error: null,
              createdAt: Date.now(),
              completedAt: null,
            };
            state.order.push(id);
          }
        });
      },

      updateJob: (id, patch) => {
        set((state) => {
          const job = state.jobs[id];
          if (job) {
            state.jobs[id] = { ...job, ...patch };
          }
        });
      },

      removeJob: (id) => {
        set((state) => {
          delete state.jobs[id];
          state.order = state.order.filter((jid) => jid !== id);
        });
      },

      clearAll: () => {
        set((state) => {
          state.jobs = {} as JobRecord;
          state.order = [];
        });
      },

      clearCompleted: () => {
        set((state) => {
          const toRemove = Object.values(state.jobs)
            .filter((j) => j.status === "done" || j.status === "error")
            .map((j) => j.id);
          for (const id of toRemove) {
            delete state.jobs[id];
          }
          state.order = state.order.filter((id) => !toRemove.includes(id));
        });
      },
    })),
    { name: "one-convert/converter" },
  ),
);
