"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { captureRefreshFocus, updateWithFocusGuard } from "@shared/lib/focus-management";

export function NotificationActionButtons({ notificationId, read }: { notificationId: string; read: boolean }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<"read" | "dismiss" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(action: "read" | "dismiss" | "email") {
    const focusSnapshot = captureRefreshFocus(document, "notifications-list");
    updateWithFocusGuard(() => setPendingAction(action), { snapshot: focusSnapshot });
    setError(null);
    setMessage(null);
    try {
      const path = action === "email" ? `/api/notifications/${notificationId}/send-to-me` : `/api/notifications/${notificationId}/${action}`;
      await submitJson(path, "POST");
      if (action === "email") {
        setMessage("Promemoria inviato alla tua email.");
      } else {
        router.refresh();
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Aggiornamento notifica non riuscito.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className={styles.actions}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      {message ? <p className={styles.formSuccess}>{message}</p> : null}
      {!read ? (
        <button className={styles.ghostButton} disabled={pendingAction !== null} onClick={() => submit("read")} type="button">
          {pendingAction === "read" ? "Aggiornamento..." : "Segna come letta"}
        </button>
      ) : null}
      <button className={styles.ghostButton} disabled={pendingAction !== null} onClick={() => submit("email")} type="button">
        {pendingAction === "email" ? "Invio..." : "Invia promemoria"}
      </button>
      <button className={styles.dangerButton} disabled={pendingAction !== null} onClick={() => submit("dismiss")} type="button">
        {pendingAction === "dismiss" ? "Aggiornamento..." : "Nascondi"}
      </button>
    </div>
  );
}
