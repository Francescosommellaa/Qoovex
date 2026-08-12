import type {
  AuthorityCapability,
  AttachmentCategory,
  ClosureStatus,
  JobSiteProcessStatus,
  JobSiteProcessStepStatus,
  JobSiteRequestStatus,
  LegalHoldStatus,
  NotificationChannel,
  NotificationFrequency,
  PostClosureRequestStatus,
  ReopeningStatus,
  RuntimeErrorStatus,
  TimelineEventType,
} from "@qoovex/db";
import type {
  AuditAction,
  AuditEntityType,
  AuditMetadataValue,
  AuditOutcome,
  AccountRole,
  ChangeProposalStatus,
  DataControlJobStatus,
  DataControlJobType,
  DisputeStatus,
  JobSiteParticipantKind,
  JobSiteParticipantStatus,
  JobSiteStatus,
  JobSiteStepStatus,
  MfaRecoveryStatus,
  MfaRecoveryMode,
  NotificationSeverity,
  NotificationType,
  OrganizationAccessPreset,
  OrganizationContactKind,
  OrganizationRole,
  PaymentRequestStatus,
  PlatformRole,
  RecordStatus,
  TimelineAudience,
} from "@qoovex/types";
import { formatEuroFromMinorUnits } from "./money";
import { formatFileSize } from "./product-metadata-presentation";

export type ProductStateTone = "danger" | "warning" | "info" | "good" | "neutral";

export interface ProductStatePresentation {
  label: string;
  tone: ProductStateTone;
  description?: string;
}

const unavailableState = { label: "Stato non disponibile", tone: "neutral" } as const satisfies ProductStatePresentation;

function createPresenter<T extends string>(presentations: Record<T, ProductStatePresentation>) {
  return (value: T): ProductStatePresentation => Object.prototype.hasOwnProperty.call(presentations, value)
    ? presentations[value]
    : unavailableState;
}

const jobSiteStatuses = {
  DRAFT: { label: "Bozza di cantiere", tone: "neutral" },
  WAITING_FOR_CLIENT: { label: "Attende il cliente", tone: "warning" },
  PENDING_INITIAL_CONFIRMATION: { label: "Attende conferma del cliente", tone: "warning" },
  ACTIVE: { label: "Cantiere attivo", tone: "good" },
  CLOSURE_PROPOSED: { label: "Chiusura da confermare", tone: "warning" },
  CLOSED: { label: "Cantiere chiuso", tone: "good" },
  ARCHIVED: { label: "Cantiere archiviato", tone: "neutral" },
} satisfies Record<JobSiteStatus, ProductStatePresentation>;

const attachmentCategories = {
  PHOTO: { label: "Fotografia", tone: "neutral" },
  VIDEO: { label: "Video", tone: "neutral" },
  DOCUMENT: { label: "Documento", tone: "neutral" },
  EVIDENCE: { label: "Prova documentale", tone: "neutral" },
  EXPENSE_RECEIPT: { label: "Ricevuta di spesa", tone: "neutral" },
  PAYMENT_RECEIPT: { label: "Ricevuta di pagamento", tone: "neutral" },
  PROPOSAL: { label: "File della proposta", tone: "neutral" },
  REQUEST: { label: "File della richiesta", tone: "neutral" },
  DISPUTE: { label: "File della segnalazione", tone: "neutral" },
  CLOSURE: { label: "File di chiusura", tone: "neutral" },
  OTHER: { label: "Altro file", tone: "neutral" },
} satisfies Record<AttachmentCategory, ProductStatePresentation>;

const stepStatuses = {
  NOT_STARTED: { label: "Da iniziare", tone: "neutral" },
  IN_PROGRESS: { label: "In corso", tone: "info" },
  WAITING: { label: "In attesa", tone: "warning" },
  WORK_COMPLETED: { label: "Lavoro completato, da confermare", tone: "warning" },
  CHANGES_REQUESTED: { label: "Modifiche richieste", tone: "warning" },
  CONFIRMED: { label: "Lavoro confermato", tone: "good" },
  CANCELLED: { label: "Annullato", tone: "neutral" },
} satisfies Record<JobSiteStepStatus, ProductStatePresentation>;

const requestStatuses = {
  OPEN: { label: "Richiesta aperta", tone: "warning" },
  RESPONDED: { label: "Risposta ricevuta", tone: "info" },
  RESOLVED: { label: "Richiesta risolta", tone: "good" },
  WITHDRAWN: { label: "Richiesta ritirata", tone: "neutral" },
} satisfies Record<JobSiteRequestStatus, ProductStatePresentation>;

const changeProposalStatuses = {
  DRAFT: { label: "Bozza di proposta", tone: "neutral" },
  PROPOSED: { label: "Proposta inviata", tone: "info" },
  COUNTERED: { label: "Controproposta presente", tone: "warning" },
  ACCEPTED: { label: "Proposta accettata", tone: "good" },
  REJECTED: { label: "Proposta rifiutata", tone: "danger" },
  WITHDRAWN: { label: "Proposta ritirata", tone: "neutral" },
  SUPERSEDED: { label: "Proposta sostituita", tone: "neutral" },
  EXPIRED: { label: "Proposta scaduta", tone: "warning" },
} satisfies Record<ChangeProposalStatus, ProductStatePresentation>;

