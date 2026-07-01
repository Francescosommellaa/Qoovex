"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";

export function DeadlineArchiveButton({ deadlineId, disabled }: { deadlineId: string; disabled?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archive() {
    setPending(true);
    setError(null);
    try {
      await submitJson(`/api/deadlines/${deadlineId}`, "DELETE");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Archiviazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <button className={styles.dangerButton} disabled={disabled || pending} onClick={archive} type="button">
        {pending ? "Archiviazione..." : "Archivia"}
      </button>
    </div>
  );
}
