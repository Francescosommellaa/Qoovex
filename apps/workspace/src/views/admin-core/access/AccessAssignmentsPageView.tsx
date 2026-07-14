"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { submitJson } from "../admin-api-client";
import styles from "../AdminCore.module.css";
import { WorkspaceEmptyState, WorkspacePage, WorkspacePageHeader, WorkspacePanel } from "@/views/workspace/WorkspacePrimitives";
import type {
  JobSiteUserAssignmentResponse,
  JobSiteWorkerAssignmentResponse,
  WorkerUserLinkResponse,
} from "@qoovex/types";

interface AssignmentOptions {
  workers: Array<{ id: string; displayName: string; roleLabel?: string | null; status: string }>;
  jobSites: Array<{ id: string; name: string; status: string }>;
  users: Array<{ id: string; label: string; email: string; role: string }>;
}

interface AccessAssignmentsPageViewProps {
  workerUserLinks: WorkerUserLinkResponse[];
  jobSiteUserAssignments: JobSiteUserAssignmentResponse[];
  jobSiteWorkerAssignments: JobSiteWorkerAssignmentResponse[];
  options: AssignmentOptions;
  returnToDashboard?: boolean;
}

function roleLabel(role: string) {
  if (role === "SITE_MANAGER") return "Capocantiere";
  if (role === "WORKER") return "Lavoratore";
  return role;
}

function AssignmentArchiveButton({ endpoint }: { endpoint: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function archive() {
    setPending(true);
    setError(null);
    try {
      await submitJson(endpoint, "DELETE");
      router.refresh();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Archiviazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <button className={styles.dangerButton} disabled={pending} onClick={archive} type="button">
        {pending ? "Archiviazione..." : "Archivia"}
      </button>
    </div>
  );
}

function WorkerUserLinkForm({ options }: { options: AssignmentOptions }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await submitJson("/api/resource-assignments/worker-user-links", "POST", {
        workerId: formData.get("workerId"),
        userId: formData.get("userId"),
      });
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Collegamento non riuscito.");
    } finally {
      setPending(false);
    }
  }

  const workers = options.workers;
  const users = options.users.filter((user) => user.role === "WORKER");
  return (
    <form action={submit} className={styles.form}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <label className={styles.field}>
        <span>Lavoratore</span>
        <select name="workerId" required>
          <option value="">Seleziona lavoratore</option>
          {workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.displayName}</option>)}
        </select>
      </label>
      <label className={styles.field}>
        <span>Utente</span>
        <select name="userId" required>
          <option value="">Seleziona utente</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.label} - {user.email}</option>)}
        </select>
      </label>
      <button className={styles.button} disabled={pending || !workers.length || !users.length} type="submit">
        {pending ? "Collegamento..." : "Collega utente"}
      </button>
    </form>
  );
}

function JobSiteUserAssignmentForm({ options }: { options: AssignmentOptions }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await submitJson("/api/resource-assignments/job-site-user-assignments", "POST", {
        jobSiteId: formData.get("jobSiteId"),
        userId: formData.get("userId"),
      });
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Assegnazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  const users = options.users.filter((user) => user.role === "SITE_MANAGER");
  return (
    <form action={submit} className={styles.form}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <label className={styles.field}>
        <span>Cantiere</span>
        <select name="jobSiteId" required>
          <option value="">Seleziona cantiere</option>
          {options.jobSites.map((jobSite) => <option key={jobSite.id} value={jobSite.id}>{jobSite.name}</option>)}
        </select>
      </label>
      <label className={styles.field}>
        <span>Capocantiere</span>
        <select name="userId" required>
          <option value="">Seleziona utente</option>
          {users.map((user) => <option key={user.id} value={user.id}>{user.label} - {user.email}</option>)}
        </select>
      </label>
      <button className={styles.button} disabled={pending || !options.jobSites.length || !users.length} type="submit">
        {pending ? "Assegnazione..." : "Assegna cantiere"}
      </button>
    </form>
  );
}

