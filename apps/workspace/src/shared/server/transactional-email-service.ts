import "server-only";

import {
  renderTransactionalEmailLayout,
  type EmailPrimaryAction,
  type TransactionalEmailLayoutInput,
} from "./email/transactional-email-layout";

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
      kind: "client-invitation";
      organizationName: string;
      jobSiteName: string;
      acceptUrl: string;
      expiresAt: Date;
    }
  | {
      kind: "export-ready";
      jobSiteName: string;
      accessUrl: string;
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

function formatSecurityDate(value: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  }).format(value);
}

function getAuthCodeCopy(purpose: AuthCodePurpose) {
  if (purpose === "MFA_ENROLLMENT") {
    return {
      subject: "Codice attivazione MFA Qoovex",
      title: "Attiva MFA",
      intro: "Usa questo codice per iniziare la configurazione MFA del tuo account Qoovex.",
      preheader: "Codice monouso per attivare l'autenticazione a due fattori.",
    };
  }

  if (purpose === "MFA_RECOVERY") {
    return {
      subject: "Codice recupero MFA Qoovex",
      title: "Recupera MFA",
      intro: "Usa questo codice per avviare il recupero MFA del tuo account Qoovex.",
      preheader: "Codice monouso per avviare il recupero MFA.",
    };
  }

  if (purpose === "PASSWORD_RESET") {
    return {
      subject: "Codice reset password Qoovex",
      title: "Reset password",
      intro: "Usa questo codice per impostare una nuova password Qoovex.",
      preheader: "Codice monouso per reimpostare la password.",
    };
  }

  if (purpose === "EMAIL_CHANGE") {
    return {
      subject: "Codice cambio email Qoovex",
      title: "Conferma nuova email",
      intro: "Usa questo codice per collegare questa email al tuo account Qoovex.",
      preheader: "Codice monouso per confermare la nuova email.",
    };
  }

  return {
    subject: "Codice verifica email Qoovex",
    title: "Verifica email",
    intro: "Usa questo codice per verificare la tua email e continuare.",
    preheader: "Codice monouso per verificare la tua email.",
  };
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
        preheader: "Conferma dell'aggiornamento email del tuo account.",
      };
    case "PASSWORD_CHANGED":
      return {
        subject: "Password Qoovex aggiornata",
        title: "Password aggiornata",
        intro: `La password del tuo account Qoovex e stata aggiornata il ${occurredAt}.`,
        preheader: "Conferma dell'aggiornamento password del tuo account.",
      };
    case "USERNAME_CHANGED":
      return {
        subject: "Username Qoovex aggiornato",
        title: "Username aggiornato",
        intro: `Il tuo username Qoovex e stato modificato il ${occurredAt}.`,
        preheader: "Conferma della modifica username del tuo account.",
      };
    case "MFA_ENABLED":
      return {
        subject: "A2F Qoovex attivata",
        title: "A2F attivata",
        intro: `L'autenticazione a due fattori e stata attivata il ${occurredAt}.`,
        preheader: "Conferma dell'attivazione dell'autenticazione a due fattori.",
      };
    case "MFA_DISABLED":
      return {
        subject: "A2F Qoovex disattivata",
        title: "A2F disattivata",
        intro: `L'autenticazione a due fattori e stata disattivata il ${occurredAt}.`,
        preheader: "Conferma della disattivazione dell'autenticazione a due fattori.",
      };
    case "MFA_REPLACED":
      return {
        subject: "MFA Qoovex sostituita",
        title: "MFA sostituita",
        intro: `Il fattore MFA del tuo account Qoovex e stato sostituito il ${occurredAt}.`,
        preheader: "Conferma della sostituzione del fattore MFA.",
      };
    case "MFA_BACKUP_CODES_REGENERATED":
      return {
        subject: "Nuovi codici di recupero MFA Qoovex",
        title: "Codici di recupero rigenerati",
        intro: `I codici di recupero MFA sono stati rigenerati il ${occurredAt}.`,
        preheader: "Conferma della rigenerazione dei codici di recupero MFA.",
      };
    case "MFA_RECOVERY_APPROVED":
      return {
        subject: "Recupero MFA Qoovex approvato",
        title: "Recupero MFA approvato",
        intro: `La richiesta di recupero MFA e stata approvata il ${occurredAt}. Accedi per configurare un nuovo fattore.`,
        preheader: "La richiesta di recupero MFA e stata approvata.",
      };
    case "MFA_RECOVERY_DENIED":
      return {
        subject: "Recupero MFA Qoovex rifiutato",
        title: "Recupero MFA rifiutato",
        intro: `La richiesta di recupero MFA e stata rifiutata il ${occurredAt}.`,
        preheader: "La richiesta di recupero MFA e stata rifiutata.",
      };
    case "NEW_DEVICE":
      return {
        subject: "Nuovo accesso a Qoovex",
        title: "Nuovo dispositivo rilevato",
        intro: `Abbiamo rilevato un accesso da ${deviceLabel} il ${occurredAt}.`,
        preheader: "Nuovo accesso rilevato sul tuo account Qoovex.",
      };
  }
}

