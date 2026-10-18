import fg from "fast-glob";
import type { CheckModule } from "../../types.js";

export const lockfileCheck: CheckModule = {
  id: "structure/lockfile",
  name: "Lockfile",
  async run(repoPath) {
    const manifests = await fg(
      ["package.json", "requirements.txt", "Pipfile", "pyproject.toml", "Gemfile", "go.mod", "Cargo.toml", "pom.xml", "build.gradle"],
      { cwd: repoPath }
    );

    if (manifests.length === 0) {
      return {
        id: "structure/lockfile",
        name: "Lockfile",
        status: "pass",
        message: "No package manifest found — lockfile not applicable",
        weight: 4,
      };
    }

    const lockfiles = await fg(
      ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lock", "Pipfile.lock", "poetry.lock", "Gemfile.lock", "go.sum", "Cargo.lock"],
      { cwd: repoPath }
    );

    if (lockfiles.length === 0) {
      return {
        id: "structure/lockfile",
        name: "Lockfile",
        status: "fail",
        message: "Package manifest found but no lockfile — builds may not be reproducible",
        weight: 4,
      };
    }

    return {
      id: "structure/lockfile",
      name: "Lockfile",
      status: "pass",
      message: `Lockfile present (${lockfiles.join(", ")})`,
      weight: 4,
    };
  },
};
