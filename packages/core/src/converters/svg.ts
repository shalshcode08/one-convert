import type { Result } from "@one-convert/types";
import { err, ok } from "@one-convert/types";

// imagetracerjs has no official types — we declare a minimal interface
interface ImageTracerStatic {
  imagedataToSVG: (
    imageData: ImageData,
    options?: Record<string, unknown>,
  ) => string;
}

// Dynamic import so bundlers can code-split the heavy tracer library
async function getTracer(): Promise<ImageTracerStatic> {
  // @ts-expect-error imagetracerjs does not have types
  const mod = await import("imagetracerjs");
  return (mod.default ?? mod) as ImageTracerStatic;
}

function loadImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("CanvasRenderingContext2D unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };

    img.src = url;
  });
}

/**
 * Converts a raster image to SVG using imagetracerjs color tracing.
 * The result is a valid SVG string wrapped in a Blob.
 */
export async function convertToSvg(file: File): Promise<Result<Blob>> {
  let imageData: ImageData;
  try {
    imageData = await loadImageData(file);
  } catch (cause) {
    return err({
      code: "INVALID_FILE",
      message: "Could not load image for SVG tracing",
      cause,
    });
  }

  let tracer: ImageTracerStatic;
  try {
    tracer = await getTracer();
  } catch (cause) {
    return err({
      code: "SVG_TRACE_FAILED",
      message: "Failed to load SVG tracer library",
      cause,
    });
  }

  let svgString: string;
  try {
    svgString = tracer.imagedataToSVG(imageData, {
      numberofcolors: 16,
      colorsampling: 0,
      mincolorratio: 0,
    });
  } catch (cause) {
    return err({
      code: "SVG_TRACE_FAILED",
      message: "SVG tracing failed",
      cause,
    });
  }

  const blob = new Blob([svgString], { type: "image/svg+xml" });
  return ok(blob);
}
