import { useEffect } from "react";

const ACCEPTED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/heic",
  "image/heif",
]);

function isAccepted(file: File): boolean {
  if (ACCEPTED_MIME.has(file.type)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

export function useClipboardPaste(onFiles: (files: readonly File[]) => void) {
  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file && isAccepted(file)) files.push(file);
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        onFiles(files);
      }
    };

    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [onFiles]);
}
