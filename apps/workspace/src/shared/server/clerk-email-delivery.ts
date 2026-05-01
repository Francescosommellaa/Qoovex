import "server-only";

import { Resend } from "resend";

interface ClerkEmailData {
  to_email_address?: string;
  email_address?: string;
  subject?: string;
  body?: string;
  html_body?: string;
  text_body?: string;
  otp_code?: string;
  action_url?: string;
  slug?: string;
}

function getString(data: Record<string, unknown>, key: keyof ClerkEmailData) {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getEmailRecipient(data: ClerkEmailData): string | undefined {
  return data.to_email_address ?? data.email_address;
}

function getEmailSubject(data: ClerkEmailData): string {
  if (data.subject) return data.subject;

  if (data.slug?.includes("reset")) return "Codice recupero password Qoovex";
  if (data.slug?.includes("verification")) return "Codice verifica Qoovex";
  if (data.slug?.includes("invitation")) return "Invito Qoovex";

  return "Comunicazione Qoovex";
}

function getEmailHtml(data: ClerkEmailData): string {
  if (data.html_body) return data.html_body;
  if (data.body) return data.body;

  const codeBlock = data.otp_code
    ? `<p style="font-size:24px;font-weight:700;letter-spacing:4px;">${data.otp_code}</p>`
    : "";
  const actionBlock = data.action_url
    ? `<p><a href="${data.action_url}">Continua su Qoovex</a></p>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;">
      <h1 style="font-size:20px;">Qoovex</h1>
      <p>Usa queste informazioni per completare l'operazione richiesta.</p>
      ${codeBlock}
      ${actionBlock}
      <p>Se non hai richiesto tu questa email, puoi ignorarla.</p>
    </div>
  `;
}

function getEmailText(data: ClerkEmailData): string {
  if (data.text_body) return data.text_body;

  const lines = [
    "Qoovex",
    "Usa queste informazioni per completare l'operazione richiesta.",
    data.otp_code ? `Codice: ${data.otp_code}` : undefined,
    data.action_url ? `Link: ${data.action_url}` : undefined,
    "Se non hai richiesto tu questa email, puoi ignorarla.",
  ];

  return lines.filter(Boolean).join("\n\n");
}

export async function sendClerkEmailWithResend(rawData: unknown) {
  if (typeof rawData !== "object" || rawData === null) {
    throw new Error("Invalid Clerk email payload");
  }

  const record = rawData as Record<string, unknown>;
  const emailData: ClerkEmailData = {
    to_email_address: getString(record, "to_email_address"),
    email_address: getString(record, "email_address"),
    subject: getString(record, "subject"),
    body: getString(record, "body"),
    html_body: getString(record, "html_body"),
    text_body: getString(record, "text_body"),
    otp_code: getString(record, "otp_code"),
    action_url: getString(record, "action_url"),
    slug: getString(record, "slug"),
  };

  const to = getEmailRecipient(emailData);
  if (!to) {
    throw new Error("Missing Clerk email recipient");
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY or RESEND_FROM_EMAIL is missing");
  }

  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to,
    subject: getEmailSubject(emailData),
    html: getEmailHtml(emailData),
    text: getEmailText(emailData),
    replyTo: process.env.RESEND_REPLY_TO_EMAIL,
  });

  if (result.error) {
    console.error("[clerk-email] Resend rejected email", {
      message: result.error.message,
      name: result.error.name,
      to,
      from,
      slug: emailData.slug,
    });

    throw new Error(result.error.message);
  }

  console.info("[clerk-email] Resend accepted email", {
    id: result.data?.id,
    to,
    from,
    slug: emailData.slug,
  });

  return result;
}
