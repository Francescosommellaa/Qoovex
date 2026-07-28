import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("GitHub workflow contracts", () => {
  it("captures each response once and fails on invalid JSON or logical failures", () => {
    const workflow = readFileSync(resolve(process.cwd(), "../../.github/workflows/scheduled-jobs.yml"), "utf8");
    const responseCaptures = workflow.match(/response="\$\(curl/g) ?? [];
    const logicalChecks = workflow.match(/jq -e 'type == "object" and \(\(\.failed \| type\) == "number"\) and \.failed == 0'/g) ?? [];

    expect(responseCaptures).toHaveLength(3);
    expect(logicalChecks).toHaveLength(3);
    expect(workflow).toContain("--fail-with-body");
  });

  it("attests isolated E2E targets and consumes the root toolchain contract", () => {
    const workflow = readFileSync(resolve(process.cwd(), "../../.github/workflows/ci.yml"), "utf8");
    const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), "../../package.json"), "utf8")) as {
      engines?: { node?: string };
      scripts?: Record<string, string>;
    };

    expect(packageJson.engines?.node).toBe("24.x");
    expect(packageJson.scripts?.["ci:install"]).toBe("pnpm install --frozen-lockfile");
    expect(packageJson.scripts?.["ci:db:prepare"]).toBe(
      "pnpm --filter @qoovex/db db:migrate:deploy -- --ci-ephemeral",
    );
    expect(packageJson.scripts?.["test:e2e:install"]).toBe("playwright install --with-deps chromium");
    expect(packageJson.scripts?.["deps:update"]).toBe(
      "pnpm --workspace-root update --include-github-actions && pnpm update --recursive",
    );
    expect(packageJson.scripts?.["deps:update:major"]).toBe(
      "pnpm --workspace-root update --latest --interactive --include-github-actions && pnpm update --recursive --latest --interactive",
    );
    expect(workflow.match(/node-version-file: package\.json/g)).toHaveLength(2);
    expect(workflow.match(/run: pnpm ci:install/g)).toHaveLength(2);
    expect(workflow.match(/run: pnpm ci:db:prepare/g)).toHaveLength(2);
    expect(workflow).toContain("run: pnpm test:e2e:install");
    expect(workflow).not.toMatch(/node-version:\s*24/);
    expect(workflow).not.toContain("run: pnpm install --frozen-lockfile");
    expect(workflow).not.toContain("run: pnpm exec playwright install");
    expect(workflow).toContain("QOOVEX_E2E_MODE: \"1\"");
    expect(workflow).toContain("CRON_SECRET: ci-cron-secret-at-least-32-characters");
    expect(workflow).toContain("QOOVEX_E2E_DATABASE_TARGET: ${{ env.DATABASE_URL }}");
    expect(workflow).toContain("BLOB_READ_WRITE_TOKEN: ${{ secrets.QOOVEX_E2E_BLOB_READ_WRITE_TOKEN }}");
    expect(workflow).toContain("QOOVEX_E2E_BLOB_TARGET: ${{ vars.QOOVEX_E2E_BLOB_STORE_ID }}");
    expect(workflow).toContain("QOOVEX_E2E_RUN_ATTESTATION: I_ACKNOWLEDGE_FIXTURE_SCOPED_CLEANUP");
  });

  it("forwards the isolated PostgreSQL database to Turbo tests", () => {
    const turbo = JSON.parse(readFileSync(resolve(process.cwd(), "../../turbo.json"), "utf8")) as {
      tasks?: { test?: { env?: string[] } };
    };
    const testEnv = turbo.tasks?.test?.env ?? [];

    expect(testEnv).toContain("CI");
    expect(testEnv).toContain("DATABASE_URL");
    expect(testEnv).toContain("QOOVEX_AUDIT_SECRET");
  });

  it("keeps the authenticated E2E email sink secret stable across Playwright config loads", () => {
    const config = readFileSync(resolve(process.cwd(), "../../playwright.config.ts"), "utf8");

    expect(config).toContain(
      'process.env.QOOVEX_E2E_EMAIL_SINK_SECRET?.trim() || crypto.randomBytes(32).toString("hex")',
    );
    expect(config).not.toContain('const sinkSecret = crypto.randomBytes(32).toString("hex")');
  });
});
