import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const generatedDirNames = new Set([
  "node_modules",
  ".git",
  ".next",
  ".turbo",
  ".vercel",
  "dist",
  "build",
  "out",
  "coverage",
]);
const readmeRoots = ["apps", "packages", "docs", "scripts", ".github", ".cursor"];
const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx"]);
const designScanExtensions = new Set([".css", ".ts", ".tsx", ".jsx"]);
const jsxExtensions = new Set([".jsx", ".tsx"]);
const workspaceLayerRank = {
  shared: 0,
  entities: 1,
  features: 2,
  widgets: 3,
  views: 4,
  app: 5,
};
const forbiddenImportPatterns = [
  /from\s+["']lucide-react["']/,
  /from\s+["']react-icons(?:\/|["'])/,
  /from\s+["']@heroicons\//,
  /from\s+["']heroicons["']/,
  /from\s+["']feather-icons["']/,
];
const uiReadmeHeadings = [
  "## Cosa",
  "## Come",
  "## Props",
  "## Token",
  "## Regole",
  "## Esempi",
];
const appArchitectureDocSections = [
  "## MVC Mapping",
  "## Service Interfaces",
  "## Repository Boundaries",
  "## DTO Contracts",
  "## SOLID Rules",
  "## OWASP And Security",
  "## Navigation",
];
const visualRawValuePatterns = [
  {
    label: "raw color literal",
    pattern: /#[0-9A-Fa-f]{3,8}\b|(?:rgb|rgba|hsl|hsla|oklch|lch|lab)\(/,
  },
  {
    label: "raw visual unit",
    pattern: /\b\d+(?:\.\d+)?(?:px|rem|em|ch|vw|vh|vmin|vmax|ms|s)\b/,
  },
  {
    label: "Tailwind arbitrary visual value",
    pattern: /\[[^\]]*(?:#[0-9A-Fa-f]{3,8}|(?:rgb|rgba|hsl|hsla|oklch|lch|lab)\(|\b\d+(?:\.\d+)?(?:px|rem|em|ch|vw|vh|vmin|vmax)\b)[^\]]*\]/,
  },
  {
    label: "Tailwind free spacing/radius/text utility",
    pattern:
      /(?:^|\s)(?:p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|space-x|space-y|rounded|text|bg|border)-(?:\d|\[|[#])/,
  },
];
const appDirectVisualTagPattern = /<(?:div|p|span|h[1-6])\b/;

const issues = [];

function addIssue(message) {
  issues.push(message);
}

function isGeneratedDir(name) {
  return generatedDirNames.has(name);
}

function walkDirectory(dirPath, visitor) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (isGeneratedDir(entry.name)) continue;

    const fullPath = path.join(dirPath, entry.name);
    visitor(fullPath, entry);

    if (entry.isDirectory()) {
      walkDirectory(fullPath, visitor);
    }
  }
}

function collectFiles(rootPath) {
  const files = [];

  if (!fs.existsSync(rootPath)) {
    return files;
  }

  walkDirectory(rootPath, (fullPath, entry) => {
    if (entry.isFile()) {
      files.push(fullPath);
    }
  });

  return files;
}

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function isUiTokenOrThemeSource(relativePath) {
  return (
    relativePath === "packages/ui/styles/tokens.css" ||
    relativePath === "packages/ui/styles/base.css" ||
    relativePath.startsWith("packages/ui/styles/tokens/") ||
    relativePath.startsWith("packages/ui/styles/themes/") ||
    relativePath.startsWith("packages/ui/config/")
  );
}

function isDocumentationFile(relativePath) {
  return /\.(?:md|mdx)$/i.test(relativePath);
}

function isDocumentedEmailTemplate(relativePath) {
  return relativePath === "apps/workspace/src/shared/server/clerk-email-delivery.ts";
}

function shouldSkipDesignValueScan(relativePath) {
  return (
    isDocumentationFile(relativePath) ||
    isUiTokenOrThemeSource(relativePath) ||
    isDocumentedEmailTemplate(relativePath)
  );
}

function ensureReadmes() {
  for (const relativeRoot of readmeRoots) {
    const absoluteRoot = path.join(repoRoot, relativeRoot);
    if (!fs.existsSync(absoluteRoot)) continue;

    if (!fs.existsSync(path.join(absoluteRoot, "README.md"))) {
      addIssue(`Missing README.md in ${relativeRoot}`);
    }

    walkDirectory(absoluteRoot, (fullPath, entry) => {
      if (!entry.isDirectory()) return;

      const readmePath = path.join(fullPath, "README.md");
      if (!fs.existsSync(readmePath)) {
        addIssue(`Missing README.md in ${path.relative(repoRoot, fullPath)}`);
      }
    });
  }
}

function checkForbiddenIconsAndSvg() {
  const sourceRoots = ["apps", "packages", "scripts"];

  for (const relativeRoot of sourceRoots) {
    const absoluteRoot = path.join(repoRoot, relativeRoot);
    if (!fs.existsSync(absoluteRoot)) continue;

    for (const filePath of collectFiles(absoluteRoot)) {
      const extension = path.extname(filePath);
      if (!sourceExtensions.has(extension)) continue;

      const source = fs.readFileSync(filePath, "utf8");
      const relativePath = path.relative(repoRoot, filePath);

      for (const pattern of forbiddenImportPatterns) {
        if (pattern.test(source)) {
          addIssue(`Forbidden icon library import in ${relativePath}`);
        }
      }

      if (jsxExtensions.has(extension) && /<svg[\s>]/.test(source)) {
        addIssue(`Inline <svg> is forbidden in source files: ${relativePath}`);
      }

      if (jsxExtensions.has(extension) && /\bstrokeWidth\s*[:=]/.test(source)) {
        addIssue(`strokeWidth is forbidden with Phosphor icons: ${relativePath}`);
      }
    }
  }
}

function extractImports(source) {
  const imports = [];
  const regex =
    /(?:import|export)\s+(?:type\s+)?(?:[^"'`]+?\s+from\s+)?["']([^"']+)["']|import\(["']([^"']+)["']\)/g;

  let match;
  while ((match = regex.exec(source)) !== null) {
    imports.push(match[1] ?? match[2]);
  }

  return imports;
}

function checkPackagesDoNotImportApps() {
  const packagesRoot = path.join(repoRoot, "packages");
  if (!fs.existsSync(packagesRoot)) return;

  for (const filePath of collectFiles(packagesRoot)) {
    const extension = path.extname(filePath);
    if (!sourceExtensions.has(extension)) continue;

    const source = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(repoRoot, filePath);
    const imports = extractImports(source);

    for (const specifier of imports) {
      if (
        specifier.startsWith("@shared/") ||
        specifier.startsWith("@entities/") ||
        specifier.startsWith("@features/") ||
        specifier.startsWith("@widgets/") ||
        specifier.startsWith("@views/")
      ) {
        addIssue(`Package file imports app-layer alias in ${relativePath}: ${specifier}`);
      }

      if (specifier.includes("/apps/") || specifier.startsWith("apps/")) {
        addIssue(`Package file imports app code in ${relativePath}: ${specifier}`);
      }
    }
  }
}

function parseTranspilePackages(nextConfigPath) {
  const source = fs.readFileSync(nextConfigPath, "utf8");
  const match = source.match(/transpilePackages\s*:\s*\[([\s\S]*?)\]/);
  if (!match) return [];

  return [...match[1].matchAll(/["']([^"']+)["']/g)].map((entry) => entry[1]);
}

function checkAppTranspilePackages() {
  const appsRoot = path.join(repoRoot, "apps");
  if (!fs.existsSync(appsRoot)) return;

  for (const appName of fs.readdirSync(appsRoot)) {
    const appRoot = path.join(appsRoot, appName);
    if (!fs.statSync(appRoot).isDirectory()) continue;

    const nextConfigPath = path.join(appRoot, "next.config.ts");
    if (!fs.existsSync(nextConfigPath)) continue;

    const transpilePackages = new Set(parseTranspilePackages(nextConfigPath));
    const importedPackages = new Set();

    for (const filePath of collectFiles(appRoot)) {
      const extension = path.extname(filePath);
      if (!sourceExtensions.has(extension)) continue;

      const source = fs.readFileSync(filePath, "utf8");
      for (const specifier of extractImports(source)) {
        const match = specifier.match(/^@qoovex\/([^/'"]+)/);
        if (match) {
          importedPackages.add(`@qoovex/${match[1]}`);
        }
      }
    }

    for (const importedPackage of importedPackages) {
      if (!transpilePackages.has(importedPackage)) {
        addIssue(
          `Missing ${importedPackage} in ${path.relative(repoRoot, nextConfigPath)} transpilePackages`,
        );
      }
    }
  }
}

function checkWorkspaceImportDirection() {
  const workspaceSrcRoot = path.join(repoRoot, "apps", "workspace", "src");
  if (!fs.existsSync(workspaceSrcRoot)) return;

  for (const filePath of collectFiles(workspaceSrcRoot)) {
    const extension = path.extname(filePath);
    if (!sourceExtensions.has(extension)) continue;

    const relativeToSrc = path.relative(workspaceSrcRoot, filePath);
    const [layer] = relativeToSrc.split(path.sep);
    if (!(layer in workspaceLayerRank)) continue;

    const source = fs.readFileSync(filePath, "utf8");
    const relativePath = path.relative(repoRoot, filePath);

    for (const specifier of extractImports(source)) {
      const aliasMatch = specifier.match(/^@(shared|entities|features|widgets|views)\//);
      if (!aliasMatch) continue;

      const importedLayer = aliasMatch[1];
      const sourceRank = workspaceLayerRank[layer];
      const importedRank = workspaceLayerRank[importedLayer];

      if (importedRank > sourceRank) {
        addIssue(
          `Illegal upward FSD import in ${relativePath}: ${layer} cannot import ${specifier}`,
        );
      }
    }
  }
}

function packageUsesReactHooks(packageSrcRoot) {
  for (const filePath of collectFiles(packageSrcRoot)) {
    const extension = path.extname(filePath);
    if (!sourceExtensions.has(extension)) continue;

    const source = fs.readFileSync(filePath, "utf8");
    if (
      /\buseState\(/.test(source) ||
      /\buseEffect\(/.test(source) ||
      /\buseRef\(/.test(source) ||
      /\buseReducer\(/.test(source) ||
      /\buseMemo\(/.test(source) ||
      /\buseCallback\(/.test(source) ||
      /React\.use[A-Z]/.test(source)
    ) {
      return true;
    }
  }

  return false;
}

function checkPackageHookRules() {
  const packagesRoot = path.join(repoRoot, "packages");
  if (!fs.existsSync(packagesRoot)) return;

  for (const packageName of fs.readdirSync(packagesRoot)) {
    const packageRoot = path.join(packagesRoot, packageName);
    if (!fs.statSync(packageRoot).isDirectory()) continue;

    const srcRoot = path.join(packageRoot, "src");
    const tsconfigPath = path.join(packageRoot, "tsconfig.json");
    const packageJsonPath = path.join(packageRoot, "package.json");

    if (!fs.existsSync(srcRoot) || !fs.existsSync(tsconfigPath) || !fs.existsSync(packageJsonPath)) {
      continue;
    }

    if (!packageUsesReactHooks(srcRoot)) continue;

    const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const compilerOptions = tsconfig.compilerOptions ?? {};
    const lib = (compilerOptions.lib ?? []).map((entry) =>
      String(entry).toLowerCase(),
    );
    const packageRelative = path.relative(repoRoot, packageRoot);
    const peerDependencies = packageJson.peerDependencies ?? {};
    const devDependencies = packageJson.devDependencies ?? {};

    for (const requiredLib of ["dom", "dom.iterable", "esnext"]) {
      if (!lib.includes(requiredLib)) {
        addIssue(`${packageRelative} tsconfig.json is missing compilerOptions.lib entry: ${requiredLib}`);
      }
    }

    if (compilerOptions.jsx !== "react-jsx") {
      addIssue(`${packageRelative} tsconfig.json must set compilerOptions.jsx to react-jsx`);
    }

    if (!peerDependencies.react) {
      addIssue(`${packageRelative} package.json must declare react as peerDependency`);
    }

    if (!devDependencies.react) {
      addIssue(`${packageRelative} package.json must declare react as devDependency`);
    }
  }
}

function checkUiComponentStructure() {
  const componentsRoot = path.join(repoRoot, "packages", "ui", "src", "components");
  if (!fs.existsSync(componentsRoot)) return;

  for (const entry of fs.readdirSync(componentsRoot, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (entry.name === "index.ts" || entry.name === "README.md") continue;
    addIssue(
      `UI component implementation must live in a component folder, not components root: ${path.relative(
        repoRoot,
        path.join(componentsRoot, entry.name),
      )}`,
    );
  }

  for (const entry of fs.readdirSync(componentsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const componentName = entry.name;
    const componentRoot = path.join(componentsRoot, componentName);
    const requiredFiles = [
      `${componentName}.tsx`,
      `${componentName}.types.ts`,
      `${componentName}.variants.ts`,
      "index.ts",
      "README.md",
    ];

    for (const requiredFile of requiredFiles) {
      const requiredPath = path.join(componentRoot, requiredFile);
      if (!fs.existsSync(requiredPath)) {
        addIssue(
          `UI component ${componentName} is missing ${path.relative(repoRoot, requiredPath)}`,
        );
      }
    }

    const implementationPath = path.join(componentRoot, `${componentName}.tsx`);
    if (fs.existsSync(implementationPath)) {
      const source = fs.readFileSync(implementationPath, "utf8");
      if (/export\s+\*\s+from\s+["']\.\.\//.test(source)) {
        addIssue(
          `UI component ${componentName} must contain its implementation, not re-export a legacy flat file`,
        );
      }
    }
  }
}

function checkUiReadmeTemplates() {
  const roots = [
    path.join(repoRoot, "packages", "ui", "src", "components"),
    path.join(repoRoot, "packages", "ui", "src", "primitives"),
    path.join(repoRoot, "packages", "ui", "src", "patterns"),
  ];

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;

    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;

      const readmePath = path.join(root, entry.name, "README.md");
      if (!fs.existsSync(readmePath)) continue;

      const source = fs.readFileSync(readmePath, "utf8");
      for (const heading of uiReadmeHeadings) {
        if (!source.includes(heading)) {
          addIssue(
            `README template section "${heading}" missing in ${path.relative(repoRoot, readmePath)}`,
          );
        }
      }
    }
  }
}

function checkAppDesignSystemRules() {
  const appRoots = ["apps/web/src", "apps/sirio/src", "apps/workspace/src"];

  for (const relativeRoot of appRoots) {
    const absoluteRoot = path.join(repoRoot, relativeRoot);
    if (!fs.existsSync(absoluteRoot)) continue;

    for (const filePath of collectFiles(absoluteRoot)) {
      const extension = path.extname(filePath);
      if (!designScanExtensions.has(extension)) continue;

      const relativePath = toRepoPath(filePath);
      if (shouldSkipDesignValueScan(relativePath)) continue;

      const source = fs.readFileSync(filePath, "utf8");

      if (jsxExtensions.has(extension) && /style\s*=\s*\{\{/.test(source)) {
        addIssue(`Inline style object is forbidden outside UI tokens: ${relativePath}`);
      }

      if (
        jsxExtensions.has(extension) &&
        relativePath.includes("/src/app/") &&
        appDirectVisualTagPattern.test(source)
      ) {
        addIssue(
          `App Router files must use @qoovex/ui primitives instead of div/p/span/h*: ${relativePath}`,
        );
      }

      for (const { label, pattern } of visualRawValuePatterns) {
        if (pattern.test(source)) {
          addIssue(`Forbidden ${label} outside token source in ${relativePath}`);
        }
      }
    }
  }
}

function checkAppArchitectureDocs() {
  const appsRoot = path.join(repoRoot, "apps");
  if (!fs.existsSync(appsRoot)) return;

  for (const entry of fs.readdirSync(appsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const appName = entry.name;
    const appRoot = path.join(appsRoot, appName);
    const packageJsonPath = path.join(appRoot, "package.json");

    if (!fs.existsSync(packageJsonPath)) continue;

    const designDocPath = path.join(appRoot, "docs", "design.md");

    if (!fs.existsSync(designDocPath)) {
      addIssue(`Missing Clean MVC architecture doc: apps/${appName}/docs/design.md`);
      continue;
    }

    const source = fs.readFileSync(designDocPath, "utf8");

    for (const section of appArchitectureDocSections) {
      if (!source.includes(section)) {
        addIssue(
          `Architecture doc section "${section}" missing in apps/${appName}/docs/design.md`,
        );
      }
    }

    for (const requiredTerm of ["Controller", "Service", "Repository", "DTO", "SOLID"]) {
      if (!source.includes(requiredTerm)) {
        addIssue(
          `Architecture doc apps/${appName}/docs/design.md must mention ${requiredTerm}`,
        );
      }
    }
  }
}

function checkWorkspaceDbImportBoundary() {
  const workspaceSrcRoot = path.join(repoRoot, "apps", "workspace", "src");
  if (!fs.existsSync(workspaceSrcRoot)) return;

  const repositoriesRoot = "apps/workspace/src/shared/server/repositories/";

  for (const filePath of collectFiles(workspaceSrcRoot)) {
    const extension = path.extname(filePath);
    if (!sourceExtensions.has(extension)) continue;

    const relativePath = toRepoPath(filePath);
    const source = fs.readFileSync(filePath, "utf8");
    const importsDb = extractImports(source).includes("@qoovex/db");

    if (!importsDb) continue;

    if (!relativePath.startsWith(repositoriesRoot)) {
      addIssue(
        `Workspace can import @qoovex/db only from shared/server/repositories: ${relativePath}`,
      );
    }

    if (!source.includes('import "server-only"')) {
      addIssue(
        `Workspace repository importing @qoovex/db must import "server-only": ${relativePath}`,
      );
    }
  }
}

function main() {
  ensureReadmes();
  checkForbiddenIconsAndSvg();
  checkPackagesDoNotImportApps();
  checkAppTranspilePackages();
  checkWorkspaceImportDirection();
  checkPackageHookRules();
  checkUiComponentStructure();
  checkUiReadmeTemplates();
  checkAppDesignSystemRules();
  checkAppArchitectureDocs();
  checkWorkspaceDbImportBoundary();

  if (issues.length > 0) {
    console.error("\nRepo guard found rule violations:\n");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    console.error(`\nTotal violations: ${issues.length}`);
    process.exit(1);
  }

  console.log("Repo guard passed.");
}

main();
