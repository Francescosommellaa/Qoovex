import type { DataInventoryResponse, DataRecordCount, DataRetentionOverviewResponse } from "@qoovex/types";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceStatusBadge } from "@/views/workspace/WorkspacePrimitives";
import styles from "../AdminCore.module.css";

const inventoryLabels: Array<[keyof DataInventoryResponse["counts"], string]> = [
  ["workers", "Lavoratori"],
  ["jobSites", "Cantieri"],
  ["documents", "Documenti"],
  ["documentVersions", "Versioni documento"],
  ["deadlines", "Scadenze"],
  ["checklists", "Checklist"],
  ["checklistItems", "Voci checklist"],
  ["evidence", "Prove"],
  ["documentPackages", "Pacchetti documentali"],
  ["documentPackageItems", "Item pacchetto"],
  ["notificationPreferences", "Preferenze notifiche"],
  ["emailDeliveries", "Invii email"],
  ["auditEvents", "Eventi audit"],
  ["workerUserLinks", "Collegamenti utente-lavoratore"],
  ["jobSiteUserAssignments", "Assegnazioni utenti-cantieri"],
  ["jobSiteWorkerAssignments", "Assegnazioni lavoratori-cantieri"],
];

function countParts(count: DataRecordCount) {
  const parts = [`Totale ${count.total}`];
  if (count.active !== undefined) parts.push(`Attivi ${count.active}`);
  if (count.archived !== undefined) parts.push(`Archiviati ${count.archived}`);
  return parts.join(" - ");
}

export function DataControlPageView({ inventory, retention }: { inventory: DataInventoryResponse; retention: DataRetentionOverviewResponse }) {
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

      <WorkspacePanel title="Export dati" description="Scarica un export metadata JSON generato al momento.">
        <div className={styles.record}>
          <div className={styles.recordMain}>
            <strong>Scarica export metadata</strong>
            <span>Non include file o allegati. I file restano gestiti tramite accesso protetto.</span>
            <small>Non contiene token, hash, chiavi Blob, URL permanenti, body email o note libere escluse.</small>
          </div>
          <div className={styles.actions}>
            <a className={styles.linkButton} href="/api/data/export">
              Scarica export metadata
            </a>
          </div>
        </div>
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
                  <WorkspaceStatusBadge label={String(candidate.count)} tone={candidate.count > 0 ? "warning" : "neutral"} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <WorkspaceEmptyState title="Nessun candidato retention da mostrare." description="Le soglie operative verranno applicate ai dati registrati quando richiedono revisione." />
        )}
      </WorkspacePanel>

      <WorkspacePanel title="Cancellazioni controllate" description="La cancellazione definitiva richiede conferma e va valutata con il responsabile.">
        <div className={styles.record}>
          <div className={styles.recordMain}>
            <strong>Cancellazione definitiva rimandata</strong>
            <span>Questa fase non esegue hard delete, non cancella audit e non elimina fisicamente file Blob.</span>
            <small>Prima di cancellare dati con relazioni o file collegati serve un flusso dedicato, esplicito e testato.</small>
          </div>
        </div>
      </WorkspacePanel>

      <WorkspacePanel title="Limiti e verifiche" description="Le regole di conservazione sono operative, non normative.">
        <ul className={styles.compactList}>
          <li>
            <span>Export</span>
            <strong>Metadata-only, generato on-demand e non salvato in DB o Blob.</strong>
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
