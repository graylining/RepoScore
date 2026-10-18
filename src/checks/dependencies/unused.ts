import { readFile, access } from "fs/promises";
import { join } from "path";
import fg from "fast-glob";
import type { CheckModule } from "../../types.js";

export const unusedCheck: CheckModule = {
  id: "dependencies/unused",
  name: "Unused Dependencies",
  async run(repoPath) {
    const pkgPath = join(repoPath, "package.json");
    try {
      await access(pkgPath);
    } catch {
      return {
        id: "dependencies/unused",
        name: "Unused Dependencies",
        status: "pass",
        message: "No package.json found — check not applicable",
        weight: 4,
      };
    }

    const pkgJson = JSON.parse(await readFile(pkgPath, "utf-8"));
    const deps = Object.keys(pkgJson.dependencies || {});

    if (deps.length === 0) {
      return {
        id: "dependencies/unused",
        name: "Unused Dependencies",
        status: "pass",
        message: "No dependencies declared",
        weight: 4,
      };
    }

    const sourceFiles = await fg("**/*.{ts,tsx,js,jsx,mjs,cjs,vue,svelte}", {
      cwd: repoPath,
      ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"],
      absolute: true,
    });

    let allSource = "";
    for (const file of sourceFiles) {
      try {
        allSource += await readFile(file, "utf-8");
      } catch {
        continue;
      }
    }

    const configFiles = await fg(
      ["*.config.*", ".*.js", ".*.cjs", ".*.mjs", "*.config.ts"],
      { cwd: repoPath, dot: true, absolute: true }
    );
    for (const file of configFiles) {
      try {
        allSource += await readFile(file, "utf-8");
      } catch {
        continue;
      }
    }

    const potentiallyUnused = deps.filter((dep) => {
      const importPatterns = [
        `'${dep}'`,
        `"${dep}"`,
        `'${dep}/`,
        `"${dep}/`,
        `from "${dep}`,
        `from '${dep}`,
        `require("${dep}`,
        `require('${dep}`,
      ];
      return !importPatterns.some((p) => allSource.includes(p));
    });

    if (potentiallyUnused.length === 0) {
      return {
        id: "dependencies/unused",
        name: "Unused Dependencies",
        status: "pass",
        message: "All dependencies appear to be used",
        weight: 4,
      };
    }

    return {
      id: "dependencies/unused",
      name: "Unused Dependencies",
      status: potentiallyUnused.length > 3 ? "warn" : "pass",
      message: `${potentiallyUnused.length} potentially unused dependency/ies`,
      details: potentiallyUnused,
      weight: 4,
    };
  },
};
