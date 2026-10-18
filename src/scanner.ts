import type { CategoryDefinition, ScanReport } from "./types.js";
import { scoreCategory, scoreOverall } from "./scorer.js";
import { securityChecks } from "./checks/security/index.js";
import { structureChecks } from "./checks/structure/index.js";
import { qualityChecks } from "./checks/quality/index.js";
import { dependencyChecks } from "./checks/dependencies/index.js";

const categories: CategoryDefinition[] = [
  securityChecks,
  structureChecks,
  qualityChecks,
  dependencyChecks,
];

export async function scan(repoPath: string): Promise<ScanReport> {
  const start = Date.now();

  const categoryScores = await Promise.all(
    categories.map(async (category) => {
      const results = await Promise.all(
        category.checks.map((check) => check.run(repoPath))
      );
      return scoreCategory(category.id, category.name, results);
    })
  );

  return {
    overallScore: scoreOverall(categoryScores),
    categories: categoryScores,
    scannedAt: new Date().toISOString(),
    repoPath,
    duration: Date.now() - start,
  };
}
