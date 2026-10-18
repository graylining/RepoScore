import { readFile } from "fs/promises";
import fg from "fast-glob";
import type { CheckModule } from "../../types.js";

export const readmeCheck: CheckModule = {
  id: "structure/readme",
  name: "README",
  async run(repoPath) {
    const files = await fg(["README.md", "README", "readme.md", "Readme.md"], {
      cwd: repoPath,
    });

    if (files.length === 0) {
      return {
        id: "structure/readme",
        name: "README",
        status: "fail",
        message: "No README file found",
        weight: 6,
      };
    }

    const content = await readFile(`${repoPath}/${files[0]}`, "utf-8");
    const lines = content.trim().split("\n").filter((l) => l.trim().length > 0);

    if (lines.length < 5) {
      return {
        id: "structure/readme",
        name: "README",
        status: "warn",
        message: "README exists but is very short (less than 5 non-empty lines)",
        weight: 6,
      };
    }

    return {
      id: "structure/readme",
      name: "README",
      status: "pass",
      message: "README exists with substantive content",
      weight: 6,
    };
  },
};
