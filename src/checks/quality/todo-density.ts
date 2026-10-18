import fg from "fast-glob";
import { readFile } from "fs/promises";
import type { CheckModule } from "../../types.js";

const TODO_PATTERN = /\b(TODO|FIXME|HACK|XXX|WORKAROUND)\b/gi;

export const todoDensityCheck: CheckModule = {
  id: "quality/todo-density",
  name: "TODO/FIXME Density",
  async run(repoPath) {
    const files = await fg("**/*.{ts,tsx,js,jsx,py,rb,go,rs,java,kt,swift,cs,cpp,c,h,php,vue,svelte}", {
      cwd: repoPath,
      ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**", "**/vendor/**"],
      absolute: true,
    });

    let totalTodos = 0;
    const todoFiles: string[] = [];

    for (const file of files) {
      try {
        const content = await readFile(file, "utf-8");
        const matches = content.match(TODO_PATTERN);
        if (matches) {
          totalTodos += matches.length;
          const relative = file.replace(repoPath + "/", "");
          todoFiles.push(`${relative} (${matches.length})`);
        }
      } catch {
        continue;
      }
    }

    if (totalTodos === 0) {
      return {
        id: "quality/todo-density",
        name: "TODO/FIXME Density",
        status: "pass",
        message: "No TODO/FIXME/HACK markers found",
        weight: 3,
      };
    }

    const density = files.length > 0 ? totalTodos / files.length : 0;

    return {
      id: "quality/todo-density",
      name: "TODO/FIXME Density",
      status: density > 0.5 ? "fail" : "warn",
      message: `Found ${totalTodos} TODO/FIXME/HACK marker(s) across ${todoFiles.length} file(s)`,
      details: todoFiles.slice(0, 10),
      weight: 3,
    };
  },
};
