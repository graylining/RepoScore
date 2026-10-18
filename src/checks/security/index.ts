import type { CategoryDefinition } from "../../types.js";
import { hardcodedSecrets } from "./hardcoded-secrets.js";
import { envExposure } from "./env-exposure.js";
import { sensitiveFiles } from "./sensitive-files.js";

export const securityChecks: CategoryDefinition = {
  id: "security",
  name: "Security",
  checks: [hardcodedSecrets, envExposure, sensitiveFiles],
};
