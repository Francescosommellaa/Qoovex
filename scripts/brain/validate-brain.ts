import fs from "node:fs";
import path from "node:path";

type BrainEntry = {
  id: string;
  title: string;
  file: string;
  tags: string[];
  keywords: string[];
  priority: number;
  maxChars: number;
};

type BrainSources = {
  vaultRoot: string;
  indexFile: string;
  generatedFrom: string[];
  entries: BrainEntry[];
};

const repoRoot = process.cwd();
const configPath = path.join(repoRoot, "scripts", "brain", "brain-sources.json");
const issues: string[] = [];
const WIKI_LINK_REGEX = /\[\[([^\]]+)\]\]/g;

function readConfig(): BrainSources {
  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = JSON.parse(raw) as BrainSources;
  const envVaultRoot = process.env.QOOVEX_BRAIN_ROOT;
  if (envVaultRoot && envVaultRoot.trim().length > 0) {
    parsed.vaultRoot = envVaultRoot;
  }
  return parsed;
}

function addIssue(message: string): void {
  issues.push(message);
}

function validateEntries(config: BrainSources): void {
  const ids = new Set<string>();

  for (const entry of config.entries) {
    if (!entry.id || !entry.title || !entry.file) {
      addIssue(`Invalid entry shape: ${JSON.stringify(entry)}`);
      continue;
    }

    if (ids.has(entry.id)) {
      addIssue(`Duplicate id: ${entry.id}`);
    }
    ids.add(entry.id);

    if (!Array.isArray(entry.tags) || entry.tags.length === 0) {
      addIssue(`Entry ${entry.id} has empty tags`);
    }

    if (!Array.isArray(entry.keywords) || entry.keywords.length === 0) {
      addIssue(`Entry ${entry.id} has empty keywords`);
    }

    const fullPath = path.join(config.vaultRoot, entry.file);
    if (!fs.existsSync(fullPath)) {
      addIssue(`Entry ${entry.id} points to missing file: ${fullPath}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, "utf8").trim();
    if (!content) {
      addIssue(`Entry ${entry.id} points to empty file: ${fullPath}`);
    }
  }
}

function validateSources(config: BrainSources): void {
  for (const sourceFile of config.generatedFrom) {
    if (!fs.existsSync(sourceFile)) {
      addIssue(`Missing generatedFrom source: ${sourceFile}`);
    }
  }
}

function validateIndexFile(config: BrainSources): void {
  const indexPath = path.join(config.vaultRoot, config.indexFile);
  if (!fs.existsSync(indexPath)) {
    addIssue(`Missing index file: ${indexPath}`);
    return;
  }

  const raw = fs.readFileSync(indexPath, "utf8");
  let parsed: { entries?: BrainEntry[] };
  try {
    parsed = JSON.parse(raw) as { entries?: BrainEntry[] };
  } catch (error) {
    addIssue(`Invalid JSON in index: ${indexPath} (${String(error)})`);
    return;
  }

  const indexEntries = parsed.entries ?? [];
  if (indexEntries.length !== config.entries.length) {
    addIssue(
      `Index entries count mismatch. index=${indexEntries.length}, config=${config.entries.length}`,
    );
  }
}

function walkMarkdownFiles(root: string): string[] {
  const files: string[] = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || !fs.existsSync(current)) continue;

    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      const base = path.basename(current);
      if (base === ".obsidian") continue;
      for (const entry of fs.readdirSync(current)) {
        stack.push(path.join(current, entry));
      }
      continue;
    }

    if (current.endsWith(".md")) {
      files.push(current);
    }
  }
  return files;
}

function normalizeWikiTarget(target: string): string {
  return target.split("|")[0].trim().replaceAll("\\", "/");
}

function validateWikiLinks(config: BrainSources): void {
  const markdownFiles = walkMarkdownFiles(config.vaultRoot);
  const knownTargets = new Set<string>();

  for (const file of markdownFiles) {
    const relative = path.relative(config.vaultRoot, file).replaceAll("\\", "/");
    const noExt = relative.replace(/\.md$/i, "");
    knownTargets.add(relative);
    knownTargets.add(noExt);
  }

  for (const file of markdownFiles) {
    const relative = path.relative(config.vaultRoot, file).replaceAll("\\", "/");
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(WIKI_LINK_REGEX)) {
      const target = normalizeWikiTarget(match[1]);
      if (!knownTargets.has(target)) {
        addIssue(`Missing wiki link target from ${relative}: [[${target}]]`);
      }
    }
  }
}

function validateTrackedMarkdownIndexed(config: BrainSources): void {
  const indexedFiles = new Set(config.entries.map((entry) => entry.file));
  const markdownFiles = walkMarkdownFiles(config.vaultRoot)
    .map((file) => path.relative(config.vaultRoot, file).replaceAll("\\", "/"))
    .filter((file) => /^(00_System|01_Architecture|02_Features|03_Components|04_Decisions|05_Bugs)\//.test(file))
    .filter((file) => !/(^|\/)(README|OVERVIEW)\.md$/i.test(file))
    .filter((file) => !/00_System\/frontmatter-schema\.md$/i.test(file));

  for (const file of markdownFiles) {
    if (!indexedFiles.has(file)) {
      addIssue(`Tracked markdown file not indexed in brain-sources entries: ${file}`);
    }
  }
}

function validateComponentReadNext(config: BrainSources): void {
  const componentDir = path.join(config.vaultRoot, "03_Components");
  if (!fs.existsSync(componentDir)) {
    addIssue("Missing components directory: 03_Components");
    return;
  }

  const componentFiles = fs
    .readdirSync(componentDir)
    .filter((name) => name.endsWith(".md"))
    .filter((name) => !["README.md", "OVERVIEW.md", "components-map.md"].includes(name));

  for (const fileName of componentFiles) {
    const fullPath = path.join(componentDir, fileName);
    const content = fs.readFileSync(fullPath, "utf8");
    if (!/^## ReadNext$/m.test(content)) {
      addIssue(`Missing ReadNext section in 03_Components/${fileName}`);
      continue;
    }

    const readNextBlock = content.split(/^## ReadNext$/m)[1] ?? "";
    const hasWikiLink = /\[\[[^\]]+\]\]/.test(readNextBlock);
    if (!hasWikiLink) {
      addIssue(`ReadNext section has no wiki links in 03_Components/${fileName}`);
    }
  }
}

function main(): void {
  const config = readConfig();
  validateSources(config);
  validateEntries(config);
  validateIndexFile(config);
  validateWikiLinks(config);
  validateTrackedMarkdownIndexed(config);
  validateComponentReadNext(config);

  if (issues.length > 0) {
    console.error("Brain validation failed:\n");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    process.exit(1);
  }

  console.log("Brain validation passed.");
}

main();
