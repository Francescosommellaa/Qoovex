import { ArrowRight, FileText, Plus, Question } from "@phosphor-icons/react/ssr";
import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  EmptyState,
  ErrorState,
  Field,
  Icon,
  IconButton,
  Input,
  LoadingState,
  Panel,
  Radio,
  Section,
  Select,
  Status,
  Switch,
  Textarea,
} from "@qoovex/ui";
import { CatalogNavigation, type CatalogEntry } from "./CatalogNavigation";
import { MfaSecurityPattern } from "./MfaSecurityPattern";

const catalogEntries: CatalogEntry[] = [
  { id: "fondazioni", label: "Fondazioni" },
  { id: "azioni", label: "Azioni" },
  { id: "stati", label: "Stati" },
  { id: "campi", label: "Campi" },
  { id: "contenuto", label: "Contenuto" },
  { id: "linguaggio", label: "Linguaggio" },
  { id: "mfa", label: "MFA" },
];

const prudentCopy = [
  "Stato documentale aggiornato",
  "Informazioni da confermare",
  "Pacchetto pronto per revisione",
];

export default function SirioPage() {
  return (
    <main className="sirio-page">
      <header className="sirio-hero">
        <Container size="xl">
          <p className="sirio-hero__label">Catalogo tecnico</p>
          <h1>Sirio, il sistema UI di Qoovex</h1>
          <p>
            Primitive condivise, stati e composizioni verificate con contenuti operativi. La fonte canonica resta <code>packages/ui</code>.
          </p>
        </Container>
      </header>

      <Container className="catalog-shell" size="xl">
        <CatalogNavigation entries={catalogEntries} />
        <div className="catalog-content">
          <Section description="Satoshi per testo operativo e Chillax per titoli. Token semantici per colore, spazio, focus, ombre e livelli." id="fondazioni" title="Fondazioni" containerSize="xl">
            <div className="token-grid">
              {[
                ["canvas", "surface"],
                ["surface", "surface-muted"],
                ["accent", "accent"],
                ["warning", "warning"],
                ["danger", "danger"],
                ["content", "text"],
              ].map(([label, token]) => (
                <Card as="article" key={label}>
                  <div aria-hidden="true" className={`token-swatch token-swatch--${token}`} />
                  <h3>{label}</h3>
                  <p className="muted">Token semantico riusabile.</p>
                </Card>
              ))}
            </div>
            <Panel className="icon-specimen">
              <Icon decorative icon={FileText} size="lg" weight="duotone" />
              <div><strong>Icona decorativa</strong><p className="muted">Dimensione e peso passano dall&apos;API condivisa.</p></div>
            </Panel>
          </Section>

          <Section description="Varianti, icone, caricamento, disabilitazione e touch target condividono lo stesso contratto." id="azioni" title="Azioni" tone="muted" containerSize="xl">
            <Panel>
              <div className="sample-actions">
                <Button endIcon={ArrowRight}>Azione principale</Button>
                <Button startIcon={FileText} variant="secondary">Apri documento</Button>
                <Button variant="ghost">Azione discreta</Button>
                <Button variant="danger">Azione irreversibile</Button>
                <Button loading>Salva modifiche</Button>
                <Button disabled>Non disponibile</Button>
                <IconButton aria-label="Aggiungi elemento" icon={Plus} tone="accent" />
                <IconButton aria-label="Azione non disponibile" disabled icon={Question} />
              </div>
            </Panel>
          </Section>

          <Section description="Badge, status e alert descrivono l'informazione anche senza affidarsi soltanto al colore." id="stati" title="Stati generici" containerSize="xl">
            <div className="component-grid">
              <Card as="article">
                <h3>Badge</h3>
                <div className="sample-badges">
                  <Badge>Neutro</Badge><Badge variant="info">Informazione</Badge><Badge variant="positive">Aggiornato</Badge><Badge variant="warning">Da verificare</Badge><Badge variant="danger">Azione richiesta</Badge>
                </div>
              </Card>
              <Card as="article" tone="info">
                <h3>Status statici</h3>
                <div className="grid gap-qv-3"><Status tone="positive">Stato aggiornato</Status><Status tone="warning">Informazioni da confermare</Status><Status tone="danger">Richiede attenzione</Status></div>
              </Card>
              <Card as="article" tone="warning">
                <h3>Alert statico e live</h3>
                <Alert title="Operazione da rivedere" tone="warning">Verifica i dati prima di proseguire.</Alert>
                <Alert aria-live="polite" className="mt-qv-3" role="status" title="Salvataggio completato" tone="positive">Le modifiche sono disponibili.</Alert>
              </Card>
            </div>
          </Section>

          <Section description="Etichette, descrizioni, required, invalidità e relazioni ARIA vengono applicati al controllo." id="campi" title="Campi e controlli" tone="muted" containerSize="xl">
            <Panel>
              <div className="form-grid">
                <Field description="Testo breve per l'utente." htmlFor="foundation-name" label="Nome" required><Input placeholder="Inserisci un valore" /></Field>
                <Field error="Scegli un'opzione." htmlFor="foundation-select" label="Opzione"><Select defaultValue=""><option disabled value="">Seleziona</option><option value="one">Prima opzione</option><option value="two">Seconda opzione</option></Select></Field>
                <Field htmlFor="foundation-note" label="Nota"><Textarea placeholder="Aggiungi informazioni utili" /></Field>
                <div className="grid gap-qv-3">
                  <label className="control-label"><Checkbox /> Conferma richiesta</label>
                  <label className="control-label"><Radio name="foundation-choice" /> Prima scelta</label>
                  <label className="control-label"><Switch /> Aggiornamenti attivi</label>
                </div>
              </div>
            </Panel>
          </Section>

          <Section description="Loading, empty ed error offrono una spiegazione e un percorso successivo." id="contenuto" title="Stati di contenuto" containerSize="xl">
            <div className="component-grid">
              <LoadingState label="Recupero dei dati in corso" />
              <EmptyState action={<Button variant="secondary">Aggiungi elemento</Button>} description="Non sono presenti elementi da mostrare." headingLevel={3} title="Nessun elemento" />
              <ErrorState action={<Button variant="secondary">Riprova</Button>} description="Riprova tra poco o verifica i dati inseriti." headingLevel={3} />
            </div>
          </Section>

          <Section id="linguaggio" title="Linguaggio prudente" tone="muted" containerSize="xl">
            <Panel><ul className="copy-list">{prudentCopy.map((copy) => <li key={copy}>{copy}</li>)}</ul></Panel>
          </Section>

          <Section description="Specimen già autorizzato per challenge, enrollment, recupero autonomo e decisione OWNER." id="mfa" title="Sicurezza account e recupero MFA" containerSize="xl">
            <MfaSecurityPattern />
          </Section>
        </div>
      </Container>
    </main>
  );
}
