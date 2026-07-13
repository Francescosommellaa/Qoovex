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
import { MfaSecurityPattern } from "./MfaSecurityPattern";

const prudentCopy = [
  "Stato documentale aggiornato",
  "Informazioni da confermare",
  "Pacchetto pronto per revisione",
];

export default function SirioPage() {
  return (
    <main className="sirio-page">
      <header className="sirio-hero">
        <Container>
          <p className="font-semibold text-qv-accent">Foundation UI</p>
          <h1>Sirio — Qoovex Design System</h1>
          <p>
            Prova isolata di token, tipografia e primitive generiche. La fonte canonica resta {" "}
            <code>packages/ui</code>; questa unità non modifica il workspace.
          </p>
        </Container>
      </header>

      <Section description="General Sans per testo operativo e Cabinet Grotesk per titoli, con fallback di sistema." title="Token e tipografia">
        <Container>
          <div className="token-grid">
            {[
              ["canvas", "surface"],
              ["surface", "surface-muted"],
              ["accent", "accent"],
              ["warning", "warning"],
              ["danger", "danger"],
              ["content", "text"],
            ].map(([label, token]) => (
              <Card key={label}>
                <div className={`token-swatch token-swatch--${token}`} />
                <h2 className="font-display text-qv-title">{label}</h2>
                <p className="qv-text-muted">Token semantico riusabile.</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <Section description="Default, hover, focus da tastiera e disabled usano lo stesso contratto." title="Azioni" tone="muted">
        <Container>
          <Panel>
            <div className="sample-actions">
              <Button>Azioni principali</Button>
              <Button variant="secondary">Azione secondaria</Button>
              <Button variant="ghost">Azione discreta</Button>
              <Button variant="danger">Azione irreversibile</Button>
              <Button disabled>Non disponibile</Button>
              <IconButton aria-label="Aggiungi elemento" tone="accent">+</IconButton>
              <IconButton aria-label="Azione non disponibile" disabled>?</IconButton>
            </div>
          </Panel>
        </Container>
      </Section>

      <Section description="Le primitive non interpretano stati documentali o ruoli." title="Stati generici">
        <Container>
          <div className="component-grid">
            <Card>
              <h2 className="font-display text-qv-title">Badge</h2>
              <div className="sample-badges">
                <Badge>Neutro</Badge>
                <Badge variant="info">Informazione</Badge>
                <Badge variant="positive">Aggiornato</Badge>
                <Badge variant="warning">Da verificare</Badge>
                <Badge variant="danger">Azione richiesta</Badge>
              </div>
            </Card>
            <Card tone="info">
              <h2 className="font-display text-qv-title">Status</h2>
              <div className="grid gap-qv-3">
                <Status tone="positive">Stato aggiornato</Status>
                <Status tone="warning">Informazioni da confermare</Status>
                <Status tone="danger">Richiede attenzione</Status>
              </div>
            </Card>
            <Card tone="warning">
              <h2 className="font-display text-qv-title">Alert</h2>
              <Alert title="Operazione da rivedere" tone="warning">
                Verifica i dati prima di proseguire.
              </Alert>
            </Card>
          </div>
        </Container>
      </Section>

      <Section description="Etichette, descrizioni ed errori restano leggibili senza affidarsi al solo colore." title="Campi e controlli" tone="muted">
        <Container>
          <Panel>
            <div className="form-grid">
              <Field description="Testo breve per l'utente." htmlFor="foundation-name" label="Nome" required>
                <Input id="foundation-name" placeholder="Inserisci un valore" />
              </Field>
              <Field error="Scegli un'opzione." htmlFor="foundation-select" label="Opzione">
                <Select defaultValue="" id="foundation-select">
                  <option disabled value="">Seleziona</option>
                  <option value="one">Prima opzione</option>
                  <option value="two">Seconda opzione</option>
                </Select>
              </Field>
              <Field htmlFor="foundation-note" label="Nota">
                <Textarea id="foundation-note" placeholder="Aggiungi informazioni utili" />
              </Field>
              <div className="grid gap-qv-3">
                <label className="flex items-center gap-qv-2"><Checkbox /> Conferma richiesta</label>
                <label className="flex items-center gap-qv-2"><Radio name="foundation-choice" /> Prima scelta</label>
                <label className="flex items-center gap-qv-2"><Switch /> Aggiornamenti attivi</label>
              </div>
            </div>
          </Panel>
        </Container>
      </Section>

      <Section description="I casi non ideali hanno una spiegazione e un percorso di recupero." title="Stati di contenuto">
        <Container>
          <div className="component-grid">
            <LoadingState label="Recupero dei dati in corso" />
            <EmptyState description="Non sono presenti elementi da mostrare." title="Nessun elemento" action={<Button variant="secondary">Aggiungi elemento</Button>} />
            <ErrorState description="Riprova tra poco o verifica i dati inseriti." action={<Button variant="secondary">Riprova</Button>} />
          </div>
        </Container>
      </Section>

      <Section title="Linguaggio prudente" tone="muted">
        <Container>
          <Panel>
            <ul className="copy-list">
              {prudentCopy.map((copy) => <li key={copy}>{copy}</li>)}
            </ul>
          </Panel>
        </Container>
      </Section>

      <Section
        description="Pattern isolato per challenge, enrollment, recupero autonomo e decisione OWNER. Nessuna integrazione workspace prima dell'approvazione."
        title="Sicurezza account e recupero MFA"
      >
        <Container>
          <MfaSecurityPattern />
        </Container>
      </Section>
    </main>
  );
}
