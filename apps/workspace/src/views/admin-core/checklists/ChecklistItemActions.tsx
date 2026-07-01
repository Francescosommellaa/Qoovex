"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";

export function ChecklistItemActions({
  checklistId,
  itemId,
  canComplete,
  canManage,
  currentStatus,
}: {
  checklistId: string;
  itemId: string;
  canComplete: boolean;
  canManage: boolean;
  currentStatus: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(status: "DONE" | "OPEN" | "TO_REVIEW") {
    setPending(status);
    setError(null);
    try {
      await submitJson(`/api/checklists/${checklistId}/items/${itemId}`, "PATCH", { status });
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Aggiornamento non riuscito.");
    } finally {
      setPending(null);
    }
  }

  async function archiveItem() {
    setPending("ARCHIVED");
    setError(null);
    try {
      await submitJson(`/api/checklists/${checklistId}/items/${itemId}`, "DELETE");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Archiviazione non riuscita.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className={styles.actions}>
      {error ? <span className={styles.formError}>{error}</span> : null}
      {canComplete && currentStatus !== "DONE" ? (
        <button className={styles.button} disabled={pending !== null} onClick={() => updateStatus("DONE")} type="button">
          {pending === "DONE" ? "Registro..." : "Completa voce"}
        </button>
      ) : null}
      {canComplete && currentStatus === "DONE" ? (
        <button className={styles.ghostButton} disabled={pending !== null} onClick={() => updateStatus("OPEN")} type="button">
          Riapri
        </button>
      ) : null}
      {canComplete && currentStatus !== "TO_REVIEW" ? (
        <button className={styles.ghostButton} disabled={pending !== null} onClick={() => updateStatus("TO_REVIEW")} type="button">
          Da verificare
        </button>
      ) : null}
      {canManage ? (
        <button className={styles.dangerButton} disabled={pending !== null} onClick={archiveItem} type="button">
          {pending === "ARCHIVED" ? "Archiviazione..." : "Archivia voce"}
        </button>
      ) : null}
    </div>
  );
}
