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
  });

  it("attests isolated E2E targets and uses Node 24 actions", () => {
    const workflow = readFileSync(resolve(process.cwd(), "../../.github/workflows/ci.yml"), "utf8");

    expect(workflow).toContain("pnpm/action-setup@v6");
    expect(workflow).toContain("actions/upload-artifact@v6");
    expect(workflow).not.toMatch(/pnpm\/action-setup@v4|actions\/upload-artifact@v4/);
    expect(workflow).toContain("QOOVEX_E2E_MODE: \"1\"");
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
