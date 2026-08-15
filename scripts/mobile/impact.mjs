import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

export function selectMobileGroups(changedPaths, impact) {
  const normalizedPaths = changedPaths.map(normalizePath).filter(Boolean);
  const allGroups = Object.keys(impact.groups).sort();
  const fullReasons = [];

  for (const changedPath of normalizedPaths) {
    const pattern = impact.fullSuitePaths.find((candidate) =>
      pathMatches(candidate, changedPath),
    );
    if (pattern) fullReasons.push(`${changedPath} matched ${pattern}`);
  }
  if (fullReasons.length > 0) {
    return { mode: "full", groups: allGroups, reasons: fullReasons };
  }

  const groups = new Set();
  const reasons = [];
  for (const changedPath of normalizedPaths) {
    for (const [group, patterns] of Object.entries(impact.groups)) {
      const pattern = patterns.find((candidate) => pathMatches(candidate, changedPath));
      if (pattern) {
        groups.add(group);
        reasons.push(`${changedPath} matched ${pattern}`);
      }
    }
  }

  if (groups.size > 0) {
    return { mode: "targeted", groups: [...groups].sort(), reasons };
  }

  const unknownSourcePath = normalizedPaths.find(
    (changedPath) => !isDoctorOnlyPath(changedPath),
  );
  if (unknownSourcePath) {
    return {
      mode: "full",
      groups: allGroups,
      reasons: [`Unknown source path ${unknownSourcePath}; selected full suite.`],
    };
  }

  return {
    mode: "doctor-only",
    groups: [],
    reasons: ["No runtime-owned source paths changed."],
  };
}

export function pathMatches(pattern, candidatePath) {
  const normalizedPattern = normalizePath(pattern);
  const normalizedCandidate = normalizePath(candidatePath);
  const expression = normalizedPattern
    .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    .replaceAll("**", "\u0000")
    .replaceAll("*", "[^/]*")
    .replaceAll("\u0000", ".*");
  return new RegExp(`^${expression}$`).test(normalizedCandidate);
}

function normalizePath(value) {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

function isDoctorOnlyPath(changedPath) {
  return (
    changedPath.endsWith(".md") ||
    changedPath.startsWith("docs/") ||
    changedPath.startsWith(".github/ISSUE_TEMPLATE/")
  );
}

async function run() {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const contract = JSON.parse(
    await readFile(path.join(repositoryRoot, "config", "mobile-experience.json"), "utf8"),
  );
  const changedPaths =
    process.argv.length > 2 ? process.argv.slice(2) : changedPathsFromGit(repositoryRoot);
  console.log(JSON.stringify(selectMobileGroups(changedPaths, contract.impact), null, 2));
}

function changedPathsFromGit(repositoryRoot) {
  const base = process.env.MOBILE_BASE_REF || "HEAD^";
  const output = execFileSync("git", ["diff", "--name-only", base, "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
  return output.split(/\r?\n/).filter(Boolean);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await run();
}
