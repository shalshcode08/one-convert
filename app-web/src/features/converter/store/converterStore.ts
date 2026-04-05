import type { ConversionJob, JobId, OutputFormat } from "@one-convert/types";
import { createJobId } from "@one-convert/types";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface ConverterState {
  jobs: Map<JobId, ConversionJob>;
  order: JobId[];
  globalFormat: OutputFormat;
}

interface ConverterActions {
  setGlobalFormat: (format: OutputFormat) => void;
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
      // State
      jobs: new Map(),
      order: [],
      globalFormat: "png" satisfies OutputFormat,

      // Actions
      setGlobalFormat: (format) => {
        set((state) => {
          state.globalFormat = format;
        });
      },

      addFiles: (files) => {
        set((state) => {
          for (const file of files) {
            const id = createJobId();
            const job: ConversionJob = {
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
            state.jobs.set(id, job);
            state.order.push(id);
          }
        });
      },

      updateJob: (id, patch) => {
        set((state) => {
          const job = state.jobs.get(id);
          if (job) {
            state.jobs.set(id, { ...job, ...patch });
          }
        });
      },

      removeJob: (id) => {
        set((state) => {
          state.jobs.delete(id);
          state.order = state.order.filter((jid) => jid !== id);
        });
      },

      clearAll: () => {
        set((state) => {
          state.jobs.clear();
          state.order = [];
        });
      },

      clearCompleted: () => {
        set((state) => {
          const toRemove = Array.from(state.jobs.values())
            .filter((j) => j.status === "done" || j.status === "error")
            .map((j) => j.id);
          for (const id of toRemove) {
            state.jobs.delete(id);
          }
          state.order = state.order.filter((id) => !toRemove.includes(id));
        });
      },
    })),
    { name: "one-convert/converter" },
  ),
);
