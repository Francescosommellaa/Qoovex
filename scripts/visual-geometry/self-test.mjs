import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import process from "node:process";

const require = createRequire(import.meta.url);
const playwrightModulePath = require.resolve("@playwright/test");
const playwrightCli = require.resolve("@playwright/test/cli");
const temporaryRoot = mkdtempSync(path.join(tmpdir(), "qoovex-visual-geometry-"));
const port = 43137;

function writeFixture(size) {
  writeFileSync(
    path.join(temporaryRoot, "index.html"),
    `<!doctype html><html><body><div id="square" style="width:${size}px;height:${size}px;background:#2563eb"></div></body></html>`,
  );
}

function runPlaywright(extraArgs = []) {
  return spawnSync(
    process.execPath,
    [playwrightCli, "test", "--config", path.join(temporaryRoot, "playwright.config.ts"), ...extraArgs],
    {
      cwd: process.cwd(),
      env: { ...process.env, CI: "" },
      shell: false,
      encoding: "utf8",
    },
  );
}

function assertStatus(result, expected, label) {
  if (result.error) throw result.error;
  const passed = expected === "pass" ? result.status === 0 : result.status !== 0;
  if (!passed) {
    throw new Error(
      `${label}: expected ${expected}, received ${result.status}\n${result.stdout ?? ""}\n${result.stderr ?? ""}`,
    );
  }
}

try {
  writeFileSync(
    path.join(temporaryRoot, "server.mjs"),
    `import http from "node:http";import { readFileSync } from "node:fs";import path from "node:path";const root=${JSON.stringify(temporaryRoot)};http.createServer((request,response)=>{response.setHeader("content-type","text/html");response.end(readFileSync(path.join(root,"index.html")));}).listen(${port},"127.0.0.1");`,
  );
  writeFileSync(
    path.join(temporaryRoot, "visual.spec.ts"),
    `import { expect, test } from ${JSON.stringify(playwrightModulePath)};test("geometry canary",async({page})=>{await page.goto("http://127.0.0.1:${port}");await expect(page.locator("#square")).toHaveScreenshot("square.png",{animations:"disabled",caret:"hide",maxDiffPixels:0});});`,
  );
  writeFileSync(
    path.join(temporaryRoot, "playwright.config.ts"),
    `import { defineConfig } from ${JSON.stringify(playwrightModulePath)};export default defineConfig({testDir:${JSON.stringify(temporaryRoot)},testMatch:"visual.spec.ts",workers:1,retries:0,reporter:"line",snapshotPathTemplate:"${temporaryRoot.replaceAll("\\", "/")}/snapshots/{arg}{ext}",webServer:{command:"node server.mjs",cwd:${JSON.stringify(temporaryRoot)},url:"http://127.0.0.1:${port}",reuseExistingServer:false,timeout:15000},use:{browserName:"chromium",viewport:{width:320,height:240},deviceScaleFactor:1}});`,
  );

  writeFixture(32);
  assertStatus(runPlaywright(), "fail", "missing baseline canary");
  assertStatus(runPlaywright(["--update-snapshots=all"]), "pass", "baseline creation canary");
  assertStatus(runPlaywright(), "pass", "exact baseline canary");

  writeFixture(33);
  assertStatus(runPlaywright(), "fail", "one-pixel diff canary");

  const baseline = path.join(temporaryRoot, "snapshots", "square.png");
  if (!readFileSync(baseline).length) throw new Error("self-test baseline was empty");
  rmSync(baseline);
  assertStatus(runPlaywright(), "fail", "deleted baseline canary");

  console.log("[visual-geometry:self-test] PASS: missing baseline and 1px drift both fail closed");
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
