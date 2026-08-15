import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const canonicalWidths = [320, 390, 768, 1024, 1440];
const requiredScenarios = [
  "coarse-touch",
  "fine-hover",
  "portrait",
  "landscape",
  "zoom-200",
  "reduced-motion",
  "safe-area",
  "software-keyboard",
];

export async function loadMobileContract(contractPath) {
  return JSON.parse(await readFile(contractPath, "utf8"));
}

export function validateMobileContract(contract) {
  const errors = [];
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
    return { ok: false, errors: ["Contract must be a JSON object."] };
  }

  if (contract.version !== 1) {
    errors.push("Contract version must be 1.");
  }

  const widths = Array.isArray(contract.viewports)
    ? contract.viewports.map((viewport) => viewport?.width)
    : [];
  for (const width of canonicalWidths) {
    if (!widths.includes(width)) {
      errors.push(`Missing canonical viewport ${width}px.`);
    }
  }

  for (const viewport of contract.viewports ?? []) {
    if (
      typeof viewport?.id !== "string" ||
      !Number.isInteger(viewport?.width) ||
      !Number.isInteger(viewport?.height) ||
      viewport.width <= 0 ||
      viewport.height <= 0
    ) {
      errors.push("Every viewport needs an id and positive integer width/height.");
    }
  }

  const scenarios = Object.values(contract.scenarios ?? {}).flat();
  for (const scenario of requiredScenarios) {
    if (!scenarios.includes(scenario)) {
      errors.push(`Missing required scenario ${scenario}.`);
    }
  }

  if (!Array.isArray(contract.surfaces) || contract.surfaces.length === 0) {
    errors.push("At least one owned surface is required.");
  }
  const surfaceIds = new Set();
  for (const [index, surface] of (contract.surfaces ?? []).entries()) {
    const label = surface?.id || `surface[${index}]`;
    if (!surface?.id || surfaceIds.has(surface.id)) {
      errors.push(`${label} needs a unique id.`);
    }
    surfaceIds.add(surface?.id);
    if (!surface?.app || !surface?.owner) {
      errors.push(`${label} needs an app and owner.`);
    }
    if (!nonEmptyStrings(surface?.routePatterns)) {
      errors.push(`${label} needs at least one route pattern.`);
    }
    if (!nonEmptyStrings(surface?.runtimeRoutes)) {
      errors.push(`${label} needs at least one runtime route.`);
    }
    if (!nonEmptyStrings(surface?.requiredScenarios)) {
      errors.push(`${label} needs required scenarios.`);
    }
    for (const scenario of surface?.requiredScenarios ?? []) {
      if (!requiredScenarios.includes(scenario)) {
        errors.push(`${label} references unknown scenario ${scenario}.`);
      }
    }
  }

  for (const [index, exclusion] of (contract.exclusions ?? []).entries()) {
    const label = `Exclusion ${index + 1}`;
    if (!exclusion?.app || !exclusion?.pattern) {
      errors.push(`${label} needs an app and pattern.`);
    }
    if (!exclusion?.owner?.trim()) {
      errors.push(`${label} needs an accountable owner.`);
    }
    if (!exclusion?.reason?.trim()) {
      errors.push(`${label} needs a reason.`);
    }
  }

  if (!nonEmptyStrings(contract.impact?.fullSuitePaths)) {
    errors.push("Impact configuration needs fullSuitePaths.");
  }
  if (
    !contract.impact?.groups ||
    typeof contract.impact.groups !== "object" ||
    Object.keys(contract.impact.groups).length === 0
  ) {
    errors.push("Impact configuration needs at least one group.");
  }

  return { ok: errors.length === 0, errors };
}

export async function discoverAppPageRoutes(repositoryRoot, app) {
  const appDirectory = path.join(repositoryRoot, "apps", app, "src", "app");
  const pages = await walkForPages(appDirectory);
  return pages
    .map((pagePath) => pagePathToRoute(path.relative(appDirectory, pagePath)))
    .sort((left, right) => left.localeCompare(right));
}

export function validateRouteCoverage(contract, routesByApp) {
  const uncovered = [];
  const duplicateOwnership = [];

  for (const [app, routes] of Object.entries(routesByApp)) {
    for (const route of routes) {
      const owners = (contract.surfaces ?? []).filter(
        (surface) =>
          surface.app === app &&
          surface.routePatterns.some((pattern) => routeMatches(pattern, route)),
      );
      const exclusions = (contract.exclusions ?? []).filter(
        (exclusion) =>
          exclusion.app === app && routeMatches(exclusion.pattern, route),
      );

      if (owners.length === 0 && exclusions.length === 0) {
        uncovered.push(`${app}:${route}`);
      }
      if (owners.length > 1 && !owners.every((owner) => owner.allowOverlap)) {
        duplicateOwnership.push(
          `${app}:${route} (${owners.map((owner) => owner.id).join(", ")})`,
        );
      }
    }
  }

  return {
    ok: uncovered.length === 0 && duplicateOwnership.length === 0,
    uncovered,
    duplicateOwnership,
  };
}

export function routeMatches(pattern, route) {
  if (pattern === "/**") return true;
  const segments = pattern.split("/").filter(Boolean);
  const routeSegments = route.split("/").filter(Boolean);

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    if (segment === "**") return true;
    if (routeSegments[index] === undefined) return false;
    if (segment !== "*" && segment !== routeSegments[index]) return false;
  }
  return segments.length === routeSegments.length;
}

async function walkForPages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];
  for (const entry of entries) {
    if (entry.name.startsWith("_") || entry.name.startsWith("@")) continue;
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      pages.push(...(await walkForPages(entryPath)));
    } else if (/^page\.(?:js|jsx|ts|tsx)$/.test(entry.name)) {
      pages.push(entryPath);
    }
  }
  return pages;
}

function pagePathToRoute(relativePagePath) {
  const routeSegments = path
    .dirname(relativePagePath)
    .split(path.sep)
    .filter((segment) => segment !== "." && !/^\(.+\)$/.test(segment));
  return routeSegments.length === 0 ? "/" : `/${routeSegments.join("/")}`;
}

function nonEmptyStrings(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((entry) => typeof entry === "string" && entry.trim().length > 0)
  );
}

async function run() {
  const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const contractPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(repositoryRoot, "config", "mobile-experience.json");
  const contract = await loadMobileContract(contractPath);
  const validation = validateMobileContract(contract);
  const apps = [...new Set((contract.surfaces ?? []).map((surface) => surface.app))];
  const routesByApp = Object.fromEntries(
    await Promise.all(
      apps.map(async (app) => [app, await discoverAppPageRoutes(repositoryRoot, app)]),
    ),
  );
  const coverage = validateRouteCoverage(contract, routesByApp);

  if (!validation.ok || !coverage.ok) {
    for (const error of validation.errors) console.error(`contract: ${error}`);
    for (const route of coverage.uncovered) console.error(`route: Uncovered ${route}`);
    for (const route of coverage.duplicateOwnership) {
      console.error(`route: Multiple owners for ${route}`);
    }
    process.exitCode = 1;
    return;
  }

  const routeCount = Object.values(routesByApp).flat().length;
  console.log(
    `Mobile contract v${contract.version}: ${contract.surfaces.length} surfaces, ${routeCount} page routes, ${contract.viewports.length} viewports.`,
  );
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  await run();
}
