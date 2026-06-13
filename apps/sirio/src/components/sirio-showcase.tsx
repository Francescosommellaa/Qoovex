import type { CSSProperties, ReactNode } from "react";

import {
  Badge,
  Button,
  Card,
  GlassPanel,
  Input,
  type BadgeVariant,
  type ButtonVariant,
  type CardVariant,
  type GlassPanelVariant,
} from "@qoovex/ui";

const monochromeTokens = [
  ["Paper 0", "--qv-paper-0", "#FFFFFF", false],
  ["Paper 25", "--qv-paper-25", "#FCFCFB", false],
  ["Paper 50", "--qv-paper-50", "#F7F7F5", false],
  ["Stone 100", "--qv-stone-100", "#EEEEEB", false],
  ["Stone 200", "--qv-stone-200", "#DEDEDA", false],
  ["Stone 400", "--qv-stone-400", "#A4A49E", false],
  ["Stone 600", "--qv-stone-600", "#666662", true],
  ["Ink 800", "--qv-ink-800", "#2A2A28", true],
  ["Ink 900", "--qv-ink-900", "#151514", true],
  ["Ink 950", "--qv-ink-950", "#090909", true],
] as const;

const accentTokens = [
  ["Signal cyan", "--qv-signal-cyan", "#28C7D9", false],
  ["Signal cobalt", "--qv-signal-cobalt", "#3568E8", true],
  ["Signal apricot", "--qv-signal-apricot", "#F2A56F", false],
  ["Signal violet", "--qv-signal-violet", "#8C6DE8", true],
] as const;

const statusTokens = [
  ["Success", "--qv-status-success", "#187A4B", true],
  ["Warning", "--qv-status-warning", "#D99A00", false],
  ["Danger", "--qv-status-danger", "#B4232D", true],
  ["Info", "--qv-status-info", "#2459B3", true],
  ["Focus", "--qv-status-focus", "#315FD6", true],
] as const;

const glassPresets = [
  {
    name: "Subtle",
    variant: "subtle",
    stage: "white",
    role: "Depth",
    use: "Separazione locale, empty state e highlight quieto.",
    avoid: "Non per testo su immagini o liste ripetute.",
  },
  {
    name: "Soft",
    variant: "soft",
    stage: "mist",
    role: "Depth",
    use: "Toolbar, preview singole e superfici leggere.",
    avoid: "Non trasforma ogni card in vetro.",
  },
  {
    name: "Medium",
    variant: "medium",
    stage: "spectrum",
    role: "Lens",
    use: "Pannello focale o onboarding isolato.",
    avoid: "Non per dati ad alta densità.",
  },
  {
    name: "Strong",
    variant: "strong",
    stage: "inverse",
    role: "Lens",
    use: "Preview isolata e momento hero controllato.",
    avoid: "Non per componenti ripetuti.",
  },
  {
    name: "Deep",
    variant: "deep",
    stage: "spectrum",
    role: "Narrative depth",
    use: "Solo marketing e fondali narrativi.",
    avoid: "Vietato nel workspace operativo.",
  },
] as const satisfies ReadonlyArray<{
  name: string;
  variant: GlassPanelVariant;
  stage: string;
  role: string;
  use: string;
  avoid: string;
}>;

const specialGlassPresets = [
  {
    name: "Navigation",
    className: "qv-glass-navigation",
    stage: "white",
    use: "Topbar e divider stabili, senza glow.",
  },
  {
    name: "Modal",
    className: "qv-glass-modal",
    stage: "mist",
    use: "Overlay quasi opaco; gli input interni restano paper.",
  },
  {
    name: "Focus",
    className: "qv-glass-focus",
    stage: "spectrum",
    use: "Selezione critica; non sostituisce il focus ring.",
  },
] as const;

const glassDirections = [
  {
    id: "01",
    key: "crystal",
    name: "Crystal optical",
    specs: "alpha 72% centro · 10% cornice · frame 6 px",
    description:
      "Centro bianco leggibile e cornice trasparente: nessuna linea separa i due materiali concentrici.",
  },
  {
    id: "02",
    key: "frost",
    name: "Soft frost",
    specs: "20 px blur · 88% alpha · bordo 2 px",
    description:
      "Più lattiginoso e calmo. Colore diffuso, contrasto interno stabile e ombra corta.",
  },
  {
    id: "03",
    key: "optical",
    name: "Optical edge",
    specs: "28 px blur · 62% alpha · doppio bordo",
    description:
      "Bordo ottico bianco, highlight interno e profondità più precisa senza diventare lucido.",
  },
  {
    id: "04",
    key: "frame",
    name: "Thick lens",
    specs: "32 px blur · 72% alpha · cornice 5 px",
    description:
      "Una lente più fisica e autorevole. La cornice spessa separa il vetro dal canvas.",
  },
  {
    id: "05",
    key: "chromatic",
    name: "Chromatic rim",
    specs: "48 px blur · 52% alpha · bordo 3 px",
    description:
      "Il colore vive nel bordo e sotto il vetro, mentre il centro resta neutro e leggibile.",
  },
] as const;

