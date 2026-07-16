"use client";

import type { SupportContext } from "@qoovex/types";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Spinner } from "@qoovex/ui/components/spinner";
import styles from "./WorkspaceShell.module.css";

export function WorkspaceLogoutButton() {
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    await fetch("/api/dev-auth", { method: "DELETE" }).catch(() => null);
    await fetch("/api/account/mfa/session", { method: "DELETE" }).catch(() => null);
    await signOut({ redirect: false });
    window.location.assign("/sign-in");
  }
  return <Button className="w-full justify-start" disabled={loading} onClick={logout} type="button" variant="ghost">{loading ? <><Spinner data-icon="inline-start" /> Uscita</> : "Esci"}</Button>;
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
        {!sensitiveConfirmed ? <form action={elevateSession}><Field><FieldLabel htmlFor="support-mfa-code">Codice MFA</FieldLabel><Input autoComplete="one-time-code" id="support-mfa-code" inputMode="numeric" name="code" /></Field><Button disabled={loading} type="submit">Conferma</Button></form> : null}
        <Button disabled={loading} onClick={closeSession} type="button" variant="outline">{loading ? <><Spinner data-icon="inline-start" /> Chiusura</> : "Chiudi supporto"}</Button>
      </div>
      {error ? <p role="alert">{error}</p> : null}
    </aside>
  );
}
