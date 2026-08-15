import type { ReactNode } from "react";
import type { InitialAgreementPayload } from "@shared/server/job-site-contracts";
import { formatEuroFromMinorUnits } from "@shared/lib/money";
import { WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";

function formatEstimatedCompletion(value: string) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function AgreementDetail({ label, children }: { label: string; children: ReactNode }) {
  return <div>
    <dt className="text-sm font-medium text-foreground">{label}</dt>
    <dd className="mt-1 text-sm text-muted-foreground">{children}</dd>
  </div>;
}

export function InitialAgreementReview({ actions, snapshot }: { actions?: ReactNode; snapshot: InitialAgreementPayload }) {
  const participantRoles = snapshot.participantSummary.map((participant) => participant.publicRoleLabel?.trim() || "Ruolo non indicato");

  return <WorkspacePanel title="Riepilogo iniziale da confermare" description="Questo è il contenuto esatto della versione in attesa di conferma.">
    <dl className="grid gap-5 sm:grid-cols-2">
      <AgreementDetail label="Lavoro"><span className="font-medium text-foreground">{snapshot.name}</span></AgreementDetail>
      {snapshot.address ? <AgreementDetail label="Indirizzo del lavoro">{snapshot.address}</AgreementDetail> : null}
      {snapshot.description ? <AgreementDetail label="Descrizione del lavoro">{snapshot.description}</AgreementDetail> : null}
      {snapshot.initialEstimateMinor ? <AgreementDetail label="Stima economica iniziale">{formatEuroFromMinorUnits(snapshot.initialEstimateMinor)}</AgreementDetail> : null}
      {snapshot.estimatedCompletionAt ? <AgreementDetail label="Conclusione prevista">{formatEstimatedCompletion(snapshot.estimatedCompletionAt)}</AgreementDetail> : null}
      {snapshot.sharedCommercialNotes ? <AgreementDetail label="Note condivise">{snapshot.sharedCommercialNotes}</AgreementDetail> : null}
    </dl>
    {participantRoles.length ? <section aria-labelledby="initial-agreement-roles" className="mt-5 border-t pt-5">
      <h3 className="text-sm font-medium" id="initial-agreement-roles">Ruoli nel lavoro</h3>
      <ul className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
        {participantRoles.map((role, index) => <li className="rounded-md border px-2 py-1" key={`${role}-${index}`}>{role}</li>)}
      </ul>
    </section> : null}
    {actions ? <div className="mt-5 flex flex-wrap gap-3 border-t pt-5">{actions}</div> : null}
  </WorkspacePanel>;
}
