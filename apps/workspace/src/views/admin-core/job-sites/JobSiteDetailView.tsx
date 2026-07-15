import Link from "next/link";
import { JobSiteArchiveButton } from "./JobSiteArchiveButton";
import { JobSiteForm } from "./JobSiteForm";
import styles from "../AdminCore.module.css";
import { WorkspacePage, WorkspacePageHeader, WorkspacePanel, WorkspaceState } from "@/views/workspace/WorkspacePrimitives";
import { deadlineStatusLabels, documentStatusLabels, formatDate, recordStatusLabels, statusTone } from "@/views/workspace/workspace-format";
import type { WorkspaceCapabilities, WorkspaceDeadlineRecord, WorkspaceDocumentRecord, WorkspaceJobSiteRecord } from "@/views/workspace/workspace-records";
import type { JobSiteUserAssignmentResponse, JobSiteWorkerAssignmentResponse } from "@qoovex/types";
import type { WorkspaceChecklistRecord, WorkspaceDocumentPackageRecord, WorkspaceEvidenceRecord } from "@/views/workspace/workspace-records";

export function JobSiteDetailView({ jobSite, documents, deadlines, evidence, checklists, packages, userAssignments, workerAssignments, capabilities }: { jobSite: WorkspaceJobSiteRecord; documents: WorkspaceDocumentRecord[]; deadlines: WorkspaceDeadlineRecord[]; evidence: WorkspaceEvidenceRecord[]; checklists: WorkspaceChecklistRecord[]; packages: WorkspaceDocumentPackageRecord[]; userAssignments: JobSiteUserAssignmentResponse[]; workerAssignments: JobSiteWorkerAssignmentResponse[]; capabilities: WorkspaceCapabilities }) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader title={jobSite.name} description={jobSite.clientName || "Committente non indicato"} action={<Link className={styles.ghostButton} href="/job-sites">Torna ai cantieri</Link>} />
      <WorkspacePanel title="Riepilogo" description="Stato corrente e azioni più frequenti.">
            <article className={styles.record}>
              <div className={styles.recordMain}>
                <strong>{jobSite.name}</strong>
                <span>{jobSite.address || "Indirizzo non registrato"}</span>
                <small>{formatDate(jobSite.startDate)} - {formatDate(jobSite.endDate)}</small>
                <small>{jobSite.notes || "Nessuna nota operativa registrata."}</small>
              </div>
              <div className={styles.actions}>
                <WorkspaceState label={recordStatusLabels[jobSite.status]} tone={statusTone(jobSite.status)} />
              </div>
            </article>
      </WorkspacePanel>
      <WorkspacePanel title="Prossima azione" description="Il contesto del cantiere viene mantenuto nei nuovi elementi.">
        <div className={styles.actions}>
          {capabilities.canCreateDocuments ? <Link className={styles.linkButton} href={`/documents/new?origin=job-site&jobSiteId=${jobSite.id}`}>Aggiungi documento</Link> : null}
          {capabilities.canUploadEvidence ? <Link className={styles.ghostButton} href={`/evidence/new?origin=job-site&jobSiteId=${jobSite.id}`}>Aggiungi prova</Link> : null}
          {capabilities.canCreateDeadlines ? <Link className={styles.ghostButton} href={`/deadlines/new?origin=job-site&jobSiteId=${jobSite.id}`}>Aggiungi scadenza</Link> : null}
          {capabilities.canManageChecklists ? <Link className={styles.ghostButton} href={`/checklists/new?origin=job-site&jobSiteId=${jobSite.id}`}>Crea checklist</Link> : null}
          {capabilities.canManagePackages ? <Link className={styles.ghostButton} href={`/document-packages/new?origin=job-site&jobSiteId=${jobSite.id}`}>Prepara condivisione</Link> : null}
        </div>
      </WorkspacePanel>
      <div className={styles.grid}>
          <WorkspacePanel title="Documenti collegati">
            {!documents.length ? <p className="qv-text-muted">Nessun documento collegato al cantiere.</p> : (
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
          <WorkspacePanel title="Scadenze registrate">
            {!deadlines.length ? <p className="qv-text-muted">Nessuna scadenza collegata al cantiere.</p> : (
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
          <WorkspacePanel title="Checklist" description={`${checklists.reduce((total, item) => total + (item.items?.filter((entry) => entry.status !== "DONE").length ?? 0), 0)} voci aperte.`}>
            {!checklists.length ? <p className="qv-text-muted">Nessuna checklist visibile per questo cantiere.</p> : <div className={styles.list}>{checklists.map((checklist) => <article className={styles.record} key={checklist.id}><div className={styles.recordMain}><strong>{checklist.name}</strong><span>{checklist.items?.filter((item) => item.status === "DONE").length ?? 0} completate su {checklist.items?.length ?? 0}</span></div><div className={styles.actions}><Link className={styles.linkButton} href={`/checklists/${checklist.id}`}>Apri</Link></div></article>)}</div>}
          </WorkspacePanel>
          <WorkspacePanel title="Prove">
            {!evidence.length ? <p className="qv-text-muted">Nessuna prova registrata nel cantiere.</p> : <div className={styles.list}>{evidence.slice(0, 8).map((item) => <article className={styles.record} key={item.id}><div className={styles.recordMain}><strong>{item.title}</strong><span>{item.type === "NOTE" ? "Nota" : item.originalFileName ?? "File caricato"}</span></div>{item.hasFile ? <div className={styles.actions}><a className={styles.linkButton} href={`/api/evidence/${item.id}/download`}>Scarica</a></div> : null}</article>)}</div>}
          </WorkspacePanel>
          {capabilities.canReadAssignments ? <WorkspacePanel title="Persone assegnate" description="Responsabile e lavoratori collegati al cantiere."><div className={styles.list}>{userAssignments.map((item) => <article className={styles.record} key={item.id}><div className={styles.recordMain}><strong>{item.userLabel}</strong><span>Responsabile cantiere</span></div></article>)}{workerAssignments.map((item) => <article className={styles.record} key={item.id}><div className={styles.recordMain}><strong>{item.workerDisplayName}</strong><span>{item.workerRoleLabel || "Ruolo operativo non indicato"}</span></div></article>)}</div><Link className={styles.ghostButton} href="/access">Gestisci assegnazioni</Link></WorkspacePanel> : null}
          {capabilities.canManagePackages ? <WorkspacePanel title="Condivisioni preparate">{!packages.length ? <p className="qv-text-muted">Nessuna condivisione preparata per questo cantiere.</p> : <div className={styles.list}>{packages.map((item) => <article className={styles.record} key={item.id}><div className={styles.recordMain}><strong>{item.title}</strong><span>{item.items?.length ?? 0} elementi</span></div><div className={styles.actions}><Link className={styles.linkButton} href={`/document-packages/${item.id}`}>Controlla</Link></div></article>)}</div>}</WorkspacePanel> : null}
        </div>
      {capabilities.canManageCore ? <WorkspacePanel title="Gestione avanzata" description="Modifica informazioni o archivia il cantiere in una zona separata."><details className={styles.details}><summary>Modifica informazioni</summary><JobSiteForm mode="update" jobSite={jobSite} /></details><details className={styles.details}><summary>Zona riservata</summary><JobSiteArchiveButton jobSiteId={jobSite.id} redirectToList /></details></WorkspacePanel> : null}
    </WorkspacePage>
  );
}
