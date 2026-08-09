"use client";

import type { SupportContext } from "@qoovex/types";
import { IconLogout } from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@qoovex/ui/components/button";
import { Field, FieldLabel } from "@qoovex/ui/components/field";
import { Input } from "@qoovex/ui/components/input";
import { Spinner } from "@qoovex/ui/components/spinner";

function useWorkspaceLogout() {
  const [loading, setLoading] = useState(false);
  async function logout() {
    setLoading(true);
    await fetch("/api/dev-auth", { method: "DELETE" }).catch(() => null);
    await fetch("/api/account/mfa/session", { method: "DELETE" }).catch(() => null);
    await signOut({ redirect: false });
    window.location.assign("/sign-in");
  }
  return { loading, logout };
}

export function WorkspaceLogoutButton() {
  const { loading, logout } = useWorkspaceLogout();
  return (
    <Button
      className="w-full justify-start group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center"
      disabled={loading}
      onClick={logout}
      type="button"
      variant="ghost"
      title="Esci"
    >
      {loading ? <Spinner data-icon="inline-start" /> : <IconLogout aria-hidden="true" />}
      <span className="group-data-[collapsible=icon]:hidden">{loading ? "Uscita" : "Esci"}</span>
    </Button>
  );
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
    <aside className="grid gap-3 border-b border-warning/40 bg-warning/15 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center" aria-label="Sessione supporto attiva">
      <div className="grid gap-0.5"><strong>Supporto: {support.organization.name}</strong><span className="text-sm text-muted-foreground">{support.organization.code} · fino alle {new Date(support.expiresAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}</span><small className="text-muted-foreground">{support.reason}</small><small className="text-muted-foreground">{sensitiveConfirmed ? "Operazioni sensibili confermate" : "Operazioni sensibili da confermare con MFA"}</small></div>
      <div className="flex flex-wrap items-end gap-2">
        {!sensitiveConfirmed ? <form action={elevateSession} className="flex flex-wrap items-end gap-2"><Field className="w-28"><FieldLabel htmlFor="support-mfa-code">Codice MFA</FieldLabel><Input autoComplete="one-time-code" id="support-mfa-code" inputMode="numeric" name="code" /></Field><Button disabled={loading} type="submit">Conferma</Button></form> : null}
        <Button disabled={loading} onClick={closeSession} type="button" variant="outline">{loading ? <><Spinner data-icon="inline-start" /> Chiusura</> : "Chiudi supporto"}</Button>
      </div>
      {error ? <p className="text-sm text-destructive lg:col-span-2" role="alert">{error}</p> : null}
    </aside>
  );
}
