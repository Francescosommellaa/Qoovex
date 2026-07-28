import "server-only";

type AuthCodePurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "EMAIL_CHANGE" | "MFA_ENROLLMENT" | "MFA_RECOVERY";
export type SecurityEmailEvent =
  | "EMAIL_CHANGED"
  | "PASSWORD_CHANGED"
  | "USERNAME_CHANGED"
  | "MFA_ENABLED"
  | "MFA_DISABLED"
  | "MFA_REPLACED"
  | "MFA_BACKUP_CODES_REGENERATED"
  | "MFA_RECOVERY_APPROVED"
  | "MFA_RECOVERY_DENIED"
  | "NEW_DEVICE";

type InviteRole = "COLLABORATOR";

export interface NotificationEmailItem {
  title: string;
  message: string;
  severity: "INFO" | "ATTENTION" | "WARNING";
  createdAt: Date;
}

export type TransactionalEmailTemplate =
  | {
      kind: "auth-code";
      purpose: AuthCodePurpose;
      code: string;
    }
  | {
      kind: "security-event";
      event: SecurityEmailEvent;
      deviceLabel?: string | null;
      occurredAt?: Date;
    }
  | {
      kind: "organization-invitation";
      organizationName?: string;
      role: InviteRole;
      acceptUrl: string;
      expiresAt: Date;
    }
  | {
      kind: "support-opened" | "support-closed";
      organizationName?: string;
      employeeEmail: string;
      reason: string;
      occurredAt: Date;
    }
  | {
      kind: "mfa-recovery-request";
      requesterEmail: string;
      organizationName: string;
      actionUrl: string;
      expiresAt: Date;
    }
  | {
      kind: "mfa-recovery-decision";
      requesterEmail: string;
      organizationName: string;
      decision: "approved" | "denied";
    }
  | {
      kind: "notification-digest";
      unreadCount: number;
      items: NotificationEmailItem[];
      notificationsUrl?: string | null;
    }
  | {
      kind: "notification-single";
      item: NotificationEmailItem;
      notificationsUrl?: string | null;
    };

export class TransactionalEmailError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TransactionalEmailError";
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getAuthCodeCopy(purpose: AuthCodePurpose, code: string) {
  if (purpose === "MFA_ENROLLMENT") {
    return {
      subject: "Codice attivazione MFA Qoovex",
      title: "Attiva MFA",
      intro: "Usa questo codice per iniziare la configurazione MFA del tuo account Qoovex.",
      code,
    };
  }

  if (purpose === "MFA_RECOVERY") {
    return {
      subject: "Codice recupero MFA Qoovex",
      title: "Recupera MFA",
      intro: "Usa questo codice per avviare il recupero MFA del tuo account Qoovex.",
      code,
    };
  }

  if (purpose === "PASSWORD_RESET") {
    return {
      subject: "Codice reset password Qoovex",
      title: "Reset password",
      intro: "Usa questo codice per impostare una nuova password Qoovex.",
      code,
    };
  }

  if (purpose === "EMAIL_CHANGE") {
    return {
      subject: "Codice cambio email Qoovex",
      title: "Conferma nuova email",
      intro: "Usa questo codice per collegare questa email al tuo account Qoovex.",
      code,
    };
  }

  return {
    subject: "Codice verifica email Qoovex",
    title: "Verifica email",
    intro: "Usa questo codice per verificare la tua email e continuare.",
    code,
  };
}

function formatSecurityDate(value: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  }).format(value);
}

function getSecurityCopy(template: Extract<TransactionalEmailTemplate, { kind: "security-event" }>) {
  const occurredAt = formatSecurityDate(template.occurredAt ?? new Date());
  const deviceLabel = template.deviceLabel?.trim() || "un nuovo dispositivo";

  switch (template.event) {
    case "EMAIL_CHANGED":
      return {
        subject: "Email account Qoovex aggiornata",
        title: "Email aggiornata",
        intro: `La email del tuo account Qoovex e stata aggiornata il ${occurredAt}.`,
      };
    case "PASSWORD_CHANGED":
      return {
        subject: "Password Qoovex aggiornata",
        title: "Password aggiornata",
        intro: `La password del tuo account Qoovex e stata aggiornata il ${occurredAt}.`,
      };
    case "USERNAME_CHANGED":
      return {
        subject: "Username Qoovex aggiornato",
        title: "Username aggiornato",
        intro: `Il tuo username Qoovex e stato modificato il ${occurredAt}.`,
      };
    case "MFA_ENABLED":
      return {
        subject: "A2F Qoovex attivata",
        title: "A2F attivata",
        intro: `L'autenticazione a due fattori e stata attivata il ${occurredAt}.`,
      };
    case "MFA_DISABLED":
      return {
        subject: "A2F Qoovex disattivata",
        title: "A2F disattivata",
        intro: `L'autenticazione a due fattori e stata disattivata il ${occurredAt}.`,
      };
    case "MFA_REPLACED":
      return {
        subject: "MFA Qoovex sostituita",
        title: "MFA sostituita",
        intro: `Il fattore MFA del tuo account Qoovex e stato sostituito il ${occurredAt}.`,
      };
    case "MFA_BACKUP_CODES_REGENERATED":
      return {
        subject: "Nuovi codici di recupero MFA Qoovex",
        title: "Codici di recupero rigenerati",
        intro: `I codici di recupero MFA sono stati rigenerati il ${occurredAt}.`,
      };
    case "MFA_RECOVERY_APPROVED":
      return {
        subject: "Recupero MFA Qoovex approvato",
        title: "Recupero MFA approvato",
        intro: `La richiesta di recupero MFA e stata approvata il ${occurredAt}. Accedi per configurare un nuovo fattore.`,
      };
    case "MFA_RECOVERY_DENIED":
      return {
        subject: "Recupero MFA Qoovex rifiutato",
        title: "Recupero MFA rifiutato",
        intro: `La richiesta di recupero MFA e stata rifiutata il ${occurredAt}.`,
      };
    case "NEW_DEVICE":
      return {
        subject: "Nuovo accesso a Qoovex",
        title: "Nuovo dispositivo rilevato",
        intro: `Abbiamo rilevato un accesso da ${deviceLabel} il ${occurredAt}.`,
      };
  }
}

