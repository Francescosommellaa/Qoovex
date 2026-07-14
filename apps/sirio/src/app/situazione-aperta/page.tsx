import {
  Archive,
  ArrowRight,
  Button,
  Check,
  CheckSquare,
  ClockCountdown,
  FileDashed,
  Icon,
  MagnifyingGlass,
  Prohibit,
  ShareNetwork,
  Trace,
  TraceGap,
  TraceNode,
  TraceTerminal,
  WarningCircle,
} from "@qoovex/ui";
import styles from "./situazione-aperta.module.css";

const stateGroups = [
  {
    title: "Disponibilità",
    items: [
      { name: "Presente", detail: "La prova esiste ed è leggibile.", glyph: Check, tone: "present" },
      { name: "Pronto", detail: "Può avanzare verso l’azione prevista.", glyph: CheckSquare, tone: "ready" },
      { name: "Mancante", detail: "Il vuoto resta nominato e recuperabile.", glyph: FileDashed, tone: "missing" },
      { name: "Non disponibile", detail: "L’estremità è bloccata e ne indica il motivo.", glyph: Prohibit, tone: "unavailable" },
    ],
  },
  {
    title: "Tempo",
    items: [
      { name: "In scadenza", detail: "Il tempo entra nella gerarchia prima dell’urgenza.", glyph: ClockCountdown, tone: "warning" },
      { name: "Scaduto", detail: "L’interruzione è netta e richiede una decisione.", glyph: WarningCircle, tone: "danger" },
    ],
  },
  {
    title: "Controllo e accesso",
    items: [
      { name: "Da verificare", detail: "La traccia resta sospesa finché una persona non conferma l’informazione.", glyph: MagnifyingGlass, tone: "verify" },
      { name: "Archiviato", detail: "Resta consultabile, senza terminale operativo.", glyph: Archive, tone: "archived" },
      { name: "Condiviso", detail: "La diramazione mostra che esiste un accesso esterno.", glyph: ShareNetwork, tone: "shared" },
    ],
  },
] as const;

const storyboard = [
  { title: "Emergono", detail: "Documento, checklist e scadenza compaiono nella loro origine.", state: "origin" },
  { title: "Si ordinano", detail: "La traccia rende leggibile la relazione tra gli elementi.", state: "ordered" },
  { title: "Resta il vuoto", detail: "La prova fotografica assente conserva nome e conseguenza.", state: "gap" },
  { title: "Entra il responsabile", detail: "La persona che deve intervenire prende una posizione stabile.", state: "owner" },
  { title: "Compare l’azione", detail: "Il terminale conclude la sequenza. Poi tutto torna statico.", state: "action" },
] as const;

