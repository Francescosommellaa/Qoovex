import type { JobSiteRequestStatus, JobSiteRequestType } from "@qoovex/db";
import type { DisputeStatus } from "@qoovex/types";
import { formatDateTime } from "@shared/lib/product-metadata-presentation";
import { presentDisputeStatus, presentJobSiteRequestStatus, presentJobSiteRequestType } from "@shared/lib/product-state-presentation";
import { RecordTransitionForm } from "@/views/job-site/JobSiteForms";
import { WorkspaceState } from "@/views/workspace/WorkspacePrimitives";

type RequestParticipant = { publicRoleLabel: string | null; user: { firstName: string | null; lastName: string | null } };
type RequestAction = { label: string; value: "RESPOND" | "RESOLVE" | "WITHDRAW" };
type RequestInteraction = { action: "RESPOND" | "RESOLVE" | "WITHDRAW"; actor: RequestParticipant; createdAt: Date; message: string };

export type JobSiteRequestConversationData = {
  availableActions: readonly RequestAction[];
  blocking: boolean;
  body: string;
  createdAt: Date;
  interactions: readonly RequestInteraction[];
  openedByParticipant: RequestParticipant;
  resolvedAt: Date | null;
  status: JobSiteRequestStatus;
  title: string;
  type: JobSiteRequestType;
};

function presentParticipant(participant: RequestParticipant) {
  return [participant.user.firstName, participant.user.lastName].filter(Boolean).join(" ") || participant.publicRoleLabel || "Persona non indicata";
}

function presentInteraction(action: RequestInteraction["action"]) {
  switch (action) {
    case "RESPOND": return "Risposta inviata";
    case "RESOLVE": return "Richiesta segnata come risolta";
    case "WITHDRAW": return "Richiesta ritirata";
  }
}

export function presentRequestNextAction({ availableActions, status }: Pick<JobSiteRequestConversationData, "availableActions" | "status">) {
  if (availableActions.length === 1) return `Prossimo passo: ${availableActions[0].label.toLocaleLowerCase("it-IT")}.`;
  if (availableActions.length > 1) return "Prossimo passo: puoi chiudere o ritirare questa richiesta.";
  switch (status) {
    case "OPEN": return "Prossimo passo: attendi una risposta dall'altra parte.";
    case "RESPONDED": return "Risposta ricevuta: l'autore della richiesta può ora chiuderla o ritirarla.";
    case "RESOLVED": return "Nessuna azione richiesta: la richiesta è stata risolta.";
    case "WITHDRAWN": return "Nessuna azione richiesta: la richiesta è stata ritirata.";
  }
}

