import { access } from "fs/promises";
import { join } from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import type { CheckModule } from "../../types.js";

const exec = promisify(execFile);

export const vulnerabilitiesCheck: CheckModule = {
  id: "dependencies/vulnerabilities",
  name: "Known Vulnerabilities",
  async run(repoPath) {
    const pkgPath = join(repoPath, "package.json");
    try {
      await access(pkgPath);
    } catch {
      return {
        id: "dependencies/vulnerabilities",
        name: "Known Vulnerabilities",
        status: "pass",
        message: "No package.json found — check not applicable",
        weight: 8,
      };
    }

    const lockPath = join(repoPath, "package-lock.json");
    try {
      await access(lockPath);
    } catch {
      return {
        id: "dependencies/vulnerabilities",
        name: "Known Vulnerabilities",
        status: "warn",
        message: "No lockfile found — cannot run vulnerability audit",
        weight: 8,
      };
    }

    try {
      const result = await exec("npm", ["audit", "--json"], {
        cwd: repoPath,
        timeout: 30000,
      }).catch((e) => ({ stdout: e.stdout || "{}" }));

      const audit = JSON.parse(result.stdout || "{}");
      const meta = audit.metadata?.vulnerabilities || {};
      const critical = meta.critical || 0;
      const high = meta.high || 0;
      const moderate = meta.moderate || 0;
      const total = critical + high + moderate;

      if (total === 0) {
        return {
          id: "dependencies/vulnerabilities",
          name: "Known Vulnerabilities",
          status: "pass",
          message: "No known vulnerabilities found",
          weight: 8,
        };
      }

      const details: string[] = [];
      if (critical > 0) details.push(`${critical} critical`);
      if (high > 0) details.push(`${high} high`);
      if (moderate > 0) details.push(`${moderate} moderate`);

      return {
        id: "dependencies/vulnerabilities",
        name: "Known Vulnerabilities",
        status: critical > 0 || high > 0 ? "fail" : "warn",
        message: `Found ${total} vulnerability/ies: ${details.join(", ")}`,
        details,
        weight: 8,
      };
    } catch {
      return {
        id: "dependencies/vulnerabilities",
        name: "Known Vulnerabilities",
        status: "warn",
        message: "Could not run vulnerability audit",
        weight: 8,
      };
    }
  },
};
