"use client";

import { useState } from "react";
import type { EmailDigestPreviewResponse, SendEmailDigestResponse } from "@qoovex/types";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function NotificationEmailDigestPanel() {
  const [preview, setPreview] = useState<EmailDigestPreviewResponse | null>(null);
  const [pendingAction, setPendingAction] = useState<"preview" | "send" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPreview() {
    setPendingAction("preview");
    setMessage(null);
    setError(null);
    try {
      const response = await fetch("/api/notifications/email-digest/preview");
      if (!response.ok) throw new Error(await response.text());
      setPreview(await response.json() as EmailDigestPreviewResponse);
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : "Anteprima riepilogo non disponibile.");
    } finally {
      setPendingAction(null);
    }
  }

  async function sendDigest() {
    setPendingAction("send");
    setMessage(null);
    setError(null);
    try {
      const result = await submitJson<SendEmailDigestResponse>("/api/notifications/email-digest/send-to-me", "POST");
      setMessage(`Riepilogo inviato con ${result.notificationCount} notifiche.`);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Invio riepilogo non riuscito.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className={styles.list}>
      <p className="text-muted-foreground">
        L'email contiene solo un riepilogo dei dati registrati. Non include file o link di download.
      </p>
      {error ? <p className={styles.formError}>{error}</p> : null}
      {message ? <p className={styles.formSuccess}>{message}</p> : null}
      <div className={styles.actions}>
        <button className={styles.ghostButton} disabled={pendingAction !== null} onClick={loadPreview} type="button">
          {pendingAction === "preview" ? "Caricamento..." : "Anteprima riepilogo"}
        </button>
        <button className={styles.button} disabled={pendingAction !== null} onClick={sendDigest} type="button">
          {pendingAction === "send" ? "Invio..." : "Invia riepilogo a me"}
        </button>
      </div>
      {preview ? (
        <article className={styles.record}>
          <div className={styles.recordMain}>
            <strong>{preview.subject}</strong>
            <span>{preview.intro}</span>
            <small>{preview.unreadCount} notifiche non lette. Anteprima generata il {formatDate(preview.generatedAt)}.</small>
            {preview.items.length ? (
              <ul className={styles.compactList}>
                {preview.items.map((item) => (
                  <li key={item.id}>
                    <strong>{item.title}</strong>
                    <span>{item.message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span>Nessuna notifica non letta da includere nel riepilogo.</span>
            )}
            <small>{preview.footer}</small>
          </div>
        </article>
      ) : null}
    </div>
  );
}
