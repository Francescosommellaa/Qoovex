"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import type { OrganizationRole } from "@qoovex/types";
import { buildOrganizationInvitationPath } from "@shared/lib/workspace-link-routes";
import styles from "./AuthPages.module.css";

const roleLabels: Record<Exclude<OrganizationRole, "OWNER">, string> = {
  ADMIN: "Amministratore",
  SAFETY_CONSULTANT: "Consulente sicurezza",
  SITE_MANAGER: "Responsabile cantiere",
  WORKER: "Lavoratore",
};

function invitationCallbackUrl(token: string) {
  return buildOrganizationInvitationPath(token);
}

export function InvitationUnavailablePageView() {
  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby="invitation-unavailable-title">
        <p className={styles.brand}>Qoovex</p>
        <h1 id="invitation-unavailable-title">Invito non disponibile</h1>
        <p>Il link e scaduto, e gia stato usato oppure non e valido. Chiedi a chi ti ha invitato di generarne uno nuovo.</p>
        <div className={styles.actions}>
          <Link className={styles.secondaryLink} href="/sign-in">Vai all&apos;accesso</Link>
        </div>
      </section>
    </main>
  );
}

export function InvitationSignInPageView({ token, organizationName }: { token: string; organizationName: string }) {
  const callbackUrl = invitationCallbackUrl(token);
  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby="invitation-signin-title">
        <p className={styles.brand}>Qoovex</p>
        <h1 id="invitation-signin-title">Invito a {organizationName}</h1>
        <p>Accedi con l&apos;email che ha ricevuto l&apos;invito. Se non hai ancora un account, crealo con la stessa email.</p>
        <div className={styles.actions}>
          <Link className={styles.primaryButton} href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Accedi</Link>
          <Link className={styles.secondaryLink} href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Crea account</Link>
        </div>
      </section>
    </main>
  );
}

export function InvitationAcceptancePageView({
  token,
  organizationName,
  role,
  expiresAt,
}: {
  token: string;
  organizationName: string;
  role: Exclude<OrganizationRole, "OWNER">;
  expiresAt: string;
}) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/organization/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const body = await response.json().catch(() => null) as { message?: string } | null;
    if (!response.ok) {
      setLoading(false);
      setError(body?.message ?? "Accettazione dell'invito non riuscita.");
      return;
    }

    await signOut({ redirect: false }).catch(() => undefined);
    setLoading(false);
    setAccepted(true);
  }

  if (accepted) {
    return (
      <main className={styles.authPage}>
        <section className={styles.authCard} aria-labelledby="invitation-accepted-title">
          <p className={styles.brand}>Qoovex</p>
          <h1 id="invitation-accepted-title">Invito accettato</h1>
          <p className={styles.success} role="status">Ora fai parte di {organizationName}.</p>
          <p>Per applicare il nuovo accesso in modo sicuro, accedi di nuovo al workspace.</p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} href="/sign-in?callbackUrl=%2Fdashboard">Accedi al workspace</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard} aria-labelledby="invitation-title">
        <p className={styles.brand}>Qoovex</p>
        <h1 id="invitation-title">Accetta l&apos;invito</h1>
        <p>Stai entrando in <strong>{organizationName}</strong> con il ruolo {roleLabels[role]}.</p>
        <p className={styles.hint}>Il link scade il {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(expiresAt))}.</p>
        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        <div className={styles.actions}>
          <button className={styles.primaryButton} disabled={loading} onClick={accept} type="button">
            {loading ? "Accettazione in corso" : "Accetta e continua"}
          </button>
          <Link className={styles.secondaryLink} href="/dashboard">Non accettare</Link>
        </div>
      </section>
    </main>
  );
}
