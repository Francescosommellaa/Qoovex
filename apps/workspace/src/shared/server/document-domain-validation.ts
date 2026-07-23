import "server-only";

import type { DocumentCategoryKey, DocumentOwnerType, DocumentSensitivity, DocumentTypeAppliesTo } from "@qoovex/types";
import { documentCategoryKeys, documentCategoryRegistry, documentSensitivities } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";

const BINARY_PAYLOAD_FIELDS = ["blobKey", "blobUrl", "file", "files", "documentVersion", "content", "base64", "binary"] as const;

export function isEnumValue<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && (values as readonly string[]).includes(value);
}

export function trimRequiredText(value: unknown, label: string, minLength: number, maxLength: number) {
  if (typeof value !== "string") throw new AccessError(`${label} non valido.`, 409);
  const trimmed = value.trim();
  if (trimmed.length < minLength || trimmed.length > maxLength) throw new AccessError(`${label} non valido.`, 409);
  return trimmed;
}

export function trimOptionalText(value: unknown, label: string, maxLength: number): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") throw new AccessError(`${label} non valido.`, 409);
  const trimmed = value.trim();
  if (trimmed.length > maxLength) throw new AccessError(`${label} non valido.`, 409);
  return trimmed.length > 0 ? trimmed : null;
}

export function trimOptionalId(value: unknown, label: string): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") throw new AccessError(`${label} non valido.`, 409);
  const trimmed = value.trim();
  if (!trimmed) throw new AccessError(`${label} non valido.`, 409);
  return trimmed;
}

export function parseRequiredDate(value: unknown, label: string): Date {
  if (typeof value !== "string" && !(value instanceof Date)) throw new AccessError(`${label} non valida.`, 409);
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new AccessError(`${label} non valida.`, 409);
  return date;
}

export function parseOptionalDate(value: unknown, label: string): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return parseRequiredDate(value, label);
}

export function rejectBinaryPayload(input: Record<string, unknown>) {
  const field = BINARY_PAYLOAD_FIELDS.find((key) => key in input);
  if (field) throw new AccessError("Questo endpoint non accetta file o riferimenti Blob.", 409);
}

export function parseDocumentCategoryKey(value: unknown): DocumentCategoryKey {
  if (!isEnumValue(documentCategoryKeys, value)) throw new AccessError("Categoria documentale non valida.", 409);
  return value;
}

export function parseDocumentSensitivity(value: unknown): DocumentSensitivity {
  if (!isEnumValue(documentSensitivities, value)) throw new AccessError("Sensibilita documentale non valida.", 409);
  return value;
}

export function assertDocumentTaxonomy(input: {
  appliesTo: DocumentTypeAppliesTo;
  categoryKey: DocumentCategoryKey;
  sensitivity: DocumentSensitivity;
  allowLegacy?: boolean;
}) {
  const category = documentCategoryRegistry[input.categoryKey];
  if (input.allowLegacy && input.categoryKey === "UNCLASSIFIED") return;
  if (!category.availableForNewDocuments) {
    throw new AccessError(input.categoryKey === "WORKER_RESTRICTED_ADMINISTRATION"
      ? "L'amministrazione riservata non e ancora disponibile: permessi ed entitlement devono essere definiti prima dell'uso operativo."
      : "La categoria Da classificare e riservata ai dati legacy.", 409);
  }
  if (input.appliesTo !== category.appliesTo) throw new AccessError("La categoria non e compatibile con la macroarea scelta.", 409);
  if (input.sensitivity === "RESTRICTED") throw new AccessError("I documenti riservati non sono ancora abilitati.", 409);
  if (input.sensitivity === "HEALTH_JUDGMENT" && input.categoryKey !== "WORKER_FITNESS_JUDGMENT") {
    throw new AccessError("Il livello Giudizio di idoneita e disponibile solo nella categoria Idoneita alla mansione.", 409);
  }
  if (input.categoryKey === "WORKER_FITNESS_JUDGMENT" && input.sensitivity !== "HEALTH_JUDGMENT") {
    throw new AccessError("La categoria Idoneita alla mansione richiede il livello Giudizio di idoneita.", 409);
  }
}

export function ownerTypeMatchesAppliesTo(ownerType: DocumentOwnerType, appliesTo: DocumentTypeAppliesTo) {
  return ownerType === appliesTo;
}
