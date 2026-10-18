import fg from "fast-glob";
import type { CheckModule } from "../../types.js";

const CI_PATTERNS = [
  ".github/workflows/*.yml",
  ".github/workflows/*.yaml",
  ".gitlab-ci.yml",
  ".circleci/config.yml",
  "Jenkinsfile",
  ".travis.yml",
  "bitbucket-pipelines.yml",
  ".buildkite/pipeline.yml",
  "azure-pipelines.yml",
];

export const ciConfigCheck: CheckModule = {
  id: "structure/ci-config",
  name: "CI/CD Configuration",
  async run(repoPath) {
    const files = await fg(CI_PATTERNS, { cwd: repoPath, dot: true });

    if (files.length === 0) {
      return {
        id: "structure/ci-config",
        name: "CI/CD Configuration",
        status: "warn",
        message: "No CI/CD configuration found",
        weight: 5,
      };
    }

    return {
      id: "structure/ci-config",
      name: "CI/CD Configuration",
      status: "pass",
      message: `CI/CD configured (${files.join(", ")})`,
      details: files,
      weight: 5,
    };
  },
};
