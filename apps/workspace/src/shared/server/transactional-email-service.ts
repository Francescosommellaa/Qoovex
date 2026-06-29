import "server-only";

type AuthCodePurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "EMAIL_CHANGE";
export type SecurityEmailEvent =
  | "EMAIL_CHANGED"
  | "PASSWORD_CHANGED"
  | "USERNAME_CHANGED"
  | "MFA_ENABLED"
  | "MFA_DISABLED"
  | "NEW_DEVICE";

type InviteRole = "ADMIN" | "SAFETY_CONSULTANT" | "SITE_MANAGER" | "WORKER" | "VIEWER";

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
      kind: "organization-invitation" | "structure-invitation";
      organizationName?: string;
      structureName?: string;
      role: InviteRole;
      acceptUrl: string;
      expiresAt: Date;
    }
  | {
      kind: "support-opened" | "support-closed";
      organizationName?: string;
      structureName?: string;
      employeeEmail: string;
      reason: string;
      occurredAt: Date;
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
    case "NEW_DEVICE":
      return {
        subject: "Nuovo accesso a Qoovex",
        title: "Nuovo dispositivo rilevato",
        intro: `Abbiamo rilevato un accesso da ${deviceLabel} il ${occurredAt}.`,
      };
  }
}

function getOrganizationName(template: { organizationName?: string; structureName?: string }) {
  return template.organizationName ?? template.structureName ?? "Qoovex";
}

function renderEmail(input: { to: string; template: TransactionalEmailTemplate }) {
  const copy = (() => {
    if (input.template.kind === "auth-code") return getAuthCodeCopy(input.template.purpose, input.template.code);
    if (input.template.kind === "security-event") return getSecurityCopy(input.template);
    if (input.template.kind === "organization-invitation" || input.template.kind === "structure-invitation") {
      const organizationName = getOrganizationName(input.template);
      return {
        subject: `Invito a ${organizationName}`,
        title: "Invito all'azienda",
        intro: `Sei stato invitato a collaborare in ${organizationName}. Apri ${input.template.acceptUrl} entro ${formatSecurityDate(input.template.expiresAt)}.`,
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
  const secondary =
    input.template.kind === "auth-code"
      ? "Scade tra 10 minuti e puo essere usato una sola volta."
      : "Se non riconosci questa attivita, cambia password e controlla la sicurezza del tuo account.";

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
    secondary,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { subject: copy.subject, html, text };
}

export async function sendTransactionalEmail(input: {
  to: string;
  template: TransactionalEmailTemplate;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  const replyTo = process.env.RESEND_REPLY_TO_EMAIL?.trim();
  const rendered = renderEmail(input);

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`[email] ${rendered.subject} -> ${input.to}\n${rendered.text}`);
      return;
    }

    throw new TransactionalEmailError("Email transazionali non configurate.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
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
}
