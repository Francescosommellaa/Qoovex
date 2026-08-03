"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { documentPackageItemTypeLabels, evidenceTypeLabels } from "@/views/workspace/workspace-format";
import type {
  WorkspaceChecklistRecord,
  WorkspaceDocumentPackageItemRecord,
  WorkspaceDocumentRecord,
  WorkspaceDocumentVersionRecord,
  WorkspaceEvidenceRecord,
} from "@/views/workspace/workspace-records";

function itemTitle(
  item: WorkspaceDocumentPackageItemRecord,
  documents: WorkspaceDocumentRecord[],
  documentVersions: WorkspaceDocumentVersionRecord[],
  evidence: WorkspaceEvidenceRecord[],
  checklists: WorkspaceChecklistRecord[],
) {
  if (item.itemType === "DOCUMENT") return documents.find((document) => document.id === item.documentId)?.title ?? "Documento incluso";
  if (item.itemType === "DOCUMENT_VERSION") {
    const version = documentVersions.find((candidate) => candidate.id === item.documentVersionId);
    const document = documents.find((candidate) => candidate.id === version?.documentId);
    return `${document?.title ?? "Documento"} - ${version?.originalFileName ?? "File incluso"}`;
  }
  if (item.itemType === "EVIDENCE") {
    const includedEvidence = evidence.find((candidate) => candidate.id === item.evidenceId);
    return includedEvidence ? `${evidenceTypeLabels[includedEvidence.type]} - ${includedEvidence.title}` : "Prova inclusa";
  }
  if (item.itemType === "CHECKLIST") return checklists.find((checklist) => checklist.id === item.checklistId)?.name ?? "Checklist inclusa";
  return item.note ?? "Nota inclusa";
}

export function DocumentPackageItemsList({
  packageId,
  items,
  documents,
  documentVersions,
  evidence,
  checklists,
  canManage,
}: {
  packageId: string;
  items: WorkspaceDocumentPackageItemRecord[];
  documents: WorkspaceDocumentRecord[];
  documentVersions: WorkspaceDocumentVersionRecord[];
  evidence: WorkspaceEvidenceRecord[];
  checklists: WorkspaceChecklistRecord[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updatePosition(itemId: string, formData: FormData) {
    const value = formData.get("position");
    if (typeof value !== "string" || value.trim() === "") return;
    setPending(itemId);
    setError(null);
    try {
      await submitJson(`/api/document-packages/${packageId}/items/${itemId}`, "PATCH", { position: Number(value) });
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Aggiornamento non riuscito.");
    } finally {
      setPending(null);
    }
  }

  async function removeItem(itemId: string) {
    setPending(itemId);
    setError(null);
    try {
      await submitJson(`/api/document-packages/${packageId}/items/${itemId}`, "DELETE");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Rimozione non riuscita.");
    } finally {
      setPending(null);
    }
  }

  if (!items.length) return <p className="text-muted-foreground">Nessun elemento selezionato.</p>;

  return (
    <div className={styles.list}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      {items.map((item) => (
        <article className={styles.record} key={item.id}>
          <div className={styles.recordMain}>
            <strong>{itemTitle(item, documents, documentVersions, evidence, checklists)}</strong>
            <span>{documentPackageItemTypeLabels[item.itemType]} - Posizione {item.position}</span>
          </div>
          {canManage ? <details className={styles.details}><summary>Altre azioni</summary>
            <div className={styles.actions}>
              <form
                className={styles.actions}
                onSubmit={(event) => {
                  event.preventDefault();
                  updatePosition(item.id, new FormData(event.currentTarget));
                }}
              >
                <label className={styles.field}>
                  <span>Posizione</span>
                  <input defaultValue={item.position} min={0} name="position" type="number" />
                </label>
                <button className={styles.ghostButton} disabled={pending === item.id} type="submit">Aggiorna ordine</button>
              </form>
              <button className={styles.dangerButton} disabled={pending === item.id} onClick={() => removeItem(item.id)} type="button">Rimuovi elemento</button>
            </div>
          </details> : null}
        </article>
      ))}
    </div>
  );
}