const paymentRequestStatuses = {
  DRAFT: { label: "Bozza di richiesta", tone: "neutral" },
  REQUESTED: { label: "Pagamento richiesto", tone: "info" },
  TRANSFER_DECLARED: { label: "Trasferimento dichiarato", tone: "info" },
  UNDER_REVIEW: { label: "Dichiarazione in verifica", tone: "warning" },
  CONFIRMED: { label: "Ricezione confermata", tone: "good" },
  DISPUTED: { label: "Dichiarazione contestata", tone: "danger" },
  CANCELLED: { label: "Richiesta annullata", tone: "neutral" },
} satisfies Record<PaymentRequestStatus, ProductStatePresentation>;

const disputeStatuses = {
  OPEN: { label: "Disputa aperta", tone: "danger" },
  IN_DISCUSSION: { label: "Confronto in corso", tone: "warning" },
  RESOLVED_BY_AGREEMENT: { label: "Risolta con accordo", tone: "good" },
  WITHDRAWN: { label: "Disputa ritirata", tone: "neutral" },
  CLOSED_WITHOUT_AGREEMENT: { label: "Chiusa senza accordo", tone: "neutral" },
} satisfies Record<DisputeStatus, ProductStatePresentation>;

const closureStatuses = {
  DRAFT: { label: "Bozza di chiusura", tone: "neutral" },
  PENDING_CLIENT_CONFIRMATION: { label: "Attende conferma del cliente", tone: "warning" },
  CLIENT_CONFIRMED: { label: "Confermata dal cliente, attende l'Azienda", tone: "warning" },
  FINALIZED: { label: "Chiusura confermata da entrambe le parti", tone: "good" },
  REJECTED: { label: "Chiusura non confermata", tone: "danger" },
  CANCELLED: { label: "Chiusura annullata", tone: "neutral" },
  SUPERSEDED: { label: "Chiusura sostituita", tone: "neutral" },
} satisfies Record<ClosureStatus, ProductStatePresentation>;

const postClosureRequestStatuses = {
  OPEN: { label: "Richiesta aperta", tone: "warning" },
  IN_DISCUSSION: { label: "Confronto in corso", tone: "warning" },
  RESOLVED: { label: "Richiesta risolta", tone: "good" },
  WITHDRAWN: { label: "Richiesta ritirata", tone: "neutral" },
  CLOSED_WITHOUT_AGREEMENT: { label: "Chiusa senza accordo", tone: "neutral" },
} satisfies Record<PostClosureRequestStatus, ProductStatePresentation>;

const reopeningStatuses = {
  PROPOSED: { label: "Riapertura proposta", tone: "info" },
  COUNTERPARTY_CONFIRMED: { label: "Prima conferma registrata", tone: "warning" },
  FINALIZED: { label: "Riapertura confermata da entrambe le parti", tone: "good" },
  REJECTED: { label: "Riapertura rifiutata", tone: "danger" },
  CANCELLED: { label: "Riapertura annullata", tone: "neutral" },
  SUPERSEDED: { label: "Proposta di riapertura sostituita", tone: "neutral" },
} satisfies Record<ReopeningStatus, ProductStatePresentation>;

const participantKinds = {
  ORGANIZATION_MEMBER: { label: "Membro dell'Azienda", tone: "info" },
  CLIENT: { label: "Cliente", tone: "neutral" },
} satisfies Record<JobSiteParticipantKind, ProductStatePresentation>;

const participantStatuses = {
  INVITED: { label: "Invito inviato", tone: "info" },
  PENDING: { label: "Attende conferma iniziale", tone: "warning" },
  ACTIVE: { label: "Accesso attivo", tone: "good" },
  SUSPENDED: { label: "Accesso sospeso", tone: "danger" },
  ENDED: { label: "Partecipazione conclusa", tone: "neutral" },
  REVOKED: { label: "Accesso revocato", tone: "danger" },
} satisfies Record<JobSiteParticipantStatus, ProductStatePresentation>;

const timelineAudiences = {
  INTERNAL: { label: "Solo Azienda", tone: "neutral" },
  SHARED: { label: "Condiviso con il cliente", tone: "info" },
} satisfies Record<TimelineAudience, ProductStatePresentation>;

