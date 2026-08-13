"use client";

import { IconSwitch } from "@tabler/icons-react";
import { Button } from "@qoovex/ui/components/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ActionButton } from "./JobSiteForms";

type ClientInvitationAcceptanceResponse = { jobSiteId: string };

export function clientJobSitePath({ jobSiteId }: ClientInvitationAcceptanceResponse) {
  if (typeof jobSiteId !== "string" || !jobSiteId.trim()) throw new Error("L'invito è stato accettato, ma non è stato possibile aprire il cantiere. Aggiorna la pagina e riprova.");
  return `/client/job-sites/${encodeURIComponent(jobSiteId)}`;
}

export function navigateToAcceptedClientJobSite(result: ClientInvitationAcceptanceResponse, replace: (path: string) => void) {
  replace(clientJobSitePath(result));
}

export function presentClientInvitationAcceptanceError(message: string) {
  if (/invito scaduto|invito non disponibile nello stato/i.test(message)) return "L'invito non è più disponibile. Chiedi all'Azienda un nuovo invito.";
  if (/appartiene a un'altra email/i.test(message)) return "Questo invito è collegato a un altro indirizzo email. Cambia account e accedi con l'indirizzo invitato.";
  if (/email verificata richiesta/i.test(message)) return "Verifica l'email associata al tuo account prima di accettare l'invito.";
  if (/stesso account non puo rappresentare/i.test(message)) return "Questo account partecipa già al lavoro per l'Azienda. Accedi con un altro account Cliente.";
  if (/ruolo account|scelta del ruolo/i.test(message)) return "Questo account non può accettare l'invito. Accedi con un account Cliente associato all'indirizzo invitato.";
  if (/cantiere e stato modificato/i.test(message)) return "La situazione del lavoro è cambiata. Aggiorna la pagina e riprova.";
  return "Non è stato possibile accettare l'invito. Riprova oppure chiedi aiuto all'Azienda.";
}

export function ClientInvitationAcceptAction({ endpoint }: { endpoint: string }) {
  const router = useRouter();
  return <ActionButton<ClientInvitationAcceptanceResponse> body={{}} confirmMessage="Accetti di partecipare come cliente principale?" endpoint={endpoint} label="Accetta e apri il lavoro" mapError={presentClientInvitationAcceptanceError} onSuccess={(result) => navigateToAcceptedClientJobSite(result, router.replace)} success="Invito accettato. Apertura del cantiere…" />;
}

export function ClientInvitationAccountRecoveryAction({ callbackUrl }: { callbackUrl: string }) {
  const [pending, setPending] = useState(false);
  return <Button disabled={pending} onClick={() => { setPending(true); void signOut({ callbackUrl }); }} type="button">{pending ? "Cambio account in corso…" : <><IconSwitch aria-hidden="true" /> Cambia account</>}</Button>;
}
