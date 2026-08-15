import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const reportPath = path.resolve("output/visual-geometry/results.json");
if (!existsSync(reportPath)) {
  console.log("[visual-geometry:report] No JSON result is available. Run pnpm visual:geometry first.");
  process.exit(0);
}

const report = JSON.parse(readFileSync(reportPath, "utf8"));
const statistics = report.stats ?? {};
const summary = {
  expected: statistics.expected ?? 0,
  unexpected: statistics.unexpected ?? 0,
  flaky: statistics.flaky ?? 0,
  skipped: statistics.skipped ?? 0,
  durationMs: statistics.duration ?? 0,
};

console.log(`[visual-geometry:report] ${JSON.stringify(summary)}`);
if (summary.unexpected > 0) process.exitCode = 1;