function getOrganizationName(template: { organizationName?: string }) {
  return template.organizationName ?? "Qoovex";
}

function getSecondaryNote(template: TransactionalEmailTemplate) {
  if (template.kind === "auth-code") {
    return "Il codice scade tra 10 minuti e puo essere usato una sola volta.";
  }
  if (template.kind === "notification-digest" || template.kind === "notification-single") {
    return "Le informazioni dipendono dai dati registrati in Qoovex e vanno confermate con il referente autorizzato dell'azienda. L'email non include file o link di download.";
  }
  if (template.kind === "mfa-recovery-request") {
    return "Approva solo se riconosci la richiesta. La decisione richiede il tuo fattore MFA corrente.";
  }
  if (template.kind === "mfa-recovery-decision") {
    return "La prima decisione valida chiude la richiesta per tutti gli OWNER.";
  }
  return "Se non riconosci questa attivita, cambia password e controlla la sicurezza del tuo account.";
}

function buildEmailContent(template: TransactionalEmailTemplate): {
  subject: string;
  layout: TransactionalEmailLayoutInput;
} {
  if (template.kind === "auth-code") {
    const copy = getAuthCodeCopy(template.purpose);
    return {
      subject: copy.subject,
      layout: {
        title: copy.title,
        intro: copy.intro,
        preheader: copy.preheader,
        code: template.code,
        secondaryNote: getSecondaryNote(template),
      },
    };
  }

  if (template.kind === "security-event") {
    const copy = getSecurityCopy(template);
    return {
      subject: copy.subject,
      layout: {
        title: copy.title,
        intro: copy.intro,
        preheader: copy.preheader,
        secondaryNote: getSecondaryNote(template),
      },
    };
  }

  if (template.kind === "organization-invitation") {
    const organizationName = getOrganizationName(template);
    return {
      subject: `Invito a ${organizationName}`,
      layout: {
        title: "Invito all'azienda",
        intro: `Sei stato invitato a collaborare in ${organizationName} su Qoovex Workspace.`,
        preheader: `Invito a collaborare in ${organizationName}.`,
        primaryAction: { label: "Accetta invito", href: template.acceptUrl },
        expiryNote: `Il link scade il ${formatSecurityDate(template.expiresAt)}.`,
        secondaryNote: getSecondaryNote(template),
      },
    };
  }

  if (template.kind === "client-invitation") {
    return {
      subject: `${template.organizationName} ti ha invitato su Qoovex`,
      layout: {
        title: "Invito al cantiere",
        intro: `${template.organizationName} ti ha invitato a partecipare al cantiere ${template.jobSiteName}.`,
        preheader: `Invito al cantiere ${template.jobSiteName}.`,
        primaryAction: { label: "Accetta invito", href: template.acceptUrl },
        expiryNote: `Il link scade il ${formatSecurityDate(template.expiresAt)}.`,
        secondaryNote: getSecondaryNote(template),
      },
    };
  }

  if (template.kind === "export-ready") {
    return {
      subject: `Export Qoovex pronto - ${template.jobSiteName}`,
      layout: {
        title: "Export pronto",
        intro: `L'archivio del cantiere ${template.jobSiteName} e pronto per il download.`,
        preheader: `Export pronto per ${template.jobSiteName}.`,
        primaryAction: { label: "Scarica export", href: template.accessUrl },
        expiryNote: `Il link scade il ${formatSecurityDate(template.expiresAt)}. L'archivio non e allegato a questa email.`,
        secondaryNote: getSecondaryNote(template),
      },
    };
  }

  if (template.kind === "notification-digest") {
    return {
      subject: "Qoovex - Attivita da controllare",
      layout: {
        title: "Attivita da controllare",
        intro: `${template.unreadCount} notifiche non lette da controllare nel workspace Qoovex.`,
        preheader: `${template.unreadCount} notifiche da controllare nel workspace.`,
        notificationItems: template.items,
        notificationsUrl: template.notificationsUrl,
        secondaryNote: getSecondaryNote(template),
      },
    };
  }

  if (template.kind === "notification-single") {
    return {
      subject: "Qoovex - Elementi da controllare",
      layout: {
        title: template.item.title,
        intro: template.item.message,
        preheader: template.item.title,
        notificationItems: [template.item],
        notificationsUrl: template.notificationsUrl,
        secondaryNote: getSecondaryNote(template),
      },
    };
  }

  if (template.kind === "mfa-recovery-request") {
    return {
      subject: `Richiesta recupero MFA - ${template.organizationName}`,
      layout: {
        title: "Recupero MFA da approvare",
        intro: `${template.requesterEmail} ha verificato la propria email e chiede di sostituire il fattore MFA.`,
        preheader: `Richiesta recupero MFA da ${template.requesterEmail}.`,
        primaryAction: { label: "Gestisci richiesta", href: template.actionUrl },
        expiryNote: `La richiesta scade il ${formatSecurityDate(template.expiresAt)}.`,
        secondaryNote: getSecondaryNote(template),
      },
    };
  }

  if (template.kind === "mfa-recovery-decision") {
    const approved = template.decision === "approved";
    return {
      subject: `Recupero MFA ${approved ? "approvato" : "rifiutato"} - ${template.organizationName}`,
      layout: {
        title: `Recupero MFA ${approved ? "approvato" : "rifiutato"}`,
        intro: `La richiesta di ${template.requesterEmail} e stata ${approved ? "approvata" : "rifiutata"}.`,
        preheader: `Recupero MFA ${approved ? "approvato" : "rifiutato"} per ${template.organizationName}.`,
        secondaryNote: getSecondaryNote(template),
      },
    };
  }

  const opened = template.kind === "support-opened";
  const organizationName = getOrganizationName(template);
  return {
    subject: `Supporto Qoovex ${opened ? "avviato" : "terminato"} - ${organizationName}`,
    layout: {
      title: `Supporto ${opened ? "attivo" : "terminato"}`,
      intro: `${template.employeeEmail} ha ${opened ? "aperto" : "chiuso"} una sessione di supporto il ${formatSecurityDate(template.occurredAt)}. Motivo: ${template.reason}`,
      preheader: `Sessione di supporto ${opened ? "avviata" : "terminata"} per ${organizationName}.`,
      secondaryNote: getSecondaryNote(template),
    },
  };
}

function renderEmail(input: { template: TransactionalEmailTemplate }) {
  const content = buildEmailContent(input.template);
  const rendered = renderTransactionalEmailLayout(content.layout);
  return { subject: content.subject, html: rendered.html, text: rendered.text };
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
  const rendered = renderEmail({ template: input.template });

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

export { buildEmailContent, renderEmail, type EmailPrimaryAction };
