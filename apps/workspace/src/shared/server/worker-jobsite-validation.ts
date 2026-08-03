import "server-only";

import type { RecordStatus } from "@qoovex/types";
import { recordStatuses } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { isEnumValue, parseOptionalDate, trimOptionalText } from "./document-domain-validation";

const SENSITIVE_FIELD_NAMES = ["taxCode", "fiscalCode", "healthData", "medicalData", "medicalNotes", "gps", "latitude", "longitude", "coordinates"] as const;

export function rejectSensitiveFields(input: Record<string, unknown>) {
  const field = SENSITIVE_FIELD_NAMES.find((key) => key in input);
  if (field) throw new AccessError("Campo non previsto per questo modulo.", 409);
}

export function parseRecordStatus(value: unknown): RecordStatus {
  if (!isEnumValue(recordStatuses, value)) throw new AccessError("Stato non valido.", 409);
  return value;
}

export function parseEditableRecordStatus(value: unknown): RecordStatus {
  const status = parseRecordStatus(value);
  if (status === "ARCHIVED") throw new AccessError("Usa l'archiviazione per archiviare il record.", 409);
  return status;
}

export function normalizeOptionalEmail(value: unknown): string | null | undefined {
  const normalized = trimOptionalText(value, "Email", 254);
  if (normalized === undefined || normalized === null) return normalized;
  const email = normalized.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AccessError("Inserisci una email valida.", 409);
  return email;
}

export function parseOptionalDateRange(input: {
  startDate?: unknown;
  endDate?: unknown;
  currentStartDate?: Date | null;
  currentEndDate?: Date | null;
}) {
  const startDate = input.startDate === undefined ? input.currentStartDate : parseOptionalDate(input.startDate, "Data inizio");
  const endDate = input.endDate === undefined ? input.currentEndDate : parseOptionalDate(input.endDate, "Data fine");
  if (startDate && endDate && endDate < startDate) throw new AccessError("La data fine non puo precedere la data inizio.", 409);
  return {
    startDate: input.startDate === undefined ? undefined : startDate ?? null,
    endDate: input.endDate === undefined ? undefined : endDate ?? null,
    resolvedStartDate: startDate ?? null,
    resolvedEndDate: endDate ?? null,
  };
}
