"use client";

import {
  ArrowRight,
  Check,
  CheckCircle,
  Eye,
  List,
  WarningOctagon,
  X,
} from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

const navItems = [
  { id: "orientamento", label: "Orientamento" },
  { id: "principi", label: "Principi" },
  { id: "palette", label: "Palette" },
  { id: "tipografia", label: "Tipografia" },
  { id: "layout", label: "Layout" },
  { id: "azioni", label: "Azioni" },
  { id: "stati", label: "Stati" },
  { id: "modalita", label: "Modalita" },
  { id: "qualita", label: "Qualita" },
] as const;

type SectionId = (typeof navItems)[number]["id"];
type ModeId = "default" | "kitchen" | "review";
type FeedbackTone = "idle" | "success" | "warning";

const sectionIds = new Set<string>(navItems.map(({ id }) => id));

const principles = [
  ["01", "Autorita silenziosa", "La gerarchia guida senza gridare."],
  ["02", "Chiarezza operativa", "Contesto, stato, rischio e prossimo passo restano visibili."],
  ["03", "Calore professionale", "Il colore segnala un cambiamento, non decora."],
  ["04", "Informazione prima della decorazione", "Ogni superficie deve migliorare una decisione."],
  ["05", "Un'azione, un significato", "Comandi e stati conservano una memoria visiva affidabile."],
] as const;

const paletteGroups = [
  {
    label: "Campo operativo",
    colors: [
      ["Porcellana", "Fondo di lavoro", "--qv-color-porcelain-50", "#faf9f6"],
      ["Cenere", "Profondita neutra", "--qv-color-ash-500", "#82827a"],
      ["Grafite", "Testo e autorita", "--qv-color-graphite-900", "#111111"],
      ["Acciaio", "Confini tecnici", "--qv-color-steel-500", "#8a8a84"],
    ],
  },
  {
    label: "Decisione",
    colors: [
      ["Calore", "Prossimo passo", "--qv-color-heat-500", "#d96b2b"],
      ["Zafferano", "Costo e variazione", "--qv-color-saffron-500", "#d18d19"],
      ["Informazione", "Contesto operativo", "--qv-color-info-500", "#3f8294"],
    ],
  },
  {
    label: "Esito",
    colors: [
      ["Erba", "Pronto e verificato", "--qv-color-herb-500", "#5f7a4f"],
      ["Grano", "Attenzione", "--qv-color-wheat-500", "#c9a646"],
      ["Errore", "Rischio critico", "--qv-color-error-500", "#b42318"],
      ["Bacca", "Nota cliente", "--qv-color-berry-500", "#ad4772"],
    ],
  },
] as const;

const typeRows = [
  ["Display", "--qv-type-5xl", "Identita e apertura, una volta per vista."],
  ["Titolo", "--qv-type-3xl", "Sezioni e blocchi di decisione."],
  ["Corpo", "--qv-type-md", "Procedure, note e descrizioni."],
  ["Dati", "--qv-font-data", "Quantita, tempi, delta e confronti."],
] as const;

const spacing = [
  ["4", "Micro separazione", "4px"],
  ["8", "Ritmo interno", "8px"],
  ["16", "Unita base", "16px"],
  ["24", "Gruppi correlati", "24px"],
  ["32", "Blocchi distinti", "32px"],
  ["64", "Cambio di capitolo", "64px"],
] as const;

const actionRows = [
  ["Primaria", "Salva revisione", "Una sola per vista.", false],
  ["Secondaria", "Anteprima QR", "Utile, senza concorrere.", false],
  ["Silenziosa", "Mostra dettagli", "Per comandi frequenti.", false],
  ["Pericolo", "Blocca menu", "Richiede conferma esplicita.", false],
  ["Disabilitata", "Pubblica menu", "Manca la verifica allergeni.", true],
] as const;

const states = [
  ["Modificato", "Calore", "Lavoro locale da confermare.", "changed"],
  ["Pronto", "Erba", "La preparazione puo avanzare.", "success"],
  ["Attenzione", "Grano", "Serve un controllo, non blocca.", "warning"],
  ["Critico", "Errore", "Allergene o pubblicazione rischiosa.", "danger"],
  ["Informativo", "Informazione", "Contesto o sincronizzazione.", "info"],
] as const;

