"use client";

import { useState } from "react";
import { IconBriefcase, IconBuilding, IconHome } from "@tabler/icons-react";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardContent } from "@qoovex/ui/components/card";
import type { AccountRole } from "@qoovex/types";
import { AuthPageShell, AuthStage } from "../auth/AuthPageShell";

const choices: Array<{ role: AccountRole; label: string; description: string; icon: typeof IconBuilding }> = [
  { role: "BUSINESS", label: "Azienda", description: "Crea la tua Azienda e i suoi cantieri.", icon: IconBuilding },
  { role: "PROFESSIONAL", label: "Professionista", description: "Accedi solo tramite invito Collaborator.", icon: IconBriefcase },
  { role: "CLIENT", label: "Cliente", description: "Accedi solo ai cantieri a cui sei invitato.", icon: IconHome },
];

export function AccountRoleSelectionView({ returnTo }: { returnTo: string }) {
  const [pending, setPending] = useState<AccountRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function selectRole(role: AccountRole) {
    setPending(role);
    setError(null);
    try {
      const response = await fetch("/api/account/role", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      const payload = await response.json() as { error?: { message?: string } };
      if (!response.ok) throw new Error(payload.error?.message ?? "Impossibile salvare la scelta.");
      window.location.assign(returnTo);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossibile salvare la scelta.");
      setPending(null);
    }
  }

  return (
    <AuthPageShell
      title="Come userai Qoovex?"
      titleId="account-role-title"
      kicker="Account Qoovex"
      description={<p>Questa scelta definisce il modo in cui puoi entrare nel workspace. Non potra essere modificata in seguito.</p>}
    >
      <AuthStage>
        <div className="grid gap-3">
          {choices.map(({ role, label, description, icon: Icon }) => (
            <Card key={role} className="border-border/70">
              <CardContent className="flex items-center gap-3 p-4">
                <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
                <div className="min-w-0 flex-1"><h2 className="font-medium">{label}</h2><p className="text-sm text-muted-foreground">{description}</p></div>
                <Button disabled={pending !== null} onClick={() => void selectRole(role)}>{pending === role ? "Salvataggio…" : "Scegli"}</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {error ? <p className="mt-3 text-sm text-destructive" role="alert">{error}</p> : null}
      </AuthStage>
    </AuthPageShell>
  );
}
