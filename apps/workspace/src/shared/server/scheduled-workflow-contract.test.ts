import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("GitHub workflow contracts", () => {
  it("captures each response once and fails on invalid JSON or logical failures", () => {
    const workflow = readFileSync(resolve(process.cwd(), "../../.github/workflows/scheduled-jobs.yml"), "utf8");
    const responseCaptures = workflow.match(/response="\$\(curl/g) ?? [];
    const logicalChecks = workflow.match(/jq -e 'type == "object" and \(\(\.failed \| type\) == "number"\) and \.failed == 0'/g) ?? [];

    expect(responseCaptures).toHaveLength(2);
    expect(logicalChecks).toHaveLength(2);
    expect(workflow).toContain("--fail-with-body");
    expect(workflow).toContain("/api/data/jobs/run");
    expect(workflow).toContain("/api/reminders/email-digest/run");
    expect(workflow).not.toContain("/api/operations/run");
    expect(workflow).not.toMatch(/^\s{2}operational:/m);
  });

  it("attests isolated E2E targets and uses Node 24 actions", () => {
    const workflow = readFileSync(resolve(process.cwd(), "../../.github/workflows/ci.yml"), "utf8");

    expect(workflow).toContain("pnpm/action-setup@0ebf47130e4866e96fce0953f49152a61190b271");
    expect(workflow).toContain("actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a");
    expect(workflow).not.toMatch(/pnpm\/action-setup@v4|actions\/upload-artifact@v4/);
    expect(workflow).toContain("QOOVEX_E2E_MODE: \"1\"");
    expect(workflow).toContain("QOOVEX_E2E_DATABASE_TARGET: ${{ env.DATABASE_URL }}");
    expect(workflow).toContain("BLOB_READ_WRITE_TOKEN: ${{ secrets.QOOVEX_E2E_BLOB_READ_WRITE_TOKEN }}");
    expect(workflow).toContain("QOOVEX_E2E_BLOB_TARGET: ${{ vars.QOOVEX_E2E_BLOB_STORE_ID }}");
    expect(workflow).toContain("QOOVEX_E2E_RUN_ATTESTATION: I_ACKNOWLEDGE_FIXTURE_SCOPED_CLEANUP");
  });

  it("keeps Workspace Production staged until manual promotion", () => {
    const workflow = readFileSync(resolve(process.cwd(), "../../.github/workflows/release-workspace.yml"), "utf8");

    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).toContain("--prebuilt --prod --skip-domain");
    expect(workflow).toContain("vercel@50.17.1 promote");
    expect(workflow).toContain("workspace-release-evidence.json");
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