function getOrganizationName(template: { organizationName?: string }) {
  return template.organizationName ?? "Qoovex";
}

function getNotificationSeverityLabel(severity: NotificationEmailItem["severity"]) {
  if (severity === "WARNING") return "Priorita alta";
  if (severity === "ATTENTION") return "Attenzione";
  return "Informazione";
}

function formatNotificationDate(value: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  }).format(value);
}

function renderNotificationItems(items: NotificationEmailItem[]) {
  const html = items.length
    ? `<ul style="margin:20px 0 0;padding:0;list-style:none;">${items.map((item) => `
                  <li style="margin:0 0 12px;padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:12px;background:#171a21;">
                    <div style="font-size:12px;color:#9ca3af;margin-bottom:6px;">${escapeHtml(getNotificationSeverityLabel(item.severity))} - ${escapeHtml(formatNotificationDate(item.createdAt))}</div>
                    <div style="font-size:15px;color:#ffffff;font-weight:700;margin-bottom:4px;">${escapeHtml(item.title)}</div>
                    <div style="font-size:14px;color:#cbd5e1;line-height:1.5;">${escapeHtml(item.message)}</div>
                  </li>`).join("")}
                </ul>`
    : "";
  const text = items.map((item) => `${getNotificationSeverityLabel(item.severity)} - ${formatNotificationDate(item.createdAt)}\n${item.title}\n${item.message}`).join("\n\n");
  return { html, text };
}

