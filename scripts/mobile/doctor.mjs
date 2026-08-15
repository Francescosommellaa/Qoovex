import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  discoverAppPageRoutes,
  loadMobileContract,
  validateMobileContract,
  validateRouteCoverage,
} from "./contract.mjs";
import { auditSourceFiles, loadAuditedFiles } from "./source-audit.mjs";

const requiredScripts = {
  "mobile:contract": "node scripts/mobile/contract.mjs",
  "mobile:doctor": "node scripts/mobile/doctor.mjs",
  "mobile:test": "node scripts/mobile/run-playwright.mjs",
};

export function validateGateIntegration(packageJson, workflowSource) {
  const findings = [];
  for (const [script, expected] of Object.entries(requiredScripts)) {
    if (packageJson.scripts?.[script] !== expected) {
      findings.push(
        integrationFinding(
          `package-${script.replace(":", "-")}`,
          `Missing canonical ${script} package script.`,
          `Set ${script} to ${JSON.stringify(expected)} in package.json.`,
        ),
      );
    }
  }

  if (!/^\s{2}mobile-responsive:\s*$/m.test(workflowSource)) {
    findings.push(
      integrationFinding(
        "ci-mobile-responsive-job",
        "The independent mobile-responsive CI job is missing.",
        "Add a top-level mobile-responsive job to .github/workflows/ci.yml.",
      ),
    );
  }

  const doctorIndex = workflowSource.indexOf("pnpm mobile:doctor");
  const browserIndex = workflowSource.indexOf("pnpm mobile:test");
  if (doctorIndex === -1 || (browserIndex !== -1 && doctorIndex > browserIndex)) {
    findings.push(
      integrationFinding(
        "ci-mobile-doctor-first",
        "CI does not run the deterministic mobile doctor before Playwright.",
        "Run pnpm mobile:doctor before pnpm mobile:test in mobile-responsive.",
      ),
    );
  }
  if (browserIndex === -1) {
    findings.push(
      integrationFinding(
        "ci-mobile-test",
        "CI does not run the mobile Playwright suite.",
        "Run pnpm mobile:test in the mobile-responsive job.",
      ),
    );
  }

  return findings;
}

export async function runMobileDoctor(repositoryRoot) {
  const contractPath = path.join(repositoryRoot, "config", "mobile-experience.json");
  const [contract, packageJson, workflowSource] = await Promise.all([
    loadMobileContract(contractPath),
    readJson(path.join(repositoryRoot, "package.json")),
    readFile(path.join(repositoryRoot, ".github", "workflows", "ci.yml"), "utf8"),
  ]);
  const findings = [];
  const contractValidation = validateMobileContract(contract);
  findings.push(
    ...contractValidation.errors.map((message) => ({
      file: "config/mobile-experience.json",
      line: 1,
      rule: "contract-schema",
      message,
      recovery: "Restore the required mobile contract field or scenario.",
    })),
  );

  const apps = [...new Set((contract.surfaces ?? []).map((surface) => surface.app))];
  const routesByApp = Object.fromEntries(
    await Promise.all(
      apps.map(async (app) => [app, await discoverAppPageRoutes(repositoryRoot, app)]),
    ),
  );
  const routeCoverage = validateRouteCoverage(contract, routesByApp);
  findings.push(
    ...routeCoverage.uncovered.map((route) => ({
      file: `apps/${route.split(":", 1)[0]}/src/app`,
      line: 1,
      rule: "unowned-route",
      message: `Page route ${route} is not owned by a mobile surface.`,
      recovery: "Assign it to one contract surface or add an owned, reasoned exclusion.",
    })),
    ...routeCoverage.duplicateOwnership.map((route) => ({
      file: "config/mobile-experience.json",
      line: 1,
      rule: "duplicate-route-owner",
      message: `Page route ${route} has overlapping owners without allowOverlap.`,
      recovery: "Choose one owner or explicitly mark every intentional overlapping role surface.",
    })),
  );

  const repositoryFiles = [
    ...(await walkFiles(path.join(repositoryRoot, "apps"), repositoryRoot)),
    ...(await walkFiles(path.join(repositoryRoot, "packages"), repositoryRoot)),
  ];
  const auditedFiles = await loadAuditedFiles(
    repositoryRoot,
    contract.sourceAudit ?? [],
    repositoryFiles,
  );
  findings.push(...auditSourceFiles(auditedFiles, contract.sourceAudit ?? []));
  findings.push(...validateGateIntegration(packageJson, workflowSource));

  return {
    ok: findings.length === 0,
    findings,
    summary: {
      contractVersion: contract.version,
      surfaces: contract.surfaces?.length ?? 0,
      routes: Object.values(routesByApp).flat().length,
      auditedFiles: auditedFiles.size,
      viewports: contract.viewports?.map(({ width }) => width) ?? [],
    },
  };
}

function integrationFinding(rule, message, recovery) {
  return {
    file: rule.startsWith("package-") ? "package.json" : ".github/workflows/ci.yml",
    line: 1,
    rule,
    message,
    recovery,
  };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function walkFiles(directory, repositoryRoot) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", ".next", "dist", "coverage"].includes(entry.name)) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(entryPath, repositoryRoot)));
    } else {
      files.push(path.relative(repositoryRoot, entryPath).replaceAll("\\", "/"));
    }
  }
  return files;
}

async function main() {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const result = await runMobileDoctor(repositoryRoot);
  if (process.argv.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
    if (!result.ok) process.exitCode = 1;
  } else if (result.ok) {
    console.log(
      `Mobile doctor: PASS — ${result.summary.surfaces} surfaces, ${result.summary.routes} routes, ${result.summary.auditedFiles} source files, viewports ${result.summary.viewports.join("/")}.`,
    );
  } else {
    console.error(`Mobile doctor: FAIL — ${result.findings.length} finding(s).`);
    for (const finding of result.findings) {
      console.error(
        `${finding.file}:${finding.line} [${finding.rule}] ${finding.message}\n  Recovery: ${finding.recovery}`,
      );
    }
    process.exitCode = 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
