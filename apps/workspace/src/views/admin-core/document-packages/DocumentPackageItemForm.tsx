"use client";

import type { DocumentPackageItemType } from "@qoovex/types";
import { documentPackageItemTypes } from "@qoovex/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formValue, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { documentPackageItemTypeLabels, evidenceTypeLabels } from "@/views/workspace/workspace-format";
import type {
  WorkspaceChecklistRecord,
  WorkspaceDocumentPackageItemRecord,
  WorkspaceDocumentRecord,
  WorkspaceDocumentVersionRecord,
  WorkspaceEvidenceRecord,
} from "@/views/workspace/workspace-records";

interface DocumentPackageItemFormProps {
  packageId: string;
  documents: WorkspaceDocumentRecord[];
  documentVersions: WorkspaceDocumentVersionRecord[];
  evidence: WorkspaceEvidenceRecord[];
  checklists: WorkspaceChecklistRecord[];
  disabled?: boolean;
}

function documentTitle(documentId: string | null | undefined, documents: WorkspaceDocumentRecord[]) {
  return documents.find((document) => document.id === documentId)?.title ?? "Documento";
}

export function DocumentPackageItemForm({ packageId, documents, documentVersions, evidence, checklists, disabled }: DocumentPackageItemFormProps) {
  const router = useRouter();
  const [itemType, setItemType] = useState<DocumentPackageItemType>("DOCUMENT");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const shareableDocuments = documents.filter((document) => document.categoryKey !== "UNCLASSIFIED" && document.sensitivity === "STANDARD");
  const shareableDocumentIds = new Set(shareableDocuments.map((document) => document.id));
  const shareableVersions = documentVersions.filter((version) => version.documentId && shareableDocumentIds.has(version.documentId));

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const selectedType = (formValue(formData, "itemType") ?? "DOCUMENT") as DocumentPackageItemType;
    const position = formValue(formData, "position");
    const payload: Record<string, unknown> = { itemType: selectedType };
    if (position !== undefined) payload.position = Number(position);
    if (selectedType === "DOCUMENT") payload.documentId = formValue(formData, "documentId");
    if (selectedType === "DOCUMENT_VERSION") payload.documentVersionId = formValue(formData, "documentVersionId");
    if (selectedType === "EVIDENCE") payload.evidenceId = formValue(formData, "evidenceId");
    if (selectedType === "CHECKLIST") payload.checklistId = formValue(formData, "checklistId");
    if (selectedType === "NOTE") payload.note = formValue(formData, "note");

    try {
      await submitJson<WorkspaceDocumentPackageItemRecord>(`/api/document-packages/${packageId}/items`, "POST", payload);
      router.refresh();
      event.currentTarget.reset();
      setItemType("DOCUMENT");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Operazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <div className={styles.fieldGrid}>
        <label className={styles.field}>
          <span>Tipo elemento</span>
          <select disabled={disabled || pending} name="itemType" onChange={(event) => setItemType(event.target.value as DocumentPackageItemType)} value={itemType}>
            {documentPackageItemTypes.map((type) => (
              <option key={type} value={type}>{documentPackageItemTypeLabels[type]}</option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Ordine opzionale</span>
          <input disabled={disabled || pending} min={0} name="position" type="number" />
        </label>
        {itemType === "DOCUMENT" ? (
          <label className={styles.field}>
            <span>Documento</span>
            <select disabled={disabled || pending} name="documentId" required>
              <option value="">Seleziona documento</option>
              {shareableDocuments.map((document) => (
                <option key={document.id} value={document.id}>{document.categoryLabel} - {document.documentTypeName} - {document.title}</option>
              ))}
            </select>
          </label>
        ) : null}
        {itemType === "DOCUMENT_VERSION" ? (
          <label className={styles.field}>
            <span>File del documento</span>
            <select disabled={disabled || pending} name="documentVersionId" required>
              <option value="">Seleziona file</option>
              {shareableVersions.map((version) => (
                <option key={version.id} value={version.id}>{documentTitle(version.documentId, shareableDocuments)} - {version.originalFileName}</option>
              ))}
            </select>
          </label>
        ) : null}
        {itemType === "EVIDENCE" ? (
          <label className={styles.field}>
            <span>Prova</span>
            <select disabled={disabled || pending} name="evidenceId" required>
              <option value="">Seleziona prova</option>
              {evidence.map((item) => (
                <option key={item.id} value={item.id}>{evidenceTypeLabels[item.type]} - {item.title}</option>
              ))}
            </select>
          </label>
        ) : null}
        {itemType === "CHECKLIST" ? (
          <label className={styles.field}>
            <span>Checklist</span>
            <select disabled={disabled || pending} name="checklistId" required>
              <option value="">Seleziona checklist</option>
              {checklists.map((checklist) => (
                <option key={checklist.id} value={checklist.id}>{checklist.name}</option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      {itemType === "NOTE" ? (
        <label className={styles.field}>
          <span>Nota da condividere</span>
          <textarea disabled={disabled || pending} maxLength={4000} minLength={2} name="note" required />
        </label>
      ) : null}
      <button className={styles.button} disabled={disabled || pending} type="submit">
        {pending ? "Salvataggio..." : "Aggiungi elemento"}
      </button>
    </form>
  );
}
