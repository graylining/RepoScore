import { Command } from "commander";
import { resolve } from "path";
import { scan } from "./scanner.js";
import { renderTerminal } from "./reporters/terminal.js";
import { writeHtmlReport } from "./reporters/html.js";

const program = new Command();

program
  .name("reposcore")
  .description("Scan any codebase and get a health score")
  .version("0.1.0")
  .argument("[path]", "path to repository", ".")
  .option("--report", "generate an HTML report")
  .option("--json", "output results as JSON")
  .option("--threshold <score>", "exit with code 1 if score is below threshold")
  .action(async (path: string, options: { report?: boolean; json?: boolean; threshold?: string }) => {
    const repoPath = resolve(path);

    const report = await scan(repoPath);

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      console.log(renderTerminal(report));
    }

    if (options.report) {
      const outputPath = await writeHtmlReport(report, repoPath);
      console.log(`HTML report saved to ${outputPath}`);
    }

    if (options.threshold) {
      const threshold = parseInt(options.threshold, 10);
      if (report.overallScore < threshold) {
        console.error(`Score ${report.overallScore} is below threshold ${threshold}`);
        process.exit(1);
      }
    }
  });

program.parse();
