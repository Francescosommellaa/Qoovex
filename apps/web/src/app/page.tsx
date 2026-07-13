import { Buildings, CalendarDots, Camera, FileText, FolderOpen, HardHat, Package, UserFocus } from "@phosphor-icons/react/ssr";
import { Badge, Button, Card, Icon, Section } from "@qoovex/ui";
import { contactEmail, contactHref, workspaceUrl } from "./site-config";
import { SiteShell } from "./site-chrome";

const capabilities = [
  { icon: FolderOpen, text: "Organizza documenti collegati ad azienda, lavoratori e cantieri." },
  { icon: CalendarDots, text: "Mostra scadenze registrate, elementi mancanti e documenti da verificare." },
  { icon: Camera, text: "Raccoglie prove operative come foto, file e note collegate al contesto corretto." },
  { icon: Package, text: "Prepara pacchetti documentali condivisibili in lettura per revisione." },
];

export default function HomePage() {
  return (
    <SiteShell>
      <section className="hero">
        <div className="hero__grid qv-container mx-auto w-full max-w-[76rem] px-qv-4">
          <div className="hero__copy">
            <h1>Documenti, scadenze e prove di cantiere finalmente in ordine.</h1>
            <p>Qoovex aiuta piccole imprese e subappaltatori a sapere cosa hanno, cosa manca, cosa scade e cosa possono condividere per revisione.</p>
            <div className="hero__actions">
              <Button href={workspaceUrl} size="lg">Accedi al workspace</Button>
              <Button href={contactHref} size="lg" variant="secondary">Richiedi informazioni</Button>
            </div>
          </div>
          <Card aria-label="Anteprima di stati operativi" className="product-panel" tone="info">
            <div className="product-panel__heading"><Icon decorative icon={FileText} size="lg" weight="duotone" /><div><strong>Vista operativa</strong><span>Contenuti dimostrativi</span></div></div>
            <div className="product-row"><strong>Stato documentale</strong><Badge variant="warning">Da verificare</Badge></div>
            <div className="product-row"><strong>Scadenze registrate</strong><Badge variant="danger">Scaduto</Badge></div>
            <div className="product-row"><strong>Pacchetto documentale</strong><Badge variant="positive">Pronto per revisione</Badge></div>
            <p className="muted">Esempio dimostrativo di stati operativi. Non contiene preset documentali o regole normative.</p>
          </Card>
        </div>
      </section>

      <Section id="problema" title="Il problema" tone="muted" containerSize="xl">
        <div className="problem-ledger">
          <article><h3>File sparsi</h3><p>PDF, foto e richieste finiscono spesso tra chat, email e cartelle diverse.</p></article>
          <article><h3>Date da controllare</h3><p>Le scadenze registrate devono restare visibili prima di diventare urgenti.</p></article>
          <article><h3>Pacchetti da preparare</h3><p>Quando serve una revisione, e utile raccogliere solo gli elementi necessari.</p></article>
        </div>
      </Section>

      <Section description="La base marketing resta provvisoria: il team Qoovex fornira contenuti validati, ricerca e preset quando saranno pronti." id="cosa-fa" title="Cosa fa Qoovex" containerSize="xl">
        <ul className="capability-list">
          {capabilities.map(({ icon, text }) => <li key={text}><Icon decorative icon={icon} size="lg" weight="duotone" /><span>{text}</span></li>)}
        </ul>
      </Section>

      <Section id="per-chi" title="Per chi e" containerSize="xl">
        <div className="audience-layout">
          <Card as="article" className="audience-card audience-card--primary"><Icon decorative icon={Buildings} size="lg" weight="duotone" /><h3>Piccole imprese</h3><p className="muted">Per tenere ordinati documenti aziendali, lavoratori e cantieri attivi.</p></Card>
          <Card as="article" className="audience-card"><Icon decorative icon={HardHat} size="lg" weight="duotone" /><h3>Subappaltatori</h3><p className="muted">Per rispondere con meno confusione alle richieste di documenti e prove.</p></Card>
          <Card as="article" className="audience-card"><Icon decorative icon={UserFocus} size="lg" weight="duotone" /><h3>Consulenti</h3><p className="muted">Per vedere stati operativi e segnalare cosa richiede una revisione.</p></Card>
        </div>
      </Section>

      <Section id="come-funziona" title="Come funziona" tone="muted" containerSize="xl">
        <ol className="process-list">
          <li><strong>Configura la tua azienda</strong><span>Imposta il contesto operativo nel workspace.</span></li>
          <li><strong>Aggiungi gli elementi di lavoro</strong><span>Registra lavoratori, cantieri, documenti e scadenze.</span></li>
          <li><strong>Raccogli versioni e prove</strong><span>Carica file e materiali operativi quando servono.</span></li>
          <li><strong>Prepara la revisione</strong><span>Componi un pacchetto documentale dedicato.</span></li>
        </ol>
      </Section>

      <Section id="limiti" title="Cosa non promette" containerSize="xl">
        <Card as="article" className="boundary-panel" tone="warning"><p>Qoovex non decide obblighi, requisiti o valutazioni al posto di responsabili, consulenti o utenti competenti. Il sistema organizza dati registrati e li rende piu facili da controllare.</p></Card>
      </Section>

      <Section id="richiedi-informazioni" title="Richiedi informazioni" tone="muted" containerSize="xl">
        <Card className="contact-panel">
          <div><h3>Contatto Qoovex</h3><p className="muted">Per informazioni operative, accesso pilota o richieste sui dati puoi scrivere a <a href={contactHref}>{contactEmail}</a>. Il mittente transazionale resta separato dal canale di risposta.</p></div>
          <Button href={contactHref}>Scrivi a Qoovex</Button>
        </Card>
      </Section>
    </SiteShell>
  );
}
