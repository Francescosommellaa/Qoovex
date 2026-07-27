import type { OperationalProcessStatus, OperationalProcessType, OperationalStepStatus } from "@qoovex/types";

export interface OperationalStepDefinition { key: string; label: string; }
export interface OperationalProcessDefinition { type: OperationalProcessType; version: 1; title: string; steps: readonly OperationalStepDefinition[]; }

const definitions: Record<OperationalProcessType, OperationalProcessDefinition> = {
  DOCUMENT_RECEIVED: { type: "DOCUMENT_RECEIVED", version: 1, title: "Documento ricevuto", steps: [
    { key: "capture-context", label: "Acquisizione del contesto" },
    { key: "evaluate-document", label: "Verifica dei dati registrati" },
    { key: "reconcile-requirements", label: "Riconciliazione dei requisiti" },
    { key: "reconcile-deadline", label: "Aggiornamento di scadenza e promemoria" },
    { key: "reconcile-packages", label: "Controllo dei pacchetti interni" },
  ] },
  WORKER_CREATED: { type: "WORKER_CREATED", version: 1, title: "Situazione documentale del lavoratore", steps: [
    { key: "capture-context", label: "Acquisizione dei requisiti configurati" },
    { key: "evaluate-requirements", label: "Verifica dei documenti presenti" },
    { key: "reconcile-deadlines", label: "Aggiornamento di scadenze e promemoria" },
  ] },
  JOB_SITE_CREATED: { type: "JOB_SITE_CREATED", version: 1, title: "Situazione operativa del cantiere", steps: [
    { key: "capture-context", label: "Acquisizione dei requisiti configurati" },
    { key: "evaluate-requirements", label: "Verifica di documenti e checklist" },
    { key: "reconcile-deadlines", label: "Aggiornamento di scadenze e promemoria" },
  ] },
  CONTINUOUS_CONTROL: { type: "CONTINUOUS_CONTROL", version: 1, title: "Controllo operativo continuo", steps: [
    { key: "reconcile-temporal-statuses", label: "Aggiornamento degli stati temporali" },
    { key: "reconcile-requirements", label: "Controllo dei requisiti mancanti" },
    { key: "reconcile-exceptions", label: "Riconciliazione delle eccezioni" },
    { key: "reconcile-reminders", label: "Aggiornamento dei promemoria" },
    { key: "validate-artifacts", label: "Verifica dei riferimenti operativi" },
  ] },
};

export function getOperationalDefinition(type: OperationalProcessType) { return definitions[type]; }
export function getOperationalStepLabel(type: OperationalProcessType, key: string) { return definitions[type].steps.find((step) => step.key === key)?.label ?? key; }

const processTransitions: Record<OperationalProcessStatus, readonly OperationalProcessStatus[]> = {
  RECEIVED: ["READY"], READY: ["RUNNING", "BLOCKED"],
  RUNNING: ["READY", "WAITING_FOR_DECISION", "BLOCKED", "RETRY_SCHEDULED", "COMPLETED", "COMPLETED_WITH_EXCEPTIONS", "TECHNICAL_FAILURE"],
  WAITING_FOR_DECISION: ["READY", "BLOCKED"], BLOCKED: ["READY", "TECHNICAL_FAILURE"],
  RETRY_SCHEDULED: ["READY", "RUNNING", "TECHNICAL_FAILURE"], COMPLETED: [], COMPLETED_WITH_EXCEPTIONS: [], TECHNICAL_FAILURE: ["READY"],
};
const stepTransitions: Record<OperationalStepStatus, readonly OperationalStepStatus[]> = {
  WAITING: ["READY", "SKIPPED"], READY: ["RUNNING", "SKIPPED"],
  RUNNING: ["COMPLETED", "BLOCKED", "RETRY_SCHEDULED", "TECHNICAL_FAILURE", "READY"], BLOCKED: ["READY", "SKIPPED"],
  RETRY_SCHEDULED: ["READY", "RUNNING", "TECHNICAL_FAILURE"], TECHNICAL_FAILURE: ["READY"], COMPLETED: [], SKIPPED: [],
};

export function assertOperationalProcessTransition(from: OperationalProcessStatus, to: OperationalProcessStatus) {
  if (!processTransitions[from].includes(to)) throw new Error(`INVALID_OPERATIONAL_PROCESS_TRANSITION:${from}:${to}`);
}
export function assertOperationalStepTransition(from: OperationalStepStatus, to: OperationalStepStatus) {
  if (!stepTransitions[from].includes(to)) throw new Error(`INVALID_OPERATIONAL_STEP_TRANSITION:${from}:${to}`);
}