const timelineEventTypes = {
  JOB_SITE_CREATED: { label: "Cantiere creato", tone: "neutral" },
  WORK_UPDATE: { label: "Aggiornamento lavori", tone: "info" },
  COMMENT: { label: "Commento", tone: "neutral" },
  EVIDENCE: { label: "Evidenza aggiunta", tone: "info" },
  SHARED_EXPENSE: { label: "Spesa condivisa", tone: "info" },
  SHARED_DOCUMENT: { label: "Documento condiviso", tone: "info" },
  STEP_CREATED: { label: "Step creato", tone: "neutral" },
  STEP_UPDATED: { label: "Step aggiornato", tone: "info" },
  STEP_READY_FOR_REVIEW: { label: "Lavoro pronto per la conferma", tone: "warning" },
  STEP_CONFIRMED: { label: "Lavoro confermato", tone: "good" },
  STEP_REOPENED: { label: "Step riaperto", tone: "warning" },
  CHANGE_PROPOSED: { label: "Modifica proposta", tone: "info" },
  CHANGE_COUNTERED: { label: "Controproposta registrata", tone: "warning" },
  CHANGE_ACCEPTED: { label: "Modifica accettata", tone: "good" },
  CHANGE_REJECTED: { label: "Modifica rifiutata", tone: "danger" },
  CHANGE_WITHDRAWN: { label: "Modifica ritirata", tone: "neutral" },
  CLARIFICATION_REQUESTED: { label: "Chiarimento richiesto", tone: "warning" },
  CLARIFICATION_RESPONDED: { label: "Chiarimento ricevuto", tone: "info" },
  ISSUE_REPORTED: { label: "Problema segnalato", tone: "danger" },
  PAYMENT_REQUESTED: { label: "Pagamento richiesto", tone: "info" },
  PAYMENT_TRANSFER_DECLARED: { label: "Trasferimento dichiarato", tone: "info" },
  PAYMENT_CONFIRMED: { label: "Ricezione confermata", tone: "good" },
  PAYMENT_DISPUTED: { label: "Dichiarazione di pagamento contestata", tone: "danger" },
  CLOSURE_PROPOSED: { label: "Chiusura proposta", tone: "warning" },
  CLOSURE_CONFIRMED: { label: "Chiusura confermata", tone: "good" },
  POST_CLOSURE_REQUESTED: { label: "Richiesta dopo la chiusura", tone: "warning" },
  JOB_SITE_REOPENED: { label: "Cantiere riaperto", tone: "info" },
  JOB_SITE_ARCHIVED: { label: "Cantiere archiviato", tone: "neutral" },
  EXPORT_CREATED: { label: "Export preparato", tone: "good" },
  SYSTEM_BACKFILL: { label: "Aggiornamento di sistema", tone: "neutral" },
} satisfies Record<TimelineEventType, ProductStatePresentation>;

const authorityCapabilities = {
  COMMERCIAL_NEGOTIATE: { label: "Negoziare condizioni economiche", tone: "info" },
  COMMERCIAL_ACCEPT: { label: "Accettare condizioni economiche", tone: "info" },
  PAYMENT_REQUEST: { label: "Richiedere pagamenti documentati", tone: "info" },
  PAYMENT_CONFIRM_RECEIPT: { label: "Confermare la ricezione dichiarata", tone: "info" },
  CLOSURE_PROPOSE: { label: "Proporre la chiusura", tone: "info" },
} satisfies Record<AuthorityCapability, ProductStatePresentation>;

const processStatuses = {
  PENDING: { label: "Processo in attesa", tone: "warning" },
  RUNNING: { label: "Processo in corso", tone: "info" },
  WAITING: { label: "Processo in attesa di un'azione", tone: "warning" },
  COMPLETED: { label: "Processo completato", tone: "good" },
  FAILED: { label: "Processo non completato", tone: "danger" },
  CANCELLED: { label: "Processo annullato", tone: "neutral" },
} satisfies Record<JobSiteProcessStatus, ProductStatePresentation>;

const processStepStatuses = {
  PENDING: { label: "Da avviare", tone: "neutral" },
  RUNNING: { label: "In corso", tone: "info" },
  COMPLETED: { label: "Completato", tone: "good" },
  FAILED: { label: "Non completato", tone: "danger" },
  SKIPPED: { label: "Non necessario", tone: "neutral" },
} satisfies Record<JobSiteProcessStepStatus, ProductStatePresentation>;

const legalHoldStatuses = {
  ACTIVE: { label: "Conservazione attiva", tone: "warning" },
  RELEASED: { label: "Conservazione terminata", tone: "neutral" },
} satisfies Record<LegalHoldStatus, ProductStatePresentation>;

const organizationRoles = {
  OWNER: { label: "Titolare dell'Azienda", tone: "info" },
  COLLABORATOR: { label: "Collaboratore", tone: "neutral" },
} satisfies Record<OrganizationRole, ProductStatePresentation>;

const organizationAccessPresets = {
  READ_ONLY: { label: "Sola lettura", tone: "neutral" },
  OPERATIONAL_COLLABORATION: { label: "Collaborazione operativa", tone: "info" },
  SITE_MANAGER: { label: "Gestione cantieri assegnati", tone: "info" },
  LIMITED_UPLOAD: { label: "Caricamento limitato", tone: "warning" },
  CUSTOM: { label: "Accesso personalizzato", tone: "neutral" },
} satisfies Record<OrganizationAccessPreset, ProductStatePresentation>;

const organizationContactKinds = {
  GENERAL: { label: "Contatto generale", tone: "neutral" },
  ADMINISTRATION: { label: "Amministrazione", tone: "neutral" },
  SAFETY: { label: "Sicurezza", tone: "warning" },
  TECHNICAL: { label: "Referente tecnico", tone: "info" },
} satisfies Record<OrganizationContactKind, ProductStatePresentation>;

