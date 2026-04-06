import type { OutputFormat, Result } from "@one-convert/types";
import { err, ok } from "@one-convert/types";
import heic2any from "heic2any";

import { convertToGif } from "./converters/gif";
import { convertRaster } from "./converters/raster";
import { convertToSvg } from "./converters/svg";

/**
 * Central conversion pipeline.
 * Routes a file to the correct converter based on the target format.
 * Returns a typed Result — never throws.
 */
export async function convert(
  file: File,
  targetFormat: OutputFormat,
  quality = 0.92,
): Promise<Result<Blob>> {
  try {
    let inputFile = file;

    // Pre-process HEIC files since browsers can't render them on canvas natively
    if (
      inputFile.type === "image/heic" ||
      inputFile.type === "image/heif" ||
      inputFile.name.toLowerCase().endsWith(".heic") ||
      inputFile.name.toLowerCase().endsWith(".heif")
    ) {
      if (
        targetFormat === "png" ||
        targetFormat === "jpg" ||
        targetFormat === "gif"
      ) {
        // We can output directly from heic2any for these formats
        const mimeType =
          targetFormat === "jpg" ? "image/jpeg" : `image/${targetFormat}`;
        const outBlob = await heic2any({
          blob: inputFile,
          toType: mimeType as "image/jpeg" | "image/png" | "image/gif",
          ...(targetFormat === "jpg" ? { quality } : {}),
        });
        const finalBlob = Array.isArray(outBlob) ? outBlob[0] : outBlob;
        return ok(finalBlob as Blob);
      } else {
        // Need to convert to a canvas-readable format first, then pipeline it
        const pngBlob = await heic2any({
          blob: inputFile,
          toType: "image/png",
        });
        const finalPngBlob = Array.isArray(pngBlob) ? pngBlob[0] : pngBlob;
        inputFile = new File(
          [finalPngBlob as Blob],
          inputFile.name.replace(/\.hei[cf]$/i, ".png"),
          { type: "image/png" },
        );
      }
    }

    switch (targetFormat) {
      case "png":
      case "jpg":
      case "webp":
      case "avif":
        return await convertRaster(inputFile, targetFormat, quality);
      case "svg":
        return await convertToSvg(inputFile);
      case "gif":
        return await convertToGif(inputFile);
      default: {
        // Exhaustiveness check — TypeScript will error if a format is unhandled
        const _exhaustive: never = targetFormat;
        return err({
          code: "UNSUPPORTED_FORMAT",
          message: `Unhandled format: ${String(_exhaustive)}`,
        });
      }
    }
  } catch (cause) {
    return err({
      code: "UNKNOWN",
      message: "Unexpected error during conversion",
      cause,
    });
  }
}
