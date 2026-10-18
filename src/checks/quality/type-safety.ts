import fg from "fast-glob";
import type { CheckModule } from "../../types.js";

export const typeSafetyCheck: CheckModule = {
  id: "quality/type-safety",
  name: "Type Safety",
  async run(repoPath) {
    const jsFiles = await fg("**/*.{js,jsx}", {
      cwd: repoPath,
      ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"],
    });

    const tsFiles = await fg("**/*.{ts,tsx}", {
      cwd: repoPath,
      ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**"],
    });

    const tsConfig = await fg(["tsconfig.json", "tsconfig.*.json", "jsconfig.json"], {
      cwd: repoPath,
    });

    const isJsProject = jsFiles.length > 0 || tsFiles.length > 0;
    if (!isJsProject) {
      return {
        id: "quality/type-safety",
        name: "Type Safety",
        status: "pass",
        message: "Not a JavaScript/TypeScript project — check not applicable",
        weight: 4,
      };
    }

    if (tsFiles.length > 0 && tsConfig.length > 0) {
      return {
        id: "quality/type-safety",
        name: "Type Safety",
        status: "pass",
        message: `TypeScript configured with ${tsFiles.length} .ts/.tsx file(s)`,
        weight: 4,
      };
    }

    if (tsConfig.length > 0) {
      return {
        id: "quality/type-safety",
        name: "Type Safety",
        status: "warn",
        message: "tsconfig.json exists but no TypeScript files found",
        weight: 4,
      };
    }

    return {
      id: "quality/type-safety",
      name: "Type Safety",
      status: "warn",
      message: `JavaScript project without TypeScript (${jsFiles.length} .js/.jsx files, no tsconfig.json)`,
      weight: 4,
    };
  },
};
