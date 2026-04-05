/**
 * All supported output formats.
 * Ordered by most commonly used first.
 */
export const OUTPUT_FORMATS = ["png", "jpg", "webp", "svg", "gif"] as const;

export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export const INPUT_FORMATS = ["png", "jpg", "jpeg", "webp", "gif", "svg"] as const;

export type InputFormat = (typeof INPUT_FORMATS)[number];

/** MIME type map for each output format */
export const FORMAT_MIME: Readonly<Record<OutputFormat, string>> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  gif: "image/gif",
} as const;

/** Human-readable label for each format */
export const FORMAT_LABEL: Readonly<Record<OutputFormat, string>> = {
  png: "PNG",
  jpg: "JPG",
  webp: "WebP",
  svg: "SVG",
  gif: "GIF",
} as const;

/** File extension for each output format */
export const FORMAT_EXTENSION: Readonly<Record<OutputFormat, string>> = {
  png: ".png",
  jpg: ".jpg",
  webp: ".webp",
  svg: ".svg",
  gif: ".gif",
} as const;

/** Checks if a string is a valid OutputFormat */
export function isOutputFormat(value: unknown): value is OutputFormat {
  return OUTPUT_FORMATS.includes(value as OutputFormat);
}
