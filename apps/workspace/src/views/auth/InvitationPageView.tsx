"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { IconAlertCircle, IconArrowRight, IconCircleCheck, IconClock, IconUserPlus } from "@tabler/icons-react";
import type { OrganizationRole } from "@qoovex/types";
import { Alert, AlertDescription } from "@qoovex/ui/components/alert";
import { Badge } from "@qoovex/ui/components/badge";
import { Button, buttonVariants } from "@qoovex/ui/components/button";
import { Spinner } from "@qoovex/ui/components/spinner";
import { cn } from "@qoovex/ui/lib/utils";
import { buildOrganizationInvitationPath } from "@shared/lib/workspace-link-routes";
import { AuthPageShell, AuthStage } from "./AuthPageShell";
import styles from "./AuthPages.module.css";

const roleLabels: Record<Exclude<OrganizationRole, "OWNER">, string> = {
  COLLABORATOR: "Collaboratore",
};

function invitationCallbackUrl(token: string) {
  return buildOrganizationInvitationPath(token);
}

export function InvitationUnavailablePageView() {
  return (
    <AuthPageShell
      description={<p>Il link è scaduto, è già stato usato oppure non è valido. Chiedi a chi ti ha invitato di generarne uno nuovo.</p>}
      kicker="Invito al workspace"
      title="Invito non disponibile"
      titleId="invitation-unavailable-title"
    >
      <AuthStage>
        <Alert variant="warning"><IconAlertCircle /><AlertDescription>Nessuna modifica è stata applicata al tuo account.</AlertDescription></Alert>
        <Link className={cn(buttonVariants({ variant: "outline" }), "mt-5 h-11 w-full")} href="/sign-in">Vai all’accesso</Link>
      </AuthStage>
    </AuthPageShell>
  );
}

export function InvitationSignInPageView({ token, organizationName }: { token: string; organizationName: string }) {
  const callbackUrl = invitationCallbackUrl(token);
  return (
    <AuthPageShell
      description={<p>Accedi con l’email che ha ricevuto l’invito. Se non hai ancora un account, crealo con lo stesso indirizzo.</p>}
      kicker="Invito al workspace"
      title={`Invito a ${organizationName}`}
      titleId="invitation-signin-title"
    >
      <AuthStage>
        <Alert variant="info"><IconUserPlus /><AlertDescription>Il link verrà conservato durante l’accesso o la registrazione.</AlertDescription></Alert>
        <div className={cn(styles.actions, "mt-5")}>
          <Link className={cn(buttonVariants(), "h-11")} href={`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Accedi <IconArrowRight data-icon="inline-end" /></Link>
          <Link className={cn(buttonVariants({ variant: "outline" }), "h-11")} href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}>Crea account</Link>
        </div>
      </AuthStage>
    </AuthPageShell>
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
  const [declined, setDeclined] = useState(false);
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
      setError(body?.message ?? "Accettazione dell’invito non riuscita.");
      return;
    }

    await signOut({ redirect: false }).catch(() => undefined);
    setLoading(false);
    setAccepted(true);
  }

  async function decline() {
    setLoading(true);
    setError(null);
    const response = await fetch("/api/organization/invitations/accept", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const body = await response.json().catch(() => null) as { message?: string } | null;
    setLoading(false);
    if (!response.ok) return setError(body?.message ?? "Rifiuto dell'invito non riuscito.");
    setDeclined(true);
  }

  if (accepted) {
    return (
      <AuthPageShell
        description={<p>Ora fai parte di <strong>{organizationName}</strong>. Per applicare il nuovo accesso in modo sicuro, accedi di nuovo.</p>}
        kicker="Invito completato"
        title="Invito accettato"
        titleId="invitation-accepted-title"
      >
        <AuthStage>
          <Alert role="status" variant="success"><IconCircleCheck /><AlertDescription>La tua associazione all’Azienda è stata aggiornata.</AlertDescription></Alert>
          <Link className={cn(buttonVariants(), "mt-5 h-11 w-full")} href="/sign-in?callbackUrl=%2Fdashboard">Accedi al workspace <IconArrowRight data-icon="inline-end" /></Link>
        </AuthStage>
      </AuthPageShell>
    );
  }

  if (declined) {
    return (
      <AuthPageShell description={<p>L'invito a <strong>{organizationName}</strong> non e piu utilizzabile. Nessun accesso e stato aggiunto.</p>} kicker="Invito rifiutato" title="Invito rifiutato" titleId="invitation-declined-title">
        <AuthStage><Link className={cn(buttonVariants({ variant: "outline" }), "h-11 w-full")} href="/dashboard">Torna al workspace</Link></AuthStage>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      description={<p>Controlla Azienda e ruolo prima di confermare. L’accesso verrà applicato alla tua prossima sessione.</p>}
      kicker="Invito al workspace"
      title="Accetta l’invito"
      titleId="invitation-title"
    >
      <AuthStage>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{organizationName}</Badge>
          <Badge variant="outline">{roleLabels[role]}</Badge>
        </div>
        <Alert className="mt-4" variant="info"><IconClock /><AlertDescription>Il link scade il {new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(expiresAt))}.</AlertDescription></Alert>
        {error ? <Alert className="mt-4" variant="destructive"><IconAlertCircle /><AlertDescription>{error}</AlertDescription></Alert> : null}
        <div className={cn(styles.actions, "mt-5")}>
          <Button className="h-11 active:scale-[0.985]" disabled={loading} onClick={accept} type="button">
            {loading ? <><Spinner /> Accettazione in corso</> : <>Accetta e continua <IconArrowRight data-icon="inline-end" /></>}
          </Button>
          <Button className="h-11" disabled={loading} onClick={() => void decline()} type="button" variant="outline">Rifiuta invito</Button>
        </div>
      </AuthStage>
    </AuthPageShell>
  );
}
