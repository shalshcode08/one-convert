import { useCallback, useEffect, useState } from "react";

const ACCEPTED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export function useDropAnywhere(onFiles: (files: readonly File[]) => void) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer?.types.includes("Files")) {
      setIsDraggingOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    // Only fire when leaving the window entirely
    if (e.clientX === 0 && e.clientY === 0) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      const files = Array.from(e.dataTransfer?.files ?? []).filter((f) =>
        ACCEPTED_MIME.has(f.type),
      );
      if (files.length > 0) onFiles(files);
    },
    [onFiles],
  );

  const handleDragEnd = useCallback(() => setIsDraggingOver(false), []);

  useEffect(() => {
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("drop", handleDrop);
    document.addEventListener("dragend", handleDragEnd);
    return () => {
      document.removeEventListener("dragover", handleDragOver);
      document.removeEventListener("dragleave", handleDragLeave);
      document.removeEventListener("drop", handleDrop);
      document.removeEventListener("dragend", handleDragEnd);
    };
  }, [handleDragOver, handleDragLeave, handleDrop, handleDragEnd]);

  return { isDraggingOver };
}