function renderEmail(input: { to: string; template: TransactionalEmailTemplate }) {
  const copy = (() => {
    if (input.template.kind === "auth-code") return getAuthCodeCopy(input.template.purpose, input.template.code);
    if (input.template.kind === "security-event") return getSecurityCopy(input.template);
    if (input.template.kind === "organization-invitation") {
      const organizationName = getOrganizationName(input.template);
      return {
        subject: `Invito a ${organizationName}`,
        title: "Invito all'azienda",
        intro: `Sei stato invitato a collaborare in ${organizationName}. Apri ${input.template.acceptUrl} entro ${formatSecurityDate(input.template.expiresAt)}.`,
      };
    }
    if (input.template.kind === "notification-digest") {
      return {
        subject: "Qoovex - Promemoria documenti e scadenze",
        title: "Elementi da controllare",
        intro: `${input.template.unreadCount} notifiche non lette da controllare nel workspace Qoovex.`,
      };
    }
    if (input.template.kind === "notification-single") {
      return {
        subject: "Qoovex - Elementi da controllare",
        title: input.template.item.title,
        intro: input.template.item.message,
      };
    }
    if (input.template.kind === "mfa-recovery-request") {
      return {
        subject: `Richiesta recupero MFA - ${input.template.organizationName}`,
        title: "Recupero MFA da approvare",
        intro: `${input.template.requesterEmail} ha verificato la propria email e chiede di sostituire il fattore MFA. Apri ${input.template.actionUrl} entro ${formatSecurityDate(input.template.expiresAt)}.`,
      };
    }
    if (input.template.kind === "mfa-recovery-decision") {
      const approved = input.template.decision === "approved";
      return {
        subject: `Recupero MFA ${approved ? "approvato" : "rifiutato"} - ${input.template.organizationName}`,
        title: `Recupero MFA ${approved ? "approvato" : "rifiutato"}`,
        intro: `La richiesta di ${input.template.requesterEmail} e stata ${approved ? "approvata" : "rifiutata"}.`,
      };
    }
    const template = input.template as Extract<TransactionalEmailTemplate, { kind: "support-opened" | "support-closed" }>;
    const opened = template.kind === "support-opened";
    const organizationName = getOrganizationName(template);
    return {
      subject: `Supporto Qoovex ${opened ? "avviato" : "terminato"} - ${organizationName}`,
      title: `Supporto ${opened ? "attivo" : "terminato"}`,
      intro: `${template.employeeEmail} ha ${opened ? "aperto" : "chiuso"} una sessione di supporto il ${formatSecurityDate(template.occurredAt)}. Motivo: ${template.reason}`,
    };
  })();

  const codeBlock =
    input.template.kind === "auth-code"
      ? `<div style="font-size:32px;letter-spacing:8px;font-weight:700;margin:24px 0;color:#ffffff;">${escapeHtml(input.template.code)}</div>`
      : "";
  const notificationDetails =
    input.template.kind === "notification-digest"
      ? renderNotificationItems(input.template.items)
      : input.template.kind === "notification-single"
        ? renderNotificationItems([input.template.item])
        : null;
  const notificationsLink =
    (input.template.kind === "notification-digest" || input.template.kind === "notification-single") && input.template.notificationsUrl
      ? `<p style="margin:20px 0 0;"><a style="color:#7dd3fc;" href="${escapeHtml(input.template.notificationsUrl)}">Apri le notifiche nel workspace</a></p>`
      : "";
  const secondary = (() => {
    if (input.template.kind === "auth-code") return "Scade tra 10 minuti e puo essere usato una sola volta.";
    if (input.template.kind === "notification-digest" || input.template.kind === "notification-single") {
      return "Le informazioni dipendono dai dati registrati in Qoovex e vanno confermate con il responsabile o consulente. L'email non include file o link di download.";
    }
    if (input.template.kind === "mfa-recovery-request") return "Approva solo se riconosci la richiesta. La decisione richiede il tuo fattore MFA corrente.";
    if (input.template.kind === "mfa-recovery-decision") return "La prima decisione valida chiude la richiesta per tutti gli OWNER.";
    return "Se non riconosci questa attivita, cambia password e controlla la sicurezza del tuo account.";
  })();

  const html = `<!doctype html>
<html lang="it">
  <body style="margin:0;background:#08090c;color:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#08090c;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border:1px solid rgba(255,255,255,.12);border-radius:18px;background:#101217;overflow:hidden;">
            <tr>
              <td style="padding:28px 28px 12px;font-size:14px;color:#9ca3af;">Qoovex</td>
            </tr>
            <tr>
              <td style="padding:0 28px 28px;">
                <h1 style="margin:0 0 12px;font-size:28px;line-height:1.15;color:#ffffff;">${escapeHtml(copy.title)}</h1>
                <p style="margin:0;color:#cbd5e1;font-size:16px;line-height:1.6;">${escapeHtml(copy.intro)}</p>
                ${codeBlock}
                ${notificationDetails?.html ?? ""}
                ${notificationsLink}
                <p style="margin:0;color:#94a3b8;font-size:14px;line-height:1.6;">${escapeHtml(secondary)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "Qoovex",
    copy.title,
    copy.intro,
    input.template.kind === "auth-code" ? `Codice: ${input.template.code}` : "",
    notificationDetails?.text ?? "",
    (input.template.kind === "notification-digest" || input.template.kind === "notification-single") && input.template.notificationsUrl
      ? `Notifiche: ${input.template.notificationsUrl}`
      : "",
    secondary,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { subject: copy.subject, html, text };
}

function getE2eEmailSink() {
  if (process.env.QOOVEX_E2E_MODE !== "1" || process.env.NODE_ENV === "production") return null;
  const rawUrl = process.env.QOOVEX_E2E_EMAIL_SINK_URL?.trim();
  const secret = process.env.QOOVEX_E2E_EMAIL_SINK_SECRET?.trim();
  if (!rawUrl || !secret) throw new TransactionalEmailError("Email sink E2E non configurato.");

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new TransactionalEmailError("Email sink E2E non valido.");
  }
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "::1"].includes(url.hostname)) {
    throw new TransactionalEmailError("Email sink E2E non consentito.");
  }
  return { url: url.toString(), secret };
}

async function sendToE2eEmailSink(input: {
  sink: { url: string; secret: string };
  to: string;
  template: TransactionalEmailTemplate;
  rendered: { subject: string; html: string; text: string };
  idempotencyKey?: string;
}) {
  const response = await fetch(input.sink.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.sink.secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: input.to,
      template: input.template,
      subject: input.rendered.subject,
      html: input.rendered.html,
      text: input.rendered.text,
      idempotencyKey: input.idempotencyKey ?? null,
    }),
  });
  if (!response.ok) throw new TransactionalEmailError("Email sink E2E non raggiungibile.");
  const payload = await response.json().catch(() => null) as { id?: unknown } | null;
  return { providerMessageId: typeof payload?.id === "string" ? payload.id : null };
}

export async function sendTransactionalEmail(input: {
  to: string;
  template: TransactionalEmailTemplate;
  idempotencyKey?: string;
}): Promise<{ providerMessageId: string | null }> {
  const sink = getE2eEmailSink();
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL?.trim();
  const rendered = renderEmail(input);

  if (sink) return sendToE2eEmailSink({ sink, ...input, rendered });

  if (!apiKey || !from) {
    throw new TransactionalEmailError("Email transazionali non configurate.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!response.ok) {
    throw new TransactionalEmailError("Invio email non riuscito.");
  }

  const payload = await response.json().catch(() => null) as { id?: unknown } | null;
  return { providerMessageId: typeof payload?.id === "string" ? payload.id : null };
}
