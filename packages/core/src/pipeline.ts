import type { OutputFormat, Result } from "@one-convert/types";
import { err } from "@one-convert/types";

import { convertToGif } from "./converters/gif";
import { convertRaster } from "./converters/raster";
import { convertToSvg } from "./converters/svg";

/**
 * Central conversion pipeline.
 * Routes a file to the correct converter based on the target format.
 * Returns a typed Result — never throws.
 */
export async function convert(file: File, targetFormat: OutputFormat): Promise<Result<Blob>> {
  try {
    switch (targetFormat) {
      case "png":
      case "jpg":
      case "webp":
        return await convertRaster(file, targetFormat);
      case "svg":
        return await convertToSvg(file);
      case "gif":
        return await convertToGif(file);
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
    return err({ code: "UNKNOWN", message: "Unexpected error during conversion", cause });
  }
}
