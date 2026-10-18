import fg from "fast-glob";
import type { CheckModule } from "../../types.js";

export const envTemplateCheck: CheckModule = {
  id: "structure/env-template",
  name: "Environment Template",
  async run(repoPath) {
    const envFiles = await fg([".env", ".env.local", ".env.development"], {
      cwd: repoPath,
      dot: true,
    });

    if (envFiles.length === 0) {
      return {
        id: "structure/env-template",
        name: "Environment Template",
        status: "pass",
        message: "No .env files used — template not needed",
        weight: 3,
      };
    }

    const templates = await fg([".env.example", ".env.template", ".env.sample"], {
      cwd: repoPath,
      dot: true,
    });

    if (templates.length === 0) {
      return {
        id: "structure/env-template",
        name: "Environment Template",
        status: "warn",
        message: "Uses .env files but no .env.example or .env.template found",
        weight: 3,
      };
    }

    return {
      id: "structure/env-template",
      name: "Environment Template",
      status: "pass",
      message: `Environment template found (${templates[0]})`,
      weight: 3,
    };
  },
};
