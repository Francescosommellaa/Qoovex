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

function readConfig(): BrainSources {
  const raw = fs.readFileSync(configPath, "utf8");
  const parsed = JSON.parse(raw) as BrainSources;
  const envVaultRoot = process.env.QOOVEX_BRAIN_ROOT;
  if (envVaultRoot && envVaultRoot.trim().length > 0) {
    parsed.vaultRoot = envVaultRoot;
  }
  return parsed;
}

function assertFilesExist(config: BrainSources): void {
  const missingFiles: string[] = [];

  for (const file of config.generatedFrom) {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
    }
  }

  for (const entry of config.entries) {
    const fullPath = path.join(config.vaultRoot, entry.file);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(fullPath);
    }
  }

  if (missingFiles.length > 0) {
    throw new Error(`Missing source files:\n- ${missingFiles.join("\n- ")}`);
  }
}

function writeIndex(config: BrainSources): void {
  const targetPath = path.join(config.vaultRoot, config.indexFile);
  const stableEntries = [...config.entries].sort((a, b) => a.id.localeCompare(b.id));

  const payload = {
    version: 2,
    generatedAt: new Date().toISOString(),
    generatedFrom: config.generatedFrom,
    entries: stableEntries,
  };

  fs.writeFileSync(targetPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Synced Brain index: ${targetPath}`);
}

function main(): void {
  const config = readConfig();
  assertFilesExist(config);
  writeIndex(config);
}

main();
