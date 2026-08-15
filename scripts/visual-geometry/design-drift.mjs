import path from "node:path";

const ARBITRARY_GEOMETRY_PROPERTIES = new Set([
  "bottom",
  "gap",
  "h",
  "inset",
  "left",
  "m",
  "mb",
  "ml",
  "mr",
  "mt",
  "mx",
  "my",
  "max-h",
  "max-w",
  "min-h",
  "min-w",
  "p",
  "pb",
  "pl",
  "pr",
  "pt",
  "px",
  "py",
  "right",
  "rounded",
  "space-x",
  "space-y",
  "top",
  "translate-x",
  "translate-y",
  "w",
]);
const COLOR_PROPERTY = /^(?:bg|border|decoration|fill|from|outline|ring|shadow|stroke|text|to|via)$/;
const INLINE_GEOMETRY = /\b(width|height|minWidth|minHeight|maxWidth|maxHeight|margin|marginTop|marginRight|marginBottom|marginLeft|padding|paddingTop|paddingRight|paddingBottom|paddingLeft|gap|top|right|bottom|left|borderRadius|transform)\s*:\s*(["']?[^,}\s]+["']?)/g;
const ARBITRARY_TAILWIND = /\b([a-z][a-z0-9-]*)-\[([^\]]+)\]/g;
const PIXEL_LITERAL = /-?\d+(?:\.\d+)?px/g;

function normalized(file) {
  return file.replaceAll("\\", "/");
}

function isSharedVisualFile(file) {
  return normalized(file).startsWith("packages/ui/") || [".css", ".scss", ".sass", ".less"].includes(path.extname(file));
}

function validateExemptions(exemptions) {
  for (const exemption of exemptions) {
    if (!exemption.file?.trim() || !exemption.property?.trim() || !exemption.value?.trim() || !exemption.reason?.trim()) {
      throw new Error("design drift exemptions require file, property, value, and reason");
    }
  }
}

function isExempt(exemptions, finding) {
  return exemptions.some(
    (exemption) =>
      normalized(exemption.file) === normalized(finding.file) &&
      exemption.property === finding.property &&
      exemption.value === finding.value,
  );
}

function addedLines(diff) {
  return diff
    .split(/\r?\n/)
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .map((line) => line.slice(1));
}

export function findDesignDrift({ files = [], exemptions = [] }) {
  validateExemptions(exemptions);
  const findings = [];

  for (const entry of files) {
    if (!isSharedVisualFile(entry.file)) continue;
    const lines = addedLines(entry.diff);
    const literalCounts = new Map();

    lines.forEach((line, index) => {
      for (const match of line.matchAll(ARBITRARY_TAILWIND)) {
        const [, property, value] = match;
        if (!ARBITRARY_GEOMETRY_PROPERTIES.has(property) && !COLOR_PROPERTY.test(property)) continue;
        findings.push({
          kind: "arbitrary-tailwind",
          file: normalized(entry.file),
          line: index + 1,
          property,
          value,
        });
      }

      for (const match of line.matchAll(INLINE_GEOMETRY)) {
        findings.push({
          kind: "inline-geometry",
          file: normalized(entry.file),
          line: index + 1,
          property: match[1],
          value: match[2].replace(/^["']|["']$/g, ""),
        });
      }

      for (const value of line.match(PIXEL_LITERAL) ?? []) {
        literalCounts.set(value, (literalCounts.get(value) ?? 0) + 1);
      }
    });

    for (const [value, count] of literalCounts) {
      if (count < 2) continue;
      findings.push({
        kind: "repeated-literal",
        file: normalized(entry.file),
        property: "pixel-literal",
        value,
        occurrences: count,
      });
    }
  }

  return findings.filter((finding) => !isExempt(exemptions, finding));
}

