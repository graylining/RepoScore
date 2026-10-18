import { readFile, access } from "fs/promises";
import { join } from "path";
import type { CheckModule } from "../../types.js";

const EXPECTED_PATTERNS = ["node_modules", ".env", "dist", "build", ".DS_Store"];

export const gitignoreCheck: CheckModule = {
  id: "structure/gitignore",
  name: ".gitignore",
  async run(repoPath) {
    const gitignorePath = join(repoPath, ".gitignore");

    try {
      await access(gitignorePath);
    } catch {
      return {
        id: "structure/gitignore",
        name: ".gitignore",
        status: "fail",
        message: "No .gitignore file found",
        weight: 5,
      };
    }

    const content = await readFile(gitignorePath, "utf-8");
    const lines = content.split("\n").map((l) => l.trim());
    const missing = EXPECTED_PATTERNS.filter(
      (p) => !lines.some((l) => l === p || l.startsWith(p))
    );

    if (missing.length === 0) {
      return {
        id: "structure/gitignore",
        name: ".gitignore",
        status: "pass",
        message: ".gitignore covers common patterns",
        weight: 5,
      };
    }

    if (missing.length <= 2) {
      return {
        id: "structure/gitignore",
        name: ".gitignore",
        status: "warn",
        message: `.gitignore is missing some common patterns`,
        details: missing.map((p) => `Missing: ${p}`),
        weight: 5,
      };
    }

    return {
      id: "structure/gitignore",
      name: ".gitignore",
      status: "fail",
      message: ".gitignore is missing several common patterns",
      details: missing.map((p) => `Missing: ${p}`),
      weight: 5,
    };
  },
};
