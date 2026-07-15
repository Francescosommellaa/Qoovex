"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { submitFormData } from "../admin-api-client";
import styles from "../AdminCore.module.css";

export function DocumentVersionUploadForm({ documentId, disabled, returnToDashboard = false }: { documentId: string; disabled?: boolean; returnToDashboard?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    const formData = new FormData(event.currentTarget);
    try {
      await submitFormData(`/api/documents/${documentId}/versions`, formData);
      event.currentTarget.reset();
      setSuccess(true);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Upload non riuscito.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      {success ? <p className={styles.formSuccess}>File caricato. Documento da verificare.</p> : null}
      <label className={styles.field}>
        <span>File documento</span>
        <input accept="application/pdf,image/jpeg,image/png,image/webp" disabled={disabled || pending} name="file" required type="file" />
      </label>
      <p className="qv-text-muted">Limite 4 MB. Il file viene collegato al documento e resta da verificare.</p>
      <button className={styles.button} disabled={disabled || pending} type="submit">
        {pending ? "Caricamento..." : "Carica file"}
      </button>
      {success && returnToDashboard ? <Link className={styles.ghostButton} href={`/dashboard?updated=${encodeURIComponent(documentId)}`}>Torna alla dashboard</Link> : null}
    </form>
  );
}
