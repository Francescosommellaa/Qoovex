import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const REQUIRED_PAYLOAD_FILES = Object.freeze([
  "SKILL.md",
  "agents/openai.yaml",
  "scripts/context.mjs",
  "scripts/doctor.mjs",
  "scripts/hook-admin.mjs",
  "scripts/hook-lib.mjs",
  "scripts/hook.mjs",
  "scripts/detector/detect-antipatterns.mjs",
]);

function listFiles(root, current = root, output = []) {
  const entries = fs.readdirSync(current, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name, "en"));

  for (const entry of entries) {
    const absolute = path.join(current, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`Unexpected symlink in Impeccable payload: ${absolute}`);
    }
    if (entry.isDirectory()) {
      listFiles(root, absolute, output);
      continue;
    }
    if (!entry.isFile()) {
      throw new Error(`Unexpected filesystem entry in Impeccable payload: ${absolute}`);
    }
    output.push(path.relative(root, absolute).split(path.sep).join("/"));
  }

  return output;
}

export function hashPayload(root) {
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return null;

  const hash = createHash("sha256");
  const files = listFiles(root);
  for (const relative of files) {
    const content = fs.readFileSync(path.join(root, ...relative.split("/")));
    hash.update(relative, "utf8");
    hash.update("\0", "utf8");
    hash.update(String(content.byteLength), "utf8");
    hash.update("\0", "utf8");
    hash.update(content);
    hash.update("\0", "utf8");
  }

  return { sha256: hash.digest("hex"), files };
}

export function readSkillVersion(root) {
  const skillPath = path.join(root, "SKILL.md");
  if (!fs.existsSync(skillPath)) return null;
  const source = fs.readFileSync(skillPath, "utf8");
  const frontmatter = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  const version = frontmatter?.[1].match(/^version:\s*["']?([^"'\s]+)["']?\s*$/m);
  return version?.[1] ?? null;
}

export function inspectPayload(root, expected) {
  const missing = REQUIRED_PAYLOAD_FILES.filter((relative) => {
    return !fs.existsSync(path.join(root, ...relative.split("/")));
  });
  const version = readSkillVersion(root);
  const digest = hashPayload(root);

  return {
    exists: Boolean(digest),
    version,
    fileCount: digest?.files.length ?? 0,
    sha256: digest?.sha256 ?? null,
    missing,
    valid: Boolean(
      digest
      && version === expected.version
      && digest.sha256 === expected.payloadSha256
      && missing.length === 0
    ),
  };
}

