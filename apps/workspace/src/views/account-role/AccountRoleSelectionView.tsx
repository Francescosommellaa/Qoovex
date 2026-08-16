"use client";

import { useState } from "react";
import { IconBriefcase, IconBuilding, IconHome } from "@tabler/icons-react";
import { Button } from "@qoovex/ui/components/button";
import { Card, CardContent } from "@qoovex/ui/components/card";
import type { AccountRole } from "@qoovex/types";
import { AuthPageShell, AuthStage } from "../auth/AuthPageShell";

interface AccountRoleChoice {
  access: string;
  description: string;
  icon: typeof IconBuilding;
  label: string;
  nextStep: string;
  role: AccountRole;
}

export const accountRoleChoices = [
  {
    role: "BUSINESS",
    label: "Azienda",
    description: "Per chi gestisce un’Azienda e i suoi lavori.",
    access: "Crei la tua Azienda e i cantieri che gestisce.",
    nextStep: "Se non hai ancora un’Azienda, completerai la sua configurazione.",
    icon: IconBuilding,
  },
  {
    role: "PROFESSIONAL",
    label: "Professionista",
    description: "Per collaboratori e professionisti che lavorano con un’Azienda su Qoovex.",
    access: "Un’Azienda deve invitarti come Collaboratore: dovrai aprire e accettare l’invito. Potrai usare soltanto i lavori e le funzioni inclusi nei permessi ricevuti.",
    nextStep: "Se hai già aperto un link di invito, tornerai all’invito; altrimenti vedrai la pagina di attesa.",
    icon: IconBriefcase,
  },
  {
    role: "CLIENT",
    label: "Cliente",
    description: "Per chi segue un lavoro affidato a un’Azienda.",
    access: "Entri soltanto nei cantieri a cui sei invitato come Cliente.",
    nextStep: "Se hai già aperto un link di invito, tornerai all’invito; altrimenti aprirai l’area Cliente.",
    icon: IconHome,
  },
] satisfies readonly AccountRoleChoice[];

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
      description={<p>Scegli il tipo di account adatto a te. Dopo la conferma non potrai cambiarlo.</p>}
    >
      <AuthStage>
        <div className="grid gap-3">
          {accountRoleChoices.map(({ role, label, description, access, nextStep, icon: Icon }) => (
            <Card key={role} className="border-border/70">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
                <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <h2 className="font-medium">{label}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div><dt className="font-medium">Come accedi</dt><dd className="text-muted-foreground">{access}</dd></div>
                    <div><dt className="font-medium">Dopo la scelta</dt><dd className="text-muted-foreground">{nextStep}</dd></div>
                  </dl>
                </div>
                <Button className="w-full shrink-0 sm:w-auto" disabled={pending !== null} onClick={() => void selectRole(role)}>
                  {pending === role ? "Salvataggio…" : `Scegli ${label}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {error ? <p className="mt-3 text-sm text-destructive" role="alert">{error}</p> : null}
      </AuthStage>
    </AuthPageShell>
  );
}
