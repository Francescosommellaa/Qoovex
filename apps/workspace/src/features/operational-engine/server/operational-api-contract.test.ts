import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();
const repositoryRoot = resolve(workspaceRoot, "../..");

describe("operational API contracts", () => {
  it("exposes every protected Phase 3 route and only makes the cron runner public", () => {
    const routes = [
      "processes/route.ts", "processes/[processId]/route.ts",
      "processes/[processId]/events/route.ts", "decisions/[decisionId]/resolve/route.ts",
      "exceptions/[exceptionId]/resolve/route.ts", "steps/[stepId]/retry/route.ts", "run/route.ts",
    ];
    for (const route of routes) expect(existsSync(resolve(workspaceRoot, "src/app/api/operations", route)), route).toBe(true);
    for (const removedRoute of ["center/route.ts", "inbox/route.ts"]) {
      expect(existsSync(resolve(workspaceRoot, "src/app/api/operations", removedRoute)), removedRoute).toBe(false);
    }
    expect(existsSync(resolve(workspaceRoot, "src/app/api/dashboard/route.ts"))).toBe(false);
    const publicRoutes = readFileSync(resolve(workspaceRoot, "src/shared/lib/public-api-routes.ts"), "utf8");
    expect(publicRoutes).toContain('pathname === "/api/operations/run"');
    expect(publicRoutes).not.toContain('pathname.startsWith("/api/operations/")');
    expect(readFileSync(resolve(workspaceRoot, "src/app/api/operations/run/route.ts"), "utf8")).toContain("isAuthorizedCronRequest");
  });

  it("keeps the compatible dashboard route independent from legacy queue views", () => {
    const page = readFileSync(resolve(workspaceRoot, "src/app/dashboard/page.tsx"), "utf8");
    expect(page).toContain("getDashboardOverview");
    expect(page).not.toMatch(/searchParams|paginateOperationalCenter|OperationalCenterView/);
  });

  it("keeps mutation inputs discriminated and excludes free lifecycle controls", () => {
    const contracts = readFileSync(resolve(repositoryRoot, "packages/types/src/index.ts"), "utf8");
    const start = contracts.indexOf("export type ResolveOperationalDecisionInput");
    const end = contracts.indexOf("export interface OperationalExceptionDto", start);
    const decisionInput = contracts.slice(start, end);
    expect(decisionInput).toContain('kind: "SELECT_OPTION"');
    expect(decisionInput).toContain('kind: "CONFIRM_DATE"');
    const actionStart = contracts.indexOf("export interface ResolveOperationalExceptionInput");
    const actionEnd = contracts.indexOf("export interface OperationalProcessSummary", actionStart);
    const actionInputs = contracts.slice(actionStart, actionEnd);
    expect(actionInputs).toContain('kind: "MANUAL_EXCEPTION_RESOLUTION"');
    expect(actionInputs).toContain('kind: "RETRY_TECHNICAL_STEP"');
    expect(`${decisionInput}\n${actionInputs}`).not.toMatch(/\b(status|reliability|impact|transition)\??:/);
  });

  it("enforces organization scope, artifact scope and underlying existing permissions", () => {
    const service = readFileSync(resolve(workspaceRoot, "src/features/operational-engine/server/operational-read-service.ts"), "utf8");
    const overviewModel = readFileSync(resolve(workspaceRoot, "src/features/operational-engine/server/dashboard-overview-model.ts"), "utf8");
    expect(service).toContain('requireOrganizationDomainAccess("organization:read"');
    expect(service).toContain("processScopeWhere");
    expect(service).toContain("requiredPermissionForArtifacts");
    for (const permission of ["documents:update", "workers:update", "jobSites:update", "deadlines:manage", "checklists:manage", "evidence:upload", "documentPackages:create", "documentPackages:share"]) expect(overviewModel).toContain(`"${permission}"`);
    expect(service).toContain("Questa eccezione viene chiusa solo da una condizione oggettiva");
  });
});