export function JobSiteRequestConversation({ actionsEndpoint, conversation, revision }: { actionsEndpoint: string; conversation: JobSiteRequestConversationData; revision: number }) {
  const isStillBlocking = conversation.blocking && ["OPEN", "RESPONDED"].includes(conversation.status);
  return <article className="py-4 first:pt-0">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="font-medium">{conversation.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Aperta da {presentParticipant(conversation.openedByParticipant)} il {formatDateTime(conversation.createdAt)}.</p>
        <p className="mt-1 text-sm text-muted-foreground">Argomento: {presentJobSiteRequestType(conversation.type).label}.</p>
      </div>
      <WorkspaceState state={presentJobSiteRequestStatus(conversation.status)} />
    </div>
    <p className="mt-3 text-sm">{conversation.body}</p>
    {conversation.blocking ? <p className="mt-3 text-sm text-muted-foreground"><strong>{isStillBlocking ? "La chiusura del cantiere resta sospesa." : "Questa richiesta non blocca più la chiusura."}</strong>{isStillBlocking ? " Rimarrà sospesa finché l'autore non la risolve o la ritira." : null}</p> : null}
    <p className="mt-3 text-sm text-muted-foreground">{presentRequestNextAction(conversation)}</p>
    <section aria-label={`Cronologia della richiesta: ${conversation.title}`} className="mt-4 space-y-3 border-l pl-4">
      <div className="text-sm"><p className="font-medium">Richiesta aperta</p><p className="text-muted-foreground">{presentParticipant(conversation.openedByParticipant)} · {formatDateTime(conversation.createdAt)}</p></div>
      {conversation.interactions.map((interaction, index) => <div className="text-sm" key={`${interaction.createdAt.toISOString()}-${index}`}><p className="font-medium">{presentInteraction(interaction.action)}</p><p className="text-muted-foreground">{presentParticipant(interaction.actor)} · {formatDateTime(interaction.createdAt)}</p><p className="mt-1">{interaction.message}</p></div>)}
    </section>
    {conversation.availableActions.length ? <div className="mt-4"><RecordTransitionForm actions={[...conversation.availableActions]} description="L'aggiornamento sarà aggiunto alla cronologia di questa richiesta." endpoint={actionsEndpoint} messageLabel="Messaggio da aggiungere" revision={revision} title="Aggiorna questa richiesta" /></div> : null}
  </article>;
}

type DisagreementAction = { label: string; value: "RESPOND" | "AGREE" | "WITHDRAW" | "CLOSE_WITHOUT_AGREEMENT" };
type DisagreementInteraction = { action: DisagreementAction["value"]; actor: RequestParticipant; createdAt: Date; message: string };

export type JobSiteDisagreementConversationData = {
  availableActions: readonly DisagreementAction[];
  description: string;
  interactions: readonly DisagreementInteraction[];
  openedAt: Date;
  openedByParticipant: RequestParticipant;
  status: DisputeStatus;
  title: string;
};

function presentDisagreementInteraction(action: DisagreementInteraction["action"]) {
  switch (action) {
    case "RESPOND": return "Posizione aggiunta";
    case "AGREE": return "Accordo registrato";
    case "WITHDRAW": return "Disaccordo ritirato";
    case "CLOSE_WITHOUT_AGREEMENT": return "Mancato accordo registrato";
  }
}

function presentDisagreementNextAction({ availableActions, status }: Pick<JobSiteDisagreementConversationData, "availableActions" | "status">) {
  if (availableActions.length) return "Prossimo passo: puoi aggiungere la tua posizione o registrare una scelta sul disaccordo.";
  switch (status) {
    case "OPEN":
    case "IN_DISCUSSION": return "In attesa dell'altra parte o di una scelta consentita.";
    case "RESOLVED_BY_AGREEMENT": return "Nessuna azione richiesta: le parti hanno registrato un accordo.";
    case "WITHDRAWN": return "Nessuna azione richiesta: il disaccordo è stato ritirato.";
    case "CLOSED_WITHOUT_AGREEMENT": return "Nessuna azione richiesta: il disaccordo è stato chiuso senza accordo.";
  }
}

export function JobSiteDisagreementConversation({ actionsEndpoint, conversation, revision }: { actionsEndpoint: string; conversation: JobSiteDisagreementConversationData; revision: number }) {
  return <article className="py-4 first:pt-0">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 className="font-medium">{conversation.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Aperto da {presentParticipant(conversation.openedByParticipant)} il {formatDateTime(conversation.openedAt)}.</p>
      </div>
      <WorkspaceState state={presentDisputeStatus(conversation.status)} />
    </div>
    <p className="mt-3 text-sm">{conversation.description}</p>
    <p className="mt-3 text-sm text-muted-foreground">{presentDisagreementNextAction(conversation)}</p>
    <section aria-label={`Cronologia del disaccordo: ${conversation.title}`} className="mt-4 space-y-3 border-l pl-4">
      <div className="text-sm"><p className="font-medium">Disaccordo aperto</p><p className="text-muted-foreground">{presentParticipant(conversation.openedByParticipant)} · {formatDateTime(conversation.openedAt)}</p></div>
      {conversation.interactions.map((interaction, index) => <div className="text-sm" key={`${interaction.createdAt.toISOString()}-${index}`}><p className="font-medium">{presentDisagreementInteraction(interaction.action)}</p><p className="text-muted-foreground">{presentParticipant(interaction.actor)} · {formatDateTime(interaction.createdAt)}</p><p className="mt-1">{interaction.message}</p></div>)}
    </section>
    {conversation.availableActions.length ? <div className="mt-4"><RecordTransitionForm actions={[...conversation.availableActions]} description="Il messaggio sarà aggiunto alla cronologia. Un accordo o una chiusura senza accordo richiede le conferme previste da entrambe le parti." endpoint={actionsEndpoint} messageLabel="Messaggio da aggiungere" revision={revision} title="Aggiorna questo disaccordo" /></div> : null}
  </article>;
}