const dataControlJobTypes = {
  METADATA_EXPORT: { label: "Preparazione dell'archivio dati", tone: "info" },
  ORPHAN_BLOB_CLEANUP: { label: "Pulizia dei file orfani", tone: "warning" },
} satisfies Record<DataControlJobType, ProductStatePresentation>;

const dataControlJobStatuses = {
  PENDING: { label: "In coda", tone: "warning" },
  RUNNING: { label: "In esecuzione", tone: "info" },
  COMPLETED: { label: "Completato", tone: "good" },
  FAILED: { label: "Non completato", tone: "danger" },
} satisfies Record<DataControlJobStatus, ProductStatePresentation>;

const notificationTypes = {
  SYSTEM: { label: "Comunicazioni di sistema", tone: "neutral" },
  JOB_SITE_ACTION_REQUIRED: { label: "Azioni richieste", tone: "warning" },
  JOB_SITE_ACTIVITY: { label: "Attività del cantiere", tone: "info" },
  PAYMENT_ACTIVITY: { label: "Pagamenti documentati", tone: "info" },
  DISPUTE_ACTIVITY: { label: "Dispute", tone: "warning" },
  EXPORT_READY: { label: "Export pronti", tone: "good" },
} satisfies Record<NotificationType, ProductStatePresentation>;

const notificationChannels = {
  IN_APP: { label: "Nell'app", tone: "neutral" },
  EMAIL: { label: "Email", tone: "neutral" },
} satisfies Record<NotificationChannel, ProductStatePresentation>;

const notificationFrequencies = {
  IMMEDIATE: { label: "Immediata", tone: "info" },
  DAILY_DIGEST: { label: "Riepilogo giornaliero", tone: "neutral" },
  DISABLED: { label: "Disattivata", tone: "neutral" },
} satisfies Record<NotificationFrequency, ProductStatePresentation>;

const notificationSeverities = {
  INFO: { label: "Informazione", tone: "info" },
  ATTENTION: { label: "Attenzione", tone: "warning" },
  WARNING: { label: "Priorità alta", tone: "danger" },
} satisfies Record<NotificationSeverity, ProductStatePresentation>;

const auditOutcomes = {
  SUCCESS: { label: "Completata", tone: "good" },
  DENIED: { label: "Non autorizzata", tone: "warning" },
  FAILED: { label: "Non riuscita", tone: "danger" },
} satisfies Record<AuditOutcome, ProductStatePresentation>;

const auditActions = {
  WORKER_CREATED: { label: "Lavoratore creato", tone: "info" },
  WORKER_UPDATED: { label: "Lavoratore aggiornato", tone: "info" },
  WORKER_ARCHIVED: { label: "Lavoratore archiviato", tone: "neutral" },
  JOB_SITE_CREATED: { label: "Cantiere creato", tone: "info" },
  JOB_SITE_UPDATED: { label: "Cantiere aggiornato", tone: "info" },
  JOB_SITE_ARCHIVED: { label: "Cantiere archiviato", tone: "neutral" },
  NOTIFICATION_READ: { label: "Notifica letta", tone: "neutral" },
  NOTIFICATION_DISMISSED: { label: "Notifica nascosta", tone: "neutral" },
  WORKER_USER_LINK_CREATED: { label: "Account collegato al lavoratore", tone: "info" },
  WORKER_USER_LINK_ARCHIVED: { label: "Collegamento account archiviato", tone: "neutral" },
  JOB_SITE_PARTICIPANT_CREATED: { label: "Partecipante aggiunto al cantiere", tone: "info" },
  JOB_SITE_PARTICIPANT_UPDATED: { label: "Partecipante del cantiere aggiornato", tone: "info" },
  JOB_SITE_PARTICIPANT_ENDED: { label: "Partecipazione al cantiere conclusa", tone: "neutral" },
  JOB_SITE_WORKER_ASSIGNMENT_CREATED: { label: "Assegnazione al cantiere creata", tone: "info" },
  JOB_SITE_WORKER_ASSIGNMENT_ARCHIVED: { label: "Assegnazione al cantiere archiviata", tone: "neutral" },
  ORGANIZATION_PROFILE_UPDATED: { label: "Profilo Azienda aggiornato", tone: "info" },
  ORGANIZATION_CONTACT_CREATED: { label: "Contatto Azienda creato", tone: "info" },
  ORGANIZATION_CONTACT_UPDATED: { label: "Contatto Azienda aggiornato", tone: "info" },
  ORGANIZATION_CONTACT_ARCHIVED: { label: "Contatto Azienda archiviato", tone: "neutral" },
  ORGANIZATION_INVITATION_CREATED: { label: "Invito Azienda creato", tone: "info" },
  ORGANIZATION_INVITATION_REVOKED: { label: "Invito Azienda revocato", tone: "neutral" },
  ORGANIZATION_INVITATION_ACCEPTED: { label: "Invito Azienda accettato", tone: "good" },
  ORGANIZATION_MEMBERSHIP_REVOKED: { label: "Accesso Azienda revocato", tone: "warning" },
  DATA_EXPORT_GENERATED: { label: "Archivio dei dati preparato", tone: "good" },
  DATA_EXPORT_FAILED: { label: "Archivio dei dati non preparato", tone: "danger" },
  DATA_CONTROL_JOB_CREATED: { label: "Operazione Data Control creata", tone: "info" },
  DATA_CONTROL_JOB_RUN: { label: "Operazione Data Control eseguita", tone: "info" },
  ORPHAN_BLOB_CLEANUP_RUN: { label: "Pulizia dei file orfani eseguita", tone: "info" },
  JOB_SITE_ACTION_EXECUTED: { label: "Azione del cantiere eseguita", tone: "info" },
  JOB_SITE_TIMELINE_APPENDED: { label: "Evento aggiunto alla timeline", tone: "info" },
  JOB_SITE_ATTACHMENT_DOWNLOADED: { label: "File del cantiere scaricato", tone: "neutral" },
  JOB_SITE_ATTACHMENT_UPLOADED: { label: "File aggiunto al cantiere", tone: "info" },
  JOB_SITE_AUTHORITY_GRANTED: { label: "Delega economica concessa", tone: "warning" },
  JOB_SITE_AUTHORITY_REVOKED: { label: "Delega economica revocata", tone: "warning" },
  JOB_SITE_EXPORT_DOWNLOADED: { label: "Archivio del cantiere scaricato", tone: "neutral" },
  PAYMENT_PROFILE_UPDATED: { label: "Profilo di pagamento aggiornato", tone: "info" },
  LEGAL_HOLD_PLACED: { label: "Conservazione bloccata", tone: "warning" },
  LEGAL_HOLD_RELEASED: { label: "Blocco di conservazione rimosso", tone: "neutral" },
  SECURITY_DENIED: { label: "Operazione di sicurezza negata", tone: "danger" },
} satisfies Record<AuditAction, ProductStatePresentation>;

