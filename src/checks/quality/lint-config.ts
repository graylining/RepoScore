import fg from "fast-glob";
import type { CheckModule } from "../../types.js";

const LINT_PATTERNS = [
  ".eslintrc*",
  "eslint.config.*",
  ".prettierrc*",
  "prettier.config.*",
  "biome.json",
  ".stylelintrc*",
  ".rubocop.yml",
  ".flake8",
  "pyproject.toml",
  ".golangci.yml",
  "rustfmt.toml",
  ".clang-format",
];

export const lintConfigCheck: CheckModule = {
  id: "quality/lint-config",
  name: "Linter Configuration",
  async run(repoPath) {
    const files = await fg(LINT_PATTERNS, { cwd: repoPath, dot: true });

    if (files.length === 0) {
      return {
        id: "quality/lint-config",
        name: "Linter Configuration",
        status: "warn",
        message: "No linter or formatter configuration found",
        weight: 5,
      };
    }

    return {
      id: "quality/lint-config",
      name: "Linter Configuration",
      status: "pass",
      message: `Linter/formatter configured (${files.join(", ")})`,
      details: files,
      weight: 5,
    };
  },
};
