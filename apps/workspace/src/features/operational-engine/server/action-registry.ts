import type { OperationalActionDefinitionV1 } from "./operational-intelligence-contracts";
import { operationalActionInputSchemaV1, operationalActionOutputSchemaV1 } from "./operational-intelligence-contracts";

const actions = [
  { key: "DOCUMENT_STATUS_RECONCILE@1", permission: "documents:update", resourceScope: ["DOCUMENT"], impact: "LOW", reversible: true, deterministic: true, idempotencyStrategy: "organization + document + computed-status + definition-version", domainService: "operationalDocumentService.reconcileStatus", receiptType: "DOCUMENT_STATUS_RECONCILED", operationalEventType: "AUTOMATION_COMPLETED" },
  { key: "DEADLINE_RECONCILE@1", permission: "documents:expiry:manage", resourceScope: ["DOCUMENT", "DEADLINE"], impact: "LOW", reversible: true, deterministic: true, idempotencyStrategy: "organization + document + expiry-date + definition-version", domainService: "operationalDeadlineService.reconcile", receiptType: "DEADLINE_RECONCILED", operationalEventType: "AUTOMATION_COMPLETED" },
  { key: "REMINDERS_RECONCILE@1", permission: "documents:expiry:manage", resourceScope: ["ORGANIZATION", "DEADLINE"], impact: "LOW", reversible: true, deterministic: true, idempotencyStrategy: "organization + reminder-window + definition-version", domainService: "reminderService.syncOrganizationRecords", receiptType: "REMINDERS_RECONCILED", operationalEventType: "AUTOMATION_COMPLETED" },
  { key: "PACKAGE_REVIEW_RESET@1", permission: "documentPackages:update", resourceScope: ["DOCUMENT_PACKAGE"], impact: "CONTROLLED", reversible: true, deterministic: true, idempotencyStrategy: "organization + package + content-revision", domainService: "documentPackageService.resetReview", receiptType: "PACKAGE_REVIEW_RESET", operationalEventType: "AUTOMATION_COMPLETED" },
] as const satisfies ReadonlyArray<Omit<OperationalActionDefinitionV1, "version" | "inputSchema" | "outputSchema">>;

const registry = new Map<string, OperationalActionDefinitionV1>(actions.map((action) => [action.key, { ...action, version: 1, inputSchema: operationalActionInputSchemaV1, outputSchema: operationalActionOutputSchemaV1 }]));

export const operationalActionRegistryVersion = 1 as const;
export const operationalActionKeys = Object.freeze(actions.map((action) => action.key));

export function listOperationalActions(): readonly OperationalActionDefinitionV1[] {
  return operationalActionKeys.map((key) => registry.get(key)!);
}

export function getOperationalAction(actionKey: string): OperationalActionDefinitionV1 {
  const action = registry.get(actionKey);
  if (!action) throw new Error(`OPERATIONAL_ACTION_NOT_REGISTERED:${actionKey}`);
  return action;
}
