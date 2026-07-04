import type {
  DashboardDeadlineItem,
  DashboardDocumentAttentionItem,
  DashboardEvidenceItem,
  DashboardJobSiteItem,
  DashboardNotificationItem,
  DashboardPackageItem,
  DashboardResponse,
  DashboardWorkerItem,
  DocumentPackageStatus,
  DocumentStatus,
} from "@qoovex/types";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./DashboardView.module.css";

const documentStatusLabels: Record<DocumentStatus, string> = {
  PRESENT: "Presente",
  MISSING: "Mancante",
  EXPIRED: "Scaduto",
  EXPIRING_SOON: "In scadenza",
  TO_REVIEW: "Da verificare",
  ARCHIVED: "Archiviato",
};

const packageStatusLabels: Record<DocumentPackageStatus, string> = {
  DRAFT: "Bozza",
  READY_FOR_REVIEW: "Pronto per revisione",
  SHARED: "Condiviso in lettura",
  ARCHIVED: "Archiviato",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function attentionTone(status: string) {
  if (status === "EXPIRED" || status === "MISSING") return styles.toneDanger;
  if (status === "EXPIRING_SOON") return styles.toneWarning;
  if (status === "READY_FOR_REVIEW" || status === "SHARED" || status === "PRESENT") return styles.toneGood;
  return styles.toneInfo;
}

function Section({ title, children, action }: { title: string; children: ReactNode; action?: string }) {
  return (
    <section className={styles.section} aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-title`}>
      <div className={styles.sectionHeader}>
        <h2 id={`${title.replace(/\s+/g, "-").toLowerCase()}-title`}>{title}</h2>
        {action ? <span>{action}</span> : null}
      </div>
      {children}
    </section>
  );
}

function EmptyList({ label }: { label: string }) {
  return <p className={styles.emptyList}>{label}</p>;
}

function DashboardSummaryCards({ data }: { data: DashboardResponse }) {
  const cards = [
    { label: "Documenti mancanti", value: data.summary.documents.missing, tone: "danger" },
    { label: "Documenti scaduti", value: data.summary.documents.expired, tone: "danger" },
    { label: "In scadenza", value: data.summary.documents.expiringSoon, tone: "warning" },
    { label: "Da verificare", value: data.summary.documents.toReview, tone: "info" },
    { label: "Pacchetti pronti", value: data.summary.packagesReadyForReview, tone: "good" },
    { label: "Prove recenti", value: data.summary.recentEvidence, tone: "neutral" },
    { label: "Notifiche non lette", value: data.summary.unreadNotifications, tone: "warning" },
  ];

  return (
    <div className={styles.summaryGrid}>
      {cards.map((card) => (
        <article className={`${styles.summaryCard} ${styles[`summary_${card.tone}`]}`} key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </article>
      ))}
    </div>
  );
}

function DashboardNotificationsList({ notifications }: { notifications: DashboardNotificationItem[] }) {
  if (!notifications.length) return <EmptyList label="Nessuna notifica da controllare." />;
  return (
    <div className={styles.itemList}>
      {notifications.map((notification) => (
        <article className={styles.rowItem} key={notification.id}>
          <div>
            <strong>{notification.title}</strong>
            <span>{notification.message}</span>
          </div>
          {notification.actionHref ? <Link className={styles.inlineLink} href={notification.actionHref}>Apri</Link> : null}
        </article>
      ))}
    </div>
  );
}

function DashboardQuickActions({ data }: { data: DashboardResponse }) {
  return (
    <div className={styles.actionsGrid}>
      {data.quickActions.map((action) => (
        <button className={styles.actionButton} disabled={action.disabled} key={action.label} type="button">
          <span>{action.label}</span>
          <small>{action.disabledReason ?? action.description}</small>
        </button>
      ))}
    </div>
  );
}

function DashboardDeadlinesList({ deadlines }: { deadlines: DashboardDeadlineItem[] }) {
  if (!deadlines.length) return <EmptyList label="Nessuna scadenza registrata da mostrare." />;
  return (
    <div className={styles.itemList}>
      {deadlines.map((deadline) => (
        <article className={styles.rowItem} key={deadline.id}>
          <div>
            <strong>{deadline.title}</strong>
            <span>Scadenza registrata: {formatDate(deadline.dueDate)}</span>
          </div>
          <span className={`${styles.statusPill} ${attentionTone(deadline.status)}`}>{deadline.status === "EXPIRED" ? "Scaduto" : deadline.status === "EXPIRING_SOON" ? "In scadenza" : "Futura"}</span>
        </article>
      ))}
    </div>
  );
}

function DashboardDocumentsList({ documents }: { documents: DashboardDocumentAttentionItem[] }) {
  if (!documents.length) return <EmptyList label="Nessun documento richiede attenzione immediata." />;
  return (
    <div className={styles.itemList}>
      {documents.map((document) => (
        <article className={styles.rowItem} key={document.id}>
          <div>
            <strong>{document.title}</strong>
            <span>{document.ownerLabel} - {document.expiryDate ? `Scadenza ${formatDate(document.expiryDate)}` : "Scadenza non registrata"}</span>
            <small>{document.nextAction}</small>
          </div>
          <span className={`${styles.statusPill} ${attentionTone(document.status)}`}>{documentStatusLabels[document.status]}</span>
        </article>
      ))}
    </div>
  );
}

function DashboardJobSitesList({ jobSites }: { jobSites: DashboardJobSiteItem[] }) {
  if (!jobSites.length) return <EmptyList label="Nessun cantiere attivo registrato." />;
  return (
    <div className={styles.compactList}>
      {jobSites.map((jobSite) => (
        <article className={styles.compactItem} key={jobSite.id}>
          <strong>{jobSite.name}</strong>
          <span>{jobSite.documentsToReview} documenti da verificare</span>
          <span>{jobSite.openChecklists} checklist configurate</span>
        </article>
      ))}
    </div>
  );
}

function DashboardWorkersOverview({ workers }: { workers: DashboardWorkerItem[] }) {
  if (!workers.length) return <EmptyList label="Nessun lavoratore registrato." />;
  return (
    <div className={styles.compactList}>
      {workers.map((worker) => (
        <article className={styles.compactItem} key={worker.id}>
          <strong>{worker.displayName}</strong>
          <span>{worker.documentsToReview} documenti da verificare</span>
          <span>{worker.openDeadlines} scadenze registrate</span>
        </article>
      ))}
    </div>
  );
}

function DashboardPackagesList({ packages }: { packages: DashboardPackageItem[] }) {
  if (!packages.length) return <EmptyList label="Nessun pacchetto documentale attivo." />;
  return (
    <div className={styles.itemList}>
      {packages.map((documentPackage) => (
        <article className={styles.rowItem} key={documentPackage.id}>
          <div>
            <strong>{documentPackage.title}</strong>
            <span>{documentPackage.itemCount} elementi inclusi - aggiornato {formatDate(documentPackage.updatedAt)}</span>
          </div>
          <span className={`${styles.statusPill} ${attentionTone(documentPackage.status)}`}>
            {documentPackage.hasActiveShareLink ? "Link attivo" : packageStatusLabels[documentPackage.status]}
          </span>
        </article>
      ))}
    </div>
  );
}

function DashboardEvidenceList({ evidence }: { evidence: DashboardEvidenceItem[] }) {
  if (!evidence.length) return <EmptyList label="Nessuna prova operativa caricata." />;
  return (
    <div className={styles.compactList}>
      {evidence.map((item) => (
        <article className={styles.compactItem} key={item.id}>
          <strong>{item.title}</strong>
          <span>{item.type === "NOTE" ? "Nota operativa" : item.type === "PHOTO" ? "Foto collegata" : "File archiviato"}</span>
          <span>{formatDate(item.createdAt)}</span>
        </article>
      ))}
    </div>
  );
}

function DashboardEmptyState({ data }: { data: DashboardResponse }) {
  if (!data.emptyStates.length) return null;
  return (
    <section className={styles.emptyState} aria-label="Primi passi consigliati">
      <h2>Prossima azione utile</h2>
      <div className={styles.emptyStateGrid}>
        {data.emptyStates.map((state) => (
          <article key={state.title}>
            <strong>{state.title}</strong>
            <span>{state.actionLabel}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

export function DashboardAccessState() {
  return (
    <main className={styles.page}>
      <section className={styles.accessState}>
        <h1>Dashboard non disponibile</h1>
        <p>Verifica accesso e azienda attiva. Nessun reset DB eseguito.</p>
      </section>
    </main>
  );
}

export function DashboardView({ data }: { data: DashboardResponse }) {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p>{data.organization.name}</p>
          <h1>Stato documentale</h1>
        </div>
        <span>Ruolo: {data.organization.role}</span>
      </header>

      <DashboardSummaryCards data={data} />
      <DashboardEmptyState data={data} />

      <div className={styles.mainGrid}>
        <Section title="Azioni rapide">
          <DashboardQuickActions data={data} />
        </Section>

        <Section title="Notifiche interne" action={`${data.summary.unreadNotifications} non lette`}>
          <DashboardNotificationsList notifications={data.notifications} />
          <Link className={styles.sectionLink} href="/notifications">Vai alle notifiche</Link>
        </Section>

        <Section title="Scadenze registrate" action={`${data.summary.openDeadlines} aperte`}>
          <DashboardDeadlinesList deadlines={data.deadlines} />
        </Section>

        <Section title="Documenti da verificare">
          <DashboardDocumentsList documents={data.documentsToReview} />
        </Section>

        <Section title="Cantieri attivi">
          <DashboardJobSitesList jobSites={data.jobSites} />
        </Section>

        <Section title="Lavoratori">
          <DashboardWorkersOverview workers={data.workers} />
        </Section>

        <Section title="Pacchetti pronti per revisione" action={`${data.summary.sharedPackages} condivisi`}>
          <DashboardPackagesList packages={data.packages} />
        </Section>

        <Section title="Prove recenti">
          <DashboardEvidenceList evidence={data.recentEvidence} />
        </Section>
      </div>

      <p className={styles.disclaimer}>Le informazioni devono essere confermate dal responsabile o consulente.</p>
    </main>
  );
}
