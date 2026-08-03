"use client";

import { FormEvent, useEffect, useState } from "react";
import { Alert, AlertDescription } from "@qoovex/ui/components/alert";
import { Button } from "@qoovex/ui/components/button";
import { Checkbox } from "@qoovex/ui/components/checkbox";
import { Field, FieldDescription, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@qoovex/ui/components/select";
import { Spinner } from "@qoovex/ui/components/spinner";
import type {
  EmailDigestFrequency,
  NotificationEmailDeliveryListResponse,
  NotificationPreferenceResponse,
  UpdateNotificationPreferenceResponse,
} from "@qoovex/types";
import { submitJson } from "../admin-api-client";
import styles from "./NotificationEmailPreferencesPanel.module.css";

const frequencyLabels: Record<EmailDigestFrequency, string> = {
  OFF: "Disattivato",
  DAILY: "Ogni giorno",
  WEEKLY: "Ogni settimana",
};

const deliveryTypeLabels = {
  DIGEST: "Riepilogo automatico",
  SINGLE_NOTIFICATION: "Promemoria singolo",
} as const;

const deliveryStatusLabels = {
  SENT: "Inviato",
  FAILED: "Non inviato",
  SKIPPED: "Non necessario",
} as const;

const digestOptions = [
  {
    name: "deadlineNotificationsEnabled",
    title: "Scadenze",
    description: "Date registrate che sono trascorse o si stanno avvicinando.",
  },
  {
    name: "documentNotificationsEnabled",
    title: "Documenti",
    description: "Documenti da verificare, scaduti o con una data vicina.",
  },
  {
    name: "packageNotificationsEnabled",
    title: "Pacchetti e condivisioni",
    description: "Pacchetti pronti e aggiornamenti sui link condivisi.",
  },
  {
    name: "systemNotificationsEnabled",
    title: "Aggiornamenti di sistema",
    description: "Informazioni operative sul funzionamento del servizio.",
  },
] as const;

function formatDate(value?: string | null) {
  if (!value) return "Mai";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NotificationEmailPreferencesPanel() {
  const [preference, setPreference] = useState<NotificationPreferenceResponse | null>(null);
  const [deliveries, setDeliveries] = useState<NotificationEmailDeliveryListResponse["deliveries"]>([]);
  const [digestEnabled, setDigestEnabled] = useState(false);
  const [digestFrequency, setDigestFrequency] = useState<EmailDigestFrequency>("OFF");
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

      const nextPreference = await preferenceResponse.json() as NotificationPreferenceResponse;
      const deliveryData = await deliveriesResponse.json() as NotificationEmailDeliveryListResponse;
      setPreference(nextPreference);
      setDigestEnabled(nextPreference.emailDigestEnabled && nextPreference.emailDigestFrequency !== "OFF");
      setDigestFrequency(nextPreference.emailDigestFrequency);
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

  function updateDigestEnabled(enabled: boolean) {
    setDigestEnabled(enabled);
    setDigestFrequency((current) => enabled && current === "OFF" ? "DAILY" : enabled ? current : "OFF");
  }

  function updateDigestFrequency(frequency: EmailDigestFrequency) {
    setDigestFrequency(frequency);
    setDigestEnabled(frequency !== "OFF");
  }

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
      setDigestEnabled(response.preference.emailDigestEnabled && response.preference.emailDigestFrequency !== "OFF");
      setDigestFrequency(response.preference.emailDigestFrequency);
      setMessage("Preferenze email salvate.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Salvataggio preferenze non riuscito.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className={styles.root}>
      <p className={styles.dataBoundary}>
        Le email riepilogano solo dati registrati in Qoovex. Non includono file, allegati o link di download.
      </p>

      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      {message ? <Alert variant="success"><AlertDescription>{message}</AlertDescription></Alert> : null}
      {pending === "load" && !preference ? <div aria-live="polite" className="flex items-center gap-2 text-sm text-muted-foreground"><Spinner /> Caricamento preferenze email</div> : null}

      {preference ? (
        <form className={styles.form} onSubmit={submit}>
          <label className={styles.activationRow}>
            <Checkbox
              checked={digestEnabled}
              disabled={pending !== null}
              name="emailDigestEnabled"
              onCheckedChange={(checked) => updateDigestEnabled(checked)}
            />
            <span className={styles.optionCopy}>
              <strong>Digest email attivo</strong>
              <span>Ricevi un unico riepilogo secondo la frequenza scelta.</span>
            </span>
          </label>

          <fieldset className={styles.scheduleGroup}>
            <legend>Programmazione</legend>
            <div className={styles.scheduleGrid}>
              <Field><FieldLabel htmlFor="email-digest-frequency">Frequenza digest</FieldLabel>
                <Select items={Object.entries(frequencyLabels).map(([value, label]) => ({ value: value as EmailDigestFrequency, label }))} name="emailDigestFrequency" onValueChange={(value) => updateDigestFrequency(value as EmailDigestFrequency)} value={digestFrequency}>
                  <SelectTrigger disabled={pending !== null} id="email-digest-frequency"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectGroup>{(Object.keys(frequencyLabels) as EmailDigestFrequency[]).map((frequency) => <SelectItem key={frequency} value={frequency}>{frequencyLabels[frequency]}</SelectItem>)}</SelectGroup></SelectContent>
                </Select>
              </Field>
              <Field><FieldLabel htmlFor="email-digest-hour">Ora digest</FieldLabel>
                <Input
                  defaultValue={preference.emailDigestHour}
                  disabled={pending !== null || !digestEnabled}
                  id="email-digest-hour"
                  inputMode="numeric"
                  max={23}
                  min={0}
                  name="emailDigestHour"
                  type="number"
                />
                <FieldDescription>Ora locale, da 0 a 23.</FieldDescription>
              </Field>
            </div>
            <p className={styles.lastDelivery}>Ultimo digest inviato: <strong>{formatDate(preference.lastDigestSentAt)}</strong></p>
          </fieldset>

          <fieldset className={styles.includedGroup}>
            <legend>Contenuti del digest</legend>
            <p className={styles.groupDescription}>Scegli quali aggiornamenti includere nel prossimo riepilogo.</p>
            <div className={styles.optionList}>
              {digestOptions.map((option) => (
                <label className={styles.optionRow} key={option.name}>
                  <Checkbox
                    defaultChecked={preference[option.name]}
                    disabled={pending !== null}
                    name={option.name}
                  />
                  <span className={styles.optionCopy}>
                    <strong>{option.title}</strong>
                    <span>{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.formTerminal}>
            <Button disabled={pending !== null} type="submit">
              {pending === "save" ? "Salvataggio in corso..." : "Salva preferenze email"}
            </Button>
          </div>
        </form>
      ) : null}

      {preference ? (
        <section aria-labelledby="recent-email-deliveries" className={styles.recentDeliveries}>
          <div className={styles.sectionHeading}>
            <h3 id="recent-email-deliveries">Invii recenti</h3>
            <p>Esito e momento degli ultimi riepiloghi inviati al tuo account.</p>
          </div>
          {!deliveries.length ? (
            <p className={styles.emptyDeliveries}>Nessun invio email registrato per il tuo account.</p>
          ) : (
            <ul className={styles.deliveryList}>
              {deliveries.map((delivery) => (
                <li className={styles.deliveryRow} key={delivery.id}>
                  <div>
                    <strong>{deliveryTypeLabels[delivery.type]}</strong>
                    <span>{deliveryStatusLabels[delivery.status]} · {delivery.notificationCount} notifiche</span>
                  </div>
                  <small>{formatDate(delivery.sentAt ?? delivery.createdAt)}{delivery.errorCode ? ` · ${delivery.errorCode}` : ""}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
