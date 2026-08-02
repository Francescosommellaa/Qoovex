import type { BlobOrphanDryRunResponse, DataControlJobListResponse, DataInventoryResponse, DataRecordCount, DataRetentionOverviewResponse } from "@qoovex/types";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import styles from "../AdminCore.module.css";
import { DataControlActionsPanel } from "./DataControlActionsPanel";

const inventoryLabels: Array<[keyof DataInventoryResponse["counts"], string]> = [
  ["workers", "Lavoratori"],
  ["jobSites", "Cantieri"],
  ["documentTypes", "Tipi documento"],
  ["documentRequirements", "Requisiti documento"],
  ["documents", "Documenti"],
  ["documentVersions", "Versioni documento"],
  ["deadlines", "Scadenze"],
  ["calendarEvents", "Eventi calendario"],
  ["checklists", "Checklist"],
  ["checklistItems", "Voci checklist"],
  ["evidence", "Prove"],
  ["documentPackages", "Pacchetti documentali"],
  ["documentPackageItems", "Item pacchetto"],
  ["shareLinks", "Link di condivisione"],
  ["notifications", "Notifiche"],
  ["notificationPreferences", "Preferenze notifiche"],
  ["emailDeliveries", "Invii email"],
  ["auditEvents", "Eventi audit"],
  ["workerUserLinks", "Collegamenti utente-lavoratore"],
  ["jobSiteUserAssignments", "Assegnazioni utenti-cantieri"],
  ["jobSiteWorkerAssignments", "Assegnazioni lavoratori-cantieri"],
  ["memberProfiles", "Profili membri"],
  ["memberships", "Membership aziendali"],
  ["invitations", "Inviti aziendali"],
  ["dataControlJobs", "Job controllo dati"],
  ["supportSessions", "Sessioni supporto"],
  ["supportEvents", "Eventi supporto"],
  ["authProviders", "Provider autenticazione"],
  ["authSessions", "Sessioni autenticazione"],
  ["authCredentials", "Stato credenziali"],
  ["authCodes", "Lifecycle codici autenticazione"],
  ["mfaRecoveryRequests", "Recuperi MFA"],
  ["authDevices", "Dispositivi autenticazione"],
  ["mfaBackupCodes", "Backup code MFA"],
  ["securityAuditEvents", "Eventi sicurezza"],
  ["authRateLimits", "Rate limit attribuibili"],
  ["operationalProcesses", "Processi operativi"],
  ["operationalSteps", "Step operativi"],
  ["operationalEvents", "Eventi operativi"],
  ["operationalDecisions", "Decisioni operative"],
  ["operationalExceptions", "Eccezioni operative"],
  ["operationalArtifactReferences", "Riferimenti operativi"],
  ["operationalEventArtifactReferences", "Riferimenti eventi operativi"],
  ["operationalRuleSnapshots", "Snapshot regole operative"],
  ["operationalEffectReceipts", "Receipt effetti operativi"],
  ["documentJobSiteLinks", "Collegamenti documenti-cantieri"],
  ["evidenceRevisions", "Revisioni prove"],
  ["documentPackageRevisions", "Revisioni pacchetti"],
  ["operationalRequests", "Richieste operative"],
  ["contextMessages", "Messaggi di contesto"],
  ["contextTimelineEvents", "Timeline di contesto"],
  ["documentSourcePolicies", "Policy fonti documento"],
  ["documentSourceChecks", "Controlli fonti documento"],
  ["documentAcquisitions", "Acquisizioni documentali"],
  ["documentPackageShareProposals", "Proposte condivisione pacchetto"],
];

function countParts(count: DataRecordCount) {
  const parts = [`Totale ${count.total}`];
  if (count.active !== undefined) parts.push(`Attivi ${count.active}`);
  if (count.archived !== undefined) parts.push(`Archiviati ${count.archived}`);
  return parts.join(" - ");
}

export function DataControlPageView({
  inventory,
  retention,
  jobs,
  orphans,
  organizationCode,
}: {
  inventory: DataInventoryResponse;
  retention: DataRetentionOverviewResponse;
  jobs: DataControlJobListResponse;
  orphans: BlobOrphanDryRunResponse;
  organizationCode: string;
}) {
  const hasRetentionCandidates = retention.candidates.some((candidate) => candidate.count > 0);

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Controllo dati"
        description="Inventario, export metadata e retention operativa per il proprietario dell'azienda."
      />

      <WorkspacePanel title="Inventario dati" description="Conteggi filtrati per azienda. Non include file, allegati, token o URL privati.">
        <div className={styles.list}>
          {inventoryLabels.map(([key, label]) => (
            <article className={styles.record} key={key}>
              <div className={styles.recordMain}>
                <strong>{label}</strong>
                <span>{countParts(inventory.counts[key] as DataRecordCount)}</span>
              </div>
            </article>
          ))}
          <article className={styles.record}>
            <div className={styles.recordMain}>
              <strong>Share link</strong>
              <span>
                Totale {inventory.counts.shareLinks.total} - Attivi {inventory.counts.shareLinks.active} - Scaduti {inventory.counts.shareLinks.expired} - Revocati {inventory.counts.shareLinks.revoked}
              </span>
            </div>
          </article>
          <article className={styles.record}>
            <div className={styles.recordMain}>
              <strong>Notifiche</strong>
              <span>
                Totale {inventory.counts.notifications.total} - Non lette {inventory.counts.notifications.unread} - Lette {inventory.counts.notifications.read} - Nascoste {inventory.counts.notifications.dismissed}
              </span>
            </div>
          </article>
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Job Data Control" description="Export asincrono, cleanup Blob e cancellazione definitiva passano da job tracciati.">
        <DataControlActionsPanel initialJobs={jobs} initialOrphans={orphans} organizationCode={organizationCode} />
      </WorkspacePanel>

      <WorkspacePanel title="Retention operativa" description={retention.notice}>
        {hasRetentionCandidates ? (
          <div className={styles.list}>
            {retention.candidates.map((candidate) => (
              <article className={styles.record} key={candidate.key}>
                <div className={styles.recordMain}>
                  <strong>{candidate.title}</strong>
                  <span>{candidate.description}</span>
                </div>
                <div className={styles.actions}>
                  <WorkspaceState label={String(candidate.count)} tone={candidate.count > 0 ? "warning" : "neutral"} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <WorkspaceEmptyState title="Nessun candidato retention da mostrare." description="Le soglie operative verranno applicate ai dati registrati quando richiedono revisione." />
        )}
      </WorkspacePanel>

      <WorkspacePanel title="Limiti e verifiche" description="Le regole di conservazione sono operative, non normative.">
        <ul className={styles.compactList}>
          <li>
            <span>Export</span>
            <strong>Metadata-only, generato via job e salvato su Blob privato.</strong>
          </li>
          <li>
            <span>Retention</span>
            <strong>{retention.notice}</strong>
          </li>
          <li>
            <span>File</span>
            <strong>I file non vengono esportati o cancellati in questa fase.</strong>
          </li>
        </ul>
      </WorkspacePanel>
    </WorkspacePage>
  );
}
