import { describe, expect, it } from "vitest";
import { shouldSerializeWorkspaceTestFiles } from "./vitest-execution-policy";

describe("Workspace Vitest execution policy", () => {
  it("serializes files in CI because PostgreSQL integration tests share the Prisma client", () => {
    expect(shouldSerializeWorkspaceTestFiles({ CI: "true" })).toBe(true);
  });

  it("serializes the explicit PostgreSQL integration phase and local E2E", () => {
    expect(shouldSerializeWorkspaceTestFiles({ QOOVEX_POSTGRES_INTEGRATION_PHASE: "run" })).toBe(true);
    expect(shouldSerializeWorkspaceTestFiles({ QOOVEX_E2E_MODE: "1" })).toBe(true);
  });

  it("keeps ordinary local unit tests parallel", () => {
    expect(shouldSerializeWorkspaceTestFiles({})).toBe(false);
  });
});
