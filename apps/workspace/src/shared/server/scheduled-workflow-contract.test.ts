import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("scheduled GitHub workflow contract", () => {
  it("captures each response once and fails on invalid JSON or logical failures", () => {
    const workflow = readFileSync(resolve(process.cwd(), "../../.github/workflows/scheduled-jobs.yml"), "utf8");
    const responseCaptures = workflow.match(/response="\$\(curl/g) ?? [];
    const logicalChecks = workflow.match(/jq -e 'type == "object" and \(\(\.failed \| type\) == "number"\) and \.failed == 0'/g) ?? [];

    expect(responseCaptures).toHaveLength(2);
    expect(logicalChecks).toHaveLength(2);
    expect(workflow).toContain("--fail-with-body");
  });
});
