import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import process from "node:process";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const tempRoot = path.join(repoRoot(), ".tmp", "lighthouse");
process.env.TMP = tempRoot;
process.env.TEMP = tempRoot;
process.env.TMPDIR = tempRoot;
const sharedEnv = {
  ...process.env,
  CI: process.env.CI ?? "1",
  NEXT_TELEMETRY_DISABLED: "1",
  TMP: tempRoot,
  TEMP: tempRoot,
};

const audits = [
  {
    label: "web",
    filter: "@qoovex/web",
    thresholds: {
      performance: 0.7,
      accessibility: 0.9,
      "best-practices": 0.9,
      seo: 0.9,
    },
  },
  {
    label: "sirio",
    filter: "@qoovex/sirio",
    thresholds: {
      performance: 0.7,
      accessibility: 0.9,
      "best-practices": 0.9,
      seo: 0.8,
    },
  },
];

function repoRoot() {
  return process.cwd();
}

function escapeWindowsArgument(argument) {
  if (/[\s"]/u.test(argument)) {
    return `"${argument.replace(/"/g, '\\"')}"`;
  }

  return argument;
}

function spawnPnpm(args, env) {
  if (process.platform === "win32") {
    const commandLine = [pnpmCommand, ...args]
      .map(escapeWindowsArgument)
      .join(" ");

    return spawn(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", commandLine], {
      stdio: "inherit",
      env,
    });
  }

  return spawn(pnpmCommand, args, {
    stdio: "inherit",
    env,
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureTempRoot() {
  fs.mkdirSync(tempRoot, { recursive: true });
}

function isIgnorableWindowsTempCleanupError(error) {
  return (
    process.platform === "win32" &&
    error instanceof Error &&
    error.message.includes("EPERM") &&
    error.message.includes("lighthouse.")
  );
}

function getFreePort(preferredPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.on("error", (error) => {
      reject(error);
    });

    server.listen(preferredPort, "127.0.0.1", () => {
      const address = server.address();
      const port =
        typeof address === "object" && address ? address.port : preferredPort;

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(port);
      });
    });
  });
}

async function waitForUrl(url, timeoutMs = 45000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // server not ready yet
    }

    await sleep(1000);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function startServer(filter, port) {
  const child = spawnPnpm(
    [
      "--filter",
      filter,
      "exec",
      "next",
      "start",
      "-p",
      String(port),
      "-H",
      "127.0.0.1",
    ],
    sharedEnv,
  );

  return child;
}

function stopServer(child) {
  if (!child || child.killed) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
    });
    return;
  }

  child.kill("SIGTERM");
}

async function auditOneApp(config) {
  const port = await getFreePort(0);
  const url = `http://127.0.0.1:${port}/`;

  console.log(`\n[lighthouse] Starting ${config.label} on port ${port}...`);
  const server = startServer(config.filter, port);

  try {
    await waitForUrl(url);

    const chrome = await launch({
      chromeFlags: ["--headless=new", "--no-sandbox", "--disable-dev-shm-usage"],
    });

    try {
      const result = await lighthouse(url, {
        port: chrome.port,
        output: "json",
        logLevel: "error",
        onlyCategories: [
          "performance",
          "accessibility",
          "best-practices",
          "seo",
        ],
      });

      const categories = result?.lhr?.categories ?? {};
      const failures = [];

      for (const [category, minimumScore] of Object.entries(config.thresholds)) {
        const score = categories[category]?.score ?? 0;
        console.log(
          `[lighthouse] ${config.label} ${category}: ${(score * 100).toFixed(0)} / ${(minimumScore * 100).toFixed(0)}`,
        );

        if (score < minimumScore) {
          failures.push(
            `${config.label} ${category} score ${(score * 100).toFixed(0)} is below ${(minimumScore * 100).toFixed(0)}`,
          );
        }
      }

      if (failures.length > 0) {
        throw new Error(failures.join(" | "));
      }
    } finally {
      try {
        await chrome.kill();
      } catch (error) {
        if (!isIgnorableWindowsTempCleanupError(error)) {
          throw error;
        }
      }
    }
  } finally {
    stopServer(server);
  }
}

async function main() {
  ensureTempRoot();

  for (const audit of audits) {
    await auditOneApp(audit);
  }

  console.log("\nLighthouse audits passed.");
}

main().catch((error) => {
  console.error(`\nLighthouse audits failed: ${error.message}`);
  process.exit(1);
});
