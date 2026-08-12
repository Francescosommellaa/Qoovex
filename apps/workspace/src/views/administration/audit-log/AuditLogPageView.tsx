import type { AuditLogFilters, AuditLogListResponse, AuditMetadata } from "@qoovex/types";
import { auditActions, auditEntityTypes, auditOutcomes } from "@qoovex/types";
import { presentAuditAction, presentAuditEntityType, presentAuditMetadataEntry, presentAuditOutcome, presentOrganizationRole } from "@shared/lib/product-state-presentation";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import styles from "../AdminCore.module.css";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function metadataEntries(metadata: AuditMetadata | null) {
  if (!metadata) return [];
  return Object.entries(metadata).filter(([, value]) => value !== undefined).map(([key, value]) => ({ key, ...presentAuditMetadataEntry(key, value) }));
}

function filterHref(nextFilters: AuditLogFilters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(nextFilters)) {
    if (value !== undefined && value !== null && value !== "") params.set(key, String(value));
  }
  const query = params.toString();
  return query ? `/audit-log?${query}` : "/audit-log";
}

export function AuditLogPageView({ data, filters }: { data: AuditLogListResponse; filters: AuditLogFilters }) {
  const activeOutcome = filters.outcome ?? "all";

  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Audit"
        description="Eventi operativi registrati per file, condivisioni, notifiche e azioni sensibili dell'azienda."
      />

      <section className={styles.filterBar} aria-label="Filtri esito audit">
        <a href={filterHref({ ...filters, outcome: undefined, cursor: undefined })} aria-current={activeOutcome === "all" ? "page" : undefined}>
          Tutti
        </a>
        {auditOutcomes.map((outcome) => (
          <a key={outcome} href={filterHref({ ...filters, outcome, cursor: undefined })} aria-current={activeOutcome === outcome ? "page" : undefined}>
            {presentAuditOutcome(outcome).label}
          </a>
        ))}
      </section>

      <WorkspacePanel title="Filtri audit" description="I filtri restringono la lista senza mostrare dati interni non necessari.">
        <form className={styles.form} action="/audit-log">
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Azione</span>
              <select name="action" defaultValue={filters.action ?? ""}>
                <option value="">Tutte</option>
                {auditActions.map((action) => (
                  <option key={action} value={action}>
                    {presentAuditAction(action).label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Elemento</span>
              <select name="entityType" defaultValue={filters.entityType ?? ""}>
                <option value="">Tutte</option>
                {auditEntityTypes.map((entityType) => (
                  <option key={entityType} value={entityType}>
                    {presentAuditEntityType(entityType).label}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>Da</span>
              <input name="from" type="date" defaultValue={filters.from ?? ""} />
            </label>
            <label className={styles.field}>
              <span>A</span>
              <input name="to" type="date" defaultValue={filters.to ?? ""} />
            </label>
          </div>
          {filters.outcome ? <input type="hidden" name="outcome" value={filters.outcome} /> : null}
          <div className={styles.actions}>
            <button className={styles.button} type="submit">
              Applica filtri
            </button>
            <a className={styles.ghostButton} href="/audit-log">
              Rimuovi filtri
            </a>
          </div>
        </form>
      </WorkspacePanel>

      <WorkspacePanel title="Eventi registrati" description="Sono mostrati soltanto i dettagli utili, senza identificatori interni o dati sensibili.">
        {data.events.length ? (
          <div className={styles.list}>
            {data.events.map((event) => {
              const entries = metadataEntries(event.metadata ?? null);
              return (
                <article className={styles.record} key={event.id}>
                  <div className={styles.recordMain}>
                    <strong>{presentAuditAction(event.action).label}</strong>
                    <span>
                      {presentAuditEntityType(event.entityType).label}
                    </span>
                    <small>
                      {formatDate(event.createdAt)}
                      {event.actorRole ? ` - ${presentOrganizationRole(event.actorRole).label}` : ""}
                    </small>
                    {entries.length ? (
                      <ul className={styles.compactList}>
                        {entries.map((entry) => (
                          <li key={entry.key}>
                            <span>{entry.label}</span>
                            <strong>{entry.value}</strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Nessun dettaglio aggiuntivo.</p>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <WorkspaceState state={presentAuditOutcome(event.outcome)} />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <WorkspaceEmptyState
            title="Nessun evento audit da mostrare."
            description="Le azioni sensibili verranno registrate qui quando disponibili."
          />
        )}
        {data.nextCursor ? (
          <div className={styles.actions}>
            <a className={styles.ghostButton} href={filterHref({ ...filters, cursor: data.nextCursor })}>
              Mostra altri eventi
            </a>
          </div>
        ) : null}
      </WorkspacePanel>
    </WorkspacePage>
  );
}
