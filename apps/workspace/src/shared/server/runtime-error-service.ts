import "server-only";

import crypto from "crypto";
import { db } from "@qoovex/db";

const MAX_MESSAGE_LENGTH = 500;
const MAX_STACK_LENGTH = 4_000;

const REDACTIONS: Array<[RegExp, string]> = [
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]"],
  [/\bBearer\s+[A-Za-z0-9._~-]+/gi, "Bearer [redacted]"],
  [/(password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]"],
  [/postgres(?:ql)?:\/\/[^\s]+/gi, "postgresql://[redacted]"],
  [/https?:\/\/[^\s]*?(?:blob|vercel-storage)[^\s]*/gi, "[blob-url]"],
  [/\b[A-Za-z0-9_-]{32,}\b/g, "[opaque-value]"],
];

function redact(value: string) {
  return REDACTIONS.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), value);
}

export function sanitizeRuntimeErrorText(value: string | null | undefined, maxLength: number) {
  if (!value) return null;
  return redact(value).slice(0, maxLength);
}

function normalizeForFingerprint(value: string) {
  return value
    .replace(/\b\d+\b/g, "#")
    .replace(/\b[0-9a-f]{8,}\b/gi, "[id]")
    .replace(/\s+/g, " ")
    .trim();
}

export function createRuntimeErrorFingerprint(input: {
  digest?: string | null;
  errorName: string;
  message: string;
  routePath?: string | null;
  stackPreview?: string | null;
}) {
  if (input.digest) return crypto.createHash("sha256").update(`digest:${input.digest}`).digest("hex");
  const topFrame = input.stackPreview?.split("\n").find((line) => line.trim().startsWith("at ")) ?? "";
  return crypto
    .createHash("sha256")
    .update([input.errorName, normalizeForFingerprint(input.message), input.routePath ?? "", topFrame].join("|"))
    .digest("hex");
}

function cleanRoutePath(value: string | null | undefined) {
  const path = value?.split("?", 1)[0]?.trim();
  return sanitizeRuntimeErrorText(path, 500);
}

export async function recordRuntimeError(input: {
  error: unknown;
  source: string;
  routePath?: string | null;
  requestMethod?: string | null;
  digest?: string | null;
  requestId?: string | null;
}) {
  const error = input.error instanceof Error ? input.error : new Error("Unknown runtime error");
  const message = sanitizeRuntimeErrorText(error.message || "Errore runtime", MAX_MESSAGE_LENGTH) ?? "Errore runtime";
  const stackPreview = sanitizeRuntimeErrorText(error.stack, MAX_STACK_LENGTH);
  const routePath = cleanRoutePath(input.routePath);
  const digest = sanitizeRuntimeErrorText(input.digest, 255);
  const fingerprint = createRuntimeErrorFingerprint({
    digest,
    errorName: error.name || "Error",
    message,
    routePath,
    stackPreview,
  });
  const now = new Date();

  await db.runtimeErrorEvent.upsert({
    where: { fingerprint },
    create: {
      fingerprint,
      source: sanitizeRuntimeErrorText(input.source, 80) ?? "server",
      routePath,
      requestMethod: sanitizeRuntimeErrorText(input.requestMethod?.toUpperCase(), 12),
      errorName: sanitizeRuntimeErrorText(error.name || "Error", 120) ?? "Error",
      message,
      stackPreview,
      digest,
      lastRequestId: sanitizeRuntimeErrorText(input.requestId, 255),
      firstSeenAt: now,
      lastSeenAt: now,
    },
    update: {
      status: "OPEN",
      source: sanitizeRuntimeErrorText(input.source, 80) ?? "server",
      routePath,
      requestMethod: sanitizeRuntimeErrorText(input.requestMethod?.toUpperCase(), 12),
      errorName: sanitizeRuntimeErrorText(error.name || "Error", 120) ?? "Error",
      message,
      stackPreview,
      digest,
      lastRequestId: sanitizeRuntimeErrorText(input.requestId, 255),
      occurrenceCount: { increment: 1 },
      lastSeenAt: now,
      resolvedAt: null,
      resolvedById: null,
      resolutionNote: null,
    },
    select: { id: true },
  });
}

export async function recordRuntimeErrorBestEffort(input: Parameters<typeof recordRuntimeError>[0]) {
  try {
    await recordRuntimeError(input);
  } catch {
    // The internal registry cannot report its own database/storage outage.
  }
}
