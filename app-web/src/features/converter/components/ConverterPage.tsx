import { Button, cn } from "@one-convert/ui";
import { Download } from "lucide-react";

import { downloadBlob } from "@/shared/lib/downloadBlob";

import { useConverter } from "../hooks/useConverter";
import { useConverterStore } from "../store/converterStore";
import { DropZone } from "./DropZone";
import { FileCard } from "./FileCard";
import { FormatPicker } from "./FormatPicker";

export function ConverterPage() {
  const {
    jobs,
    order,
    globalFormat,
    setGlobalFormat,
    addFiles,
    removeJob,
    clearCompleted,
  } = useConverterStore();

  const { convertAll } = useConverter();

  const jobList = order.map((id) => jobs.get(id)).filter(Boolean) as NonNullable<
    ReturnType<typeof jobs.get>
  >[];

  const pendingCount = jobList.filter((j) => j.status === "pending").length;
  const runningCount = jobList.filter((j) => j.status === "running").length;
  const doneCount = jobList.filter((j) => j.status === "done").length;
  const isConverting = runningCount > 0;
  const hasJobs = jobList.length > 0;
  const hasDone = doneCount > 0;

  const handleRetry = (id: string) => {
    // Re-queue failed job as pending — store treats it as new
    useConverterStore.getState().updateJob(id as Parameters<typeof removeJob>[0], {
      status: "pending",
      error: null,
      outputBlob: null,
      outputFileName: null,
      completedAt: null,
      progress: 0,
    });
  };

  const handleDownloadAll = () => {
    for (const job of jobList) {
      if (job.status === "done" && job.outputBlob && job.outputFileName) {
        downloadBlob(job.outputBlob, job.outputFileName);
      }
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-16">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-xl font-semibold tracking-tight">one-convert</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Local image conversion — nothing leaves your browser.
        </p>
      </header>

      {/* Drop zone */}
      <DropZone onFiles={addFiles} disabled={isConverting} />

      {/* Controls */}
      <div
        className={cn(
          "mt-6 flex flex-wrap items-center justify-between gap-3 transition-opacity",
          !hasJobs && "opacity-40 pointer-events-none",
        )}
      >
        <FormatPicker value={globalFormat} onChange={setGlobalFormat} disabled={isConverting} />

        <div className="flex items-center gap-2">
          {hasDone && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownloadAll}
                className="gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Download all
              </Button>
              <Button variant="ghost" size="sm" onClick={clearCompleted} className="text-xs">
                Clear done
              </Button>
            </>
          )}
          <Button
            size="sm"
            onClick={() => void convertAll()}
            disabled={isConverting || pendingCount === 0}
            className="min-w-24"
          >
            {isConverting ? `Converting…` : `Convert${pendingCount > 0 ? ` (${pendingCount})` : ""}`}
          </Button>
        </div>
      </div>

      {/* File list */}
      {hasJobs && (
        <ul className="mt-3 flex flex-col gap-2" role="list" aria-label="Conversion queue">
          {jobList.map((job) => (
            <li key={job.id}>
              <FileCard
                job={job}
                onRemove={removeJob}
                onRetry={handleRetry}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
