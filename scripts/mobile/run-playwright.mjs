import { spawnSync } from "node:child_process";

const pnpmCli = process.env.npm_execpath;
if (!pnpmCli) throw new Error("Run the mobile browser gate through pnpm mobile:test.");
const result = spawnSync(
  process.execPath,
  [pnpmCli, "exec", "playwright", "test", "--config=playwright.mobile.config.ts", ...process.argv.slice(2)],
  {
    env: { ...process.env, QOOVEX_MOBILE_MODE: "1" },
    stdio: "inherit",
  },
);

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
