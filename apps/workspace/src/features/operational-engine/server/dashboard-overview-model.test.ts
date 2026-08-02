import { describe, expect, it } from "vitest";
import type { DashboardHandledResult, DashboardIntervention } from "@qoovex/types";
import {
  canPerformDashboardAction,
  deduplicateAndSortDashboardInterventions,
  isDashboardHandledEvent,
  requiredDashboardDecisionPermission,
  requiredDashboardPermission,
  selectDashboardHandledResults,
} from "./dashboard-overview-model";

function intervention(overrides: Partial<DashboardIntervention> = {}): DashboardIntervention {
  return {
    id: "item-1",
    processId: "process-1",
    kind: "EXCEPTION",
    title: "Informazione mancante",
    handledSummary: "Qoovex ha verificato i dati disponibili.",
    missingSummary: "Completa il dato.",
    context: { type: "DOCUMENT", id: "document-1", label: "Documento", href: "/documents/document-1" },
    blocking: false,
    overdue: false,
    severity: "ATTENTION",
    openedAt: "2026-07-31T09:00:00.000Z",
    dueAt: null,
    canResolve: false,
    primaryAction: { label: "Controlla cosa manca", href: "/operations/process-1" },
    ...overrides,
  };
}

function handled(overrides: Partial<DashboardHandledResult> = {}): DashboardHandledResult {
  return {
    id: "event-1",
    processId: "process-1",
    title: "Documento collegato",
    summary: "Il collegamento è stato registrato.",
    occurredAt: "2026-07-31T09:00:00.000Z",
    href: "/operations/process-1",
    context: { type: "DOCUMENT", id: "document-1", label: null, href: "/documents/document-1" },
    source: "OPERATIONAL_EVENT",
    ...overrides,
  };
}

describe("dashboard overview model", () => {
  it("derives action authority from the underlying mutation and disables support actions", () => {
    expect(requiredDashboardPermission([{ artifactType: "DOCUMENT" }])).toBe("documents:update");
    expect(requiredDashboardDecisionPermission("APPROVE_DOCUMENT_PACKAGE_SHARE", [{ artifactType: "DOCUMENT_PACKAGE" }])).toBe("documentPackages:share");
    expect(canPerformDashboardAction(["documents:update"], "documents:update", false)).toBe(true);
    expect(canPerformDashboardAction(["documents:update"], "documents:update", true)).toBe(false);
    expect(canPerformDashboardAction(["documents:read"], "documents:update", false)).toBe(false);
  });

  it("deduplicates the same process and artifact deterministically and preserves distinct contexts", () => {
    const decision = intervention({ id: "decision", kind: "DECISION", blocking: true, severity: null });
    const duplicateException = intervention({ id: "exception", kind: "EXCEPTION", blocking: false });
    const otherContext = intervention({
      id: "sharing",
      kind: "SHARING",
      processId: "process-2",
      context: { type: "DOCUMENT_PACKAGE", id: "package-1", label: "Pacchetto", href: "/document-packages/package-1" },
    });
    expect(deduplicateAndSortDashboardInterventions([duplicateException, otherContext, decision]).map((item) => item.id)).toEqual(["decision", "sharing"]);
  });

  it("orders blocking work, overdue work, decisions, blocking exceptions, sharing and older verification", () => {
    const items = [
      intervention({ id: "verify", processId: "p-6", openedAt: "2026-07-01T00:00:00.000Z" }),
      intervention({ id: "share", processId: "p-5", kind: "SHARING" }),
      intervention({ id: "blocking-exception", processId: "p-4", severity: "BLOCKING" }),
      intervention({ id: "decision", processId: "p-3", kind: "DECISION", severity: null }),
      intervention({ id: "overdue", processId: "p-2", overdue: true }),
      intervention({ id: "blocking", processId: "p-1", blocking: true }),
    ];
    expect(deduplicateAndSortDashboardInterventions(items).map((item) => item.id)).toEqual([
      "blocking", "overdue", "decision", "blocking-exception", "share", "verify",
    ]);
  });

  it("accepts only meaningful system events and prefers them to completed-process fallbacks", () => {
    expect(isDashboardHandledEvent({ eventType: "DOCUMENT_LINKED", actorType: "SYSTEM", sourceType: "ENGINE" })).toBe(true);
    expect(isDashboardHandledEvent({ eventType: "DOCUMENT_LINKED", actorType: "USER", sourceType: "USER_ACTION" })).toBe(false);
    expect(isDashboardHandledEvent({ eventType: "STEP_STARTED", actorType: "SYSTEM", sourceType: "ENGINE" })).toBe(false);

    const fallback = handled({ id: "fallback", source: "COMPLETED_PROCESS", occurredAt: "2026-07-31T10:00:00.000Z" });
    const event = handled({ id: "event", occurredAt: "2026-07-31T09:00:00.000Z" });
    const other = handled({ id: "other", processId: "process-2", context: null, occurredAt: "2026-07-31T08:00:00.000Z" });
    expect(selectDashboardHandledResults([event, other], [fallback]).map((item) => item.id)).toEqual(["event", "other"]);
  });

  it("limits handled results to five", () => {
    const results = Array.from({ length: 7 }, (_, index) => handled({ id: `event-${index}`, processId: `process-${index}`, context: null }));
    expect(selectDashboardHandledResults(results, [])).toHaveLength(5);
  });
});
