const fileSizeUnits = ["KB", "MB", "GB", "TB"] as const;

const fileSizeNumber = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 1,
});

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "Dimensione non disponibile";
  if (bytes === 0) return "0 KB";
  if (bytes < 1_000) return "Meno di 1 KB";

  let value = bytes / 1_000;
  let unitIndex = 0;
  while (value >= 1_000 && unitIndex < fileSizeUnits.length - 1) {
    value /= 1_000;
    unitIndex += 1;
  }

  return `${fileSizeNumber.format(value)} ${fileSizeUnits[unitIndex]}`;
}

export function presentProposalVersion(version: number | null | undefined): string {
  if (!Number.isInteger(version) || !version || version < 1) return "Proposta";
  return version === 1 ? "Proposta iniziale" : `Proposta aggiornata · ${version}ª versione`;
}

const dataInventoryCategories: Record<string, string> = {
  workers: "Lavoratori",
  jobSites: "Cantieri",
  notifications: "Notifiche",
  auditEvents: "Attività registrate",
  workerUserLinks: "Collegamenti tra lavoratori e account",
  jobSiteParticipants: "Partecipanti ai cantieri",
  jobSiteWorkerAssignments: "Assegnazioni dei lavoratori ai cantieri",
  jobSiteSteps: "Fasi dei cantieri",
  timelineEvents: "Aggiornamenti dei cantieri",
  attachments: "File dei cantieri",
  changeProposals: "Proposte di modifica",
  paymentRequests: "Richieste di pagamento",
  disputes: "Segnalazioni",
  jobSiteExports: "Archivi dei cantieri",
  memberships: "Accessi all'Azienda",
  clientInvitations: "Inviti ai clienti",
  clientProperties: "Immobili dei clienti",
  clientPropertyLinks: "Collegamenti tra immobili e cantieri",
  authorityGrants: "Deleghe economiche",
  initialAgreements: "Riepiloghi iniziali",
  initialAgreementVersions: "Aggiornamenti dei riepiloghi iniziali",
  initialAgreementConsents: "Conferme dei riepiloghi iniziali",
  stepUserAssignments: "Assegnazioni delle persone alle fasi",
  stepWorkerAssignments: "Assegnazioni dei lavoratori alle fasi",
  timelineReferences: "Riferimenti negli aggiornamenti",
  attachmentPublications: "Condivisioni dei file",
  timelineAttachments: "File collegati agli aggiornamenti",
  jobSiteRequests: "Richieste dei cantieri",
  changeProposalVersions: "Aggiornamenti delle proposte",
  changeProposalEffects: "Effetti delle proposte",
  changeProposalConsents: "Conferme delle proposte",
  paymentProfiles: "Profili di pagamento",
  paymentProfileVersions: "Aggiornamenti dei profili di pagamento",
  transferDeclarations: "Dichiarazioni di trasferimento",
  paymentReviews: "Verifiche dei pagamenti",
  disputeReferences: "Riferimenti delle segnalazioni",
  disputeConsents: "Conferme delle segnalazioni",
  disputePreservations: "Dati conservati per le segnalazioni",
  closures: "Chiusure dei cantieri",
  closureConsents: "Conferme di chiusura",
  postClosureRequests: "Richieste dopo la chiusura",
  reopeningProposals: "Proposte di riapertura",
  reopeningConsents: "Conferme di riapertura",
  exportAccessLinks: "Accessi agli archivi",
  exportDownloadGrants: "Autorizzazioni al download degli archivi",
  legalHolds: "Blocchi di conservazione",
  actionReceipts: "Operazioni registrate",
  jobSiteProcesses: "Processi dei cantieri",
  jobSiteProcessSteps: "Fasi dei processi",
  jobSiteProcessEvents: "Aggiornamenti dei processi",
  notificationPreferences: "Preferenze di notifica",
  notificationDeliveries: "Invii delle notifiche",
  invitations: "Inviti all'Azienda",
  dataControlJobs: "Operazioni sui dati",
  supportSessions: "Sessioni di assistenza",
  supportEvents: "Attività di assistenza",
  authProviders: "Metodi di accesso collegati",
  authSessions: "Sessioni di accesso",
  authCredentials: "Credenziali di accesso",
  authCodes: "Codici temporanei di accesso",
  mfaRecoveryRequests: "Richieste di recupero MFA",
  authDevices: "Dispositivi usati per MFA",
  mfaBackupCodes: "Codici di recupero MFA",
  securityAuditEvents: "Eventi di sicurezza",
  authRateLimits: "Protezioni contro tentativi ripetuti",
  memberProfiles: "Profili dei membri",
};

export function presentDataInventoryCategory(value: string): string {
  return dataInventoryCategories[value] ?? "Altri dati";
}
