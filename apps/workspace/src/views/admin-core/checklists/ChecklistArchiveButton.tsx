"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";

export function ChecklistArchiveButton({ checklistId, redirectToList = false }: { checklistId: string; redirectToList?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archiveChecklist() {
    setPending(true);
    setError(null);
    try {
      await submitJson(`/api/checklists/${checklistId}`, "DELETE");
      if (redirectToList) router.push("/checklists");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Archiviazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {error ? <span className={styles.formError}>{error}</span> : null}
      <button className={styles.dangerButton} disabled={pending} onClick={archiveChecklist} type="button">
        {pending ? "Archiviazione..." : "Archivia"}
      </button>
    </>
  );
}
