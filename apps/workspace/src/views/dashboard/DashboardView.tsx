import type {
  DashboardContextItem,
  DashboardPackageItem,
  DashboardResponse,
  DashboardSituation,
  DashboardSituationKind,
} from "@qoovex/types";
import {
  Button,
  ClockCountdown,
  FileDashed,
  Icon,
  MagnifyingGlass,
  ShareNetwork,
  WarningCircle,
} from "@qoovex/ui";
import Link from "next/link";
import styles from "./DashboardView.module.css";

const situationIcons: Record<DashboardSituationKind, typeof WarningCircle> = {
  EXPIRED: WarningCircle,
  EXPIRING_SOON: ClockCountdown,
  MISSING: FileDashed,
  TO_REVIEW: MagnifyingGlass,
};

const summaryLinks = [
  { key: "expired", label: "scadute", href: "/documents?status=EXPIRED&from=dashboard" },
  { key: "expiringSoon", label: "in scadenza", href: "/documents?status=EXPIRING_SOON&from=dashboard" },
  { key: "missing", label: "mancanti", href: "/documents?status=MISSING&from=dashboard" },
  { key: "toReview", label: "da verificare", href: "/documents?status=TO_REVIEW&from=dashboard" },
] as const;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("it-IT", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function SectionError({ message }: { message: string }) {
  return (
    <div className={styles.sectionError} role="status">
      <strong>Sezione non disponibile</strong>
      <p>{message}</p>
      <Button href="/dashboard" size="sm" variant="secondary">Riprova</Button>
    </div>
  );
}

function SituationItem({ item, updated }: { item: DashboardSituation; updated: boolean }) {
  const assignmentAction = item.responsibility.assignmentHref ? (
    <Link className={styles.assignmentLink} href={item.responsibility.assignmentHref}>Assegna responsabile</Link>
  ) : null;

  return (
    <article className={styles.situation} data-kind={item.kind} data-updated={updated || undefined}>
      <div aria-hidden="true" className={styles.traceMarker}>
        <Icon glyph={situationIcons[item.kind]} size={20} weight="bold" />
      </div>
      <div className={styles.situationBody}>
        <header className={styles.situationHeading}>
          <p className={styles.stateLabel}>{item.statusLabel}</p>
          {item.date ? <time dateTime={item.date}>{formatDate(item.date)}</time> : null}
        </header>
        <h3>{item.title}</h3>
        <p className={styles.reason}>{item.reason}</p>
        <p className={styles.consequence}>{item.consequence}</p>
        <dl className={styles.situationMeta}>
          <div><dt>Contesto</dt><dd>{item.contextLabel}</dd></div>
          <div><dt>Responsabile</dt><dd>{item.responsibility.label}{assignmentAction}</dd></div>
        </dl>
        <div className={styles.terminal}>
          <Button href={item.action.href} size="sm">{item.action.label}</Button>
          {updated ? <span className={styles.updatedLabel}>Aggiornato ora</span> : null}
        </div>
      </div>
    </article>
  );
}

function PackageItem({ item }: { item: DashboardPackageItem }) {
  return (
    <article className={styles.packageItem}>
      <div aria-hidden="true" className={styles.packageIcon}><Icon glyph={ShareNetwork} size={20} /></div>
      <div>
        <p className={styles.stateLabel}>{item.statusLabel}</p>
        <h3>{item.title}</h3>
        <p>{item.itemCount} {item.itemCount === 1 ? "elemento" : "elementi"} · {item.shareLabel}</p>
        <Button href={item.action.href} size="sm" variant="secondary">{item.action.label}</Button>
      </div>
    </article>
  );
}

function ContextItem({ item }: { item: DashboardContextItem }) {
  return (
    <li>
      <div><strong>{item.label}</strong><span>{item.situationCount} {item.situationCount === 1 ? "situazione" : "situazioni"}</span></div>
      <Link href={item.action.href}>{item.action.label}</Link>
    </li>
  );
}

export function DashboardView({ data, updatedId }: { data: DashboardResponse; updatedId?: string | null }) {
  const errorFor = (section: DashboardResponse["errors"][number]["section"]) => data.errors.find((error) => error.section === section);
  const attentionError = errorFor("attention");
  const sharingError = errorFor("sharing");
  const deadlinesError = errorFor("deadlines");
  const contextsError = errorFor("contexts");
  const fullError = Boolean(attentionError && deadlinesError && (!data.availability.sharing || sharingError));

  if (fullError) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div><p className={styles.company}>{data.organization.name}</p><h1>Da fare</h1></div>
        </header>
        <section className={styles.fullError}>
          <strong>Non riusciamo a caricare la situazione operativa.</strong>
          <p>I dati non sono stati modificati. Riprova tra poco.</p>
          <Button href="/dashboard" variant="secondary">Riprova</Button>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.company}>{data.organization.name}</p>
          <h1>Da fare</h1>
        </div>
        <div className={styles.headerContext}>
          <p>Vista: {data.organization.viewLabel}</p>
          <p>{data.organization.roleLabel}</p>
          <p>Aggiornato alle <time dateTime={data.generatedAt}>{formatTime(data.generatedAt)}</time></p>
        </div>
      </header>

      {!attentionError ? (
        <section aria-labelledby="operational-summary" className={styles.summary}>
          <p id="operational-summary"><strong>{data.attention.total}</strong> {data.attention.total === 1 ? "situazione richiede" : "situazioni richiedono"} attenzione</p>
          {data.attention.total > 0 ? (
            <nav aria-label="Filtra le situazioni per stato" className={styles.summaryIndex}>
              {summaryLinks.flatMap((item) => {
                const count = data.attention.counts[item.key];
                return count ? [<Link href={item.href} key={item.key}>{count} {item.label}</Link>] : [];
              })}
            </nav>
          ) : null}
        </section>
      ) : null}

      {data.firstUse ? (
        <section className={styles.firstUse}>
          <p className={styles.stateLabel}>Primo passo</p>
          <h2>Inizia dal primo documento</h2>
          <p>Aggiungi un documento logico per rendere visibili presenza, scadenza e prossima azione. Potrai collegare il file dal dettaglio.</p>
          <Button href="/documents?from=dashboard">Aggiungi documento</Button>
          <div className={styles.secondaryStarts}>
            <Link href="/workers?from=dashboard">Aggiungi un lavoratore</Link>
            <Link href="/job-sites?from=dashboard">Aggiungi un cantiere</Link>
          </div>
        </section>
      ) : (
        <div className={styles.dashboardGrid}>
          <section aria-labelledby="attention-title" className={styles.attentionSection}>
            <div className={styles.sectionHeading}>
              <div><p className={styles.sectionIndex}>01</p><h2 id="attention-title">Da fare ora</h2></div>
              {data.attention.total > data.attention.situations.length ? <Link href="/documents?from=dashboard">Vedi tutte le situazioni</Link> : null}
            </div>
            {attentionError ? <SectionError message={attentionError.message} /> : data.attention.situations.length ? (
              <div className={styles.situationList}>
                {data.attention.situations.map((item) => <SituationItem item={item} key={item.id} updated={Boolean(updatedId && (item.id === updatedId || item.id.endsWith(updatedId)))} />)}
              </div>
            ) : (
              <div className={styles.regularState}>
                <strong>Nessuna azione immediata in base ai dati registrati.</strong>
                <p>Le prossime scadenze e i pacchetti restano disponibili nelle sezioni vicine.</p>
              </div>
            )}
          </section>

          <aside className={styles.secondaryColumn}>
            {data.availability.sharing ? (
              <section aria-labelledby="sharing-title" className={styles.secondarySection}>
                <div className={styles.sectionHeading}><div><p className={styles.sectionIndex}>02</p><h2 id="sharing-title">Pronto da condividere</h2></div></div>
                {sharingError ? <SectionError message={sharingError.message} /> : data.readyPackages.length ? (
                  <div className={styles.packageList}>{data.readyPackages.map((item) => <PackageItem item={item} key={item.id} />)}</div>
                ) : (
                  <p className={styles.compactEmpty}>Nessun pacchetto pronto per revisione.</p>
                )}
                <Link className={styles.sectionLink} href="/document-packages?from=dashboard">Vedi tutti i pacchetti</Link>
              </section>
            ) : null}

            <section aria-labelledby="deadlines-title" className={styles.secondarySection}>
              <div className={styles.sectionHeading}><div><p className={styles.sectionIndex}>{data.availability.sharing ? "03" : "02"}</p><h2 id="deadlines-title">Prossime scadenze</h2></div></div>
              {deadlinesError ? <SectionError message={deadlinesError.message} /> : data.upcomingDeadlines.length ? (
                <ol className={styles.deadlineList}>
                  {data.upcomingDeadlines.map((deadline) => (
                    <li key={deadline.id}>
                      <time dateTime={deadline.dueDate}>{formatDate(deadline.dueDate)}</time>
                      <div><strong>{deadline.title}</strong><span>{deadline.timingLabel} · {deadline.contextLabel}</span></div>
                      <Link href={deadline.action.href}>Apri</Link>
                    </li>
                  ))}
                </ol>
              ) : <p className={styles.compactEmpty}>Nessuna scadenza registrata da mostrare.</p>}
              <Link className={styles.sectionLink} href="/deadlines?from=dashboard">Vedi tutte le scadenze</Link>
            </section>
          </aside>
        </div>
      )}

      {!data.firstUse && data.availability.contexts ? (
        <section aria-labelledby="contexts-title" className={styles.contextSection}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.sectionIndex}>{data.availability.sharing ? "04" : "03"}</p><h2 id="contexts-title">Dove intervenire</h2></div>
            {data.organization.role === "OWNER" || data.organization.role === "ADMIN" ? <Link href="/access?from=dashboard">Accessi operativi</Link> : null}
          </div>
          {contextsError ? <SectionError message={contextsError.message} /> : data.contexts.length ? (
            <ul className={styles.contextList}>{data.contexts.map((item) => <ContextItem item={item} key={item.id} />)}</ul>
          ) : <p className={styles.compactEmpty}>Nessuna risorsa assegnata alle situazioni visibili.</p>}
        </section>
      ) : null}
    </div>
  );
}
