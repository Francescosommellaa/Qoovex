"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";

export function DocumentPackageArchiveButton({ packageId, redirectToList = false }: { packageId: string; redirectToList?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archivePackage() {
    setPending(true);
    setError(null);
    try {
      await submitJson(`/api/document-packages/${packageId}`, "DELETE");
      if (redirectToList) router.push("/document-packages");
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
      <button className={styles.dangerButton} disabled={pending} onClick={archivePackage} type="button">
        {pending ? "Archiviazione..." : "Archivia"}
      </button>
    </>
  );
}
