import fg from "fast-glob";
import { readFile } from "fs/promises";
import type { CheckModule } from "../../types.js";

const SECRET_PATTERNS = [
  { name: "AWS Access Key", pattern: /AKIA[0-9A-Z]{16}/ },
  { name: "AWS Secret Key", pattern: /(?:aws_secret_access_key|aws_secret)\s*[:=]\s*['"]?[A-Za-z0-9/+=]{40}/ },
  { name: "Generic API Key", pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][A-Za-z0-9_\-]{20,}['"]/ },
  { name: "Generic Secret", pattern: /(?:secret|token|password|passwd|pwd)\s*[:=]\s*['"][^'"]{8,}['"]/ },
  { name: "Private Key", pattern: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/ },
  { name: "GitHub Token", pattern: /gh[pousr]_[A-Za-z0-9_]{36,}/ },
  { name: "Slack Token", pattern: /xox[baprs]-[A-Za-z0-9-]+/ },
  { name: "JWT", pattern: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/ },
];

const IGNORE_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2",
  ".ttf", ".eot", ".mp4", ".mp3", ".pdf", ".zip", ".gz", ".tar",
  ".lock", ".min.js", ".min.css",
]);

export const hardcodedSecrets: CheckModule = {
  id: "security/hardcoded-secrets",
  name: "Hardcoded Secrets",
  async run(repoPath) {
    const files = await fg("**/*", {
      cwd: repoPath,
      ignore: ["**/node_modules/**", "**/.git/**", "**/dist/**", "**/build/**", "**/*.lock"],
      absolute: true,
      dot: true,
    });

    const findings: string[] = [];

    for (const file of files) {
      const ext = file.substring(file.lastIndexOf(".")).toLowerCase();
      if (IGNORE_EXTENSIONS.has(ext)) continue;

      let content: string;
      try {
        content = await readFile(file, "utf-8");
      } catch {
        continue;
      }

      if (content.length > 1_000_000) continue;

      for (const { name, pattern } of SECRET_PATTERNS) {
        if (pattern.test(content)) {
          const relative = file.replace(repoPath + "/", "");
          findings.push(`${name} found in ${relative}`);
        }
      }
    }

    if (findings.length === 0) {
      return {
        id: "security/hardcoded-secrets",
        name: "Hardcoded Secrets",
        status: "pass",
        message: "No hardcoded secrets detected",
        weight: 10,
      };
    }

    return {
      id: "security/hardcoded-secrets",
      name: "Hardcoded Secrets",
      status: "fail",
      message: `Found ${findings.length} potential secret(s) in source files`,
      details: findings,
      weight: 10,
    };
  },
};
