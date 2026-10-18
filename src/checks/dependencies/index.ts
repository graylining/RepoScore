import type { CategoryDefinition } from "../../types.js";
import { outdatedCheck } from "./outdated.js";
import { vulnerabilitiesCheck } from "./vulnerabilities.js";
import { unusedCheck } from "./unused.js";
import { lockfileSyncCheck } from "./lockfile-sync.js";

export const dependencyChecks: CategoryDefinition = {
  id: "dependencies",
  name: "Dependencies",
  checks: [outdatedCheck, vulnerabilitiesCheck, unusedCheck, lockfileSyncCheck],
};