const auditEntityTypes = {
  WORKER: { label: "Lavoratore", tone: "neutral" },
  JOB_SITE: { label: "Cantiere", tone: "neutral" },
  NOTIFICATION: { label: "Notifica", tone: "neutral" },
  DATA_CONTROL_JOB: { label: "Operazione Data Control", tone: "neutral" },
  WORKER_USER_LINK: { label: "Collegamento account-lavoratore", tone: "neutral" },
  JOB_SITE_PARTICIPANT: { label: "Partecipante del cantiere", tone: "neutral" },
  JOB_SITE_WORKER_ASSIGNMENT: { label: "Assegnazione al cantiere", tone: "neutral" },
  JOB_SITE_ATTACHMENT: { label: "File del cantiere", tone: "neutral" },
  JOB_SITE_TIMELINE_EVENT: { label: "Evento della timeline", tone: "neutral" },
  JOB_SITE_CHANGE_PROPOSAL: { label: "Proposta di modifica", tone: "neutral" },
  JOB_SITE_PAYMENT_REQUEST: { label: "Richiesta di pagamento", tone: "neutral" },
  JOB_SITE_DISPUTE: { label: "Disputa", tone: "neutral" },
  JOB_SITE_CLOSURE: { label: "Chiusura del cantiere", tone: "neutral" },
  JOB_SITE_EXPORT: { label: "Archivio del cantiere", tone: "neutral" },
  LEGAL_HOLD: { label: "Blocco di conservazione", tone: "neutral" },
  ORGANIZATION_PAYMENT_PROFILE: { label: "Profilo di pagamento", tone: "neutral" },
  ORGANIZATION_INVITATION: { label: "Invito Azienda", tone: "neutral" },
  ORGANIZATION_MEMBERSHIP: { label: "Accesso Azienda", tone: "neutral" },
  ORGANIZATION: { label: "Azienda", tone: "neutral" },
  ORGANIZATION_PROFILE: { label: "Profilo Azienda", tone: "neutral" },
  ORGANIZATION_CONTACT: { label: "Contatto Azienda", tone: "neutral" },
  USER: { label: "Utente", tone: "neutral" },
  SYSTEM: { label: "Sistema", tone: "neutral" },
} satisfies Record<AuditEntityType, ProductStatePresentation>;

const runtimeErrorStatuses = {
  OPEN: { label: "Aperto", tone: "danger" },
  RESOLVED: { label: "Risolto", tone: "good" },
} satisfies Record<RuntimeErrorStatus, ProductStatePresentation>;

const mfaRecoveryStatuses = {
  PENDING: { label: "In attesa", tone: "warning" },
  APPROVED: { label: "Approvata", tone: "good" },
  DENIED: { label: "Rifiutata", tone: "danger" },
  SETUP_STARTED: { label: "Nuova configurazione avviata", tone: "info" },
  COMPLETED: { label: "Completata", tone: "good" },
  EXPIRED: { label: "Scaduta", tone: "danger" },
} satisfies Record<MfaRecoveryStatus, ProductStatePresentation>;

