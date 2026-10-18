import type { CategoryDefinition } from "../../types.js";
import { readmeCheck } from "./readme.js";
import { licenseCheck } from "./license.js";
import { ciConfigCheck } from "./ci-config.js";
import { containerizationCheck } from "./containerization.js";
import { gitignoreCheck } from "./gitignore.js";
import { envTemplateCheck } from "./env-template.js";
import { lockfileCheck } from "./lockfile.js";

export const structureChecks: CategoryDefinition = {
  id: "structure",
  name: "Project Structure",
  checks: [
    readmeCheck,
    licenseCheck,
    ciConfigCheck,
    containerizationCheck,
    gitignoreCheck,
    envTemplateCheck,
    lockfileCheck,
  ],
};
