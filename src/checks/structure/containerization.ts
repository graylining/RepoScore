import fg from "fast-glob";
import type { CheckModule } from "../../types.js";

export const containerizationCheck: CheckModule = {
  id: "structure/containerization",
  name: "Containerization",
  async run(repoPath) {
    const files = await fg(
      ["Dockerfile", "Dockerfile.*", "docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"],
      { cwd: repoPath }
    );

    if (files.length === 0) {
      return {
        id: "structure/containerization",
        name: "Containerization",
        status: "warn",
        message: "No Dockerfile or docker-compose found",
        weight: 3,
      };
    }

    return {
      id: "structure/containerization",
      name: "Containerization",
      status: "pass",
      message: `Container config found (${files.join(", ")})`,
      details: files,
      weight: 3,
    };
  },
};
