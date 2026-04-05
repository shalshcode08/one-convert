/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "scope-enum": [
      2,
      "always",
      [
        "types",
        "core",
        "ui",
        "app-web",
        "app-desktop",
        "app-mobile",
        "tooling",
        "ci",
        "deps",
        "release",
      ],
    ],
    "subject-case": [2, "always", "lower-case"],
  },
};
