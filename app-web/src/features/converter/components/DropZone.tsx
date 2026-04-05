import { cn } from "@one-convert/ui";
import { UploadCloud } from "lucide-react";
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
]);

function filterImageFiles(fileList: FileList): readonly File[] {
  return Array.from(fileList).filter((f) => ACCEPTED_MIME.has(f.type));
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

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      const files = filterImageFiles(e.target.files);
      if (files.length > 0) onFiles(files);
      // Reset input so same files can be re-added
      e.target.value = "";
    },
    [onFiles],
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Drop images here or click to browse"
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) inputRef.current?.click();
      }}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-8 py-14 transition-colors select-none",
        isDragging
          ? "border-foreground bg-muted"
          : "border-border hover:border-foreground/40 hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <UploadCloud
        className={cn(
          "h-8 w-8 transition-colors",
          isDragging ? "text-foreground" : "text-muted-foreground",
        )}
        strokeWidth={1.5}
      />
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {isDragging ? "Release to add files" : "Drop images here"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          or click to browse &middot; PNG, JPG, WebP, GIF, SVG
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        multiple
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
    </div>
  );
}
