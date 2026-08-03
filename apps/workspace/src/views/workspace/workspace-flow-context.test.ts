import { describe, expect, it } from "vitest";
import { parseWorkspaceFlowContext, workspaceResultHref } from "./workspace-flow-context";

describe("workspace flow context", () => {
  it("accepts only allowlisted origins and results", () => {
    expect(parseWorkspaceFlowContext({ origin: "dashboard", result: "file-uploaded" })).toMatchObject({ origin: "dashboard", result: "file-uploaded" });
    expect(parseWorkspaceFlowContext({ origin: "https://example.com", result: "redirect" })).toMatchObject({ origin: null, result: null });
  });

  it("precompiles exactly one context", () => {
    expect(parseWorkspaceFlowContext({ jobSiteId: "site-1" }).context).toEqual({ type: "job-site", id: "site-1" });
    expect(parseWorkspaceFlowContext({ jobSiteId: "site-1", workerId: "worker-1" })).toMatchObject({ context: null, invalidContext: true });
  });

  it("never produces an arbitrary return URL", () => {
    expect(workspaceResultHref("dashboard", "document-created", "doc-1")).toBe("/dashboard?result=document-created&updated=doc-1");
  });
});
