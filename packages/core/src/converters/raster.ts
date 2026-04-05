import type { OutputFormat, Result } from "@one-convert/types";
import { FORMAT_MIME, err, ok } from "@one-convert/types";

const RASTER_FORMATS = ["png", "jpg", "webp", "avif"] as const;
type RasterOutputFormat = (typeof RASTER_FORMATS)[number];

function isRasterOutputFormat(
  format: OutputFormat,
): format is RasterOutputFormat {
  return RASTER_FORMATS.includes(format as RasterOutputFormat);
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

/**
 * Converts any raster image (PNG, JPG, WebP) to another raster format
 * using the browser Canvas API. No external dependencies.
 */
export async function convertRaster(
  file: File,
  targetFormat: OutputFormat,
  quality = 0.92,
): Promise<Result<Blob>> {
  if (!isRasterOutputFormat(targetFormat)) {
    return err({
      code: "UNSUPPORTED_FORMAT",
      message: `convertRaster does not handle format: ${targetFormat}`,
    });
  }

  let img: HTMLImageElement;
  try {
    img = await loadImageFromFile(file);
  } catch (cause) {
    return err({
      code: "INVALID_FILE",
      message: "Could not load image file",
      cause,
    });
  }

  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return err({
      code: "CANVAS_UNAVAILABLE",
      message: "CanvasRenderingContext2D unavailable",
    });
  }

  // For JPG: fill white background (JPG has no alpha channel)
  if (targetFormat === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);

  const mimeType = FORMAT_MIME[targetFormat];
  // Quality only applies to lossy formats; PNG ignores it
  const q =
    targetFormat === "jpg" || targetFormat === "webp" || targetFormat === "avif"
      ? quality
      : undefined;
  const blob = await canvasToBlob(canvas, mimeType, q);

  if (!blob) {
    return err({
      code: "CANVAS_UNAVAILABLE",
      message: "canvas.toBlob returned null",
    });
  }

  return ok(blob);
}
