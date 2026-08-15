import { readFile } from "node:fs/promises";
import path from "node:path";

import { pathMatches } from "./impact.mjs";

const ruleDefinitions = {
  "capability-from-ua-or-width": {
    message: "Input capability is inferred from user agent or viewport width.",
    recovery: "Use pointer/hover media capabilities and react to media-query changes.",
    inspect(source) {
      if (!/(?:mobile|touch|pointer|hover)/i.test(source)) return [];
      return matchLines(source, /navigator\.userAgent|\binnerWidth\b|max-width\s*:/);
    },
  },
  "raw-viewport-height": {
    message: "A mobile-critical surface uses legacy vh units.",
    recovery: "Use dvh/svh and reserve the safe-area insets for constrained overlays.",
    inspect(source) {
      return matchLines(source, /\b(?:100|90|80|75|50)vh\b/);
    },
  },
  "hover-only-interaction": {
    message: "An interactive JSX element exposes a hover handler without an equivalent action.",
    recovery: "Add click, focus, pointer, or keyboard behavior, or document a scoped suppression.",
    inspect(source) {
      const findings = [];
      const openingTag = /<[A-Za-z][^<]*?\bonMouse(?:Enter|Leave)\s*=.*?(?<!=)>/gs;
      for (const match of source.matchAll(openingTag)) {
        if (/\bon(?:Click|Focus|Blur|PointerDown|PointerUp|KeyDown)\s*=/.test(match[0])) {
          continue;
        }
        const line = lineNumber(source, match.index ?? 0);
        if (!isSuppressed(source, line, "hover-only-interaction")) findings.push(line);
      }
      return findings;
    },
  },
  "responsive-component-fork": {
    message: "Separate desktop/mobile component implementations can drift behaviorally.",
    recovery: "Keep one component tree and adapt layout or capability behavior within it.",
    inspect(source) {
      return matchLines(source, /\b(?:Mobile|Desktop)(?:Version|View|Component)\b/);
    },
  },
  "fixed-without-safe-area": {
    message: "A fixed mobile surface has no explicit safe-area treatment.",
    recovery: "Use the shared safe-area inset variables on the relevant fixed edge.",
    inspect(source) {
      if (!/(?:className=.*\bfixed\b|position\s*:\s*["']fixed)/s.test(source)) return [];
      if (/(?:safe-area|safeAreaInset)/.test(source)) return [];
      return [lineNumber(source, source.search(/\bfixed\b/))];
    },
  },
  "shared-touch-target-contract": {
    message: "A touch-critical shared control does not reference the minimum target contract.",
    recovery: "Apply the shared coarse-pointer min target without changing fine-pointer density.",
    inspect(source) {
      return source.includes("--touch-target-min") ? [] : [1];
    },
  },
};

export function auditSourceFiles(files, rules) {
  const findings = [];
  for (const rule of rules) {
    const definition = ruleDefinitions[rule.id];
    if (!definition) {
      findings.push({
        file: "config/mobile-experience.json",
        line: 1,
        rule: rule.id,
        message: "Unknown mobile source-audit rule.",
        recovery: "Use a rule implemented by scripts/mobile/source-audit.mjs.",
      });
      continue;
    }
    for (const [file, source] of files) {
      if (!rule.files.some((pattern) => pathMatches(pattern, file))) continue;
      for (const line of definition.inspect(source)) {
        findings.push({
          file,
          line,
          rule: rule.id,
          message: definition.message,
          recovery: definition.recovery,
        });
      }
    }
  }
  return deduplicateFindings(findings);
}

export async function loadAuditedFiles(repositoryRoot, rules, repositoryFiles) {
  const selectedFiles = repositoryFiles.filter((file) =>
    rules.some((rule) => rule.files.some((pattern) => pathMatches(pattern, file))),
  );
  return new Map(
    await Promise.all(
      selectedFiles.map(async (file) => [
        file,
        await readFile(path.join(repositoryRoot, file), "utf8"),
      ]),
    ),
  );
}

function matchLines(source, expression) {
  const flags = expression.flags.includes("g") ? expression.flags : `${expression.flags}g`;
  const globalExpression = new RegExp(expression.source, flags);
  const lines = [];
  for (const match of source.matchAll(globalExpression)) {
    const line = lineNumber(source, match.index ?? 0);
    if (!isSuppressed(source, line, "all")) lines.push(line);
  }
  return lines;
}

function isSuppressed(source, line, rule) {
  const sourceLines = source.split(/\r?\n/);
  const nearby = sourceLines.slice(Math.max(0, line - 2), line).join("\n");
  const match = nearby.match(/mobile-audit-ignore\s+([\w-]+)\s+--\s+(.+)/);
  return Boolean(match && (match[1] === rule || match[1] === "all") && match[2].trim());
}

function lineNumber(source, index) {
  return source.slice(0, Math.max(0, index)).split(/\r?\n/).length;
}

function deduplicateFindings(findings) {
  const seen = new Set();
  return findings.filter((finding) => {
    const key = `${finding.file}:${finding.line}:${finding.rule}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
