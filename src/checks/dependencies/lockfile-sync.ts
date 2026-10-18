import { readFile, access } from "fs/promises";
import { join } from "path";
import type { CheckModule } from "../../types.js";

export const lockfileSyncCheck: CheckModule = {
  id: "dependencies/lockfile-sync",
  name: "Lockfile Sync",
  async run(repoPath) {
    const pkgPath = join(repoPath, "package.json");
    const lockPath = join(repoPath, "package-lock.json");

    try {
      await access(pkgPath);
    } catch {
      return {
        id: "dependencies/lockfile-sync",
        name: "Lockfile Sync",
        status: "pass",
        message: "No package.json — check not applicable",
        weight: 4,
      };
    }

    try {
      await access(lockPath);
    } catch {
      return {
        id: "dependencies/lockfile-sync",
        name: "Lockfile Sync",
        status: "warn",
        message: "No package-lock.json found to verify sync",
        weight: 4,
      };
    }

    try {
      const pkg = JSON.parse(await readFile(pkgPath, "utf-8"));
      const lock = JSON.parse(await readFile(lockPath, "utf-8"));

      const allDeps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };

      const lockPackages = lock.packages?.[""]?.dependencies || {};
      const lockDevPackages = lock.packages?.[""]?.devDependencies || {};
      const allLockDeps = { ...lockPackages, ...lockDevPackages };

      const missingFromLock: string[] = [];
      for (const dep of Object.keys(allDeps)) {
        const inLock =
          lock.packages?.[`node_modules/${dep}`] !== undefined ||
          allLockDeps[dep] !== undefined;
        if (!inLock) {
          missingFromLock.push(dep);
        }
      }

      if (missingFromLock.length === 0) {
        return {
          id: "dependencies/lockfile-sync",
          name: "Lockfile Sync",
          status: "pass",
          message: "Lockfile appears in sync with package.json",
          weight: 4,
        };
      }

      return {
        id: "dependencies/lockfile-sync",
        name: "Lockfile Sync",
        status: "warn",
        message: `${missingFromLock.length} package(s) in package.json not found in lockfile`,
        details: missingFromLock,
        weight: 4,
      };
    } catch {
      return {
        id: "dependencies/lockfile-sync",
        name: "Lockfile Sync",
        status: "warn",
        message: "Could not parse lockfile to verify sync",
        weight: 4,
      };
    }
  },
};
