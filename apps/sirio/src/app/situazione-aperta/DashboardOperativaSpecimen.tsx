import { Button, ClockCountdown, FileDashed, Icon, MagnifyingGlass, ShareNetwork, WarningCircle } from "@qoovex/ui";
import styles from "./situazione-aperta.module.css";

const situations = [
  {
    state: "Scaduto",
    title: "Attestazione assicurativa",
    reason: "La data registrata e trascorsa.",
    context: "Cantiere Via Roma",
    responsibility: "Interviene: Elena Mariani",
    action: "Controlla il documento",
    glyph: WarningCircle,
    tone: "expired",
  },
  {
    state: "In scadenza",
    title: "Documento Mario Rossi con un titolo volutamente lungo",
    reason: "La data registrata e tra 4 giorni.",
    context: "Mario Rossi",
    responsibility: "Intervieni tu",
    action: "Apri la scadenza",
    glyph: ClockCountdown,
    tone: "expiring",
  },
  {
    state: "Mancante",
    title: "Prova fotografica dell'attrezzatura",
    reason: "Il requisito configurato non ha ancora un documento collegato.",
    context: "Cantiere Via Roma",
    responsibility: "Responsabile non assegnato",
    action: "Aggiungi documento",
    glyph: FileDashed,
    tone: "missing",
  },
] as const;

const proofStates = [
  ["Primo accesso", "Inizia dal primo documento; lavoratore e cantiere restano alternative."],
  ["Situazione regolare", "Nessuna azione immediata in base ai dati registrati."],
  ["Molte criticita", "Prime cinque situazioni e accesso alla lista completa."],
  ["Caricamento", "Scheletro della struttura reale con header stabile e aria-busy."],
  ["Errore parziale", "La sezione fallita espone recupero; le altre restano utilizzabili."],
  ["Errore completo", "Messaggio prudente: i dati non sono stati modificati."],
  ["Accesso limitato", "Scope dichiarato; sezioni non autorizzate assenti."],
  ["Contenuto lungo", "Titolo, motivo e responsabilita vanno a capo senza troncamento."],
  ["Mobile 390", "Sequenza verticale, azione vicina alla conseguenza e target da 44 px."],
] as const;

function DemoSituation({ item }: { item: (typeof situations)[number] }) {
  return (
    <article className={styles.dashboardSituation} data-tone={item.tone}>
      <div aria-hidden="true" className={styles.dashboardMarker}><Icon glyph={item.glyph} size={20} weight="bold" /></div>
      <div>
        <p className={styles.dashboardState}>{item.state}</p>
        <h4>{item.title}</h4>
        <p>{item.reason}</p>
        <dl><div><dt>Contesto</dt><dd>{item.context}</dd></div><div><dt>Responsabile</dt><dd>{item.responsibility}</dd></div></dl>
        <Button size="sm">{item.action}</Button>
      </div>
    </article>
  );
}

function DashboardFrame({ compact = false }: { compact?: boolean }) {
  return (
    <article aria-label={compact ? "Dashboard dimostrativa mobile" : "Dashboard dimostrativa desktop"} className={styles.dashboardFrame} data-compact={compact || undefined}>
      <header className={styles.dashboardHeader}>
        <div><p>Azienda Demo</p><h3>Da fare</h3></div>
        <div><span>Vista: tutta l'azienda</span><span>Titolare</span><span>Aggiornato alle 10:42</span></div>
      </header>
      <div className={styles.dashboardSummary}><strong>5</strong><span>situazioni richiedono attenzione</span><small>1 scaduta · 2 in scadenza · 1 mancante · 1 da verificare</small></div>
      <div className={styles.dashboardColumns}>
        <section aria-label="Da fare ora" className={styles.dashboardAttention}>
          <h4>01 · Da fare ora</h4>
          {situations.slice(0, compact ? 2 : 3).map((item) => <DemoSituation item={item} key={item.title} />)}
          <a href="#dashboard-states">Vedi tutte le situazioni</a>
        </section>
        <aside className={styles.dashboardAside}>
          <section>
            <h4>02 · Pronto da condividere</h4>
            <p className={styles.dashboardPackage}><Icon glyph={ShareNetwork} size={20} /><span><strong>Pacchetto Cantiere Via Roma</strong><small>8 elementi · pronto per revisione</small></span></p>
          </section>
          <section>
            <h4>03 · Prossime scadenze</h4>
            <p>18 lug · Documento Mario Rossi</p><p>24 lug · Revisione periodica</p>
          </section>
        </aside>
      </div>
    </article>
  );
}

export function DashboardOperativaSpecimen() {
  return (
    <section aria-labelledby="dashboard-specimen-title" className={styles.dashboardSpecimen}>
      <div className={styles.sectionHeading}>
        <p className={styles.eyebrow}>Vertical slice approvata</p>
        <h2 id="dashboard-specimen-title">Dashboard operativa</h2>
        <p>Una coda decisionale, non un riepilogo statistico. Il primo viewport collega stato, motivo, responsabilita e prossima azione.</p>
      </div>

      <div className={styles.dashboardProofs}>
        <div><p className={styles.proofLabel}>1440 · coda principale e orientamento</p><DashboardFrame /></div>
        <div className={styles.mobileProof}><p className={styles.proofLabel}>390 · sequenza con una mano</p><DashboardFrame compact /></div>
      </div>

      <div id="dashboard-states" className={styles.dashboardStates}>
        <div className={styles.sectionHeading}>
          <h2>Stati da provare</h2>
          <p>Ogni stato mantiene una causa, un recupero e un comportamento responsive verificabile.</p>
        </div>
        <div className={styles.dashboardStateGrid}>
          {proofStates.map(([title, description]) => <article key={title}><strong>{title}</strong><p>{description}</p></article>)}
        </div>
      </div>
    </section>
  );
}
