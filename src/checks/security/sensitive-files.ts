import fg from "fast-glob";
import type { CheckModule } from "../../types.js";

const SENSITIVE_PATTERNS = [
  "**/*.pem",
  "**/*.key",
  "**/*.p12",
  "**/*.pfx",
  "**/*.jks",
  "**/*.keystore",
  "**/id_rsa",
  "**/id_dsa",
  "**/id_ecdsa",
  "**/id_ed25519",
  "**/.htpasswd",
  "**/.netrc",
  "**/credentials.json",
  "**/service-account*.json",
  "**/wp-config.php",
];

export const sensitiveFiles: CheckModule = {
  id: "security/sensitive-files",
  name: "Sensitive Files",
  async run(repoPath) {
    const found = await fg(SENSITIVE_PATTERNS, {
      cwd: repoPath,
      ignore: ["**/node_modules/**", "**/.git/**"],
      dot: true,
    });

    if (found.length === 0) {
      return {
        id: "security/sensitive-files",
        name: "Sensitive Files",
        status: "pass",
        message: "No sensitive files (keys, certificates, credentials) found",
        weight: 7,
      };
    }

    return {
      id: "security/sensitive-files",
      name: "Sensitive Files",
      status: "fail",
      message: `Found ${found.length} sensitive file(s) in repository`,
      details: found,
      weight: 7,
    };
  },
};
