import {
  Alert,
  ArrowRight,
  Button,
  Checkbox,
  Container,
  EmptyState,
  ErrorState,
  Field,
  Icon,
  IconButton,
  Input,
  LoadingState,
  Plus,
  Radio,
  Section,
  Select,
  Switch,
  Textarea,
  Trace,
  TraceGap,
  TraceNode,
  TraceTerminal,
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
        <Container size="wide">
          <div className="sirio-hero__grid">
            <div>
              <p className="sirio-kicker">Sistema condiviso</p>
              <h1>Sirio.<br />Traccia Operativa.</h1>
              <p>
                Token, primitive e casi limite della nuova grammatica Qoovex. La fonte canonica resta <code>packages/ui</code>.
              </p>
              <Button href="/situazione-aperta" size="sm" variant="secondary">Visualizza lo specimen</Button>
            </div>
            <Trace aria-label="Sequenza di sistema">
              <TraceNode label="Stato" title="Informazione presente" description="La situazione ha un'origine leggibile." />
              <TraceGap label="Vuoto indicizzato" title="Documento mancante" description="Il pacchetto resta incompleto, ma il recupero è visibile." />
              <TraceTerminal
                label="Prossima azione"
                title="Richiedi il documento"
                action={<Button size="sm">Continua <Icon glyph={ArrowRight} size={16} /></Button>}
              />
            </Trace>
          </div>
        </Container>
      </header>

      <Section description="General Sans governa il lavoro. Cabinet Grotesk orienta i momenti di ingresso." title="Materia e tipografia">
        <Container size="wide">
          <div className="token-grid">
            {[
              ["Campo", "canvas"],
              ["Carta", "surface"],
              ["Nebbia", "fog"],
              ["Cobalto", "accent"],
              ["Inchiostro", "text"],
            ].map(([label, token]) => (
              <figure className="token-proof" key={label}>
                <div className={`token-swatch token-swatch--${token}`} />
                <figcaption><strong>{label}</strong><span>Ruolo strutturale</span></figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </Section>

      <Section description="Il cobalto indica orientamento e avanzamento. Non sostituisce mai lo stato." title="Azioni" tone="muted">
        <Container>
          <div className="specimen">
            <div className="sample-actions">
              <Button>Azione principale</Button>
              <Button variant="secondary">Azione secondaria</Button>
              <Button variant="ghost">Azione discreta</Button>
              <Button variant="danger">Azione irreversibile</Button>
              <Button disabled>Non disponibile</Button>
              <IconButton aria-label="Aggiungi elemento" tone="accent"><Icon glyph={Plus} /></IconButton>
            </div>
          </div>
        </Container>
      </Section>

      <Section description="Presenza, assenza e recupero sono strutture, non pill colorate." title="Traccia, vuoto e terminale">
        <Container>
          <Trace aria-label="Esempio di situazione operativa">
            <TraceNode label="Presente" title="Visura aziendale" description="Versione caricata il 12 luglio 2026." />
            <TraceNode label="Responsabile" title="Amministrazione" description="La verifica resta assegnata all'azienda." />
            <TraceGap label="Mancante" title="Documento del lavoratore" description="L'accesso al pacchetto resta incompleto finché l'elemento non viene aggiunto." />
            <TraceTerminal label="Recupero" title="Richiedi all'interessato" action={<Button size="sm">Prepara richiesta</Button>} />
          </Trace>
        </Container>
      </Section>

      <Section description="Etichetta, descrizione, errore e controllo mantengono un ordine stabile." title="Campi e controlli" tone="muted">
        <Container>
          <div className="specimen form-grid">
            <Field description="Testo breve e operativo." htmlFor="foundation-name" label="Nome" required>
              <Input id="foundation-name" placeholder="Inserisci un valore" />
            </Field>
            <Field error="Scegli un'opzione per continuare." htmlFor="foundation-select" label="Opzione">
              <Select defaultValue="" id="foundation-select">
                <option disabled value="">Seleziona</option>
                <option value="one">Prima opzione</option>
                <option value="two">Seconda opzione</option>
              </Select>
            </Field>
            <Field htmlFor="foundation-note" label="Nota">
              <Textarea id="foundation-note" placeholder="Aggiungi informazioni utili" />
            </Field>
            <div className="control-stack">
              <label><Checkbox /> Conferma richiesta</label>
              <label><Radio name="foundation-choice" /> Prima scelta</label>
              <label><Switch /> Aggiornamenti attivi</label>
            </div>
          </div>
        </Container>
      </Section>

      <Section description="Ogni caso non ideale spiega cosa è successo e da dove ripartire." title="Stati di contenuto">
        <Container>
          <div className="state-grid">
            <LoadingState label="Recupero dei dati in corso" />
            <EmptyState description="Non sono presenti elementi. Puoi aggiungere il primo quando sei pronto." title="Nessun elemento" action={<Button variant="secondary">Aggiungi elemento</Button>} />
            <ErrorState description="Riprova tra poco oppure verifica i dati inseriti." action={<Button variant="secondary">Riprova</Button>} />
          </div>
        </Container>
      </Section>

      <Section title="Linguaggio prudente" tone="muted">
        <Container>
          <div className="language-proof">
            {prudentCopy.map((copy) => <p key={copy}>{copy}</p>)}
          </div>
        </Container>
      </Section>

      <Section
        description="Challenge, enrollment, recupero autonomo e decisione OWNER mantengono comportamento e linguaggio autorizzati."
        title="Sicurezza account e recupero MFA"
      >
        <Container>
          <MfaSecurityPattern />
        </Container>
      </Section>
    </main>
  );
}
