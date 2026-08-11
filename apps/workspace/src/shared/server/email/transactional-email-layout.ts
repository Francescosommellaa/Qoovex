import "server-only";

import { buildAbsoluteWorkspaceUrl } from "../workspace-url-service";
import { transactionalEmailTokens as t } from "./transactional-email-tokens";

export interface EmailPrimaryAction {
  label: string;
  href: string;
}

export interface EmailNotificationItem {
  title: string;
  message: string;
  severity: "INFO" | "ATTENTION" | "WARNING";
  createdAt: Date;
}

export interface TransactionalEmailLayoutInput {
  title: string;
  intro: string;
  preheader: string;
  code?: string;
  primaryAction?: EmailPrimaryAction;
  expiryNote?: string;
  secondaryNote: string;
  notificationItems?: EmailNotificationItem[];
  notificationsUrl?: string | null;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getNotificationSeverityLabel(severity: EmailNotificationItem["severity"]) {
  if (severity === "WARNING") return "Priorita alta";
  if (severity === "ATTENTION") return "Attenzione";
  return "Informazione";
}

function getNotificationSeverityColor(severity: EmailNotificationItem["severity"]) {
  if (severity === "WARNING") return t.severityWarning;
  if (severity === "ATTENTION") return t.severityAttention;
  return t.severityInfo;
}

function formatNotificationDate(value: Date) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Rome",
  }).format(value);
}

function renderBrandHeader(logoUrl: string) {
  return `<tr>
              <td style="padding:28px 28px 20px;border-bottom:1px solid ${t.cardBorder};">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding-right:10px;vertical-align:middle;">
                      <img src="${escapeHtml(logoUrl)}" alt="" width="28" height="28" style="display:block;border:0;border-radius:6px;" />
                    </td>
                    <td style="vertical-align:middle;font-family:${t.fontSans};font-size:15px;font-weight:600;letter-spacing:-0.02em;color:${t.foreground};">
                      Qoovex
                    </td>
                    <td style="padding-left:10px;vertical-align:middle;">
                      <span style="display:inline-block;padding:4px 8px;border:1px solid ${t.cardBorder};border-radius:999px;font-family:${t.fontSans};font-size:11px;font-weight:600;color:${t.muted};">
                        Workspace
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>`;
}

function renderPrimaryButton(action: EmailPrimaryAction) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:24px 0 8px;">
                  <tr>
                    <td style="border-radius:${t.radius};background:${t.buttonBackground};">
                      <a href="${escapeHtml(action.href)}" style="display:inline-block;padding:12px 20px;font-family:${t.fontSans};font-size:14px;font-weight:600;line-height:1;color:${t.buttonText};text-decoration:none;border-radius:${t.radius};">
                        ${escapeHtml(action.label)}
                      </a>
                    </td>
                  </tr>
                </table>`;
}

function renderOutlineButton(label: string, href: string) {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:20px 0 8px;">
                  <tr>
                    <td style="border:1px solid ${t.buttonOutlineBorder};border-radius:${t.radius};">
                      <a href="${escapeHtml(href)}" style="display:inline-block;padding:11px 18px;font-family:${t.fontSans};font-size:14px;font-weight:600;line-height:1;color:${t.buttonOutlineText};text-decoration:none;border-radius:${t.radius};">
                        ${escapeHtml(label)}
                      </a>
                    </td>
                  </tr>
                </table>`;
}

function renderCodeBlock(code: string) {
  return `<div style="margin:24px 0;padding:20px;border:1px solid ${t.cardBorder};border-radius:${t.radius};background:${t.inset};text-align:center;">
                  <div style="font-family:${t.fontSans};font-size:12px;font-weight:600;color:${t.muted};margin-bottom:8px;">Codice monouso</div>
                  <div style="font-family:${t.fontMono};font-size:32px;letter-spacing:0.35em;font-weight:700;color:${t.foreground};">${escapeHtml(code)}</div>
                </div>`;
}

