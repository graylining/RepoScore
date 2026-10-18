import { readFile, access } from "fs/promises";
import { join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import type { CheckModule } from "../../types.js";

const exec = promisify(execFile);

export const outdatedCheck: CheckModule = {
  id: "dependencies/outdated",
  name: "Outdated Packages",
  async run(repoPath) {
    const pkgPath = join(repoPath, "package.json");
    try {
      await access(pkgPath);
    } catch {
      return {
        id: "dependencies/outdated",
        name: "Outdated Packages",
        status: "pass",
        message: "No package.json found — check not applicable",
        weight: 5,
      };
    }

    try {
      const { stdout } = await exec("npm", ["outdated", "--json"], {
        cwd: repoPath,
        timeout: 30000,
      });

      const outdated = JSON.parse(stdout || "{}");
      const count = Object.keys(outdated).length;

      if (count === 0) {
        return {
          id: "dependencies/outdated",
          name: "Outdated Packages",
          status: "pass",
          message: "All packages are up to date",
          weight: 5,
        };
      }

      const majorOutdated = Object.entries(outdated).filter(([, info]: [string, any]) => {
        const current = (info as any).current?.split(".")[0];
        const latest = (info as any).latest?.split(".")[0];
        return current && latest && current !== latest;
      });

      const details = Object.entries(outdated)
        .slice(0, 10)
        .map(([name, info]: [string, any]) => `${name}: ${(info as any).current} → ${(info as any).latest}`);

      return {
        id: "dependencies/outdated",
        name: "Outdated Packages",
        status: majorOutdated.length > 3 ? "fail" : "warn",
        message: `${count} outdated package(s), ${majorOutdated.length} major version(s) behind`,
        details,
        weight: 5,
      };
    } catch {
      // npm outdated exits with code 1 when outdated packages exist
      try {
        const { stdout } = await exec("npm", ["outdated", "--json"], {
          cwd: repoPath,
          timeout: 30000,
        }).catch((e) => ({ stdout: e.stdout || "{}" }));

        const outdated = JSON.parse(stdout || "{}");
        const count = Object.keys(outdated).length;

        if (count === 0) {
          return {
            id: "dependencies/outdated",
            name: "Outdated Packages",
            status: "pass",
            message: "All packages are up to date",
            weight: 5,
          };
        }

        const details = Object.entries(outdated)
          .slice(0, 10)
          .map(([name, info]: [string, any]) => `${name}: ${(info as any).current} → ${(info as any).latest}`);

        return {
          id: "dependencies/outdated",
          name: "Outdated Packages",
          status: "warn",
          message: `${count} outdated package(s)`,
          details,
          weight: 5,
        };
      } catch {
        return {
          id: "dependencies/outdated",
          name: "Outdated Packages",
          status: "warn",
          message: "Could not check for outdated packages (npm not available or timeout)",
          weight: 5,
        };
      }
    }
  },
};
