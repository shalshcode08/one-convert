import { cn } from "@one-convert/ui";
import { Upload } from "lucide-react";
import { useCallback, useRef, useState } from "react";

interface DropZoneProps {
  readonly onFiles: (files: readonly File[]) => void;
  readonly disabled?: boolean;
}

const ACCEPTED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/heic",
  "image/heif",
]);

// Also accept files by extension as fallback since some OS might not resolve heic mime types correctly
function isAccepted(file: File): boolean {
  if (ACCEPTED_MIME.has(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

function filterImageFiles(fileList: FileList): readonly File[] {
  return Array.from(fileList).filter(isAccepted);
}

export function DropZone({ onFiles, disabled = false }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const files = filterImageFiles(e.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
    [disabled, onFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const files = filterImageFiles(e.target.files);
      if (files.length > 0) onFiles(files);
      e.target.value = "";
    },
    [onFiles],
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.key === "Enter" || e.key === " ") && !disabled) {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled],
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drop images here or click to browse"
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-8 py-12 text-center select-none transition-all duration-150",
        isDragging
          ? "scale-[1.01] border-[var(--color-foreground)] bg-[var(--color-muted)]"
          : "border-[var(--color-border)] hover:border-[var(--color-foreground)]/30 hover:bg-[var(--color-muted)]/60",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-lg border transition-all duration-150",
          isDragging
            ? "border-[var(--color-foreground)]/20 bg-[var(--color-foreground)] text-[var(--color-background)]"
            : "border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)] group-hover:border-[var(--color-foreground)]/20",
        )}
      >
        <Upload className="h-4 w-4" strokeWidth={1.5} />
      </div>

      <div className="space-y-1">
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-foreground)" }}
        >
          {isDragging ? "Drop to add" : "Drop images here"}
        </p>
        <p
          className="text-xs"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          or{" "}
          <span
            className="underline underline-offset-2"
            style={{ color: "var(--color-foreground)" }}
          >
            browse files
          </span>{" "}
          · PNG, JPG, WebP, GIF, SVG, HEIC
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/heic,image/heif,.heic,.heif"
        multiple
        className="sr-only"
        onChange={handleInputChange}
        disabled={disabled}
      />
    </div>
  );
}
