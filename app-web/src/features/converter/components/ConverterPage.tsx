import type { JobId, OutputFormat } from "@one-convert/types";
import { Button } from "@one-convert/ui";
import { Download, Loader2, Moon, Sun } from "lucide-react";

import { downloadBlob } from "@/shared/lib/downloadBlob";
import { downloadZip } from "@/shared/lib/downloadZip";
import { useTheme } from "@/shared/hooks/useTheme";
import { useClipboardPaste } from "@/shared/hooks/useClipboardPaste";
import { useDropAnywhere } from "@/shared/hooks/useDropAnywhere";

import { useConverter } from "../hooks/useConverter";
import { useConverterStore } from "../store/converterStore";
import { DropZone } from "./DropZone";
import { FileCard } from "./FileCard";
import { FormatPicker } from "./FormatPicker";
import { QualitySlider } from "./QualitySlider";

export function ConverterPage() {
  const {
    jobs,
    order,
    globalFormat,
    quality,
    setGlobalFormat,
    setQuality,
    addFiles,
    removeJob,
    clearCompleted,
  } = useConverterStore();

  const { convertAll } = useConverter();
  const { theme, toggle: toggleTheme } = useTheme();

  useClipboardPaste(addFiles);
  const { isDraggingOver } = useDropAnywhere(addFiles);

  const jobList = order
    .map((id) => jobs[id])
    .filter((j): j is NonNullable<typeof j> => j !== undefined);

  const pendingCount = jobList.filter((j) => j.status === "pending").length;
  const runningCount = jobList.filter((j) => j.status === "running").length;
  const doneCount = jobList.filter((j) => j.status === "done").length;
  const isConverting = runningCount > 0;
  const hasJobs = jobList.length > 0;
  const hasDone = doneCount > 0;

  const handleRetry = (id: JobId) => {
    const { globalFormat: fmt, updateJob } = useConverterStore.getState();
    updateJob(id, {
      status: "pending",
      targetFormat: fmt,
      error: null,
      outputBlob: null,
      outputFileName: null,
      completedAt: null,
      progress: 0,
    });
  };

  const handleFormatChange = (id: JobId, format: OutputFormat) => {
    useConverterStore.getState().updateJob(id, {
      targetFormat: format,
    });
  };

  const handleDownloadAll = () => {
    const doneJobs = jobList.filter(
      (j) => j.status === "done" && j.outputBlob && j.outputFileName,
    );
    if (doneJobs.length === 1) {
      downloadBlob(doneJobs[0]!.outputBlob!, doneJobs[0]!.outputFileName!);
    } else {
      void downloadZip(
        doneJobs.map((j) => ({ blob: j.outputBlob!, name: j.outputFileName! })),
      );
    }
  };

  return (
    <div
      className="flex h-[100dvh] flex-col items-center px-4 py-8 sm:py-12"
      style={{ backgroundColor: "var(--color-background)" }}
    >
      {/* Full-page drag overlay */}
      {isDraggingOver && (
        <div
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: "var(--color-background)", opacity: 0.95 }}
        >
          <div
            className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-16 py-12"
            style={{ borderColor: "var(--color-foreground)" }}
          >
            <p
              className="text-sm font-medium"
              style={{ color: "var(--color-foreground)" }}
            >
              Drop anywhere to add
            </p>
          </div>
        </div>
      )}

      <div className="flex w-full max-w-[480px] min-h-0 flex-1 flex-col">
        {/* Wordmark */}
        <div className="mb-6 shrink-0 flex items-start justify-between sm:mb-8">
          <div>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@300;800&display=swap');`}</style>
            <h1
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                fontSize: 20,
                lineHeight: 1,
                letterSpacing: "-0.04em",
              }}
            >
              <span
                style={{ fontWeight: 300, color: "var(--color-foreground)" }}
              >
                one
              </span>
              <span
                style={{ fontWeight: 800, color: "var(--color-foreground)" }}
              >
                convert
              </span>
            </h1>
            <p
              className="mt-2 text-xs"
              style={{
                color: "var(--color-muted-foreground)",
                letterSpacing: "0.01em",
              }}
            >
              Convert images locally — nothing leaves your browser.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors"
            style={{ color: "var(--color-muted-foreground)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-muted)";
              e.currentTarget.style.color = "var(--color-foreground)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "var(--color-muted-foreground)";
            }}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Sun className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        </div>

        {/* Drop zone */}
        <div className="shrink-0">
          <DropZone onFiles={addFiles} disabled={isConverting} />
        </div>

        {/* Controls */}
        <div className="mt-2.5 shrink-0 flex flex-col gap-1.5">
          {/* Row 1: Format picker + Convert */}
          <div className="flex items-center gap-2">
            <div
              className="min-w-0 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
            >
              <FormatPicker
                value={globalFormat}
                onChange={setGlobalFormat}
                disabled={isConverting}
              />
            </div>
            <div className="flex-1" />
            <Button
              size="sm"
              onClick={() => void convertAll()}
              disabled={isConverting || !hasJobs || pendingCount === 0}
              className="h-8 shrink-0 gap-1.5 px-4 text-xs font-medium"
            >
              {isConverting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : pendingCount > 0 ? (
                `Convert ${pendingCount} file${pendingCount > 1 ? "s" : ""}`
              ) : (
                "Convert"
              )}
            </Button>
          </div>

          {/* Row 2: Quality slider + Save/Clear */}
          <div className="flex items-center gap-1">
            <QualitySlider
              value={quality}
              onChange={setQuality}
              format={globalFormat}
              disabled={isConverting}
            />
            <div className="flex-1" />
            {hasDone && (
              <>
                <button
                  type="button"
                  onClick={handleDownloadAll}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap transition-colors"
                  style={{ color: "var(--color-muted-foreground)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--color-muted)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <Download className="h-3 w-3" />
                  {doneCount > 1 ? "Save zip" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="rounded-md px-2.5 py-1.5 text-xs whitespace-nowrap transition-colors"
                  style={{ color: "var(--color-muted-foreground)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--color-muted)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* File list — scrollable */}
        {hasJobs && (
          <ul
            className="mt-2.5 min-h-0 flex flex-col gap-1 overflow-y-auto pb-4"
            role="list"
            style={{ scrollbarWidth: "none" }}
          >
            {jobList.map((job) => (
              <li key={job.id}>
                <FileCard
                  job={job}
                  onRemove={removeJob}
                  onRetry={handleRetry}
                  onFormatChange={handleFormatChange}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
