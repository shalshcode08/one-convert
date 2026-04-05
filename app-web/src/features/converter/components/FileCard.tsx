import type { ConversionJob } from "@one-convert/types";
import { Badge, Button, Progress, cn } from "@one-convert/ui";
import { AlertCircle, CheckCircle2, Clock, Download, Loader2, X } from "lucide-react";

import { downloadBlob } from "@/shared/lib/downloadBlob";

interface FileCardProps {
  readonly job: ConversionJob;
  readonly onRemove: (id: string) => void;
  readonly onRetry: (id: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileCard({ job, onRemove, onRetry }: FileCardProps) {
  const handleDownload = () => {
    if (job.outputBlob && job.outputFileName) {
      downloadBlob(job.outputBlob, job.outputFileName);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors",
        job.status === "error" && "border-destructive/30 bg-destructive/5",
        job.status === "done" && "border-success/30 bg-success/5",
      )}
    >
      {/* Status icon */}
      <div className="shrink-0">
        {job.status === "pending" && (
          <Clock className="h-4 w-4 text-muted-foreground" />
        )}
        {job.status === "running" && (
          <Loader2 className="h-4 w-4 animate-spin text-foreground" />
        )}
        {job.status === "done" && (
          <CheckCircle2 className="h-4 w-4 text-success" />
        )}
        {job.status === "error" && (
          <AlertCircle className="h-4 w-4 text-destructive" />
        )}
      </div>

      {/* File info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{job.file.name}</p>
          <Badge variant="muted" className="shrink-0">
            {job.targetFormat.toUpperCase()}
          </Badge>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{formatBytes(job.file.size)}</p>
          {job.status === "error" && job.error && (
            <p className="truncate text-xs text-destructive">{job.error.message}</p>
          )}
        </div>
        {job.status === "running" && (
          <Progress value={job.progress} className="mt-2" />
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1">
        {job.status === "done" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            aria-label={`Download ${job.outputFileName ?? ""}`}
            className="h-8 gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Download
          </Button>
        )}
        {job.status === "error" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRetry(job.id)}
            className="h-8 text-xs"
          >
            Retry
          </Button>
        )}
        {(job.status === "pending" || job.status === "done" || job.status === "error") && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(job.id)}
            aria-label="Remove file"
            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
