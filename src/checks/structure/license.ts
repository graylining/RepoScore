import fg from "fast-glob";
import type { CheckModule } from "../../types.js";

export const licenseCheck: CheckModule = {
  id: "structure/license",
  name: "LICENSE",
  async run(repoPath) {
    const files = await fg(["LICENSE*", "LICENCE*", "license*", "licence*"], {
      cwd: repoPath,
    });

    if (files.length === 0) {
      return {
        id: "structure/license",
        name: "LICENSE",
        status: "warn",
        message: "No LICENSE file found",
        weight: 4,
      };
    }

    return {
      id: "structure/license",
      name: "LICENSE",
      status: "pass",
      message: "LICENSE file present",
      weight: 4,
    };
  },
};
