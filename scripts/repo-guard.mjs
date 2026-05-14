import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceSrc = join(repoRoot, "apps", "workspace", "src");

const layerOrder = {
  shared: 0,
  entities: 1,
  features: 2,
  widgets: 3,
  views: 4,
  app: 5,
};

const layerNames = new Set(Object.keys(layerOrder));
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "out",
]);
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);
const vagueFileNames = new Set(["helpers.ts", "utils.ts", "misc.ts", "temp.ts"]);

const failures = [];

function toRepoPath(path) {
  return relative(repoRoot, path).replaceAll("\\", "/");
}

function readDirectoryTree(root, options = {}) {
  const { includeDirectories = false, includeFiles = true } = options;
  const entries = [];

  function walk(current) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
        continue;
      }

      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        if (includeDirectories) entries.push(fullPath);
        walk(fullPath);
        continue;
      }

      if (entry.isFile() && includeFiles) entries.push(fullPath);
    }
  }

  walk(root);
  return entries;
}

function getWorkspaceLayer(path) {
  const rel = relative(workspaceSrc, path).replaceAll("\\", "/");
  if (rel.startsWith("../") || rel === "..") return null;

  const [segment] = rel.split("/");
  return layerNames.has(segment) ? segment : null;
}

function getImportedWorkspaceLayer(specifier, importerPath) {
  if (specifier.startsWith("@/")) {
    const [segment] = specifier.slice(2).split("/");
    return layerNames.has(segment) ? segment : null;
  }

  for (const layer of layerNames) {
    if (specifier === `@${layer}` || specifier.startsWith(`@${layer}/`)) {
      return layer;
    }
  }

  if (specifier.startsWith(".")) {
    const resolved = resolve(dirname(importerPath), specifier);
    return getWorkspaceLayer(resolved);
  }

  return null;
}

function getImportSpecifiers(content) {
  const specifiers = [];
  const importPattern =
    /(?:from\s+["']([^"']+)["']|import\s+["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\))/g;

  for (const match of content.matchAll(importPattern)) {
    specifiers.push(match[1] ?? match[2] ?? match[3]);
  }

  return specifiers;
}

function assertWorkspaceReadmes() {
  const directories = [
    workspaceSrc,
    ...readDirectoryTree(workspaceSrc, {
      includeDirectories: true,
      includeFiles: false,
    }),
  ];

  for (const directory of directories) {
    if (!existsSync(join(directory, "README.md"))) {
      failures.push(`Missing README.md in ${toRepoPath(directory)}`);
    }
  }
}

function assertNoVagueWorkspaceFiles() {
  const files = readDirectoryTree(workspaceSrc);

  for (const file of files) {
    if (vagueFileNames.has(basename(file).toLowerCase())) {
      failures.push(`Vague file name is not allowed: ${toRepoPath(file)}`);
    }
  }
}

function assertWorkspaceImportDirection() {
  const files = readDirectoryTree(workspaceSrc).filter((file) =>
    sourceExtensions.has(extname(file)),
  );

  for (const file of files) {
    const importerLayer = getWorkspaceLayer(file);
    if (!importerLayer) continue;

    const content = readFileSync(file, "utf8");
    for (const specifier of getImportSpecifiers(content)) {
      const importedLayer = getImportedWorkspaceLayer(specifier, file);
      if (!importedLayer) continue;

      if (layerOrder[importedLayer] > layerOrder[importerLayer]) {
        failures.push(
          `Upward workspace import in ${toRepoPath(file)}: ${specifier} imports ${importedLayer} from ${importerLayer}`,
        );
      }
    }
  }
}

function assertClerkConfinedToWorkspace() {
  const sourceFiles = readDirectoryTree(repoRoot).filter((file) =>
    sourceExtensions.has(extname(file)),
  );

  for (const file of sourceFiles) {
    const repoPath = toRepoPath(file);
    if (repoPath.startsWith("apps/workspace/")) continue;

    const content = readFileSync(file, "utf8");
    const importsClerk = getImportSpecifiers(content).some((specifier) =>
      specifier.startsWith("@clerk/"),
    );

    if (importsClerk) {
      failures.push(`Clerk import outside apps/workspace: ${repoPath}`);
    }
  }
}

function assertRequiredRoots() {
  for (const path of [workspaceSrc]) {
    if (!existsSync(path) || !statSync(path).isDirectory()) {
      failures.push(`Required directory is missing: ${toRepoPath(path)}`);
    }
  }
}

assertRequiredRoots();
if (failures.length === 0) {
  assertWorkspaceReadmes();
  assertNoVagueWorkspaceFiles();
  assertWorkspaceImportDirection();
  assertClerkConfinedToWorkspace();
}

if (failures.length > 0) {
  console.error("Repo guard failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Repo guard passed.");
