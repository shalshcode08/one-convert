# OneConvert

A lightning-fast, privacy-first image converter that runs entirely in your browser.

[**Visit OneConvert**](https://oneconvert.website)

## Features

- **100% Private:** Images are processed locally using the Canvas API and WebAssembly. Your files are never uploaded to any server.
- **Broad Support:** Convert to and from PNG, JPG, WebP, AVIF, GIF, SVG, and HEIC/HEIF.
- **Batch Processing:** Drop multiple files, select individual or global formats, and download as a ZIP.
- **Modern Tech Stack:** Built with React, Vite, Tailwind CSS, Zustand, and Radix UI in a Turborepo monorepo.

## Local Development

This project uses [Bun](https://bun.sh/) as the package manager and [Turborepo](https://turbo.build/) for monorepo management.

```bash
# Install dependencies
bun install

# Start the web app development server
bun run dev

# Run type checking
bun run type-check

# Build for production
bun run build
```

## Architecture

- `app-web`: The main React/Vite application.
- `packages/core`: The conversion pipeline logic and WASM integrations (`gif.js`, `heic2any`, etc).
- `packages/ui`: Shared UI components (Tailwind + Radix).
- `packages/types`: Shared TypeScript definitions and formats.
