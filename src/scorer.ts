import type { CheckResult, CategoryScore } from "./types.js";

function statusToScore(status: CheckResult["status"]): number {
  switch (status) {
    case "pass":
      return 100;
    case "warn":
      return 50;
    case "fail":
      return 0;
  }
}

export function scoreCategory(
  id: string,
  name: string,
  checks: CheckResult[]
): CategoryScore {
  if (checks.length === 0) {
    return { id, name, score: 0, checks };
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const check of checks) {
    weightedSum += statusToScore(check.status) * check.weight;
    totalWeight += check.weight;
  }

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
  return { id, name, score, checks };
}

export function scoreOverall(categories: CategoryScore[]): number {
  if (categories.length === 0) return 0;
  const sum = categories.reduce((acc, cat) => acc + cat.score, 0);
  return Math.round(sum / categories.length);
}
