import { reactConfig } from "@one-convert/eslint-config";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/node_modules/**",
      "**/.turbo/**",
      "**/coverage/**",
    ],
  },
  ...reactConfig.map((config) => ({
    ...config,
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
  })),
];
