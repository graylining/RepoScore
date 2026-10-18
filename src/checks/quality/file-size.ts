import fg from "fast-glob";
import { readFile } from "fs/promises";
import type { CheckModule } from "../../types.js";

const MAX_LINES = 500;
const CODE_EXTENSIONS = [
  ".ts", ".tsx", ".js", ".jsx", ".py", ".rb", ".go", ".rs",
  ".java", ".kt", ".swift", ".cs", ".cpp", ".c", ".h", ".php",
  ".vue", ".svelte",
];

export const fileSizeCheck: CheckModule = {
  id: "quality/file-size",
  name: "File Size",
  async run(repoPath) {
    const patterns = CODE_EXTENSIONS.map((ext) => `**/*${ext}`);
    const files = await fg(patterns, {
      cwd: repoPath,
      ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**", "**/vendor/**"],
      absolute: true,
    });

    const largeFiles: string[] = [];

    for (const file of files) {
      try {
        const content = await readFile(file, "utf-8");
        const lineCount = content.split("\n").length;
        if (lineCount > MAX_LINES) {
          const relative = file.replace(repoPath + "/", "");
          largeFiles.push(`${relative} (${lineCount} lines)`);
        }
      } catch {
        continue;
      }
    }

    if (largeFiles.length === 0) {
      return {
        id: "quality/file-size",
        name: "File Size",
        status: "pass",
        message: `All source files are under ${MAX_LINES} lines`,
        weight: 5,
      };
    }

    const ratio = largeFiles.length / Math.max(files.length, 1);

    return {
      id: "quality/file-size",
      name: "File Size",
      status: ratio > 0.1 ? "fail" : "warn",
      message: `${largeFiles.length} file(s) exceed ${MAX_LINES} lines`,
      details: largeFiles.slice(0, 10),
      weight: 5,
    };
  },
};