function JobSiteWorkerAssignmentForm({ options }: { options: AssignmentOptions }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setPending(true);
    setError(null);
    try {
      await submitJson("/api/resource-assignments/job-site-worker-assignments", "POST", {
        jobSiteId: formData.get("jobSiteId"),
        workerId: formData.get("workerId"),
      });
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Assegnazione non riuscita.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={submit} className={styles.form}>
      {error ? <p className={styles.formError}>{error}</p> : null}
      <label className={styles.field}>
        <span>Cantiere</span>
        <select name="jobSiteId" required>
          <option value="">Seleziona cantiere</option>
          {options.jobSites.map((jobSite) => <option key={jobSite.id} value={jobSite.id}>{jobSite.name}</option>)}
        </select>
      </label>
      <label className={styles.field}>
        <span>Lavoratore</span>
        <select name="workerId" required>
          <option value="">Seleziona lavoratore</option>
          {options.workers.map((worker) => <option key={worker.id} value={worker.id}>{worker.displayName}</option>)}
        </select>
      </label>
      <button className={styles.button} disabled={pending || !options.jobSites.length || !options.workers.length} type="submit">
        {pending ? "Assegnazione..." : "Assegna lavoratore"}
      </button>
    </form>
  );
}

export function AccessAssignmentsPageView({
  workerUserLinks,
  jobSiteUserAssignments,
  jobSiteWorkerAssignments,
  options,
  returnToDashboard = false,
}: AccessAssignmentsPageViewProps) {
  return (
    <WorkspacePage>
      <WorkspacePageHeader
        title="Accessi operativi"
        description="Collega utenti, lavoratori e cantieri per limitare la vista alle risorse assegnate."
        action={returnToDashboard ? <Link className={styles.ghostButton} href="/dashboard">Torna alla dashboard</Link> : undefined}
      />
      <div className={styles.grid}>
        <WorkspacePanel title="Collega utenti e lavoratori" description="Collegamento operativo per mostrare al lavoratore solo i propri dati.">
          <WorkerUserLinkForm options={options} />
          <div className={styles.list}>
            {!workerUserLinks.length ? (
              <WorkspaceEmptyState title="Nessun collegamento operativo" description="Collega un utente a un lavoratore per attivare lo scope personale." />
            ) : workerUserLinks.map((link) => (
              <article className={styles.record} key={link.id}>
                <div className={styles.recordMain}>
                  <strong>{link.workerDisplayName}</strong>
                  <span>{link.userLabel}</span>
                  <small>{link.userEmail}</small>
                </div>
                <div className={styles.actions}>
                  <AssignmentArchiveButton endpoint={`/api/resource-assignments/worker-user-links/${link.id}`} />
                </div>
              </article>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Assegna capocantiere ai cantieri" description="Il capocantiere vede solo i cantieri assegnati e risorse collegate.">
          <JobSiteUserAssignmentForm options={options} />
          <div className={styles.list}>
            {!jobSiteUserAssignments.length ? (
              <WorkspaceEmptyState title="Nessun cantiere assegnato" description="Assegna un cantiere per creare un accesso limitato al contesto operativo." />
            ) : jobSiteUserAssignments.map((assignment) => (
              <article className={styles.record} key={assignment.id}>
                <div className={styles.recordMain}>
                  <strong>{assignment.jobSiteName}</strong>
                  <span>{assignment.userLabel}</span>
                  <small>{roleLabel(assignment.assignmentRole)} - {assignment.userEmail}</small>
                </div>
                <div className={styles.actions}>
                  <AssignmentArchiveButton endpoint={`/api/resource-assignments/job-site-user-assignments/${assignment.id}`} />
                </div>
              </article>
            ))}
          </div>
        </WorkspacePanel>

        <WorkspacePanel title="Assegna lavoratori ai cantieri" description="Collega lavoratori ai cantieri per limitare dati e prove al contesto assegnato.">
          <JobSiteWorkerAssignmentForm options={options} />
          <div className={styles.list}>
            {!jobSiteWorkerAssignments.length ? (
              <WorkspaceEmptyState title="Nessun lavoratore assegnato" description="Assegna un lavoratore a un cantiere per collegare dati e prossime attivita." />
            ) : jobSiteWorkerAssignments.map((assignment) => (
              <article className={styles.record} key={assignment.id}>
                <div className={styles.recordMain}>
                  <strong>{assignment.workerDisplayName}</strong>
                  <span>{assignment.jobSiteName}</span>
                  <small>{assignment.workerRoleLabel || "Ruolo operativo non indicato"}</small>
                </div>
                <div className={styles.actions}>
                  <AssignmentArchiveButton endpoint={`/api/resource-assignments/job-site-worker-assignments/${assignment.id}`} />
                </div>
              </article>
            ))}
          </div>
        </WorkspacePanel>
      </div>
    </WorkspacePage>
  );
}
