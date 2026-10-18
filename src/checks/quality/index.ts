import type { CategoryDefinition } from "../../types.js";
import { fileSizeCheck } from "./file-size.js";
import { lintConfigCheck } from "./lint-config.js";
import { todoDensityCheck } from "./todo-density.js";
import { typeSafetyCheck } from "./type-safety.js";

export const qualityChecks: CategoryDefinition = {
  id: "quality",
  name: "Code Quality",
  checks: [fileSizeCheck, lintConfigCheck, todoDensityCheck, typeSafetyCheck],
};
