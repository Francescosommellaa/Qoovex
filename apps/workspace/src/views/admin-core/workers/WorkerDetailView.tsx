import Link from "next/link";
import { WorkerArchiveButton } from "./WorkerArchiveButton";
import { WorkerForm } from "./WorkerForm";
import styles from "../AdminCore.module.css";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { deadlineStatusLabels, documentStatusLabels, formatDate, recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceWorkerRecord } from "@/views/workspace/workspace-records";
import type { WorkerUserLinkResponse } from "@qoovex/types";
import type { WorkspaceEvidenceRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";

export function WorkerDetailView({ worker, documents, deadlines, evidence, jobSites, userLinks, capabilities }: { worker: WorkspaceWorkerRecord; documents: WorkspaceDocumentRecord[]; deadlines: WorkspaceDeadlineRecord[]; evidence: WorkspaceEvidenceRecord[]; jobSites: WorkspaceJobSiteRecord[]; userLinks: WorkerUserLinkResponse[]; capabilities: WorkspaceCapabilities }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title={worker.displayName} description={worker.roleLabel || "Ruolo operativo non indicato"} action={<Link className={styles.ghostButton} href="/workers">Torna ai lavoratori</Link>} />
      <WorkspacePanel title="Riepilogo" description="Dati minimi e stato corrente.">
            <article className={styles.record}>
              <div className={styles.recordMain}>
                <strong>{worker.displayName}</strong>
                <span>{worker.email || "Email non registrata"}</span>
                <span>{worker.phone || "Telefono non registrato"}</span>
                <small>{worker.notes || "Nessuna nota operativa registrata."}</small>
              </div>
              <div className={styles.actions}>
                <WorkspaceState label={recordStatusLabels[worker.status]} tone={statusTone(worker.status)} />
              </div>
            </article>
      </WorkspacePanel>
      <WorkspacePanel title="Prossima azione" description="Il lavoratore viene già collegato ai nuovi elementi."><div className={styles.actions}>{capabilities.canCreateDocuments ? <Link className={styles.linkButton} href={`/documents/new?origin=worker&workerId=${worker.id}`}>Aggiungi documento</Link> : null}{capabilities.canUploadEvidence ? <Link className={styles.ghostButton} href={`/evidence/new?origin=worker&workerId=${worker.id}`}>Aggiungi prova</Link> : null}{capabilities.canCreateDeadlines ? <Link className={styles.ghostButton} href={`/deadlines/new?origin=worker&workerId=${worker.id}`}>Aggiungi scadenza</Link> : null}</div></WorkspacePanel>
      <div className={styles.grid}>
          <WorkspacePanel title="Documenti collegati">
            {!documents.length ? <p className="text-muted-foreground">Nessun documento collegato al lavoratore.</p> : (
              <div className={styles.list}>
                {documents.map((document) => (
                  <article className={styles.record} key={document.id}>
                    <div className={styles.recordMain}>
                      <strong>{document.title}</strong>
                      <span>Scadenza: {formatDate(document.expiryDate)}</span>
                    </div>
                    <div className={styles.actions}>
                      <WorkspaceState label={documentStatusLabels[document.status]} tone={statusTone(document.status)} />
                      <Link className={styles.linkButton} href={`/documents/${document.id}`}>Apri</Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </WorkspacePanel>
          <WorkspacePanel title="Scadenze collegate">
            {!deadlines.length ? <p className="text-muted-foreground">Nessuna scadenza collegata al lavoratore.</p> : (
              <div className={styles.list}>
                {deadlines.map((deadline) => (
                  <article className={styles.record} key={deadline.id}>
                    <div className={styles.recordMain}>
                      <strong>{deadline.title}</strong>
                      <span>{formatDate(deadline.dueDate)}</span>
                    </div>
                    <WorkspaceState label={deadlineStatusLabels[deadline.status]} tone={statusTone(deadline.status)} />
                  </article>
                ))}
              </div>
            )}
          </WorkspacePanel>
        <WorkspacePanel title="Cantieri assegnati">{!jobSites.length ? <p className="text-muted-foreground">Nessun cantiere assegnato visibile.</p> : <div className={styles.list}>{jobSites.map((site) => <article className={styles.record} key={site.id}><div className={styles.recordMain}><strong>{site.name}</strong><span>{site.clientName || "Committente non indicato"}</span></div><div className={styles.actions}><Link className={styles.linkButton} href={`/job-sites/${site.id}`}>Apri</Link></div></article>)}</div>}</WorkspacePanel>
        <WorkspacePanel title="Prove collegate">{!evidence.length ? <p className="text-muted-foreground">Nessuna prova collegata al lavoratore.</p> : <div className={styles.list}>{evidence.slice(0, 8).map((item) => <article className={styles.record} key={item.id}><div className={styles.recordMain}><strong>{item.title}</strong><span>{item.type === "NOTE" ? "Nota" : item.originalFileName ?? "File caricato"}</span></div>{item.hasFile ? <div className={styles.actions}><a className={styles.linkButton} href={`/api/evidence/${item.id}/download`}>Scarica</a></div> : null}</article>)}</div>}</WorkspacePanel>
        {capabilities.canReadAssignments ? <WorkspacePanel title="Accesso utente" description="Collegamento necessario per applicare lo scope personale.">{!userLinks.length ? <p className="text-muted-foreground">Nessun accesso utente collegato.</p> : userLinks.map((link) => <article className={styles.record} key={link.id}><div className={styles.recordMain}><strong>{link.userLabel}</strong><span>{link.userEmail}</span></div></article>)}<Link className={styles.ghostButton} href="/access">Gestisci accesso</Link></WorkspacePanel> : null}
      </div>
      {capabilities.canManageCore ? <WorkspacePanel title="Gestione avanzata" description="Modifica informazioni o archivia il lavoratore in una zona separata."><details className={styles.details}><summary>Modifica informazioni</summary><WorkerForm mode="update" worker={worker} /></details><details className={styles.details}><summary>Zona riservata</summary><WorkerArchiveButton workerId={worker.id} redirectToList /></details></WorkspacePanel> : null}
    </WorkspacePage>
  );
}
