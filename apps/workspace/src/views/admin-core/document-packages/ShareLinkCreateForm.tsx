"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formValue, submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { formatDateTimeInput } from "@/views/workspace/workspace-format";
import type { WorkspaceShareLinkRecord } from "@/views/workspace/workspace-records";
import { buildSharedDocumentPackagePath } from "@shared/lib/workspace-link-routes";

interface CreateShareLinkResponse {
  shareLink: WorkspaceShareLinkRecord;
  token: string;
}

function defaultShareExpiry() {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return formatDateTimeInput(date.toISOString());
}

export function ShareLinkCreateForm({ packageId, disabled }: { packageId: string; disabled?: boolean }) {
  const router = useRouter();
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const defaultExpiry = useMemo(defaultShareExpiry, []);
  const sharePath = createdToken ? buildSharedDocumentPackagePath(createdToken) : "";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setCreatedToken(null);
    const formData = new FormData(event.currentTarget);
    const expiresAt = formValue(formData, "expiresAt");
    try {
      const response = await submitJson<CreateShareLinkResponse>(`/api/document-packages/${packageId}/share-links`, "POST", { expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined });
      setCreatedToken(response.token);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Creazione link non riuscita.");
    } finally {
      setPending(false);
    }
  }

  async function copyLink() {
    if (!createdToken || typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(`${window.location.origin}${sharePath}`);
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <label className={styles.field}>
        <span>Scadenza del link</span>
        <input defaultValue={defaultExpiry} disabled={disabled || pending} name="expiresAt" type="datetime-local" />
      </label>
      <p className="text-muted-foreground">Default provvisorio: 7 giorni. Il link e revocabile.</p>
      <button className={styles.button} disabled={disabled || pending} type="submit">
        {pending ? "Creazione..." : "Crea link di condivisione"}
      </button>
      {createdToken ? (
        <div className={styles.record}>
          <div className={styles.recordMain}>
            <strong>Link creato. Copialo ora: per sicurezza non verra mostrato di nuovo.</strong>
            <input aria-label="Link di condivisione appena creato" readOnly value={sharePath} />
          </div>
          <div className={styles.actions}>
            <button className={styles.ghostButton} onClick={copyLink} type="button">Copia link</button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
