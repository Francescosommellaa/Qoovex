import { spawn } from "node:child_process";
import process from "node:process";

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const sharedEnv = {
  ...process.env,
  CI: process.env.CI ?? "1",
  NEXT_TELEMETRY_DISABLED: "1",
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://postgres:postgres@127.0.0.1:5432/qoovex",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "pk_test_qoovex_dummy",
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY ?? "sk_test_qoovex_dummy",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL ?? "/dashboard",
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
    process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL ?? "/dashboard",
};

const builds = [
  { label: "web", filter: "@qoovex/web" },
  { label: "sirio", filter: "@qoovex/sirio" },
  { label: "workspace", filter: "@qoovex/workspace" },
];

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

function runCommand(label, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawnPnpm(args, env);

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${label} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

async function main() {
  for (const build of builds) {
    console.log(`\n[build-check] Building ${build.label}...`);
    await runCommand(
      build.label,
      ["--filter", build.filter, "build"],
      sharedEnv,
    );
  }

  console.log("\nBuild checks passed.");
}

main().catch((error) => {
  console.error(`\nBuild checks failed: ${error.message}`);
  process.exit(1);
});
