import type { Result } from "@one-convert/types";
import { err, ok } from "@one-convert/types";

interface GIFOptions {
  workers?: number;
  quality?: number;
  width?: number;
  height?: number;
  workerScript?: string;
}

interface GIFInstance {
  addFrame: (
    ctx: CanvasRenderingContext2D,
    options?: { delay?: number; copy?: boolean },
  ) => void;
  on(event: "finished", callback: (blob: Blob) => void): void;
  on(event: "error", callback: (error: unknown) => void): void;
  render: () => void;
}

interface GIFConstructor {
  new (options: GIFOptions): GIFInstance;
}

async function getGIFEncoder(): Promise<GIFConstructor> {
  const mod = await import("gif.js");
  return (mod.default ?? mod) as GIFConstructor;
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
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

/**
 * Converts a raster image to a single-frame GIF using gif.js.
 * Requires gif.worker.js to be available at /gif.worker.js (copy to public/).
 */
export async function convertToGif(file: File): Promise<Result<Blob>> {
  let img: HTMLImageElement;
  try {
    img = await loadImageElement(file);
  } catch (cause) {
    return err({
      code: "INVALID_FILE",
      message: "Could not load image for GIF encoding",
      cause,
    });
  }

  let GIF: GIFConstructor;
  try {
    GIF = await getGIFEncoder();
  } catch (cause) {
    return err({
      code: "GIF_ENCODE_FAILED",
      message: "Failed to load GIF encoder library",
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

  ctx.drawImage(img, 0, 0);

  return new Promise<Result<Blob>>((resolve) => {
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height,
      workerScript: "/gif.worker.js",
    });

    gif.addFrame(ctx, { copy: true, delay: 0 });
    gif.on("finished", (blob) => resolve(ok(blob)));
    gif.on("error", (cause) =>
      resolve(
        err({
          code: "GIF_ENCODE_FAILED",
          message: "GIF encoding failed",
          cause,
        }),
      ),
    );
    gif.render();
  });
}
