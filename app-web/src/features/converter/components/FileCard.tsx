import type { ConversionJob, JobId, OutputFormat } from "@one-convert/types";
import { FORMAT_LABEL, OUTPUT_FORMATS } from "@one-convert/types";
import { cn } from "@one-convert/ui";
import { Download, FileImage, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { downloadBlob } from "@/shared/lib/downloadBlob";

interface FileCardProps {
  readonly job: ConversionJob;
  readonly onRemove: (id: JobId) => void;
  readonly onRetry: (id: JobId) => void;
  readonly onFormatChange: (id: JobId, format: OutputFormat) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function SizeDiff({
  inputSize,
  outputSize,
}: {
  inputSize: number;
  outputSize: number;
}) {
  const diff = Math.round((1 - outputSize / inputSize) * 100);
  const sign = diff > 0 ? "-" : diff < 0 ? "+" : "";
  const color =
    diff > 0
      ? "var(--color-success)"
      : diff < 0
        ? "var(--color-destructive)"
        : "var(--color-muted-foreground)";
  return (
    <span>
      {formatBytes(inputSize)} → {formatBytes(outputSize)}{" "}
      {diff !== 0 && (
        <span style={{ color }}>
          {sign}
          {Math.abs(diff)}%
        </span>
      )}
    </span>
  );
}

function Thumbnail({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div
      className="h-9 w-9 shrink-0 rounded-md overflow-hidden"
      style={{
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-muted)",
        backgroundImage: url ? `url(${url})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    />
  );
}

function FormatSelect({
  value,
  disabled,
  onChange,
}: {
  value: OutputFormat;
  disabled: boolean;
  onChange: (f: OutputFormat) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
    setOpen((o) => !o);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={handleOpen}
        className="shrink-0 rounded font-mono text-[10px] font-medium uppercase tracking-wide transition-colors"
        style={{
          padding: "2px 6px",
          backgroundColor: open ? "var(--color-border)" : "var(--color-muted)",
          color: "var(--color-muted-foreground)",
          border: "none",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {FORMAT_LABEL[value]}
      </button>

      {open &&
        createPortal(
          <div
            className="fixed z-50 overflow-hidden rounded-lg border py-1"
            style={{
              top: pos.top,
              left: pos.left,
              minWidth: 80,
              backgroundColor: "var(--color-background)",
              borderColor: "var(--color-border)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {OUTPUT_FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  onChange(f);
                  setOpen(false);
                }}
                className="flex w-full items-center px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wide transition-colors"
                style={{
                  backgroundColor:
                    f === value ? "var(--color-muted)" : "transparent",
                  color:
                    f === value
                      ? "var(--color-foreground)"
                      : "var(--color-muted-foreground)",
                  fontWeight: f === value ? 700 : 500,
                }}
                onMouseEnter={(e) => {
                  if (f !== value)
                    e.currentTarget.style.backgroundColor =
                      "var(--color-muted)";
                }}
                onMouseLeave={(e) => {
                  if (f !== value)
                    e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                {FORMAT_LABEL[f]}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}

export function FileCard({
  job,
  onRemove,
  onRetry,
  onFormatChange,
}: FileCardProps) {
  const handleDownload = () => {
    if (job.outputBlob && job.outputFileName) {
      downloadBlob(job.outputBlob, job.outputFileName);
    }
  };

  const borderColor =
    job.status === "done"
      ? "var(--color-success)"
      : job.status === "error"
        ? "var(--color-destructive)"
        : "var(--color-border)";

  const dismissAlwaysVisible = job.status === "done" || job.status === "error";

  return (
    <div
      className={cn(
        "animate-fade-in group relative flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all duration-150",
        "hover:bg-[var(--color-muted)]",
        job.status === "running" && "pointer-events-none",
      )}
      style={{ borderColor }}
    >
      {/* Thumbnail */}
      <Thumbnail file={job.file} />

      {/* File name + size */}
      <div className="min-w-0 flex-1">
        <p
          className="truncate text-sm font-medium leading-none"
          style={{ color: "var(--color-foreground)" }}
          title={job.file.name}
        >
          {job.file.name}
        </p>
        <p
          className="mt-1.5 text-xs leading-none"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          {job.status === "error" && job.error ? (
            job.error.message
          ) : job.status === "done" && job.outputBlob ? (
            <SizeDiff
              inputSize={job.file.size}
              outputSize={job.outputBlob.size}
            />
          ) : (
            formatBytes(job.file.size)
          )}
        </p>
      </div>

      {/* Format selector */}
      <FormatSelect
        value={job.targetFormat}
        disabled={job.status !== "pending"}
        onChange={(f) => onFormatChange(job.id, f)}
      />

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5">
        {job.status === "running" && (
          <Loader2
            className="h-4 w-4 animate-spin"
            style={{ color: "var(--color-foreground)" }}
          />
        )}
        {job.status === "done" && (
          <button
            type="button"
            onClick={handleDownload}
            aria-label={`Download ${job.outputFileName ?? ""}`}
            className="flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors"
            style={{ color: "var(--color-foreground)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-border)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <Download className="h-3 w-3" />
            Save
          </button>
        )}
        {job.status === "error" && (
          <button
            type="button"
            onClick={() => onRetry(job.id)}
            className="flex h-7 cursor-pointer items-center rounded-md px-2 text-xs font-medium transition-colors"
            style={{ color: "var(--color-foreground)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--color-border)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            Retry
          </button>
        )}
        {job.status === "pending" && (
          <div className="flex h-7 w-7 items-center justify-center">
            <FileImage
              className="h-4 w-4"
              strokeWidth={1.5}
              style={{ color: "var(--color-muted-foreground)" }}
            />
          </div>
        )}
        <button
          type="button"
          onClick={() => onRemove(job.id)}
          aria-label="Remove file"
          className={cn(
            "flex h-7 w-7 cursor-pointer items-center justify-center rounded-md transition-all duration-150",
            dismissAlwaysVisible
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100",
          )}
          style={{ color: "var(--color-muted-foreground)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-border)";
            e.currentTarget.style.color = "var(--color-foreground)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--color-muted-foreground)";
          }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Progress bar */}
      {job.status === "running" && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden rounded-b-lg">
          <div
            className="h-full w-full"
            style={{ backgroundColor: "var(--color-border)" }}
          />
          <div
            className="absolute inset-y-0 left-0 transition-all duration-300"
            style={{
              width: `${job.progress}%`,
              backgroundColor: "var(--color-foreground)",
            }}
          />
        </div>
      )}
    </div>
  );
}