const modes: ReadonlyArray<{ id: ModeId; label: string; description: string }> = [
  { id: "default", label: "Base", description: "Pianifica e confronta" },
  { id: "kitchen", label: "Cucina", description: "Esegui con meno scelte" },
  { id: "review", label: "Revisione", description: "Controlla prima di pubblicare" },
];

const modePreviews = {
  default: {
    eyebrow: "Piano del servizio",
    title: "Cena / 24 coperti",
    meta: "3 preparazioni aperte",
    action: "Salva piano",
    rows: [
      ["Ravioli ricotta e limone", "Porzioni aggiornate", "Modificato", "changed"],
      ["Pasta fresca", "Glutine verificato", "Controllo", "warning"],
      ["Fondo vegetale", "Pronto per il servizio", "Pronto", "success"],
    ],
  },
  kitchen: {
    eyebrow: "Servizio in corso",
    title: "Pass caldo / 18:42",
    meta: "2 azioni visibili",
    action: "Segna pronto",
    rows: [
      ["Ravioli ricotta e limone", "24 porzioni al pass", "In uscita", "changed"],
      ["Fondo vegetale", "Mantieni a 72 C", "Pronto", "success"],
    ],
  },
  review: {
    eyebrow: "Revisione pubblicazione",
    title: "Menu degustazione",
    meta: "1 blocco critico",
    action: "Approva menu",
    rows: [
      ["Pasta fresca", "Glutine non dichiarato nel QR", "Blocca", "danger"],
      ["Costo porzione", "+12% rispetto alla versione", "Verifica", "warning"],
      ["Note cliente", "Traduzione completata", "Pronto", "success"],
    ],
  },
} as const;

const quality = [
  "Lo stato si capisce in 5 secondi.",
  "La prossima azione si distingue a distanza.",
  "La gerarchia resta chiara senza colore.",
  "Le superfici sticky sono sempre opache.",
  "Il mobile conserva orientamento e contesto.",
  "I token restano pubblici e semantici.",
] as const;

function useActiveSection(): [SectionId, Dispatch<SetStateAction<SectionId>>] {
  const [activeSection, setActiveSection] = useState<SectionId>(navItems[0].id);

  useEffect(() => {
    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) return;

    let frame = 0;
    const updateActiveSection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const reachedPageEnd =
          Math.ceil(window.scrollY + window.innerHeight) >=
          document.documentElement.scrollHeight - 1;
        const current = reachedPageEnd
          ? sections[sections.length - 1]
          : sections.reduce<HTMLElement>(
              (active, section) =>
                section.getBoundingClientRect().top <= window.innerHeight * 0.3
                  ? section
                  : active,
              sections[0],
            );

        if (current.id && sectionIds.has(current.id)) {
          setActiveSection(current.id as SectionId);
        }
      });
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  return [activeSection, setActiveSection];
}

function useMobileHeaderVisibility(menuOpen: boolean) {
  const [headerHidden, setHeaderHidden] = useState(false);

  useEffect(() => {
    let frame = 0;
    if (menuOpen) {
      frame = requestAnimationFrame(() => setHeaderHidden(false));
      return () => cancelAnimationFrame(frame);
    }

    let lastScrollY = 0;
    const updateHeader = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const nextScrollY = window.scrollY || document.documentElement.scrollTop;
        const delta = nextScrollY - lastScrollY;

        if (nextScrollY <= 24) {
          setHeaderHidden(false);
        } else if (Math.abs(delta) >= 8) {
          setHeaderHidden(delta > 0);
        }

        lastScrollY = nextScrollY;
      });
    };

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateHeader);
    };
  }, [menuOpen]);

  return headerHidden;
}

