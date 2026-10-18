import { writeFile } from "fs/promises";
import { join } from "path";
import type { ScanReport, CategoryScore, CheckResult } from "../types.js";

function scoreClass(score: number): string {
  if (score >= 90) return "green";
  if (score >= 70) return "yellow";
  return "red";
}

function statusBadge(status: CheckResult["status"]): string {
  const colors = { pass: "#22c55e", warn: "#eab308", fail: "#ef4444" };
  const labels = { pass: "PASS", warn: "WARN", fail: "FAIL" };
  return `<span class="badge" style="background:${colors[status]}">${labels[status]}</span>`;
}

function renderCategoryHtml(category: CategoryScore): string {
  const checks = category.checks
    .map(
      (check) => `
      <div class="check">
        <div class="check-header">
          ${statusBadge(check.status)}
          <span class="check-name">${check.name}</span>
        </div>
        <p class="check-message">${check.message}</p>
        ${
          check.details && check.details.length > 0
            ? `<ul class="check-details">${check.details.map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>`
            : ""
        }
      </div>`
    )
    .join("");

  return `
    <div class="category">
      <div class="category-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <h2>${category.name}</h2>
        <div class="gauge small ${scoreClass(category.score)}">
          <span>${category.score}</span>
        </div>
      </div>
      <div class="category-body">
        ${checks}
      </div>
    </div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function generateHtml(report: ScanReport): string {
  const categories = report.categories.map(renderCategoryHtml).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>reposcore Report</title>
  <style>
    :root {
      --bg: #0f172a;
      --surface: #1e293b;
      --border: #334155;
      --text: #e2e8f0;
      --text-dim: #94a3b8;
      --green: #22c55e;
      --yellow: #eab308;
      --red: #ef4444;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 16px;
      max-width: 800px;
      margin: 0 auto;
    }
    header {
      text-align: center;
      padding: 40px 0;
    }
    header h1 {
      font-size: 2rem;
      margin-bottom: 8px;
    }
    header .path {
      color: var(--text-dim);
      font-size: 0.875rem;
      word-break: break-all;
    }
    .gauge {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: bold;
      margin: 24px auto;
      border: 4px solid;
    }
    .gauge.green { border-color: var(--green); color: var(--green); }
    .gauge.yellow { border-color: var(--yellow); color: var(--yellow); }
    .gauge.red { border-color: var(--red); color: var(--red); }
    .gauge.small {
      width: 48px;
      height: 48px;
      font-size: 1rem;
      border-width: 3px;
      margin: 0;
      flex-shrink: 0;
    }
    .category {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 16px;
      overflow: hidden;
    }
    .category-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      cursor: pointer;
      user-select: none;
    }
    .category-header:hover { background: rgba(255,255,255,0.03); }
    .category-header h2 { font-size: 1.125rem; }
    .category.collapsed .category-body { display: none; }
    .category-body {
      border-top: 1px solid var(--border);
      padding: 12px 20px;
    }
    .check {
      padding: 12px 0;
      border-bottom: 1px solid var(--border);
    }
    .check:last-child { border-bottom: none; }
    .check-header {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      color: #000;
      letter-spacing: 0.03em;
    }
    .check-name { font-weight: 600; }
    .check-message {
      color: var(--text-dim);
      font-size: 0.875rem;
      margin: 6px 0 0 0;
      padding-left: 52px;
    }
    .check-details {
      list-style: none;
      padding-left: 52px;
      margin-top: 6px;
    }
    .check-details li {
      color: var(--text-dim);
      font-size: 0.8rem;
      font-family: monospace;
      padding: 2px 0;
    }
    .check-details li::before {
      content: "\\2192 ";
    }
    footer {
      text-align: center;
      padding: 32px 0;
      color: var(--text-dim);
      font-size: 0.8rem;
    }
    footer a { color: var(--text-dim); }
    .meta {
      display: flex;
      justify-content: center;
      gap: 24px;
      color: var(--text-dim);
      font-size: 0.8rem;
      margin-bottom: 32px;
    }
  </style>
</head>
<body>
  <header>
    <h1>reposcore</h1>
    <div class="path">${escapeHtml(report.repoPath)}</div>
    <div class="gauge ${scoreClass(report.overallScore)}">
      <span>${report.overallScore}</span>
    </div>
  </header>
  <div class="meta">
    <span>Scanned: ${new Date(report.scannedAt).toLocaleDateString()}</span>
    <span>Duration: ${report.duration}ms</span>
  </div>
  ${categories}
  <footer>
    Generated by <strong>reposcore</strong> &mdash; an open-source project by
    <a href="https://graylining.com" target="_blank" rel="noopener">Graylining</a>
  </footer>
</body>
</html>`;
}

export async function writeHtmlReport(report: ScanReport, outputDir: string): Promise<string> {
  const html = generateHtml(report);
  const outputPath = join(outputDir, "reposcore-report.html");
  await writeFile(outputPath, html, "utf-8");
  return outputPath;
}