const buttonVariants = [
  "primary",
  "secondary",
  "ghost",
  "glass",
  "destructive",
] as const satisfies ReadonlyArray<ButtonVariant>;

const cardVariants = [
  "default",
  "elevated",
  "glass",
  "glass-strong",
  "inverse",
] as const satisfies ReadonlyArray<CardVariant>;

const badgeVariants = [
  "neutral",
  "accent",
  "success",
  "warning",
  "danger",
  "info",
] as const satisfies ReadonlyArray<BadgeVariant>;

function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <header className="sirio-section-heading">
      <div>
        <p className="sirio-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      <p>{children}</p>
    </header>
  );
}

function Swatch({
  dark,
  hex,
  name,
  token,
}: {
  dark: boolean;
  hex: string;
  name: string;
  token: string;
}) {
  return (
    <div
      className="swatch"
      data-dark={dark}
      style={{ background: `var(${token})` } as CSSProperties}
    >
      <strong>{name}</strong>
      <span>{hex}</span>
    </div>
  );
}

export function SirioShowcase() {
  return (
    <div className="sirio-shell">
      <nav className="sirio-nav qv-glass-navigation" aria-label="Sezioni Sirio">
        <a className="sirio-brand" href="#top">
          <span className="sirio-brand-mark" aria-hidden="true" />
          <span className="sirio-brand-word">Sirio</span>
          <Badge variant="success">Stable v0.1</Badge>
        </a>
        <div className="sirio-nav-links">
          <a href="#fondazioni">Fondazioni</a>
          <a href="#glass">Glass system</a>
          <a href="#tipografia">Tipografia</a>
          <a href="#componenti">Componenti</a>
          <a href="#composizione">Composizione</a>
          <a href="#revisione">Revisione</a>
        </div>
      </nav>

      <main className="sirio-main" id="top">
        <header className="sirio-hero">
          <div>
            <p className="sirio-eyebrow">Qoovex visual foundation</p>
            <h1>Chiarezza, luce e profondità controllata.</h1>
            <p className="sirio-hero-copy">
              Questa è la fondazione visuale Stable v0.1. Il blur mette a fuoco
              una decisione, non decora l’interfaccia. Palette, componenti e
              intensità condivise sono il contratto runtime approvato.
            </p>
            <div className="sirio-actions">
              <Button interaction="magnetic">Esplora la fondazione</Button>
              <Button variant="secondary">Vedi i criteri</Button>
            </div>
          </div>

          <div className="optic-bench" aria-label="Banco ottico operativo">
            <span className="optic-ring" data-ring="one" />
            <span className="optic-ring" data-ring="two" />
            <span className="optic-ring" data-ring="three" />
            <div className="optic-fragment" data-fragment="sheet">
              Foglio cliente B
              <br />
              “Ricalcolare 24 porzioni”
            </div>
            <div className="optic-fragment" data-fragment="message">
              Messaggio brigata
              <br />
              “Quale versione preparo?”
            </div>
            <GlassPanel className="optic-recipe" variant="medium">
              <div className="optic-meta">
                <Badge variant="success">Confermata</Badge>
                <span>24 porzioni</span>
              </div>
              <h2>Risotto al limone e timo</h2>
              <ul className="optic-ingredients">
                <li>
                  <span>Riso Carnaroli</span>
                  <strong>1,92 kg</strong>
                </li>
                <li>
                  <span>Brodo vegetale</span>
                  <strong>5,4 l</strong>
                </li>
                <li>
                  <span>Limoni non trattati</span>
                  <strong>8 pz</strong>
                </li>
              </ul>
            </GlassPanel>
          </div>
        </header>

        <section className="sirio-section" id="fondazioni">
          <SectionHeading
            eyebrow="01 · Fondazioni"
            title="Carta, ossidiana e segnali rari."
          >
            Il bianco sostiene il lavoro, il nero organizza la gerarchia e il
            colore appare come orientamento o trasformazione. Gli stati
            funzionali non diventano decorazione.
          </SectionHeading>

          <div className="token-group">
            <div>
              <h3>Scala monocromatica</h3>
              <p>Dieci passaggi per canvas, testo, bordi e profondità.</p>
            </div>
            <div className="swatch-grid">
              {monochromeTokens.map(([name, token, hex, dark]) => (
                <Swatch
                  dark={dark}
                  hex={hex}
                  key={token}
                  name={name}
                  token={token}
                />
              ))}
            </div>
          </div>

          <div className="token-group sirio-stack-lg">
            <div>
              <h3>Accenti sepolti</h3>
              <p>
                Ciano e cobalto orientano; albicocca segnala l’output; violetto
                rifrange senza dominare.
              </p>
            </div>
            <div className="swatch-grid">
              {accentTokens.map(([name, token, hex, dark]) => (
                <Swatch
                  dark={dark}
                  hex={hex}
                  key={token}
                  name={name}
                  token={token}
                />
              ))}
            </div>
          </div>

          <div className="token-group sirio-stack-lg">
            <div>
              <h3>Stati funzionali</h3>
              <p>
                Ogni stato richiede testo o struttura oltre al colore. Il verde
                non dichiara mai sicurezza alimentare assoluta.
              </p>
            </div>
            <div className="swatch-grid">
              {statusTokens.map(([name, token, hex, dark]) => (
                <Swatch
                  dark={dark}
                  hex={hex}
                  key={token}
                  name={name}
                  token={token}
                />
              ))}
            </div>
          </div>

          <div className="sirio-grid sirio-stack-lg" data-columns="4">
            <Card className="surface-card">
              <Badge>Canvas</Badge>
              <div>
                <h3>Bianco dominante</h3>
                <p>Default per pagine e lavoro operativo.</p>
              </div>
            </Card>
            <Card className="surface-card" variant="elevated">
              <Badge>Paper</Badge>
              <div>
                <h3>Dati nitidi</h3>
                <p>Form, liste e informazioni professionali.</p>
              </div>
            </Card>
            <div className="glass-card-stage" data-light="cool-warm">
              <Card className="surface-card" variant="glass">
                <Badge variant="accent">Glass</Badge>
                <div>
                  <h3>Focus isolato</h3>
                  <p>Una superficie dominante, non una griglia intera.</p>
                </div>
              </Card>
            </div>
            <Card className="surface-card" variant="inverse">
              <Badge>Obsidian</Badge>
              <div>
                <h3>Contrasto locale</h3>
                <p>CTA e passaggi intensi, mai dark mode diffuso.</p>
              </div>
            </Card>
          </div>
        </section>

        <section className="sirio-section" id="glass">
          <SectionHeading eyebrow="02 · Blur system" title="Un blur, una funzione.">
            Ogni preset dichiara cosa mette a fuoco, separa o attenua. Su mobile
            l’opacità cresce e l’intensità cala; il contenuto resta leggibile
            anche senza backdrop-filter.
          </SectionHeading>

          <div className="sirio-grid" data-columns="2">
            {glassPresets.map((preset) => (
              <div
                className="glass-stage"
                data-stage={preset.stage}
                key={preset.variant}
              >
                <GlassPanel
                  className="glass-specimen"
                  variant={preset.variant}
                >
                  <Badge variant="accent">{preset.role}</Badge>
                  <h3>{preset.name}</h3>
                  <p>{preset.use}</p>
                  <ul className="glass-contract">
                    <li>
                      <strong>Usare:</strong> {preset.use}
                    </li>
                    <li>
                      <strong>Evitare:</strong> {preset.avoid}
                    </li>
                  </ul>
                </GlassPanel>
              </div>
            ))}

            {specialGlassPresets.map((preset) => (
              <div
                className="glass-stage"
                data-stage={preset.stage}
                key={preset.name}
              >
                <div
                  className={`${preset.className} qv-glass-panel glass-specimen`}
                >
                  <Badge>{preset.name}</Badge>
                  <h3>Glass {preset.name.toLowerCase()}</h3>
                  <p>{preset.use}</p>
                  <ul className="glass-contract">
                    <li>
                      <strong>Contratto:</strong> nitidezza interna e fallback
                      opaco equivalente.
                    </li>
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-direction-lab">
            <header className="glass-direction-heading">
              <div>
                <Badge variant="warning">Visual direction lab</Badge>
                <h3>Quale vetro deve diventare Qoovex?</h3>
              </div>
              <p>
                Cinque prove non contrattuali sullo stesso contenuto e sullo
                stesso fondale. Scegli un numero: nessuna di queste varianti
                entra nella libreria prima della review.
              </p>
            </header>

            <div className="glass-direction-grid">
              {glassDirections.map((direction) => (
                <div
                  className="glass-direction-stage"
                  data-direction={direction.key}
                  key={direction.key}
                >
                  <div className="glass-direction-source" aria-hidden="true">
                    <span>24</span>
                    <span>Menu estate</span>
                    <span>Ricetta · Output · Servizio</span>
                  </div>

                  <Card className="glass-direction-card" variant="glass">
                    <div className="glass-direction-center">
                      <div className="glass-direction-meta">
                        <Badge
                          variant={
                            direction.key === "crystal" ? "success" : "neutral"
                          }
                        >
                          {direction.key === "crystal"
                            ? `${direction.id} · Selected`
                            : direction.id}
                        </Badge>
                        <span>{direction.specs}</span>
                      </div>
                      <div>
                        <h4>{direction.name}</h4>
                        <p>{direction.description}</p>
                      </div>
                      <div className="glass-direction-output">
                        <span>Menu degustazione</span>
                        <strong>Pronto</strong>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sirio-section" id="tipografia">
          <SectionHeading
            eyebrow="03 · Tipografia"
            title="Editoriale quando racconta, precisa quando lavora."
          >
            Cabinet Grotesk e Synonym sono ruoli candidati, non font caricati.
            Questa pagina usa fallback di sistema per validare scala, ritmo,
            cifre, unità e contenuti italiani prima del self-hosting.
          </SectionHeading>

          <Card>
            <div className="type-specimen">
              <p className="type-label">Display / fallback candidate</p>
              <p className="type-display">Una ricetta, più output.</p>
            </div>
            <div className="type-specimen">
              <p className="type-label">Section heading</p>
              <p className="type-heading">
                Trasforma dati professionali in lavoro pronto.
              </p>
            </div>
            <div className="type-specimen">
              <p className="type-label">Body / UI</p>
              <p className="type-body">
                Aggiorna la ricetta una volta. Menu, allergeni e lista partono
                dalla stessa base, con stati leggibili e controllo umano.
              </p>
            </div>
            <div className="type-specimen">
              <p className="type-label">Dati e unità</p>
              <p className="type-data">
                1,92 kg · 24 porzioni · 185 °C · 01:35 h · € 12,50
              </p>
            </div>
            <div className="type-specimen">
              <p className="type-label">Diacritici e affidabilità</p>
              <p>
                È già pronta? Caffè, crème brûlée, piñoli. Allergeni: rilevato,
                da verificare, confermato.
              </p>
            </div>
          </Card>
        </section>

        <section className="sirio-section" id="componenti">
          <SectionHeading
            eyebrow="04 · Primitive"
            title="Cinque responsabilità, nessun riempitivo."
          >
            Le varianti rappresentano differenze semantiche. Focus, disabled,
            error e success sono parte del contratto; hover non contiene
            informazioni esclusive.
          </SectionHeading>

          <div className="sirio-grid" data-columns="2">
            <Card className="component-card" variant="elevated">
              <div>
                <h3>Button</h3>
                <p>Azioni con gerarchia chiara e target minimo di 44 px.</p>
              </div>
              <div className="sirio-inline">
                {buttonVariants.map((variant) => (
                  <Button key={variant} variant={variant}>
                    {variant}
                  </Button>
                ))}
                <Button disabled>Non disponibile</Button>
              </div>
            </Card>

            <Card className="component-card">
              <div>
                <h3>Badge</h3>
                <p>Il testo mantiene il significato anche senza colore.</p>
              </div>
              <div className="sirio-badge-row">
                {badgeVariants.map((variant) => (
                  <Badge key={variant} variant={variant}>
                    {variant === "warning" ? "Da verificare" : variant}
                  </Badge>
                ))}
              </div>
            </Card>

            <Card className="component-card">
              <div>
                <h3>Input</h3>
                <p>Label persistente, superficie paper e messaggi specifici.</p>
              </div>
              <div className="input-stack">
                <Input
                  description="Nome visibile nel tuo archivio."
                  id="recipe-name"
                  label="Nome ricetta"
                  placeholder="Es. Risotto al limone"
                />
                <Input
                  defaultValue="0"
                  id="recipe-portions"
                  label="Porzioni"
                  message="Inserisci un numero maggiore di zero."
                  status="error"
                />
                <Input
                  defaultValue="RIS-024"
                  id="recipe-code"
                  label="Codice interno"
                  message="Codice disponibile."
                  status="success"
                />
                <Input
                  defaultValue="Chef Martina Rossi"
                  disabled
                  id="recipe-owner"
                  label="Creatore"
                />
              </div>
            </Card>

            <div className="sirio-grid">
              {cardVariants.map((variant) => (
                <div
                  className="card-variant-stage"
                  data-glass={variant.startsWith("glass")}
                  data-light={
                    variant === "glass-strong" ? "warm-focus" : "cool-warm"
                  }
                  key={variant}
                >
                  <Card className="component-card" variant={variant}>
                    <Badge>{variant}</Badge>
                    <div>
                      <h3>Card {variant}</h3>
                      <p>
                        {variant.startsWith("glass")
                          ? "Vetro e blur rivelano la luce sottostante solo su contenuti focali."
                          : "Struttura stabile per contenuto nitido e leggibile."}
                      </p>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="sirio-section" id="composizione">
          <SectionHeading
            eyebrow="05 · Composizione pilota"
            title="Dal frammento all’output controllabile."
          >
            La lente operativa attenua file e messaggi dispersi, mantiene la
            ricetta nitida e mostra un menu come conseguenza concreta. Non è
            una schermata prodotto né una promessa di feature aggiuntive.
          </SectionHeading>

          <div className="pilot">
            <div className="pilot-layout">
              <div className="pilot-context" aria-label="Contesto attenuato">
                <div className="pilot-fragment">
                  Foglio cliente A
                  <br />
                  18 porzioni
                </div>
                <div className="pilot-fragment">
                  PDF menu
                  <br />
                  Versione finale 3
                </div>
                <div className="pilot-fragment">
                  Messaggio
                  <br />
                  “Manca il sedano?”
                </div>
              </div>

              <GlassPanel className="pilot-focus" variant="strong">
                <div className="sirio-inline">
                  <Badge variant="accent">Ricetta sorgente</Badge>
                  <Badge variant="warning">Allergeni da verificare</Badge>
                </div>
                <div>
                  <h3>Risotto al limone e timo</h3>
                  <p>
                    La zona nitida contiene il dato controllabile. Gli input
                    interni restano paper e non ereditano blur.
                  </p>
                </div>
                <Input
                  defaultValue="24"
                  id="pilot-portions"
                  label="Porzioni"
                />
                <div className="sirio-actions">
                  <Button>Genera il menu</Button>
                  <Button variant="secondary">Controlla gli allergeni</Button>
                </div>
              </GlassPanel>

              <div className="pilot-output-stage">
                <Card className="pilot-output" variant="glass">
                  <Badge variant="success">Output pronto</Badge>
                  <div>
                    <h3>Menu degustazione</h3>
                    <p>Cliente B · Estate</p>
                  </div>
                  <div className="pilot-output-row">
                    <span>Portata</span>
                    <strong>Primo</strong>
                  </div>
                  <div className="pilot-output-row">
                    <span>Allergeni</span>
                    <strong>Da verificare</strong>
                  </div>
                  <Button variant="secondary">Apri il menu</Button>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="sirio-section" id="revisione">
          <SectionHeading
            eyebrow="06 · Gate approvato"
            title="Il contratto visuale è stabile."
          >
            La review sui quattro viewport ha approvato fondazioni, gerarchia,
            stati e responsive behavior. Le correzioni richieste sono parte
            della Stable v0.1.
          </SectionHeading>

          <div className="review-approval">
            <Badge variant="success">10/10 criteri approvati</Badge>
            <p>
              Font esterni e componenti avanzati restano fuori dal contratto.
            </p>
          </div>

          <div className="sirio-grid" data-columns="2">
            <Card variant="elevated">
              <ul className="review-list">
                {[
                  "Il bianco resta davvero dominante?",
                  "Il nero struttura senza trasformarsi in dark mode?",
                  "Il colore è raro e legato a orientamento o output?",
                  "Le intensità glass sono distinguibili ma controllate?",
                  "Testo, quantità e stati restano leggibili sul caso peggiore?",
                ].map((item, index) => (
                  <li key={item}>
                    <span className="review-index">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <ul className="review-list">
                {[
                  "Il fallback opaco conserva la stessa gerarchia?",
                  "Focus, disabled, error e success sono comprensibili?",
                  "Mobile riduce gli effetti senza perdere significato?",
                  "Marketing e workspace condividono il linguaggio senza avere la stessa intensità?",
                  "C’è qualcosa che non serve a una decisione o a un flusso?",
                ].map((item, index) => (
                  <li key={item}>
                    <span className="review-index">
                      {String(index + 6).padStart(2, "0")}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>
      </main>

      <footer className="sirio-main sirio-footer">
        Qoovex Design Foundations · Stable v0.1 · Font esterni non caricati ·
        Nessuna entity o feature prodotto implementata
      </footer>
    </div>
  );
}