const platformRoles = {
  USER: { label: "Utente", tone: "good" },
  SUPPORT_AGENT: { label: "Assistenza Qoovex", tone: "info" },
  PLATFORM_ADMIN: { label: "Amministratore Qoovex", tone: "info" },
} satisfies Record<PlatformRole, ProductStatePresentation>;

const accountRoles = {
  BUSINESS: { label: "Azienda", tone: "info" },
  PROFESSIONAL: { label: "Professionista", tone: "info" },
  CLIENT: { label: "Cliente", tone: "neutral" },
} satisfies Record<AccountRole, ProductStatePresentation>;

const recordStatuses = {
  ACTIVE: { label: "Attivo", tone: "good" },
  ARCHIVED: { label: "Archiviato", tone: "neutral" },
} satisfies Record<RecordStatus, ProductStatePresentation>;

const mfaRecoveryModes = {
  SELF_EMAIL: { label: "Verifica tramite email", tone: "info" },
  OWNER_APPROVAL: { label: "Approvazione del Titolare", tone: "warning" },
} satisfies Record<MfaRecoveryMode, ProductStatePresentation>;

const processDefinitions: Record<string, ProductStatePresentation> = {
  "CLIENT_INVITATION@1": { label: "Invito del cliente", tone: "info" },
  "JOB_SITE_INITIAL_CONFIRMATION@1": { label: "Conferma iniziale del cantiere", tone: "info" },
  "CHANGE_NEGOTIATION@1": { label: "Confronto sulla modifica", tone: "info" },
  "PAYMENT_REQUEST@1": { label: "Richiesta di pagamento documentata", tone: "info" },
  "JOB_SITE_CLOSURE@1": { label: "Chiusura del cantiere", tone: "info" },
  "JOB_SITE_EXPORT@1": { label: "Preparazione dell'archivio", tone: "info" },
  "POST_CLOSURE_REQUEST@1": { label: "Richiesta dopo la chiusura", tone: "info" },
  "JOB_SITE_REOPENING@1": { label: "Riapertura del cantiere", tone: "info" },
};

const processStepNames: Record<string, ProductStatePresentation> = {
  SEND_INVITATION: { label: "Invio dell'invito", tone: "neutral" },
  WAIT_FOR_ACCEPTANCE: { label: "Attesa dell'accettazione", tone: "neutral" },
  PUBLISH_AGREEMENT: { label: "Pubblicazione del riepilogo", tone: "neutral" },
  WAIT_FOR_CLIENT_CONFIRMATION: { label: "Attesa della conferma del cliente", tone: "neutral" },
  ACTIVATE_JOB_SITE: { label: "Attivazione del cantiere", tone: "neutral" },
  PUBLISH_VERSION: { label: "Pubblicazione della versione", tone: "neutral" },
  WAIT_FOR_COUNTERPART: { label: "Attesa dell'altra parte", tone: "neutral" },
  APPLY_ACCEPTED_EFFECTS: { label: "Applicazione della modifica accettata", tone: "neutral" },
  PUBLISH_REQUEST: { label: "Pubblicazione della richiesta", tone: "neutral" },
  WAIT_FOR_TRANSFER: { label: "Attesa della dichiarazione di trasferimento", tone: "neutral" },
  WAIT_FOR_REVIEW: { label: "Attesa della verifica", tone: "neutral" },
  BUILD_SNAPSHOT: { label: "Preparazione del riepilogo di chiusura", tone: "neutral" },
  WAIT_FOR_CLIENT: { label: "Attesa del cliente", tone: "neutral" },
  WAIT_FOR_ORGANIZATION: { label: "Attesa dell'Azienda", tone: "neutral" },
  CLOSE_JOB_SITE: { label: "Chiusura del cantiere", tone: "neutral" },
  BUILD_MANIFEST: { label: "Preparazione dell'indice", tone: "neutral" },
  STREAM_ARCHIVE: { label: "Creazione dell'archivio", tone: "neutral" },
  ISSUE_ACCESS_LINK: { label: "Creazione del link di accesso", tone: "neutral" },
  WAIT_FOR_RESPONSE: { label: "Attesa della risposta", tone: "neutral" },
  PUBLISH_PROPOSAL: { label: "Pubblicazione della proposta", tone: "neutral" },
  WAIT_FOR_CONSENTS: { label: "Attesa delle conferme", tone: "neutral" },
  REOPEN_JOB_SITE: { label: "Riapertura del cantiere", tone: "neutral" },
};

