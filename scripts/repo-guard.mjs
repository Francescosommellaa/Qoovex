import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const workspaceSrc = join(repoRoot, "apps", "workspace", "src");
const appsRoot = join(repoRoot, "apps");
const packagesRoot = join(repoRoot, "packages");

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

function assertCanonicalOrigins() {
  const config = readFileSync(join(repoRoot, "packages", "config", "src", "index.ts"), "utf8");
  const webLayout = readFileSync(join(repoRoot, "apps", "web", "src", "app", "layout.tsx"), "utf8");
  const sirioLayout = readFileSync(join(repoRoot, "apps", "sirio", "src", "app", "layout.tsx"), "utf8");
  const expected = ["https://qoovex.com", "https://app.qoovex.com", "https://sirio.qoovex.com"];

  for (const origin of expected) {
    if (!config.includes(origin)) failures.push(`Missing canonical origin in packages/config: ${origin}`);
  }
  if (!webLayout.includes("https://qoovex.com")) failures.push("Web metadata must use https://qoovex.com");
  if (!sirioLayout.includes("https://sirio.qoovex.com")) failures.push("Sirio metadata must use https://sirio.qoovex.com");
}

function assertPreServiceDirection() {
  const productContext = readFileSync(join(repoRoot, "docs", "ProductContext.md"), "utf8");
  const platform = readFileSync(join(repoRoot, "docs", "platform-strategy.md"), "utf8");
  const mobileReadme = join(repoRoot, "apps", "mobile", "README.md");

  if (!productContext.includes("Pre-Service Brain")) failures.push("Product context must define Pre-Service Brain");
  if (!platform.includes("apps/mobile")) failures.push("Platform strategy must define apps/mobile");
  if (!platform.includes("apps/workspace")) failures.push("Platform strategy must define workspace as the web product");
  if (!existsSync(mobileReadme)) failures.push("apps/mobile must contain its document-only README");
}

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

function assertNoLegacyRootApp() {
  const legacyPaths = [
    join(repoRoot, "src", "app"),
    join(repoRoot, "prisma", "schema.prisma"),
  ];

  for (const path of legacyPaths) {
    if (existsSync(path)) {
      failures.push(`Legacy template path must be removed: ${toRepoPath(path)}`);
    }
  }
}

function assertWorkspaceMiddlewareConvention() {
  const middlewarePath = join(workspaceSrc, "middleware.ts");
  const proxyPath = join(workspaceSrc, "proxy.ts");

  if (!existsSync(proxyPath)) {
    failures.push("Workspace request interception must live in apps/workspace/src/proxy.ts");
  }

  if (existsSync(middlewarePath)) {
    failures.push("apps/workspace/src/middleware.ts is deprecated; use apps/workspace/src/proxy.ts");
  }
}

function getAppPackageNames() {
  return readdirSync(appsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertAppTranspilePackages() {
  for (const appName of getAppPackageNames()) {
    const appRoot = join(appsRoot, appName);
    const packagePath = join(appRoot, "package.json");
    const nextConfigPath = join(appRoot, "next.config.ts");

    if (!existsSync(packagePath) || !existsSync(nextConfigPath)) continue;

    const packageJson = readJson(packagePath);
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    const workspacePackages = Object.keys(dependencies).filter((name) =>
      name.startsWith("@qoovex/"),
    );
    if (workspacePackages.length === 0) continue;

    const nextConfig = readFileSync(nextConfigPath, "utf8");
    for (const packageName of workspacePackages) {
      if (!nextConfig.includes(`"${packageName}"`)) {
        failures.push(
          `${toRepoPath(nextConfigPath)} must include ${packageName} in transpilePackages`,
        );
      }
    }
  }
}

function assertNoControllerDbImports() {
  const files = readDirectoryTree(workspaceSrc).filter((file) =>
    sourceExtensions.has(extname(file)),
  );

  for (const file of files) {
    const rel = toRepoPath(file);
    if (rel.startsWith("apps/workspace/src/shared/server/")) continue;

    const content = readFileSync(file, "utf8");
    if (content.includes('"@qoovex/db"') || content.includes("'@qoovex/db'")) {
      failures.push(
        `Direct @qoovex/db import is only allowed in shared/server: ${rel}`,
      );
    }
  }
}

function assertPackagesDoNotImportApps() {
  const files = readDirectoryTree(packagesRoot).filter((file) =>
    sourceExtensions.has(extname(file)),
  );

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const specifier of getImportSpecifiers(content)) {
      if (
        specifier.startsWith("@/") ||
        specifier.startsWith("apps/") ||
        specifier.includes("/apps/")
      ) {
        failures.push(
          `Package code must not import app code in ${toRepoPath(file)}: ${specifier}`,
        );
      }
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
assertCanonicalOrigins();
assertPreServiceDirection();
if (failures.length === 0) {
  assertWorkspaceReadmes();
  assertNoVagueWorkspaceFiles();
  assertWorkspaceImportDirection();
  assertNoLegacyRootApp();
  assertWorkspaceMiddlewareConvention();
  assertAppTranspilePackages();
  assertNoControllerDbImports();
  assertPackagesDoNotImportApps();
}

if (failures.length > 0) {
  console.error("Repo guard failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Repo guard passed.");
