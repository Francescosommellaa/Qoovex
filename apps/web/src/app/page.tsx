import { Badge, Button, Card, Container, Section } from "@qoovex/ui";
import { contactEmail, contactHref, workspaceUrl } from "./site-config";
import { SiteShell } from "./site-chrome";

export default function HomePage() {
  return (
    <SiteShell>
      <section className="hero">
        <Container>
          <div className="hero__grid">
            <div>
              <h1>Documenti, scadenze e prove di cantiere finalmente in ordine.</h1>
              <p>
                Qoovex aiuta piccole imprese e subappaltatori a sapere cosa hanno, cosa manca,
                cosa scade e cosa possono condividere per revisione.
              </p>
              <div className="hero__actions">
                <Button href={workspaceUrl} size="lg">
                  Accedi al workspace
                </Button>
                <Button href={contactHref} size="lg" variant="secondary">
                  Richiedi informazioni
                </Button>
              </div>
            </div>
            <Card className="product-panel" tone="accent">
              <div className="product-row">
                <strong>Stato documentale</strong>
                <Badge variant="review">Da verificare</Badge>
              </div>
              <div className="product-row">
                <strong>Scadenze registrate</strong>
                <Badge variant="expired">Scaduto</Badge>
              </div>
              <div className="product-row">
                <strong>Pacchetto documentale</strong>
                <Badge variant="ready">Pronto per revisione</Badge>
              </div>
              <p className="muted">
                Esempio dimostrativo di stati operativi. Non contiene preset documentali o regole
                normative.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <Section title="Il problema" tone="muted">
        <Container>
          <div className="grid">
            <Card>
              <h3>File sparsi</h3>
              <p className="muted">PDF, foto e richieste finiscono spesso tra chat, email e cartelle diverse.</p>
            </Card>
            <Card>
              <h3>Date da controllare</h3>
              <p className="muted">Le scadenze registrate devono restare visibili prima di diventare urgenti.</p>
            </Card>
            <Card>
              <h3>Pacchetti da preparare</h3>
              <p className="muted">Quando serve una revisione, e utile raccogliere solo gli elementi necessari.</p>
            </Card>
          </div>
        </Container>
      </Section>

      <Section
        description="La base marketing resta provvisoria: il team Qoovex fornira contenuti validati, ricerca e preset quando saranno pronti."
        id="cosa-fa"
        title="Cosa fa Qoovex"
      >
        <Container>
          <ul className="flow-list">
            <li>Organizza documenti collegati ad azienda, lavoratori e cantieri.</li>
            <li>Mostra scadenze registrate, elementi mancanti e documenti da verificare.</li>
            <li>Raccoglie prove operative come foto, file e note collegate al contesto corretto.</li>
            <li>Prepara pacchetti documentali condivisibili in lettura per revisione.</li>
          </ul>
        </Container>
      </Section>

      <Section id="per-chi" title="Per chi e">
        <Container>
          <div className="grid">
            <Card>
              <h3>Piccole imprese</h3>
              <p className="muted">Per tenere ordinati documenti aziendali, lavoratori e cantieri attivi.</p>
            </Card>
            <Card>
              <h3>Subappaltatori</h3>
              <p className="muted">Per rispondere con meno confusione alle richieste di documenti e prove.</p>
            </Card>
            <Card>
              <h3>Consulenti</h3>
              <p className="muted">Per vedere stati operativi e segnalare cosa richiede una revisione.</p>
            </Card>
          </div>
        </Container>
      </Section>

      <Section title="Come funziona" tone="muted">
        <Container>
          <ul className="flow-list">
            <li>Crea o seleziona l'azienda nel workspace.</li>
            <li>Aggiungi lavoratori, cantieri, documenti e scadenze registrate.</li>
            <li>Carica versioni documento e prove operative quando servono.</li>
            <li>Prepara un pacchetto documentale pronto per revisione.</li>
          </ul>
        </Container>
      </Section>

      <Section title="Cosa non promette">
        <Container>
          <Card tone="attention">
            <p>
              Qoovex non decide obblighi, requisiti o valutazioni al posto di responsabili,
              consulenti o utenti competenti. Il sistema organizza dati registrati e li rende piu
              facili da controllare.
            </p>
          </Card>
        </Container>
      </Section>

      <Section id="richiedi-informazioni" title="Richiedi informazioni" tone="muted">
        <Container>
          <Card className="contact-panel">
            <div>
              <h3>Contatto Qoovex</h3>
              <p className="muted">
                Per informazioni operative, accesso pilota o richieste sui dati puoi scrivere a{" "}
                <a href={contactHref}>{contactEmail}</a>. Il mittente transazionale resta separato
                dal canale di risposta.
              </p>
            </div>
            <Button href={contactHref}>Scrivi a Qoovex</Button>
          </Card>
        </Container>
      </Section>
    </SiteShell>
  );
}