const securityEventTypes: Record<string, ProductStatePresentation> = {
  credentials_signup_email_requested: { label: "Email di registrazione richiesta", tone: "info" },
  credentials_verification_requested: { label: "Nuova verifica email richiesta", tone: "info" },
  credentials_signin_failed: { label: "Accesso non riuscito", tone: "danger" },
  credentials_signin_suspended: { label: "Accesso bloccato per account sospeso", tone: "danger" },
  mfa_enabled: { label: "MFA attivata", tone: "good" },
  mfa_replaced: { label: "Fattore MFA sostituito", tone: "warning" },
  mfa_disabled: { label: "MFA disattivata", tone: "warning" },
  mfa_backup_codes_regenerated: { label: "Codici di recupero rigenerati", tone: "warning" },
  mfa_backup_code_used: { label: "Codice di recupero utilizzato", tone: "warning" },
  mfa_factor_verified: { label: "Verifica MFA riuscita", tone: "good" },
  mfa_factor_failed: { label: "Verifica MFA non riuscita", tone: "danger" },
  mfa_recovery_approved: { label: "Recupero MFA approvato", tone: "good" },
  mfa_recovery_denied: { label: "Recupero MFA rifiutato", tone: "danger" },
  platform_user_suspended: { label: "Account sospeso", tone: "danger" },
  platform_user_reactivated: { label: "Account riattivato", tone: "good" },
  platform_user_sessions_revoked: { label: "Sessioni revocate", tone: "warning" },
};

const searchResultTypes: Record<string, ProductStatePresentation> = {
  timeline: { label: "Evento della timeline", tone: "neutral" },
  step: { label: "Step", tone: "neutral" },
  request: { label: "Richiesta", tone: "neutral" },
  proposal: { label: "Proposta di modifica", tone: "neutral" },
  payment: { label: "Pagamento documentato", tone: "neutral" },
  attachment: { label: "File", tone: "neutral" },
};

export const presentJobSiteStatus = createPresenter(jobSiteStatuses);
export const presentAttachmentCategory = createPresenter(attachmentCategories);
export const presentJobSiteStepStatus = createPresenter(stepStatuses);
export const presentJobSiteRequestStatus = createPresenter(requestStatuses);
export const presentChangeProposalStatus = createPresenter(changeProposalStatuses);
export const presentPaymentRequestStatus = createPresenter(paymentRequestStatuses);
export const presentDisputeStatus = createPresenter(disputeStatuses);
export const presentClosureStatus = createPresenter(closureStatuses);
export const presentPostClosureRequestStatus = createPresenter(postClosureRequestStatuses);
export const presentReopeningStatus = createPresenter(reopeningStatuses);
export const presentParticipantKind = createPresenter(participantKinds);
export const presentParticipantStatus = createPresenter(participantStatuses);
export const presentTimelineAudience = createPresenter(timelineAudiences);
export const presentTimelineEventType = createPresenter(timelineEventTypes);
export const presentAuthorityCapability = createPresenter(authorityCapabilities);
export const presentProcessStatus = createPresenter(processStatuses);
export const presentProcessStepStatus = createPresenter(processStepStatuses);
export const presentLegalHoldStatus = createPresenter(legalHoldStatuses);
export const presentOrganizationRole = createPresenter(organizationRoles);
export const presentOrganizationAccessPreset = createPresenter(organizationAccessPresets);
export const presentOrganizationContactKind = createPresenter(organizationContactKinds);
export const presentDataControlJobType = createPresenter(dataControlJobTypes);
export const presentDataControlJobStatus = createPresenter(dataControlJobStatuses);
export const presentNotificationType = createPresenter(notificationTypes);
export const presentNotificationChannel = createPresenter(notificationChannels);
export const presentNotificationFrequency = createPresenter(notificationFrequencies);
export const presentNotificationSeverity = createPresenter(notificationSeverities);
export const presentAuditOutcome = createPresenter(auditOutcomes);
export const presentAuditAction = createPresenter(auditActions);
export const presentAuditEntityType = createPresenter(auditEntityTypes);
export const presentRuntimeErrorStatus = createPresenter(runtimeErrorStatuses);
export const presentMfaRecoveryStatus = createPresenter(mfaRecoveryStatuses);
export const presentPlatformRole = createPresenter(platformRoles);
export const presentAccountRole = createPresenter(accountRoles);
export const presentRecordStatus = createPresenter(recordStatuses);
export const presentMfaRecoveryMode = createPresenter(mfaRecoveryModes);

export function presentProcessDefinition(value: string): ProductStatePresentation {
  return processDefinitions[value] ?? unavailableState;
}

export function presentProcessStepName(value: string): ProductStatePresentation {
  return processStepNames[value] ?? unavailableState;
}

export function presentSecurityEventType(value: string): ProductStatePresentation {
  return securityEventTypes[value] ?? { label: "Evento di sicurezza", tone: "neutral" };
}

export function presentSearchResultType(value: string): ProductStatePresentation {
  return searchResultTypes[value] ?? { label: "Risultato", tone: "neutral" };
}

export function presentSearchResultDetail(resultType: string, value: unknown): string {
  if (typeof value !== "string") return "Risultato";
  if (resultType === "timeline") return presentTimelineEventType(value as TimelineEventType).label;
  if (resultType === "request") return presentJobSiteRequestStatus(value as JobSiteRequestStatus).label;
  if (resultType === "proposal") return presentChangeProposalStatus(value as ChangeProposalStatus).label;
  if (resultType === "payment") return presentPaymentRequestStatus(value as PaymentRequestStatus).label;
  if (resultType === "step" || resultType === "attachment") return value;
  return "Risultato";
}

