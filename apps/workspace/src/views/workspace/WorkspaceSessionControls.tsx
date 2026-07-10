"use client";

import type { SupportContext } from "@qoovex/types";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./WorkspaceShell.module.css";

export function WorkspaceLogoutButton() {
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    await fetch("/api/dev-auth", { method: "DELETE" }).catch(() => null);
    await signOut({ redirect: false });
    window.location.assign("/sign-in");
  }
  return <button className={styles.navButton} disabled={loading} onClick={logout} type="button">{loading ? "Uscita" : "Esci"}</button>;
}

export function SupportSessionBanner({ support }: { support: SupportContext }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sensitiveConfirmed = Boolean(support.sensitiveConfirmedUntil && new Date(support.sensitiveConfirmedUntil) > new Date());

  async function elevateSession(formData: FormData) {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/support/sessions/elevate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: String(formData.get("code") ?? "") }),
    });
    setLoading(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string } | null;
      setError(body?.message ?? "Conferma MFA non disponibile.");
      return;
    }
    router.refresh();
  }
  async function closeSession() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/support/sessions", { method: "DELETE" });
    setLoading(false);
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { message?: string } | null;
      setError(body?.message ?? "Chiusura supporto non disponibile.");
      return;
    }
    router.push("/qoovex-admin");
    router.refresh();
  }
  return (
    <aside className={styles.supportBanner} aria-label="Sessione supporto attiva">
      <div><strong>Supporto: {support.organization.name}</strong><span>{support.organization.code} · fino alle {new Date(support.expiresAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</span><small>{support.reason}</small><small>{sensitiveConfirmed ? "Operazioni sensibili confermate" : "Operazioni sensibili da confermare con MFA"}</small></div>
      <div className={styles.supportActions}>
        {!sensitiveConfirmed ? <form action={elevateSession}><label htmlFor="support-mfa-code">Codice MFA</label><input autoComplete="one-time-code" id="support-mfa-code" inputMode="numeric" name="code" /><button disabled={loading} type="submit">Conferma</button></form> : null}
        <button disabled={loading} onClick={closeSession} type="button">{loading ? "Chiusura" : "Chiudi supporto"}</button>
      </div>
      {error ? <p role="alert">{error}</p> : null}
    </aside>
  );
}
