import Link from "next/link";
import { IconAlertCircle, IconCircleCheck, IconClock, IconMail, IconUser } from "@tabler/icons-react";
import { Alert, AlertDescription, AlertTitle } from "@qoovex/ui/components/alert";
import { buttonVariants } from "@qoovex/ui/components/button";
import { ClientInvitationAcceptAction, ClientInvitationAccountRecoveryAction } from "@/views/job-site/ClientInvitationAcceptAction";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import { getClientInvitationPageState, type ClientInvitationPageState } from "@shared/server/job-site-lifecycle-service";

type InvitationStateKind = Exclude<ClientInvitationPageState["kind"], "READY" | "ALREADY_ACCEPTED_WITH_ACCESS">;

function invitationStatePresentation(kind: InvitationStateKind) {
  switch (kind) {
    case "EXPIRED":
      return { title: "Invito scaduto", description: "Questo invito non è più utilizzabile. Chiedi all'Azienda di inviartene uno nuovo.", variant: "warning" as const, Icon: IconClock };
    case "REVOKED":
      return { title: "Invito revocato", description: "L'Azienda ha annullato questo invito. Se ti serve ancora l'accesso, chiedi un nuovo invito.", variant: "warning" as const, Icon: IconAlertCircle };
    case "ALREADY_ACCEPTED":
      return { title: "Invito già utilizzato", description: "Questo invito è già stato accettato e non può essere usato di nuovo.", variant: "info" as const, Icon: IconCircleCheck };
    case "ACCEPTED_ACCESS_UNAVAILABLE":
      return { title: "Accesso al lavoro non disponibile", description: "Questo invito è già stato accettato, ma il tuo account non può aprire il lavoro in questo momento. Contatta l'Azienda.", variant: "warning" as const, Icon: IconAlertCircle };
    case "WRONG_ACCOUNT_EMAIL":
      return { title: "Accedi con l'email invitata", description: "Questo invito è collegato a un altro indirizzo email. Cambia account e accedi con l'indirizzo che ha ricevuto l'invito.", variant: "warning" as const, Icon: IconMail };
    case "ACCOUNT_ROLE_MISMATCH":
      return { title: "Serve un account Cliente", description: "Questo account non può accettare un invito al lavoro. Cambia account e accedi con un account Cliente associato all'indirizzo invitato.", variant: "warning" as const, Icon: IconUser };
    case "EMAIL_VERIFICATION_REQUIRED":
      return { title: "Verifica l'email prima di continuare", description: "Per accettare l'invito, l'email associata al tuo account deve essere verificata. Dopo la verifica, riapri questo link.", variant: "warning" as const, Icon: IconMail };
    case "ACCOUNT_ALREADY_PARTICIPATES":
      return { title: "Questo account è già collegato al lavoro", description: "Questo account ha già una partecipazione registrata per il lavoro e non può usare di nuovo questo invito. Accedi con un altro account Cliente o contatta l'Azienda.", variant: "warning" as const, Icon: IconUser };
    case "SESSION_UNAVAILABLE":
      return { title: "Sessione non disponibile", description: "Non è possibile usare questo account in questo momento. Per assistenza, contatta Qoovex.", variant: "destructive" as const, Icon: IconAlertCircle };
    case "UNAVAILABLE":
      return { title: "Invito non disponibile", description: "Questo invito non è valido oppure non può più essere usato. Chiedi all'Azienda un nuovo invito se ti serve ancora l'accesso.", variant: "warning" as const, Icon: IconAlertCircle };
  }
}

export default async function ClientInvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invitationPath = `/client/invitations/${encodeURIComponent(token)}`;
  const state = await getClientInvitationPageState(token);

  if (state.kind !== "READY") {
    if (state.kind === "ALREADY_ACCEPTED_WITH_ACCESS") {
      return (
        <WorkspacePage>
          <WorkspacePageHeader title="Invito già accettato" description="Hai già accesso a questo lavoro con l'account attuale." />
          <WorkspacePanel title="Cosa puoi fare ora">
            <Alert role="status" variant="success"><IconCircleCheck aria-hidden="true" /><AlertTitle>Il lavoro è disponibile</AlertTitle><AlertDescription>Puoi aprire il lavoro e continuare da dove eri rimasto.</AlertDescription></Alert>
            <Link className={`${buttonVariants()} mt-5`} href={`/client/job-sites/${encodeURIComponent(state.jobSiteId)}`}>Apri il lavoro</Link>
          </WorkspacePanel>
        </WorkspacePage>
      );
    }

    const presentation = invitationStatePresentation(state.kind);
    const StateIcon = presentation.Icon;
    const canChangeAccount = state.kind === "WRONG_ACCOUNT_EMAIL" || state.kind === "ACCOUNT_ROLE_MISMATCH" || state.kind === "ACCOUNT_ALREADY_PARTICIPATES";
    return (
      <WorkspacePage>
        <WorkspacePageHeader title={presentation.title} description={presentation.description} />
        <WorkspacePanel title="Cosa puoi fare ora">
          <Alert role="status" variant={presentation.variant}><StateIcon aria-hidden="true" /><AlertTitle>Stato dell'invito</AlertTitle><AlertDescription>{presentation.description}</AlertDescription></Alert>
          {canChangeAccount ? <div className="mt-5"><ClientInvitationAccountRecoveryAction callbackUrl={invitationPath} /></div> : null}
        </WorkspacePanel>
      </WorkspacePage>
    );
  }

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Invito a un lavoro"
        description="Verifica il lavoro e l'Azienda prima di accettare con l'account Qoovex associato all'indirizzo invitato."
      />
      <WorkspacePanel title="Prima di accettare">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted-foreground">Azienda invitante</dt>
            <dd className="mt-1 font-medium">{state.organizationName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Lavoro</dt>
            <dd className="mt-1 font-medium">{state.jobSiteName}</dd>
          </div>
          {state.jobSiteAddress ? (
            <div>
              <dt className="text-muted-foreground">Indirizzo del lavoro</dt>
              <dd className="mt-1 font-medium">{state.jobSiteAddress}</dd>
            </div>
          ) : null}
        </dl>
        <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground">
          Accettando, aprirai questo lavoro in Qoovex come cliente principale. Prima che il lavoro diventi operativo, l'Azienda pubblicherà il riepilogo iniziale da consultare e confermare.
        </p>
        <div className="mt-5">
          <ClientInvitationAcceptAction endpoint={`/api/client/invitations/${encodeURIComponent(token)}/accept`} />
        </div>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
