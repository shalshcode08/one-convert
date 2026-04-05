/**
 * Triggers a browser download for a given Blob.
 * Creates and immediately revokes an object URL to avoid memory leaks.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Revoke after a tick to ensure the download has started
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