function renderNotificationItems(items: EmailNotificationItem[]) {
  if (!items.length) return { html: "", text: "" };

  const html = `<ul style="margin:24px 0 0;padding:0;list-style:none;">${items.map((item) => `
                  <li style="margin:0 0 12px;padding:14px 16px;border:1px solid ${t.cardBorder};border-radius:${t.radiusLg};background:${t.inset};">
                    <div style="font-family:${t.fontSans};font-size:12px;font-weight:600;color:${getNotificationSeverityColor(item.severity)};margin-bottom:6px;">${escapeHtml(getNotificationSeverityLabel(item.severity))} · ${escapeHtml(formatNotificationDate(item.createdAt))}</div>
                    <div style="font-family:${t.fontSans};font-size:15px;color:${t.foreground};font-weight:700;margin-bottom:4px;line-height:1.35;">${escapeHtml(item.title)}</div>
                    <div style="font-family:${t.fontSans};font-size:14px;color:${t.muted};line-height:1.55;">${escapeHtml(item.message)}</div>
                  </li>`).join("")}
                </ul>`;

  const text = items
    .map((item) => `${getNotificationSeverityLabel(item.severity)} · ${formatNotificationDate(item.createdAt)}\n${item.title}\n${item.message}`)
    .join("\n\n");

  return { html, text };
}

function renderFooter() {
  return `<tr>
              <td style="padding:20px 28px 28px;border-top:1px solid ${t.cardBorder};font-family:${t.fontSans};font-size:12px;line-height:1.55;color:${t.secondary};">
                Qoovex — documenta un lavoro edile con chiarezza.<br />
                Questa email e transazionale. Se non l&apos;hai richiesta tu, ignora il messaggio.
              </td>
            </tr>`;
}

export function getTransactionalEmailLogoUrl() {
  return buildAbsoluteWorkspaceUrl("/brand/qoovex-workspace-icon.svg");
}

export function renderTransactionalEmailLayout(input: TransactionalEmailLayoutInput) {
  const logoUrl = getTransactionalEmailLogoUrl();
  const notificationDetails = input.notificationItems ? renderNotificationItems(input.notificationItems) : null;
  const primaryAction = input.primaryAction ? renderPrimaryButton(input.primaryAction) : "";
  const notificationsButton =
    input.notificationsUrl ? renderOutlineButton("Apri le notifiche nel workspace", input.notificationsUrl) : "";
  const codeBlock = input.code ? renderCodeBlock(input.code) : "";
  const expiryNote = input.expiryNote
    ? `<p style="margin:${input.code ? "0 0 20px" : "20px 0 0"};font-family:${t.fontSans};font-size:14px;line-height:1.55;color:${t.secondary};">${escapeHtml(input.expiryNote)}</p>`
    : "";
  const secondaryNote = `<p style="margin:${primaryAction || notificationsButton || notificationDetails?.html ? "16px 0 0" : "20px 0 0"};font-family:${t.fontSans};font-size:14px;line-height:1.55;color:${t.secondary};">${escapeHtml(input.secondaryNote)}</p>`;

  const html = `<!doctype html>
<html lang="it">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(input.title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${t.background};color:${t.foreground};font-family:${t.fontSans};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
      ${escapeHtml(input.preheader)}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:${t.background};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:${t.maxWidth};border:1px solid ${t.cardBorder};border-radius:${t.radiusLg};background:${t.card};overflow:hidden;">
            ${renderBrandHeader(logoUrl)}
            <tr>
              <td style="padding:28px;">
                <h1 style="margin:0 0 12px;font-family:${t.fontSans};font-size:28px;line-height:1.08;letter-spacing:-0.03em;font-weight:700;color:${t.foreground};">${escapeHtml(input.title)}</h1>
                <p style="margin:0;font-family:${t.fontSans};font-size:16px;line-height:1.6;color:${t.muted};">${escapeHtml(input.intro)}</p>
                ${codeBlock}
                ${expiryNote}
                ${notificationDetails?.html ?? ""}
                ${primaryAction}
                ${notificationsButton}
                ${secondaryNote}
              </td>
            </tr>
            ${renderFooter()}
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    "Qoovex Workspace",
    input.title,
    input.intro,
    input.code ? `Codice monouso: ${input.code}` : "",
    input.expiryNote ?? "",
    notificationDetails?.text ?? "",
    input.primaryAction ? `${input.primaryAction.label}: ${input.primaryAction.href}` : "",
    input.notificationsUrl ? `Notifiche: ${input.notificationsUrl}` : "",
    input.secondaryNote,
    "Qoovex — documenta un lavoro edile con chiarezza.",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { html, text, preheader: input.preheader };
}
