import { zipSync } from "fflate";

export async function downloadZip(
  files: { blob: Blob; name: string }[],
  zipName = "converted.zip",
): Promise<void> {
  const entries: Record<string, Uint8Array> = {};

  await Promise.all(
    files.map(async ({ blob, name }) => {
      const buf = await blob.arrayBuffer();
      // Deduplicate filenames by appending index if needed
      let key = name;
      let i = 1;
      while (key in entries) {
        const ext = name.lastIndexOf(".");
        key =
          ext === -1
            ? `${name}_${i}`
            : `${name.slice(0, ext)}_${i}${name.slice(ext)}`;
        i++;
      }
      entries[key] = new Uint8Array(buf);
    }),
  );

  const zipped = zipSync(entries, { level: 0 }); // level 0 = store, images are already compressed
  const zipBlob = new Blob([zipped.buffer as ArrayBuffer], {
    type: "application/zip",
  });

  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  a.click();
  URL.revokeObjectURL(url);
}
