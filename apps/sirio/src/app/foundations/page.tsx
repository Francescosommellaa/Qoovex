import { Container } from "@qoovex/ui";
import styles from "./foundations.module.css";

const operationalRows = [
  {
    action: "Apri",
    consequence: "Informazione disponibile",
    object: "Documento impresa",
    owner: "Amministrazione",
    state: "Presente",
    tone: "present",
  },
  {
    action: "Verifica",
    consequence: "Controlla la versione prima di usarla",
    object: "Documento lavoratore",
    owner: "Consulente",
    state: "Da verificare",
    tone: "review",
  },
  {
    action: "Richiedi",
    consequence: "Il pacchetto resta incompleto",
    object: "Documento cantiere",
    owner: "Responsabile cantiere",
    state: "Mancante",
    tone: "missing",
  },
] as const;

const stateCases = [
  {
    action: "Nessuna azione immediata",
    detail: "Il documento è disponibile nel fascicolo.",
    state: "Presente",
    tone: "present",
  },
  {
    action: "Apri la scadenza",
    detail: "La data richiede attenzione, senza trasformare l'intera pagina in un allarme.",
    state: "In scadenza",
    tone: "expiring",
  },
  {
    action: "Verifica la versione",
    detail: "Il contenuto esiste, ma serve ancora un controllo.",
    state: "Da verificare",
    tone: "review",
  },
  {
    action: "Richiedi il documento",
    detail: "L'assenza resta visibile nel punto esatto in cui blocca il lavoro.",
    state: "Mancante",
    tone: "missing",
  },
  {
    action: "Prepara la condivisione",
    detail: "Gli elementi selezionati possono essere raccolti per la revisione.",
    state: "Condivisibile",
    tone: "shareable",
  },
] as const;

const sequence = [
  ["Stato", "Mancante"],
  ["Oggetto", "Documento cantiere"],
  ["Conseguenza", "Il pacchetto resta incompleto"],
  ["Responsabile", "Responsabile cantiere"],
  ["Prossima azione", "Richiedi"],
] as const;

