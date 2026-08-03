"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";

export function EvidenceArchiveButton({ evidenceId }: { evidenceId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archiveEvidence() {
    setPending(true);
    setError(null);
    try {
      await submitJson(`/api/evidence/${evidenceId}`, "DELETE");
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
      <button className={styles.dangerButton} disabled={pending} onClick={archiveEvidence} type="button">
        {pending ? "Archiviazione..." : "Archivia"}
      </button>
    </>
  );
}
