import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function parseEnv(raw) {
  return Object.fromEntries(
    raw.split(/\r?\n/)
      .map((line) => line.match(/^([A-Z][A-Z0-9_]*)=(.*)$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2].trim().replace(/^(["'])(.*)\1$/, "$2")]),
  );
}

const local = parseEnv(await readFile(resolve("packages/db/.env"), "utf8"));
const databaseUrl = new URL(local.DATABASE_URL);
if (databaseUrl.hostname !== "localhost" || databaseUrl.port !== "51225") {
  throw new Error("Workspace smoke requires the canonical local database target.");
}

const smokeEnv = {
  ...process.env,
  DATABASE_URL: local.DATABASE_URL,
  QOOVEX_DATABASE_ENVIRONMENT: "local",
  VERCEL_ENV: "development",
  AUTH_URL: "http://127.0.0.1:3101",
  AUTH_SECRET: "local-smoke-auth-secret-at-least-32-characters",
  QOOVEX_AUTH_CODE_SECRET: "local-smoke-auth-code-secret-at-least-32",
  QOOVEX_PASSWORD_PEPPER: "local-smoke-password-pepper-at-least-32",
  QOOVEX_AUDIT_SECRET: "local-smoke-audit-secret-at-least-32",
  QOOVEX_MFA_ENCRYPTION_KEY: "local-smoke-mfa-encryption-key-at-least-32",
  QOOVEX_MFA_COOKIE_SECRET: "local-smoke-mfa-cookie-secret-at-least-32",
  CRON_SECRET: "local-smoke-cron-secret-at-least-32",
};

const server = spawn(
  process.execPath,
  [resolve("apps/workspace/node_modules/next/dist/bin/next"), "start", "-p", "3101"],
  { cwd: resolve("apps/workspace"), env: smokeEnv, stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
);
let diagnostics = "";
for (const stream of [server.stdout, server.stderr]) {
  stream.on("data", (chunk) => {
    diagnostics += chunk.toString();
    if (diagnostics.length > 8_000) diagnostics = diagnostics.slice(-8_000);
  });
}

const redact = (value) => value
  .replace(/(?:prisma\+)?postgres(?:ql)?:\/\/\S+/giu, "[REDACTED_DATABASE_URL]")
  .replace(/api_key=\S+/giu, "api_key=[REDACTED]");
const delay = (milliseconds) => new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));

try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    await delay(500);
    try {
      const response = await fetch("http://127.0.0.1:3101/sign-in", { redirect: "manual" });
      if (response.status === 200) {
        ready = true;
        break;
      }
    } catch {}
  }
  if (!ready) throw new Error(`Workspace smoke server did not become ready. ${redact(diagnostics)}`);

  const checks = [
    { path: "/sign-in", expected: 200 },
    { path: "/contexts", expected: 307 },
    { path: "/client", expected: 307 },
    { path: "/workers", expected: 307 },
    { path: "/api/contexts", expected: 401 },
    { path: "/api/client/job-sites", expected: 401 },
    { path: "/api/does-not-exist", expected: 404 },
    { path: "/api/data/jobs/run", expected: 404 },
    { path: "/api/internal/vnext/processes/run", expected: 404, method: "POST" },
  ];
  for (const { path, expected, method = "GET" } of checks) {
    const response = await fetch(`http://127.0.0.1:3101${path}`, { redirect: "manual", method });
    if (response.status !== expected) {
      throw new Error(`${path}: expected ${expected}, received ${response.status}. ${redact(diagnostics)}`);
    }
    if (expected === 307) {
      const location = response.headers.get("location") ?? "";
      if (!location.includes("/sign-in?callbackUrl=%2F")) {
        throw new Error(`${path}: missing sanitized sign-in callback.`);
      }
    }
    console.log(`${path} -> ${response.status}`);
  }
} finally {
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolveExit) => server.once("exit", resolveExit)),
    delay(5_000).then(() => server.kill("SIGKILL")),
  ]);
}
