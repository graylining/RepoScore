import { readFile, access } from "fs/promises";
import { join } from "path";
import fg from "fast-glob";
import type { CheckModule } from "../../types.js";

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export const envExposure: CheckModule = {
  id: "security/env-exposure",
  name: "Environment File Exposure",
  async run(repoPath) {
    const issues: string[] = [];

    const envFiles = await fg(".env*", {
      cwd: repoPath,
      ignore: [".env.example", ".env.template", ".env.sample"],
      dot: true,
    });

    if (envFiles.length > 0) {
      const gitignorePath = join(repoPath, ".gitignore");
      const hasGitignore = await fileExists(gitignorePath);

      if (!hasGitignore) {
        issues.push("No .gitignore file found — .env files may be committed");
      } else {
        const gitignore = await readFile(gitignorePath, "utf-8");
        const patterns = gitignore.split("\n").map((l) => l.trim());
        const coversEnv = patterns.some(
          (p) => p === ".env" || p === ".env*" || p === ".env.*" || p === "*.env"
        );
        if (!coversEnv) {
          issues.push(".gitignore does not include .env patterns");
        }
      }
    }

    if (issues.length === 0) {
      return {
        id: "security/env-exposure",
        name: "Environment File Exposure",
        status: "pass",
        message: envFiles.length > 0
          ? ".env files found and properly gitignored"
          : "No .env files found",
        weight: 8,
      };
    }

    return {
      id: "security/env-exposure",
      name: "Environment File Exposure",
      status: "fail",
      message: "Environment files may be exposed",
      details: issues,
      weight: 8,
    };
  },
};