export default function SirioPage() {
  const [activeSection, setActiveSection] = useActiveSection();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastAction, setLastAction] = useState("Scegli un comando per provarne il feedback.");
  const [feedbackTone, setFeedbackTone] = useState<FeedbackTone>("idle");
  const [dangerPending, setDangerPending] = useState(false);
  const [selectedMode, setSelectedMode] = useState<ModeId>("default");
  const [modeFeedback, setModeFeedback] = useState("Anteprima pronta.");
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const headerHidden = useMobileHeaderVisibility(menuOpen);
  const preview = modePreviews[selectedMode];

  useEffect(() => {
    document.body.toggleAttribute("data-sirio-menu-open", menuOpen);
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };

    window.addEventListener("keydown", closeMenu);
    return () => {
      document.body.removeAttribute("data-sirio-menu-open");
      window.removeEventListener("keydown", closeMenu);
    };
  }, [menuOpen]);

  const runAction = (kind: string, label: string) => {
    if (kind === "Pericolo") {
      setDangerPending(true);
      setFeedbackTone("warning");
      setLastAction("Conferma o annulla il blocco del menu.");
      return;
    }

    setDangerPending(false);
    setFeedbackTone("success");
    setLastAction(`${label}: comando ricevuto.`);
  };

  return (
    <>
      <a className="sirio-skip-link" href="#sirio-content">
        Vai al contenuto
      </a>
      <main
        className="sirio-atlas"
        data-active-section={activeSection}
        data-header-hidden={headerHidden ? "true" : "false"}
        data-menu-open={menuOpen ? "true" : "false"}
      >
        <aside className="sirio-sidebar" aria-label="Navigazione Sirio">
          <a
            aria-label="Torna a Orientamento"
            className="sirio-brand"
            href="#orientamento"
            onClick={() => {
              setActiveSection("orientamento");
              setMenuOpen(false);
            }}
          >
            <Image
              alt=""
              aria-hidden="true"
              height={34}
              priority
              src="/logo-icon/sirio-icon.svg"
              width={34}
            />
            <span>
              <strong>Sirio</strong>
              <small>Fondazioni Qoovex</small>
            </span>
          </a>

          <button
            aria-label={menuOpen ? "Chiudi menu" : "Apri menu"}
            aria-controls="sirio-menu"
            aria-expanded={menuOpen}
            className="sirio-menu-button"
            data-open={menuOpen ? "true" : "false"}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
            ref={menuButtonRef}
            type="button"
          >
            <span aria-hidden="true" className="sirio-menu-icons">
              <List className="sirio-menu-icons__open" size={22} weight="bold" />
              <X className="sirio-menu-icons__close" size={22} weight="bold" />
            </span>
          </button>

          <nav aria-label="Sezioni della pagina" id="sirio-menu">
            {navItems.map((item) => (
              <a
                aria-current={activeSection === item.id ? "location" : undefined}
                data-active={activeSection === item.id ? "true" : undefined}
                href={`#${item.id}`}
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setMenuOpen(false);
                }}
              >
                <span>{item.label}</span>
                <ArrowRight aria-hidden="true" size={15} weight="bold" />
              </a>
            ))}
          </nav>

          <p className="sirio-copyright">
            <span>&copy; 2026 Qoovex</span>
            <span>Tutti i diritti riservati.</span>
          </p>
        </aside>

        <div className="sirio-content" id="sirio-content">
          <section className="sirio-hero" id="orientamento">
            <div className="sirio-copy">
              <p className="sirio-kicker">Calore Misurato v0</p>
              <h1>Il lavoro resta al centro.</h1>
              <p>
                Sirio misura la fondazione sul lavoro reale: priorita leggibili,
                stati espliciti e una sola prossima azione.
              </p>
              <p className="sirio-direction-line">Criterio: utile, chiaro, durevole.</p>
            </div>

            <div className="sirio-command-board" aria-label="Binario operativo del servizio">
              <div className="sirio-board-header">
                <span>Servizio cena / 24 coperti</span>
                <strong data-qv-numeric>18:42</strong>
              </div>
              <div className="sirio-ticket" data-state="changed">
                <span data-qv-numeric>01</span>
                <div><strong>Ravioli ricotta e limone</strong><p>Porzioni e costo aggiornati.</p></div>
                <em>Da salvare</em>
              </div>
              <div className="sirio-ticket" data-state="warning">
                <span data-qv-numeric>02</span>
                <div><strong>Pasta fresca</strong><p>Glutine da verificare nel QR.</p></div>
                <em>Controllo</em>
              </div>
              <div className="sirio-ticket" data-state="success">
                <span data-qv-numeric>03</span>
                <div><strong>Fondo vegetale</strong><p>Preparazione pronta per il pass.</p></div>
                <em>Pronto</em>
              </div>
              <div className="sirio-board-footer">
                <span>1 modifica da confermare</span>
                <a href="#azioni" onClick={() => setActiveSection("azioni")}>
                  Apri revisione <ArrowRight aria-hidden="true" size={17} weight="bold" />
                </a>
              </div>
            </div>
          </section>

          <section className="sirio-section" id="principi">
            <div className="sirio-section-head">
              <p className="sirio-kicker">Principi</p>
              <h2>Ogni segno deve guadagnarsi spazio.</h2>
            </div>
            <ol className="sirio-principle-list">
              {principles.map(([number, label, text]) => (
                <li key={label}>
                  <span data-qv-numeric>{number}</span><strong>{label}</strong><p>{text}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="sirio-section" id="palette">
            <div className="sirio-section-head">
              <p className="sirio-kicker">Palette</p>
              <h2>Il colore cambia una decisione.</h2>
              <p>Neutrali per il campo, calore per il prossimo passo, stati per gli esiti.</p>
            </div>
            <div className="sirio-palette-groups">
              {paletteGroups.map((group) => (
                <section className="sirio-palette-family" key={group.label}>
                  <h3>{group.label}</h3>
                  <div>
                    {group.colors.map(([name, purpose, token, color]) => (
                      <div className="sirio-color-row" key={token}>
                        <span aria-hidden="true" style={{ backgroundColor: color }} />
                        <strong>{name}</strong><p>{purpose}</p><code translate="no">{token}</code>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>

          <section className="sirio-section" id="tipografia">
            <div className="sirio-section-head">
              <p className="sirio-kicker">Tipografia</p>
              <h2>Prima si legge. Poi si apprezza.</h2>
            </div>
            <div className="sirio-type-specimen">
              <p className="sirio-display">La cucina decide in secondi.</p>
              <p className="sirio-body">Ricette, allergeni, quantita e tempi restano confrontabili anche durante il servizio.</p>
              <p className="sirio-data" data-qv-numeric>24 porzioni / 1.250 kg / 18 min / +12%</p>
            </div>
            <div className="sirio-rule-list">
              {typeRows.map(([label, token, detail]) => (
                <div className="sirio-rule-row" key={label}>
                  <strong>{label}</strong><code translate="no">{token}</code><span>{detail}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="sirio-section" id="layout">
            <div className="sirio-section-head">
              <p className="sirio-kicker">Layout</p>
              <h2>Il ritmo separa le decisioni.</h2>
            </div>
            <div className="sirio-spacing-rail">
              {spacing.map(([label, use, size]) => (
                <div className="sirio-space-row" key={label}>
                  <strong data-qv-numeric>{label}px</strong><span style={{ inlineSize: size }} /><p>{use}</p>
                </div>
              ))}
            </div>
            <div className="sirio-surface-strip" aria-label="Gerarchia superfici">
              <div><strong>Canvas</strong><span>campo operativo</span></div>
              <div><strong>Panel</strong><span>contenuto primario</span></div>
              <div><strong>Selected</strong><span>scelta o modifica</span></div>
              <div><strong>Inverse</strong><span>momento raro</span></div>
            </div>
          </section>

          <section className="sirio-section" id="azioni">
            <div className="sirio-section-head">
              <p className="sirio-kicker">Azioni</p>
              <h2>Un comando principale per volta.</h2>
              <p>Ogni specimen locale dimostra gerarchia, conseguenza e feedback.</p>
            </div>
            <div className="sirio-action-matrix">
              {actionRows.map(([kind, label, detail, disabled]) => (
                <div className="sirio-action-row" data-kind={kind} key={kind}>
                  <div><strong>{kind}</strong><p>{detail}</p></div>
                  <button
                    className="sirio-fake-button"
                    data-kind={kind}
                    disabled={disabled}
                    onClick={() => runAction(kind, label)}
                    type="button"
                  >
                    <span>{label}</span>
                    {kind === "Secondaria" ? <Eye aria-hidden="true" size={18} weight="bold" /> :
                      kind === "Pericolo" ? <WarningOctagon aria-hidden="true" size={18} weight="bold" /> :
                        kind === "Disabilitata" ? <Check aria-hidden="true" size={18} weight="bold" /> :
                          <ArrowRight aria-hidden="true" size={18} weight="bold" />}
                  </button>
                </div>
              ))}
            </div>

            {dangerPending ? (
              <div className="sirio-confirmation" role="group" aria-label="Conferma blocco menu">
                <div><WarningOctagon aria-hidden="true" size={22} weight="fill" /><p><strong>Bloccare il menu?</strong><span>Non sara piu visibile ai clienti.</span></p></div>
                <div>
                  <button type="button" onClick={() => { setDangerPending(false); setFeedbackTone("success"); setLastAction("Blocco annullato. Nessuna modifica applicata."); }}>Annulla</button>
                  <button className="sirio-confirm-danger" type="button" onClick={() => { setDangerPending(false); setFeedbackTone("success"); setLastAction("Menu bloccato. La pubblicazione e sospesa."); }}>Conferma blocco</button>
                </div>
              </div>
            ) : null}

            <p className="sirio-action-feedback" data-tone={feedbackTone} aria-atomic="true" aria-live="polite">
              {feedbackTone === "warning" ? <WarningOctagon aria-hidden="true" size={18} weight="fill" /> :
                feedbackTone === "success" ? <CheckCircle aria-hidden="true" size={18} weight="fill" /> :
                  <ArrowRight aria-hidden="true" size={18} weight="bold" />}
              <span>{lastAction}</span>
            </p>
          </section>

          <section className="sirio-section" id="stati">
            <div className="sirio-section-head">
              <p className="sirio-kicker">Stati</p>
              <h2>Ogni stato spiega cosa cambia.</h2>
            </div>
            <div className="sirio-state-table">
              {states.map(([name, tone, meaning, attr]) => (
                <div className="sirio-state-row" data-state={attr} key={name}>
                  <i aria-hidden="true" /><strong>{name}</strong><span>{tone}</span><p>{meaning}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="sirio-section" id="modalita">
            <div className="sirio-section-head">
              <p className="sirio-kicker">Modalita operative</p>
              <h2>La postura cambia. L&apos;identita resta.</h2>
            </div>
            <div className="sirio-mode-switch" aria-label="Seleziona modalita" role="group">
              {modes.map((mode) => (
                <button
                  aria-pressed={selectedMode === mode.id}
                  data-mode={mode.id}
                  key={mode.id}
                  onClick={() => {
                    setSelectedMode(mode.id);
                    setModeFeedback(`Modalita ${mode.label} attiva.`);
                  }}
                  type="button"
                >
                  <strong>{mode.label}</strong><span>{mode.description}</span>
                </button>
              ))}
            </div>

            <div
              className="sirio-mode-preview"
              data-preview-mode={selectedMode}
              data-qv-mode={selectedMode === "default" ? undefined : selectedMode}
            >
              <header><div><span>{preview.eyebrow}</span><h3>{preview.title}</h3></div><p>{preview.meta}</p></header>
              <div className="sirio-preview-rail">
                {preview.rows.map(([name, detail, status, state], index) => (
                  <div data-state={state} key={name}>
                    <span data-qv-numeric>{String(index + 1).padStart(2, "0")}</span>
                    <p><strong>{name}</strong><small>{detail}</small></p><em>{status}</em>
                  </div>
                ))}
              </div>
              <footer>
                <span aria-live="polite">{modeFeedback}</span>
                <button type="button" onClick={() => setModeFeedback(`${preview.action}: comando ricevuto.`)}>
                  {preview.action}<ArrowRight aria-hidden="true" size={18} weight="bold" />
                </button>
              </footer>
            </div>
          </section>

          <section className="sirio-section" id="qualita">
            <div className="sirio-section-head">
              <p className="sirio-kicker">Soglia qualita</p>
              <h2>Non bello. Risolto.</h2>
              <p>Sirio deve dimostrare orientamento, stato, accessibilita e resistenza prima dei componenti.</p>
            </div>
            <ul className="sirio-quality-list">
              {quality.map((item) => <li key={item}><Check aria-hidden="true" size={18} weight="bold" /><span>{item}</span></li>)}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
