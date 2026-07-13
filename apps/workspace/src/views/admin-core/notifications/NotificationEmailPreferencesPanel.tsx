"use client";

import { FormEvent, useEffect, useState } from "react";
import type {
  EmailDigestFrequency,
  NotificationEmailDeliveryListResponse,
  NotificationPreferenceResponse,
  UpdateNotificationPreferenceResponse,
} from "@qoovex/types";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";

const frequencyLabels: Record<EmailDigestFrequency, string> = {
  OFF: "Disattivato",
  DAILY: "Giornaliero",
  WEEKLY: "Settimanale",
};

const deliveryTypeLabels = {
  DIGEST: "Digest",
  SINGLE_NOTIFICATION: "Notifica singola",
} as const;

const deliveryStatusLabels = {
  SENT: "Inviato",
  FAILED: "Non inviato",
  SKIPPED: "Saltato",
} as const;

function formatDate(value?: string | null) {
  if (!value) return "Mai";
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export function NotificationEmailPreferencesPanel() {
  const [preference, setPreference] = useState<NotificationPreferenceResponse | null>(null);
  const [deliveries, setDeliveries] = useState<NotificationEmailDeliveryListResponse["deliveries"]>([]);
  const [pending, setPending] = useState<"load" | "save" | null>("load");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadData() {
    setPending("load");
    setError(null);
    try {
      const [preferenceResponse, deliveriesResponse] = await Promise.all([
        fetch("/api/notifications/preferences"),
        fetch("/api/notifications/email-deliveries"),
      ]);
      if (!preferenceResponse.ok) throw new Error(await preferenceResponse.text());
      if (!deliveriesResponse.ok) throw new Error(await deliveriesResponse.text());
      setPreference(await preferenceResponse.json() as NotificationPreferenceResponse);
      const deliveryData = await deliveriesResponse.json() as NotificationEmailDeliveryListResponse;
      setDeliveries(deliveryData.deliveries);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Preferenze email non disponibili.");
    } finally {
      setPending(null);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const frequency = String(formData.get("emailDigestFrequency") ?? "OFF") as EmailDigestFrequency;
    const hour = Number(formData.get("emailDigestHour") ?? 8);
    const enabled = formData.get("emailDigestEnabled") === "on" && frequency !== "OFF";

    setPending("save");
    setError(null);
    setMessage(null);
    try {
      const response = await submitJson<UpdateNotificationPreferenceResponse>("/api/notifications/preferences", "PATCH", {
        emailDigestEnabled: enabled,
        emailDigestFrequency: frequency,
        emailDigestHour: hour,
        deadlineNotificationsEnabled: formData.get("deadlineNotificationsEnabled") === "on",
        documentNotificationsEnabled: formData.get("documentNotificationsEnabled") === "on",
        packageNotificationsEnabled: formData.get("packageNotificationsEnabled") === "on",
        systemNotificationsEnabled: formData.get("systemNotificationsEnabled") === "on",
      });
      setPreference(response.preference);
      setMessage("Preferenze email salvate.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Salvataggio preferenze non riuscito.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className={styles.list}>
      <p className="qv-text-muted">
        Le email riepilogano solo dati registrati in Qoovex. Non includono file, allegati o link di download.
      </p>
      {error ? <p className={styles.formError}>{error}</p> : null}
      {message ? <p className={styles.formSuccess}>{message}</p> : null}
      {pending === "load" && !preference ? <p className="qv-text-muted">Caricamento preferenze...</p> : null}
      {preference ? (
        <form className={styles.form} onSubmit={submit}>
          <label className={styles.checkboxField}>
            <input defaultChecked={preference.emailDigestEnabled} name="emailDigestEnabled" type="checkbox" />
            <span>Digest email attivo</span>
          </label>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Frequenza digest</span>
              <select defaultValue={preference.emailDigestFrequency} name="emailDigestFrequency">
                {(Object.keys(frequencyLabels) as EmailDigestFrequency[]).map((frequency) => (
                  <option key={frequency} value={frequency}>{frequencyLabels[frequency]}</option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Ora digest</span>
              <input defaultValue={preference.emailDigestHour} max={23} min={0} name="emailDigestHour" type="number" />
            </label>
          </div>
          <p className="qv-text-muted">Ultimo digest inviato: {formatDate(preference.lastDigestSentAt)}.</p>
          <fieldset className={styles.field}>
            <span>Tipi inclusi nel digest</span>
            <label className={styles.checkboxField}>
              <input defaultChecked={preference.deadlineNotificationsEnabled} name="deadlineNotificationsEnabled" type="checkbox" />
              <span>Scadenze scadute o in arrivo</span>
            </label>
            <label className={styles.checkboxField}>
              <input defaultChecked={preference.documentNotificationsEnabled} name="documentNotificationsEnabled" type="checkbox" />
              <span>Documenti da verificare, scaduti o in scadenza</span>
            </label>
            <label className={styles.checkboxField}>
              <input defaultChecked={preference.packageNotificationsEnabled} name="packageNotificationsEnabled" type="checkbox" />
              <span>Pacchetti e link condivisi</span>
            </label>
            <label className={styles.checkboxField}>
              <input defaultChecked={preference.systemNotificationsEnabled} name="systemNotificationsEnabled" type="checkbox" />
              <span>Sistema</span>
            </label>
          </fieldset>
          <div className={styles.actions}>
            <button className={styles.button} disabled={pending !== null} type="submit">
              {pending === "save" ? "Salvataggio..." : "Salva preferenze email"}
            </button>
          </div>
        </form>
      ) : null}
      <div className={styles.details}>
        <strong>Invii recenti</strong>
        <div className={styles.list}>
          {!deliveries.length ? (
            <p className="qv-text-muted">Nessun invio email registrato per il tuo account.</p>
          ) : deliveries.map((delivery) => (
            <article className={styles.record} key={delivery.id}>
              <div className={styles.recordMain}>
                <strong>{deliveryTypeLabels[delivery.type]}</strong>
                <span>{deliveryStatusLabels[delivery.status]} - {delivery.notificationCount} notifiche</span>
                <small>{formatDate(delivery.sentAt ?? delivery.createdAt)}{delivery.errorCode ? ` - ${delivery.errorCode}` : ""}</small>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
