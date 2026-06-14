"use client";

import {
  Bell,
  Check,
  ChefHat,
  DotsThree,
  FilePlus,
  Info,
  ListChecks,
  SlidersHorizontal,
} from "@phosphor-icons/react";
import Image from "next/image";
import { useState, type CSSProperties, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTrigger,
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  Field,
  IconButton,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  SegmentedControl,
  Select,
  Separator,
  Skeleton,
  Surface,
  Switch,
  Tabs,
  Textarea,
  Toast,
  ToastProvider,
  ToastViewport,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@qoovex/ui";

const palette = [
  ["Paper", "--qv-paper-0", "#FFFFFF"],
  ["Mist", "--qv-paper-50", "#F7F7F5"],
  ["Stone", "--qv-stone-200", "#DEDEDA"],
  ["Graphite", "--qv-stone-600", "#666662"],
  ["Ink", "--qv-ink-900", "#151514"],
  ["Obsidian", "--qv-ink-950", "#090909"],
  ["Cyan", "--qv-signal-cyan", "#28C7D9"],
  ["Cobalt", "--qv-signal-cobalt", "#3568E8"],
  ["Apricot", "--qv-signal-apricot", "#F2A56F"],
  ["Violet", "--qv-signal-violet", "#8C6DE8"],
] as const;

const materialProfiles = [
  {
    alpha: ".82 / 12 px",
    description: "Separa una barra stabile senza trasformarla in una lente.",
    purpose: "navigation",
    title: "Navigation",
  },
  {
    alpha: ".68 / 18 px",
    description: "Circoscrive il dettaglio selezionato e mantiene il dato nitido.",
    purpose: "focus",
    title: "Focus",
  },
  {
    alpha: ".48 / 20 px",
    description: "La firma ad alta intensita per preview e racconto prodotto.",
    purpose: "feature",
    title: "Feature",
  },
  {
    alpha: ".92 / 24 px",
    description: "Quasi opaco: protegge lettura, focus e decisioni modali.",
    purpose: "overlay",
    title: "Overlay",
  },
] as const;

function SectionHeading({
  children,
  eyebrow,
  title,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
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

function TokenSwatch({
  hex,
  name,
  token,
}: {
  hex: string;
  name: string;
  token: string;
}) {
  return (
    <div
      className="sirio-swatch"
      style={{ "--swatch": `var(${token})` } as CSSProperties}
    >
      <span />
      <strong>{name}</strong>
      <small>{hex}</small>
    </div>
  );
}

function ComponentBlock({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card className="component-block">
      <header>
        <h3>{title}</h3>
        <p>{description}</p>
      </header>
      <div className="component-block__content">{children}</div>
    </Card>
  );
}

export function SirioShowcase() {
  const [toastOpen, setToastOpen] = useState(false);

  return (
    <ToastProvider swipeDirection="right">
      <TooltipProvider delayDuration={250}>
        <div className="sirio-shell" data-qv-density="comfort">
          <Surface
            className="sirio-nav"
            material="crystal"
            purpose="navigation"
          >
            <a className="sirio-brand" href="#top">
              <Image
                alt=""
                aria-hidden="true"
                className="sirio-brand-mark"
                height={20}
                priority
                src="/logo-icon/sirio-icon.svg"
                style={{ height: 20, width: 20 }}
                width={20}
              />
              <span>Sirio</span>
              <Badge variant="success">Stable v0.5</Badge>
            </a>
            <nav aria-label="Sezioni Sirio">
              <a href="#fondazioni">Fondazioni</a>
              <a href="#materiali">Materiali</a>
              <a href="#componenti">Componenti</a>
              <a href="#composizione">Composizione</a>
              <a href="#revisione">Revisione</a>
            </nav>
          </Surface>

          <main className="sirio-main" id="top">
            <header className="sirio-hero">
              <div className="sirio-hero__copy">
                <p className="sirio-eyebrow">Qoovex design system</p>
                <Badge variant="accent">Contratto runtime 0.5.0</Badge>
                <h1>La precisione diventa materiale.</h1>
                <p>
                  Paper quando il lavoro richiede densita. Crystal quando una
                  decisione deve emergere. Ogni raggio, contrasto e movimento
                  nasce dalla funzione, non dall&apos;effetto.
                </p>
                <div className="sirio-actions">
                  <Button
                    interaction="magnetic"
                    onClick={() =>
                      document
                        .querySelector("#materiali")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Esplora il materiale
                  </Button>
                  <Button
                    onClick={() =>
                      document
                        .querySelector("#componenti")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    variant="secondary"
                  >
                    Vedi il core
                  </Button>
                </div>
              </div>

              <div className="sirio-optical-bench">
                <div className="sirio-source-data" aria-hidden="true">
                  <span>24</span>
                  <span>porzioni</span>
                  <span>1,92 kg</span>
                  <span>185 C</span>
                </div>
                <Surface
                  className="sirio-hero-lens"
                  material="crystal"
                  purpose="feature"
                >
                  <div className="sirio-lens-meta">
                    <Badge variant="success">Ricetta verificata</Badge>
                    <span>Menu estate</span>
                  </div>
                  <div>
                    <p className="sirio-kicker">Output operativo</p>
                    <h2>Risotto al limone e timo</h2>
                    <p>
                      Il centro sfoca il contesto senza sfocare il contenuto.
                      La cornice rifrange soltanto cio che esiste sotto.
                    </p>
                  </div>
                  <Separator />
                  <dl className="sirio-data-grid">
                    <div>
                      <dt>Porzioni</dt>
                      <dd>24</dd>
                    </div>
                    <div>
                      <dt>Resa</dt>
                      <dd>7,4 kg</dd>
                    </div>
                    <div>
                      <dt>Stato</dt>
                      <dd>Pronta</dd>
                    </div>
                  </dl>
                </Surface>
              </div>
            </header>

            <section className="sirio-section" id="fondazioni">
              <SectionHeading
                eyebrow="01 / Costituzione"
                title="Bianco dominante. Nero strutturale. Colore raro."
              >
                La griglia parte da 4 px. Gli accenti orientano e segnalano
                trasformazione; non classificano intere aree del prodotto.
              </SectionHeading>

              <div className="sirio-swatch-grid">
                {palette.map(([name, token, hex]) => (
                  <TokenSwatch
                    hex={hex}
                    key={token}
                    name={name}
                    token={token}
                  />
                ))}
              </div>

              <div className="sirio-foundation-grid">
                <Card>
                  <p className="sirio-kicker">Geometria</p>
                  <h3>10 / 16 / 28 / 40</h3>
                  <p>
                    Controlli, superfici, Crystal e grandi lens. La cornice
                    Crystal misura 6 px; il centro usa radius 22 px.
                  </p>
                </Card>
                <Card elevation="raised">
                  <p className="sirio-kicker">Densita</p>
                  <h3>Comfort + compact</h3>
                  <p>
                    Compact riduce ritmo e padding, mai il target interattivo
                    minimo di 44 px.
                  </p>
                </Card>
                <Card material="inverse">
                  <p className="sirio-kicker">Motion</p>
                  <h3>160 / 220 / 360 / 600</h3>
                  <p>
                    Risposte fisiche a stato e prossimita. Nessuna animazione
                    ambientale continua.
                  </p>
                </Card>
              </div>

              <Card className="sirio-type-specimen">
                <div>
                  <p className="sirio-kicker">Cabinet Grotesk / display</p>
                  <p className="sirio-display-line">Una base. Piu output.</p>
                </div>
                <Separator />
                <div>
                  <p className="sirio-kicker">Synonym / UI e dati</p>
                  <p className="sirio-body-line">
                    Caffe, creme brulee, pinoli. 1,92 kg / 24 porzioni /
                    185 C / 01:35 h / EUR 12,50.
                  </p>
                </div>
              </Card>
            </section>

            <section className="sirio-section" id="materiali">
              <SectionHeading
                eyebrow="02 / Materiali"
                title="Una sola fisica, quattro responsabilita."
              >
                Il profilo non descrive quanto vetro vogliamo vedere, ma il
                lavoro che la superficie deve svolgere. Nessun profilo viene
                scelto come variante decorativa.
              </SectionHeading>

              <div className="sirio-material-grid">
                {materialProfiles.map((profile) => (
                  <div className="sirio-material-stage" key={profile.purpose}>
                    <div className="sirio-material-source" aria-hidden="true">
                      <strong>{profile.title}</strong>
                      <span>Menu / Ricetta / Servizio / Allergeni</span>
                    </div>
                    <Surface
                      className="sirio-material-card"
                      material="crystal"
                      purpose={profile.purpose}
                    >
                      <div>
                        <Badge variant="accent">{profile.title}</Badge>
                        <span>{profile.alpha}</span>
                      </div>
                      <h3>{profile.title}</h3>
                      <p>{profile.description}</p>
                    </Surface>
                  </div>
                ))}
              </div>

              <div className="sirio-material-rules">
                <Card>
                  <Badge variant="success">Fare</Badge>
                  <h3>Contenuto sempre nitido</h3>
                  <p>
                    I filtri appartengono alle due pseudo-superfici. Testo,
                    controlli e discendenti non ricevono blur.
                  </p>
                </Card>
                <Card>
                  <Badge variant="danger">Non fare</Badge>
                  <h3>Glass dentro glass</h3>
                  <p>
                    Form, liste e dati densi restano paper. Il budget massimo e
                    due backdrop layer simultanei.
                  </p>
                </Card>
              </div>
            </section>

            <section className="sirio-section" id="componenti">
              <SectionHeading
                eyebrow="03 / Core"
                title="Componenti quieti, stati inequivocabili."
              >
                Le primitive condividono geometria e comportamento. Hover non
                porta informazione esclusiva; focus, disabled ed errore restano
                comprensibili senza colore.
              </SectionHeading>

              <div className="sirio-component-grid">
                <ComponentBlock
                  description="Gerarchia, pressione fisica e disabled neutro."
                  title="Azioni"
                >
                  <div className="sirio-inline">
                    <Button>Salva ricetta</Button>
                    <Button variant="secondary">Anteprima</Button>
                    <Button variant="tertiary">Annulla</Button>
                    <Button variant="destructive">Elimina</Button>
                    <Button disabled>Non disponibile</Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconButton aria-label="Informazioni sul salvataggio">
                          <Info aria-hidden="true" size={20} />
                        </IconButton>
                      </TooltipTrigger>
                      <TooltipContent>
                        Salva senza pubblicare il menu.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </ComponentBlock>

                <ComponentBlock
                  description="Label persistenti, messaggi specifici e carta opaca."
                  title="Campi"
                >
                  <div className="sirio-form-grid">
                    <Field
                      description="Nome visibile nell'archivio."
                      label="Nome ricetta"
                    >
                      <Input defaultValue="Risotto al limone e timo" />
                    </Field>
                    <Field
                      label="Allergeni"
                      message="Verifica almeno una fonte prima di pubblicare."
                      status="error"
                    >
                      <Textarea defaultValue="Sedano nel brodo vegetale." />
                    </Field>
                    <Field
                      label="Portata"
                      message="Classificazione salvata."
                      status="success"
                    >
                      <Select
                        aria-label="Portata"
                        defaultValue="primo"
                        options={[
                          { label: "Antipasto", value: "antipasto" },
                          { label: "Primo", value: "primo" },
                          { label: "Secondo", value: "secondo" },
                        ]}
                      />
                    </Field>
                  </div>
                </ComponentBlock>

                <ComponentBlock
                  description="Scelte leggibili con mouse, touch e tastiera."
                  title="Selezione"
                >
                  <div className="sirio-form-grid">
                    <Checkbox
                      defaultChecked
                      description="Richiede comunque controllo umano."
                      label="Evidenzia allergeni rilevati"
                    />
                    <Switch
                      defaultChecked
                      description="Conserva una versione pronta per la stampa."
                      label="Genera PDF menu"
                    />
                    <RadioGroup
                      defaultValue="24"
                      label="Porzioni di servizio"
                      name="portions"
                      options={[
                        { label: "12 porzioni", value: "12" },
                        { label: "24 porzioni", value: "24" },
                        { label: "48 porzioni", value: "48" },
                      ]}
                    />
                  </div>
                </ComponentBlock>

                <ComponentBlock
                  description="La posizione e la struttura sostengono lo stato attivo."
                  title="Navigazione"
                >
                  <SegmentedControl
                    aria-label="Densita della tabella"
                    defaultValue="comfort"
                    items={[
                      { label: "Comfort", value: "comfort" },
                      { label: "Compact", value: "compact" },
                    ]}
                  />
                  <Tabs
                    aria-label="Dettagli ricetta"
                    defaultValue="ingredienti"
                    items={[
                      {
                        content: "Riso, brodo, limone, timo e burro.",
                        label: "Ingredienti",
                        value: "ingredienti",
                      },
                      {
                        content: "Mantecatura finale: 4 minuti.",
                        label: "Metodo",
                        value: "metodo",
                      },
                      {
                        content: "Sedano: da verificare nel brodo.",
                        label: "Allergeni",
                        value: "allergeni",
                      },
                    ]}
                  />
                </ComponentBlock>

                <ComponentBlock
                  description="Focus gestito, Escape e ripristino sul trigger."
                  title="Overlay"
                >
                  <div className="sirio-inline">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary">Apri dialog</Button>
                      </DialogTrigger>
                      <DialogContent
                        description="Conferma i dati prima di generare l'output."
                        title="Pubblica menu"
                      >
                        <Field label="Nome pubblico">
                          <Input defaultValue="Menu degustazione estate" />
                        </Field>
                        <div className="sirio-dialog-actions">
                          <DialogClose asChild>
                            <Button variant="tertiary">Annulla</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button>Pubblica</Button>
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button variant="secondary">Apri drawer</Button>
                      </DrawerTrigger>
                      <DrawerContent
                        description="Contesto della ricetta senza perdere il menu."
                        title="Dettaglio operativo"
                      >
                        <Card>
                          <h3>Servizio serale</h3>
                          <p>24 coperti / pass ore 20:30.</p>
                        </Card>
                        <DrawerClose asChild>
                          <Button>Chiudi dettaglio</Button>
                        </DrawerClose>
                      </DrawerContent>
                    </Drawer>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="secondary">Apri popover</Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <strong>Fonte allergene</strong>
                        <p>Etichetta brodo aggiornata il 12 giugno.</p>
                      </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <IconButton aria-label="Altre azioni">
                          <DotsThree aria-hidden="true" size={22} />
                        </IconButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Duplica ricetta</DropdownMenuItem>
                        <DropdownMenuCheckboxItem checked>
                          Mostra quantita
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Archivia</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          Elimina versione
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent
                        description="La versione pubblicata resta disponibile, ma questa bozza non potra essere recuperata."
                        title="Eliminare la bozza?"
                      >
                        <div className="sirio-dialog-actions">
                          <AlertDialogCancel asChild>
                            <Button variant="secondary">Mantieni</Button>
                          </AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button variant="destructive">Elimina</Button>
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </ComponentBlock>

                <ComponentBlock
                  description="Stato locale, progresso e attesa senza rumore."
                  title="Feedback"
                >
                  <div className="sirio-badges">
                    <Badge>Bozza</Badge>
                    <Badge variant="success">Pronta</Badge>
                    <Badge variant="warning">Da verificare</Badge>
                    <Badge variant="danger">Errore</Badge>
                    <Badge variant="info">Informazione</Badge>
                  </div>
                  <Progress label="Controllo ricetta" value={72} />
                  <div className="sirio-skeletons">
                    <Skeleton height={16} width="72%" />
                    <Skeleton height={16} width="48%" />
                  </div>
                  <Button onClick={() => setToastOpen(true)} variant="secondary">
                    Mostra notifica
                  </Button>
                  <Toast
                    description="Il menu e ora disponibile in anteprima."
                    onOpenChange={setToastOpen}
                    open={toastOpen}
                    title="Menu generato"
                    tone="success"
                  />
                </ComponentBlock>

                <ComponentBlock
                  description="Il vuoto spiega il motivo e offre un prossimo passo."
                  title="Empty state"
                >
                  <EmptyState
                    action={
                      <Button>
                        <FilePlus aria-hidden="true" size={18} />
                        Crea il primo menu
                      </Button>
                    }
                    description="Combina ricette verificate per preparare un output cliente."
                    icon={<ChefHat aria-hidden="true" size={24} />}
                    title="Nessun menu per questo cliente"
                  />
                </ComponentBlock>
              </div>
            </section>

            <section className="sirio-section" id="composizione">
              <SectionHeading
                eyebrow="04 / Composizione"
                title="Il vetro orienta. La carta fa lavorare."
              >
                Una ricetta professionale produce un menu controllabile. Il
                contesto si attenua, il dato resta paper e l&apos;output emerge in
                una sola lens.
              </SectionHeading>

              <div className="sirio-pilot">
                <aside className="sirio-pilot-context">
                  <p className="sirio-kicker">Contesto sorgente</p>
                  <div>
                    <ListChecks aria-hidden="true" size={20} />
                    <span>Foglio cliente B</span>
                  </div>
                  <div>
                    <Bell aria-hidden="true" size={20} />
                    <span>Allergeni da verificare</span>
                  </div>
                  <div>
                    <SlidersHorizontal aria-hidden="true" size={20} />
                    <span>Servizio / 24 coperti</span>
                  </div>
                </aside>

                <Surface
                  className="sirio-pilot-focus"
                  material="crystal"
                  purpose="focus"
                >
                  <div className="sirio-lens-meta">
                    <Badge variant="accent">Lente operativa</Badge>
                    <span>Versione 3</span>
                  </div>
                  <div>
                    <h3>Risotto al limone e timo</h3>
                    <p>
                      Dato controllabile al centro. Nessun blur interno sui
                      campi o sulle quantita.
                    </p>
                  </div>
                  <Card>
                    <dl className="sirio-recipe-table">
                      <div>
                        <dt>Riso Carnaroli</dt>
                        <dd>1,92 kg</dd>
                      </div>
                      <div>
                        <dt>Brodo vegetale</dt>
                        <dd>5,4 l</dd>
                      </div>
                      <div>
                        <dt>Limoni</dt>
                        <dd>8 pz</dd>
                      </div>
                    </dl>
                  </Card>
                  <div className="sirio-inline">
                    <Button>Genera menu</Button>
                    <Button variant="secondary">Controlla allergeni</Button>
                  </div>
                </Surface>

                <Card className="sirio-pilot-output" elevation="floating">
                  <Badge variant="success">Output pronto</Badge>
                  <div>
                    <p className="sirio-kicker">Menu degustazione</p>
                    <h3>Cliente B / Estate</h3>
                  </div>
                  <Separator />
                  <dl className="sirio-recipe-table">
                    <div>
                      <dt>Portata</dt>
                      <dd>Primo</dd>
                    </div>
                    <div>
                      <dt>Allergeni</dt>
                      <dd>Da verificare</dd>
                    </div>
                  </dl>
                </Card>
              </div>
            </section>

            <section className="sirio-section" id="revisione">
              <SectionHeading
                eyebrow="05 / Gate"
                title="Stable significa verificabile."
              >
                Il contratto viene accettato solo quando gerarchia,
                accessibilita e prestazioni sopravvivono al caso peggiore.
              </SectionHeading>

              <Card className="sirio-review-card" elevation="raised">
                {[
                  "WCAG 2.2 AA su testo, controlli e focus.",
                  "Nessun blur su testo, input o discendenti.",
                  "Massimo due backdrop layer simultanei.",
                  "Fallback opaco e forced colors equivalenti.",
                  "Reduced motion senza perdita di stato.",
                  "375 / 768 / 1024 / 1440 px senza overflow.",
                  "Font locali: nessuna richiesta esterna.",
                  "Marketing e workspace condividono la grammatica, non l'intensita.",
                ].map((item) => (
                  <div className="sirio-review-item" key={item}>
                    <span>
                      <Check aria-hidden="true" size={16} weight="bold" />
                    </span>
                    <p>{item}</p>
                  </div>
                ))}
              </Card>
            </section>
          </main>

          <footer className="sirio-footer">
            <span>Qoovex Design System / Stable v0.5</span>
            <span>Paper, Crystal, precisione operativa.</span>
          </footer>
        </div>
        <ToastViewport />
      </TooltipProvider>
    </ToastProvider>
  );
}