export default function FoundationsPage() {
  return (
    <main className={styles.page} id="top">
      <a className={styles.skipLink} href="#idea">
        Vai alla direzione creativa
      </a>

      <header className={styles.hero}>
        <Container size="wide">
          <div className={styles.masthead}>
            <strong>Qoovex</strong>
            <span>Fondazione identitaria in revisione</span>
          </div>

          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.directionName}>Traccia Operativa</p>
              <h1>Dare forma a ciò che manca.</h1>
              <p className={styles.heroLead}>
                Qoovex collega stato, prova, responsabilità e azione. Il vuoto non viene nascosto: diventa il punto da cui ripartire.
              </p>
              <div className={styles.heroDecision}>
                <span>Idea centrale</span>
                <strong>Rendere azionabile l&apos;assenza.</strong>
              </div>
            </div>

            <figure className={styles.heroField}>
              <span className={styles.heroGlyph} aria-hidden="true">Q</span>
              <div className={styles.heroTrace} aria-hidden="true">
                <span />
                <span />
              </div>
              <div className={`${styles.heroFragment} ${styles.heroFragmentPresent}`}>
                <span>Presente</span>
                <strong>Documento impresa</strong>
                <small>Origine riconoscibile</small>
              </div>
              <div className={`${styles.heroFragment} ${styles.heroFragmentMissing}`}>
                <span>Mancante</span>
                <strong>Documento cantiere</strong>
                <small>Il pacchetto resta incompleto</small>
              </div>
              <div className={styles.heroTerminal}>
                <span>Prossima azione</span>
                <strong>Richiedi</strong>
              </div>
              <figcaption>
                La traccia continua dove l&apos;informazione esiste, si interrompe dove manca e termina nell&apos;azione successiva.
              </figcaption>
            </figure>
          </div>

          <nav className={styles.index} aria-label="Indice della direzione Traccia Operativa">
            <a href="#idea">Idea</a>
            <a href="#grammatica">Grammatica</a>
            <a href="#superfici">Tre superfici</a>
            <a href="#stati">Stati</a>
            <a href="#linguaggio">Linguaggio</a>
            <a href="#confini">Confini</a>
          </nav>
        </Container>
      </header>

      <section className={styles.section} id="idea">
        <Container size="wide">
          <header className={styles.sectionHeader}>
            <h2>Un solo gesto, cinque domande.</h2>
            <p>
              La firma non è una decorazione applicata alle schermate. È l&apos;ordine costante con cui Qoovex rende leggibile una situazione operativa.
            </p>
          </header>

          <article className={styles.sequenceField} aria-label="Sequenza operativa fondamentale">
            <span className={styles.sequenceAxis} aria-hidden="true" />
            <ol>
              {sequence.map(([label, value], index) => (
                <li className={index === sequence.length - 1 ? styles.sequenceAction : undefined} key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </li>
              ))}
            </ol>
          </article>

          <div className={styles.ideaPrinciples}>
            <p><strong>Continuità</strong> per ciò che esiste e ha un&apos;origine leggibile.</p>
            <p><strong>Interruzione</strong> per ciò che manca o non è ancora pronto.</p>
            <p><strong>Terminale</strong> per una sola prossima azione chiaramente collocata.</p>
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.grammarSection}`} id="grammatica">
        <Container size="wide">
          <header className={styles.sectionHeader}>
            <h2>Il vuoto non è bianco. È una decisione aperta.</h2>
            <p>
              La Traccia Operativa usa spazio, interruzioni e cambi di ritmo per mostrare il lavoro ancora da completare senza creare ansia.
            </p>
          </header>

          <div className={styles.grammarLayout}>
            <figure className={styles.gapSpecimen}>
              <div className={styles.gapLine} aria-hidden="true">
                <span />
                <i />
                <span />
              </div>
              <div className={styles.gapCopy}>
                <span>Manca una prova</span>
                <strong>Il vuoto conserva il suo posto.</strong>
                <p>Non viene sostituito da un badge, un allarme o una card colorata.</p>
              </div>
              <figcaption>Interruzione strutturale, testo esplicito, recupero vicino.</figcaption>
            </figure>

            <dl className={styles.grammarRules}>
              <div>
                <dt>Traccia continua</dt>
                <dd>Collega oggetti che appartengono alla stessa situazione operativa.</dd>
              </div>
              <div>
                <dt>Vuoto indicizzato</dt>
                <dd>Riserva uno spazio leggibile a ciò che manca e ne dichiara la conseguenza.</dd>
              </div>
              <div>
                <dt>Passaggio di mano</dt>
                <dd>Uno spostamento della traccia segnala che cambia il responsabile.</dd>
              </div>
              <div>
                <dt>Terminale d&apos;azione</dt>
                <dd>L&apos;accento compare dove l&apos;utente può proseguire, non dove il brand vuole decorare.</dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      <section className={styles.section} id="superfici">
        <Container size="wide">
          <header className={styles.sectionHeader}>
            <h2>Tre prodotti, una sola voce.</h2>
            <p>
              La stessa grammatica cambia scala e densità. Il marketing rende la traccia narrativa, il workspace la rende operativa, il mobile la rende sequenziale.
            </p>
          </header>

          <div className={styles.surfaceAtlas}>
            <article className={styles.marketingSpecimen}>
              <header>
                <span>Marketing</span>
                <strong>Densità 3/10</strong>
              </header>
              <div className={styles.marketingStatement}>
                <h3>Capisci cosa c&apos;è.<br />Agisci su ciò che manca.</h3>
                <p>Una promessa concreta, una composizione ampia, una sola traiettoria visiva.</p>
              </div>
              <div className={styles.marketingTrace} aria-hidden="true">
                <span />
                <i />
                <b />
              </div>
              <footer>
                <span>Documenti</span>
                <span>Scadenze</span>
                <span>Prove</span>
              </footer>
            </article>

            <article className={styles.mobileSpecimen} aria-label="Frammento mobile dimostrativo">
              <header>
                <span>Mobile</span>
                <strong>Cantiere</strong>
              </header>
              <div className={styles.mobileContext}>
                <span>Pacchetto documentale</span>
                <h3>Preparazione in corso</h3>
              </div>
              <ol className={styles.mobileTrail}>
                <li>
                  <span>Presente</span>
                  <strong>Documento impresa</strong>
                </li>
                <li className={styles.mobileMissing}>
                  <span>Mancante</span>
                  <strong>Documento cantiere</strong>
                  <small>Il pacchetto resta incompleto</small>
                </li>
                <li>
                  <span>Responsabile</span>
                  <strong>Responsabile cantiere</strong>
                </li>
              </ol>
              <div className={styles.mobileAction}>
                <span>Prossima azione</span>
                <strong>Richiedi documento</strong>
              </div>
            </article>

            <article className={styles.workspaceSpecimen} aria-label="Frammento workspace dimostrativo">
              <header className={styles.workspaceHeader}>
                <div>
                  <span>Workspace</span>
                  <h3>Documenti</h3>
                </div>
                <p>Stato, conseguenza e azione restano nello stesso campo visivo.</p>
              </header>
              <div className={styles.workspaceColumns} aria-hidden="true">
                <span>Situazione</span>
                <span>Responsabilità</span>
                <span>Azione</span>
              </div>
              <div className={styles.workspaceList}>
                {operationalRows.map(({ action, consequence, object, owner, state, tone }) => (
                  <div className={styles.workspaceRow} data-tone={tone} key={object}>
                    <div className={styles.workspaceSituation}>
                      <span>{state}</span>
                      <strong>{object}</strong>
                      <small>{consequence}</small>
                    </div>
                    <div className={styles.workspaceOwner}>
                      <span>Responsabile</span>
                      <strong>{owner}</strong>
                    </div>
                    <div className={styles.workspaceAction}>
                      <span>Prossima azione</span>
                      <strong>{action}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.stateSection}`} id="stati">
        <Container size="wide">
          <header className={styles.sectionHeader}>
            <h2>Gli stati cambiano la struttura, non soltanto il colore.</h2>
            <p>
              Ogni caso rimane comprensibile in scala di grigi. Il cobalto orienta verso l&apos;azione, mentre testo e forma conservano il significato.
            </p>
          </header>

          <div className={styles.stateMatrix}>
            {stateCases.map(({ action, detail, state, tone }) => (
              <article data-tone={tone} key={state}>
                <div>
                  <span>Stato</span>
                  <h3>{state}</h3>
                </div>
                <p>{detail}</p>
                <strong>{action}</strong>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.section} id="linguaggio">
        <Container size="wide">
          <header className={styles.sectionHeader}>
            <h2>Carattere senza teatro.</h2>
            <p>
              Tipografia, materia, fotografia e movimento seguono la stessa regola: rendere più leggibile una decisione, mai celebrare l&apos;interfaccia.
            </p>
          </header>

          <div className={styles.languageGrid}>
            <article className={styles.typeVoice}>
              <span>Voce tipografica</span>
              <strong>Stato prima.<br />Azione dopo.</strong>
              <p>Cabinet Grotesk orienta nei momenti identitari. General Sans sostiene il lavoro quotidiano e i contenuti densi.</p>
            </article>

            <article className={styles.materialVoice}>
              <header>
                <span>Materia cromatica provvisoria</span>
                <strong>Un accento, quattro ruoli</strong>
              </header>
              <div className={styles.materialScale} aria-label="Gamma cromatica dimostrativa">
                <div><i className={styles.swatchInk} /><span>Inchiostro</span></div>
                <div><i className={styles.swatchField} /><span>Campo</span></div>
                <div><i className={styles.swatchFog} /><span>Nebbia</span></div>
                <div><i className={styles.swatchCobalt} /><span>Cobalto</span></div>
              </div>
              <p>Il cobalto appartiene a orientamento e azione. Non sostituisce mai gli stati semantici.</p>
            </article>

            <article className={styles.motionVoice}>
              <header>
                <span>Movimento</span>
                <strong>Riordino, non spettacolo</strong>
              </header>
              <div className={styles.motionFrames} aria-label="Storyboard del riordino informativo">
                <div><span>Frammenti</span><i /><i /><i /></div>
                <div><span>Allineamento</span><b /><i /><i /></div>
                <div><span>Azione</span><b /><strong>Apri</strong></div>
              </div>
              <p>Le informazioni si allineano, il vuoto resta visibile, l&apos;azione prende posizione. Poi tutto si ferma.</p>
            </article>

            <article className={styles.photoVoice}>
              <header>
                <span>Fotografia</span>
                <strong>Prova, origine, contesto</strong>
              </header>
              <div className={styles.cropSystem} aria-hidden="true">
                <span>Origine</span>
                <span>Contesto</span>
                <span>Dettaglio</span>
              </div>
              <p>Inquadrature osservazionali di documenti, mani, materiali e luoghi. Luce reale, tagli ravvicinati, nessun operaio in posa.</p>
            </article>
          </div>
        </Container>
      </section>

      <section className={`${styles.section} ${styles.boundarySection}`} id="confini">
        <Container size="wide">
          <div className={styles.boundaryGrid}>
            <div className={styles.boundaryStatement}>
              <span>In approvazione</span>
              <h2>Traccia Operativa come sistema generativo.</h2>
              <p>
                La direzione passa se può produrre marketing, workspace e mobile senza dipendere da card generiche, logo o decorazione.
              </p>
            </div>
            <dl className={styles.boundaryRules}>
              <div>
                <dt>Incluso ora</dt>
                <dd>Idea proprietaria, grammatica, stati, densità, voce, materia provvisoria e traduzione cross-surface.</dd>
              </div>
              <div>
                <dt>Non integrato</dt>
                <dd>Nessuna modifica a token condivisi, primitive, sito marketing, workspace o app mobile.</dd>
              </div>
              <div>
                <dt>Unità successiva</dt>
                <dd>Palette e token strutturali, soltanto dopo approvazione esplicita.</dd>
              </div>
            </dl>
          </div>
          <a className={styles.backToTop} href="#top">Torna all&apos;inizio</a>
        </Container>
      </section>
    </main>
  );
}