export default function OpenSituationPage() {
  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <Button href="/" size="sm" variant="ghost">Torna a Sirio</Button>
          <p className={styles.eyebrow}>Specimen identitario</p>
          <h1>Una situazione aperta</h1>
          <p className={styles.lede}>
            Precisione che accoglie l’incompletezza. Qoovex mostra dove il lavoro si interrompe e rende visibile il modo per riprenderlo.
          </p>
          <p className={styles.disclosure}>Contenuto dimostrativo, privo di valore normativo.</p>
        </div>
      </header>

      <section aria-labelledby="situation-title" className={styles.situationSection}>
        <div className={styles.situationGrid}>
          <article className={styles.situation}>
            <header className={styles.situationHeader}>
              <div>
                <p className={styles.context}>Cantiere Via delle Officine, Bologna</p>
                <h2 id="situation-title">Ingresso di Marco Riva</h2>
              </div>
              <dl className={styles.reference}>
                <div><dt>Riferimento</dt><dd>QX-2407-18</dd></div>
                <div><dt>Aggiornato</dt><dd>14 luglio 2026</dd></div>
              </dl>
            </header>

            <Trace aria-label="Stato operativo dell’ingresso" className={styles.trace}>
              <TraceNode
                label="Presente"
                title="Documento di identità"
                description="Versione leggibile caricata dall’azienda il 12 luglio 2026."
              >
                <span className={styles.nodeSignal} data-tone="present"><Icon glyph={Check} size={16} weight="bold" /> Origine confermata</span>
              </TraceNode>
              <TraceNode
                label="Da verificare"
                title="Checklist di ingresso"
                description="Tre risposte sono presenti. La verifica della persona incaricata non è ancora registrata."
              >
                <span className={styles.nodeSignal} data-tone="verify"><Icon glyph={MagnifyingGlass} size={16} weight="bold" /> Verifica richiesta</span>
              </TraceNode>
              <TraceNode
                label="In scadenza"
                title="Attestazione assicurativa"
                description="La data indicata è il 22 luglio 2026. Il sistema segnala il tempo residuo senza dichiarare validità o conformità."
              >
                <span className={styles.nodeSignal} data-tone="warning"><Icon glyph={ClockCountdown} size={16} weight="bold" /> 8 giorni indicati</span>
              </TraceNode>
              <TraceGap
                label="Mancante"
                title="Prova fotografica dell’attrezzatura"
                description="Senza questa prova il fascicolo resta incompleto. Il vuoto mantiene visibili oggetto, conseguenza e recupero."
              >
                <div className={styles.indexedGap}>
                  <Icon glyph={FileDashed} size={24} weight="bold" />
                  <span>File non ancora ricevuto</span>
                </div>
              </TraceGap>
              <TraceNode
                label="Responsabile"
                title="Elena Mariani, impresa affidataria"
                description="È la prossima persona indicata per richiedere e controllare la prova."
              />
              <TraceTerminal
                label="Prossima azione"
                title="Richiedi la prova"
                description="Prepara una richiesta con oggetto, destinatario e motivo già collegati alla situazione."
                action={<Button size="sm">Richiedi la prova <Icon glyph={ArrowRight} size={16} weight="bold" /></Button>}
              />
            </Trace>
          </article>

          <aside aria-label="Calibrazione visiva" className={styles.calibration}>
            <div className={styles.typeSample}>
              <p className={styles.displaySample}>La traccia resta leggibile.</p>
              <p>General Sans governa oggetti, conseguenze, responsabilità e azioni.</p>
              <code>QX-2407-18</code>
            </div>
            <div className={styles.colorRoles}>
              <span data-color="ink"><strong>Inchiostro</strong> contenuto</span>
              <span data-color="field"><strong>Campo</strong> contesto</span>
              <span data-color="paper"><strong>Carta</strong> prova</span>
              <span data-color="fog"><strong>Nebbia</strong> incompletezza</span>
              <span data-color="cobalt"><strong>Cobalto</strong> azione</span>
            </div>
            <p className={styles.calibrationNote}>
              La composizione continua a funzionare senza cobalto: linea, testo, icona e posizione conservano il significato.
            </p>
          </aside>
        </div>
      </section>

      <section aria-labelledby="states-title" className={styles.statesSection}>
        <div className={styles.sectionHeading}>
          <h2 id="states-title">Nove stati, una sola grammatica</h2>
          <p>Il colore rinforza. Testo, icona, forma e posizione comunicano lo stato.</p>
        </div>
        <div className={styles.stateGroups}>
          {stateGroups.map((group) => (
            <section className={styles.stateGroup} key={group.title}>
              <h3>{group.title}</h3>
              <div className={styles.stateItems}>
                {group.items.map((item) => (
                  <article className={styles.stateItem} data-tone={item.tone} key={item.name}>
                    <Icon glyph={item.glyph} size={20} weight="bold" />
                    <div><h4>{item.name}</h4><p>{item.detail}</p></div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section aria-labelledby="motion-title" className={styles.motionSection}>
        <div className={styles.sectionHeading}>
          <h2 id="motion-title">Il movimento ricostruisce</h2>
          <p>Cinque passaggi descrivono provenienza, relazione, assenza, responsabilità e azione. Nessun ciclo decorativo.</p>
        </div>
        <ol className={styles.storyboard}>
          {storyboard.map((frame) => (
            <li className={styles.storyFrame} data-frame={frame.state} key={frame.title} tabIndex={0}>
              <div aria-hidden="true" className={styles.storyGlyph}>
                <span /><span /><span />
              </div>
              <h3>{frame.title}</h3>
              <p>{frame.detail}</p>
            </li>
          ))}
        </ol>
        <p className={styles.motionNote}>Con movimento ridotto, i cinque passaggi restano statici e completamente leggibili.</p>
      </section>
    </main>
  );
}