export function presentAuditMetadataEntry(key: string, value: AuditMetadataValue): { label: string; value: string } {
  const monetaryLabel = monetaryFieldLabels[key];
  if (monetaryLabel) return { label: monetaryLabel, value: typeof value === "string" ? formatEuroFromMinorUnits(value) : "Importo non disponibile" };
  if (key === "size") return { label: "Dimensione file", value: typeof value === "number" ? formatFileSize(value) : "Dimensione non disponibile" };
  if (key === "mimeType") return { label: "Formato file", value: typeof value === "string" ? presentFileFormat(value) : "Formato non disponibile" };
  if (key === "accountRole") return { label: "Tipo di account", value: presentAccountRole(value as AccountRole).label };
  if (key === "role") return { label: "Ruolo Azienda", value: presentOrganizationRole(value as OrganizationRole).label };
  if (key === "participantKind") return { label: "Tipo di partecipante", value: presentParticipantKind(value as JobSiteParticipantKind).label };
  if (key === "kind") return { label: "Tipo di contatto", value: presentOrganizationContactKind(value as OrganizationContactKind).label };
  if (key === "type") return { label: "Tipo di operazione", value: presentDataControlJobType(value as DataControlJobType).label };
  if (key === "previousStatus") return { label: "Stato precedente", value: presentRecordStatus(value as RecordStatus).label };
  if (key === "nextStatus") return { label: "Nuovo stato", value: presentRecordStatus(value as RecordStatus).label };
  if (key === "previousPhase") return { label: "Fase precedente", value: "Informazione non disponibile" };
  if (key === "nextPhase") return { label: "Nuova fase", value: "Informazione non disponibile" };
  if (key === "mode") return { label: "Modalità", value: presentMfaRecoveryMode(value as MfaRecoveryMode).label };
  if (key === "automatic") return { label: "Esecuzione automatica", value: value === true ? "Sì" : "No" };
  if (key === "fieldsChanged") return { label: "Campi aggiornati", value: String(value ?? 0) };
  if (key === "entityType") return { label: "Tipo di elemento", value: value === "WorkerUserLink" ? "Collegamento account-lavoratore" : value === "JobSiteWorkerAssignment" ? "Assegnazione al cantiere" : "Elemento" };
  if (key === "itemType") return { label: "Tipo di elemento", value: "Elemento" };
  if (key === "reasonCode") return { label: "Operazione", value: value === "created" ? "Creazione" : value === "archived" ? "Archiviazione" : "Aggiornamento" };
  if (key === "expiresAt") return { label: "Scadenza", value: presentAuditDate(value) };
  if (key === "notificationCount") return { label: "Notifiche", value: presentAuditCount(value) };
  if (key === "scanned") return { label: "Elementi verificati", value: presentAuditCount(value) };
  if (key === "sent") return { label: "Invii completati", value: presentAuditCount(value) };
  if (key === "failed") return { label: "Invii non riusciti", value: presentAuditCount(value) };
  if (key === "skipped") return { label: "Elementi non elaborati", value: presentAuditCount(value) };
  if (key === "hasFile") return { label: "File disponibile", value: value === true ? "Sì" : "No" };
  if (key === "frequency" || key === "emailDigestFrequency") return { label: "Frequenza", value: presentNotificationFrequency(value as NotificationFrequency).label };
  if (key === "deliveryStatus") return { label: "Consegna", value: presentDeliveryStatus(value) };
  if (key === "accessState") return { label: "Accesso", value: presentRecordStatus(value as RecordStatus).label };
  return { label: "Dettaglio", value: "Valore non disponibile" };
}

const fileFormats: Record<string, string> = {
  "application/pdf": "PDF",
  "image/jpeg": "Immagine JPEG",
  "image/png": "Immagine PNG",
  "image/webp": "Immagine WebP",
  "video/mp4": "Video MP4",
  "video/webm": "Video WebM",
  "video/quicktime": "Video MOV",
};

function presentFileFormat(value: string): string {
  return fileFormats[value] ?? "Formato non disponibile";
}

function presentAuditDate(value: AuditMetadataValue): string {
  if (typeof value !== "string") return "Data non disponibile";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data non disponibile";
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Rome" }).format(date);
}

function presentAuditCount(value: AuditMetadataValue): string {
  return typeof value === "number" && Number.isFinite(value) ? new Intl.NumberFormat("it-IT").format(value) : "Dato non disponibile";
}

function presentDeliveryStatus(value: AuditMetadataValue): string {
  if (value === "SENT") return "Inviata";
  if (value === "PENDING") return "In attesa";
  if (value === "FAILED") return "Non riuscita";
  return "Stato non disponibile";
}

const monetaryFieldLabels: Record<string, string> = {
  amountMinor: "Importo",
  initialEstimateMinor: "Stima iniziale",
  economicValueMinor: "Valore economico",
  previousPriceMinor: "Importo precedente",
  economicDeltaMinor: "Variazione",
  rangeMinimumMinor: "Importo minimo",
  rangeMaximumMinor: "Importo massimo",
};
