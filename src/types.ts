export interface CheckResult {
  id: string;
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  details?: string[];
  weight: number;
}

export interface CheckModule {
  id: string;
  name: string;
  run: (repoPath: string) => Promise<CheckResult>;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  checks: CheckModule[];
}

export interface CategoryScore {
  id: string;
  name: string;
  score: number;
  checks: CheckResult[];
}

export interface ScanReport {
  overallScore: number;
  categories: CategoryScore[];
  scannedAt: string;
  repoPath: string;
  duration: number;
}

export interface ScanOptions {
  repoPath: string;
  report?: boolean;
  json?: boolean;
  threshold?: number;
}
