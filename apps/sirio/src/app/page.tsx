"use client";

import Image from "next/image";
import {
  List,
  X,
} from "@phosphor-icons/react/dist/ssr";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

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

const sectionIds = new Set<string>(navItems.map(({ id }) => id));

const principles = [
  {
    label: "Autorita silenziosa",
    text: "La gerarchia guida senza gridare. Il contenuto operativo resta sempre davanti alla decorazione.",
  },
  {
    label: "Chiarezza operativa",
    text: "Ogni vista deve mostrare contesto, stato, rischio e prossima azione senza chiedere interpretazione.",
  },
  {
    label: "Calore professionale",
    text: "Il calore entra come segnale umano e funzionale: una linea, una conferma, una trasformazione.",
  },
  {
    label: "Informazione prima della decorazione",
    text: "Una superficie esiste solo se migliora lettura, separazione o decisione. Il resto si elimina.",
  },
  {
    label: "Un'azione, un significato",
    text: "Colori, stati e controlli non fanno doppio lavoro. La memoria visiva deve restare affidabile.",
  },
] as const;

const palette = [
  ["Porcellana", "--qv-color-porcelain-50", "Fondo di lavoro", "#faf9f6"],
  ["Cenere", "--qv-color-ash-500", "Scala neutra", "#82827a"],
  ["Grafite", "--qv-color-graphite-900", "Autorita e testo", "#111111"],
  ["Acciaio", "--qv-color-steel-500", "Separazione", "#8a8a84"],
  ["Calore", "--qv-color-heat-500", "Azione primaria", "#d96b2b"],
  ["Zafferano", "--qv-color-saffron-500", "Costo e variazione", "#d18d19"],
  ["Erba", "--qv-color-herb-500", "Pronto", "#5f7a4f"],
  ["Grano", "--qv-color-wheat-500", "Attenzione", "#c9a646"],
  ["Errore", "--qv-color-error-500", "Rischio", "#b42318"],
  ["Informazione", "--qv-color-info-500", "Contesto", "#3f8294"],
  ["Bacca", "--qv-color-berry-500", "Nota cliente", "#ad4772"],
] as const;

const typeRows = [
  ["Display", "--qv-type-6xl", "Raro. Solo identita e apertura di una vista."],
  ["Titolo", "--qv-type-3xl", "Per sezioni e blocchi di decisione."],
  ["Corpo", "--qv-type-md", "Per ricette, procedure, note e descrizioni."],
  ["Dati", "--qv-font-data", "Per quantita, tempi, delta, codici e comparazioni."],
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
  ["Primaria", "Salva revisione", "Una sola per vista, sempre riconoscibile."],
  ["Secondaria", "Anteprima QR", "Utile, vicina, ma non concorrente."],
  ["Silenziosa", "Mostra dettagli", "Bassa enfasi per comandi ripetuti."],
  ["Pericolo", "Blocca menu", "Solo per effetti critici o irreversibili."],
] as const;

const states = [
  ["Modificato", "Calore", "C'e' lavoro locale da confermare.", "changed"],
  ["Pronto", "Erba", "La preparazione puo' avanzare.", "success"],
  ["Attenzione", "Grano", "Serve controllo, non blocca da sola.", "warning"],
  ["Critico", "Errore", "Allergene, perdita dati o pubblicazione rischiosa.", "danger"],
  ["Informativo", "Informazione", "Messaggio di contesto o sincronizzazione.", "info"],
] as const;

const modes = [
  {
    label: "Base",
    attr: "default",
    text: "Scrittura, pianificazione e confronto. Spazio regolare, ritmo calmo, accento raro.",
  },
  {
    label: "Cucina",
    attr: "kitchen",
    text: "Target piu' grandi, contrasto piu' netto, meno scelte mentre il servizio corre.",
  },
  {
    label: "Revisione",
    attr: "review",
    text: "Controllo freddo: allergeni, costi, pubblicazione e decisione finale.",
  },
] as const;

const quality = [
  "A 5 secondi si capisce lo stato della vista.",
  "A distanza si distingue la prossima azione.",
  "Senza colore resta chiara la gerarchia.",
  "Nessuna superficie sticky e' trasparente.",
  "Il mobile mantiene navigazione e contesto.",
  "Nessun futuro componente introduce token privati.",
] as const;

function useActiveSection(): [SectionId, Dispatch<SetStateAction<SectionId>>] {
  const [activeSection, setActiveSection] = useState<SectionId>(navItems[0].id);

  useEffect(() => {
    const sections = navItems
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id && sectionIds.has(visible.target.id)) {
          setActiveSection(visible.target.id as SectionId);
        }
      },
      {
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0.12, 0.24, 0.4],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return [activeSection, setActiveSection];
}

export default function SirioPage() {
  const [activeSection, setActiveSection] = useActiveSection();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeLabel =
    navItems.find((item) => item.id === activeSection)?.label ?? "Orientamento";

  useEffect(() => {
    document.body.toggleAttribute("data-sirio-menu-open", menuOpen);

    return () => {
      document.body.removeAttribute("data-sirio-menu-open");
    };
  }, [menuOpen]);

  return (
    <main
      className="sirio-atlas"
      data-active-section={activeSection}
      data-menu-open={menuOpen ? "true" : "false"}
    >
      <aside className="sirio-sidebar" aria-label="Navigazione Sirio">
        <a
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

        <div className="sirio-now" aria-live="polite">
          <span>Ora</span>
          <strong>{activeLabel}</strong>
        </div>

        <button
          aria-controls="sirio-menu"
          aria-expanded={menuOpen}
          className="sirio-menu-button"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
          type="button"
        >
          {menuOpen ? <X aria-hidden="true" size={20} /> : <List aria-hidden="true" size={20} />}
          <span>{menuOpen ? "Chiudi" : "Menu"}</span>
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
              {item.label}
            </a>
          ))}
        </nav>

        <p className="sirio-package-note">
          Direzione Rams: utile, chiaro, durevole. packages/ui resta styles-only.
        </p>
      </aside>

      <div className="sirio-content">
        <section className="sirio-hero" id="orientamento">
          <div className="sirio-copy">
            <p className="sirio-kicker">Calore Misurato v0</p>
            <h1>Uno strumento, non una vetrina.</h1>
            <p>
              Sirio diventa il banco di prova della fondazione: navigazione
              sempre presente, livelli opachi, segnali leggibili, mobile
              pensato come strumento operativo. I componenti arrivano solo dopo
              che questa base regge.
            </p>
            <p className="sirio-direction-line">
              Criterio: utile, chiaro, durevole.
            </p>
          </div>

          <div className="sirio-command-board" aria-label="Quadro operativo">
            <div className="sirio-board-header">
              <span>Servizio cena</span>
              <strong>18:42</strong>
            </div>
            <div className="sirio-ticket" data-state="changed">
              <span>01</span>
              <div>
                <strong>Ravioli ricotta e limone</strong>
                <p>Scala a 24 porzioni. Costo aggiornato.</p>
              </div>
              <em>Da salvare</em>
            </div>
            <div className="sirio-ticket" data-state="warning">
              <span>02</span>
              <div>
                <strong>Pasta fresca</strong>
                <p>Glutine presente. Verifica pubblicazione QR.</p>
              </div>
              <em>Controllo</em>
            </div>
            <div className="sirio-ticket" data-state="success">
              <span>03</span>
              <div>
                <strong>Fondo vegetale</strong>
                <p>Preparazione pronta per servizio.</p>
              </div>
              <em>Pronto</em>
            </div>
          </div>
        </section>

        <section className="sirio-section" id="principi">
          <div className="sirio-section-head">
            <p className="sirio-kicker">Principi</p>
            <h2>L&apos;interfaccia deve meritare spazio.</h2>
            <p>
              Il sistema deve sembrare inevitabile: pochi segni, tutti utili,
              nessun rumore che confonde priorita e stato.
            </p>
          </div>
          <div className="sirio-principle-grid">
            {principles.map((principle) => (
              <article className="sirio-card" key={principle.label}>
                <h3>{principle.label}</h3>
                <p>{principle.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sirio-section" id="palette">
          <div className="sirio-section-head">
            <p className="sirio-kicker">Palette</p>
            <h2>La materia resta calma. Il segnale e&apos; preciso.</h2>
            <p>
              Porcellana, grafite e acciaio costruiscono il campo. Calore,
              erba, grano, errore e informazione entrano solo quando cambiano
              una decisione.
            </p>
          </div>
          <div className="sirio-palette-grid">
            {palette.map(([name, token, purpose, color]) => (
              <article className="sirio-swatch" key={token}>
                <span style={{ backgroundColor: color }} />
                <div>
                  <h3>{name}</h3>
                  <p>{purpose}</p>
                  <code>{token}</code>
                </div>
              </article>
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
            <p className="sirio-body">
              Ricette, allergeni, quantita, costo porzione e tempi devono
              restare confrontabili anche su tablet, in movimento, durante il
              servizio.
            </p>
            <p className="sirio-data" data-qv-numeric>
              24 porzioni / 1.250 kg / 18 min / +12%
            </p>
          </div>
          <div className="sirio-rule-list">
            {typeRows.map(([label, token, detail]) => (
              <div className="sirio-rule-row" key={label}>
                <strong>{label}</strong>
                <code>{token}</code>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="sirio-section" id="layout">
          <div className="sirio-section-head">
            <p className="sirio-kicker">Layout</p>
            <h2>Il ritmo nasce da distanze ripetibili.</h2>
          </div>
          <div className="sirio-spacing-grid">
            {spacing.map(([label, use, size]) => (
              <article className="sirio-space-card" key={label}>
                <span style={{ inlineSize: size }} />
                <h3>{label}px</h3>
                <p>{use}</p>
              </article>
            ))}
          </div>
          <div className="sirio-surface-strip" aria-label="Gerarchia superfici">
            <div>
              <strong>Canvas</strong>
              <span>campo operativo</span>
            </div>
            <div>
              <strong>Panel</strong>
              <span>contenuto primario</span>
            </div>
            <div>
              <strong>Selected</strong>
              <span>scelta o modifica</span>
            </div>
            <div>
              <strong>Inverse</strong>
              <span>momento raro</span>
            </div>
          </div>
        </section>

        <section className="sirio-section" id="azioni">
          <div className="sirio-section-head">
            <p className="sirio-kicker">Azioni</p>
            <h2>Un comando principale per volta.</h2>
            <p>
              Questi sono specimen locali, non componenti reali. Servono a
              misurare peso, contrasto, target e linguaggio prima di approvare
              API in packages/ui.
            </p>
          </div>
          <div className="sirio-action-grid">
            {actionRows.map(([kind, label, detail]) => (
              <article className="sirio-action-card" key={kind}>
                <button className="sirio-fake-button" data-kind={kind}>
                  {label}
                </button>
                <h3>{kind}</h3>
                <p>{detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sirio-section" id="stati">
          <div className="sirio-section-head">
            <p className="sirio-kicker">Stati</p>
            <h2>Ogni stato spiega cosa e&apos; cambiato.</h2>
          </div>
          <div className="sirio-state-table">
            {states.map(([name, tone, meaning, attr]) => (
              <div className="sirio-state-row" data-state={attr} key={name}>
                <strong>{name}</strong>
                <span>{tone}</span>
                <p>{meaning}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="sirio-section" id="modalita">
          <div className="sirio-section-head">
            <p className="sirio-kicker">Modalita operative</p>
            <h2>La stessa base cambia postura, non identita.</h2>
          </div>
          <div className="sirio-mode-grid">
            {modes.map((mode) => (
              <article
                className="sirio-mode-card"
                data-qv-mode={mode.attr === "default" ? undefined : mode.attr}
                key={mode.label}
              >
                <span>{mode.attr}</span>
                <h3>{mode.label}</h3>
                <p>{mode.text}</p>
                <button className="sirio-fake-button">Azione campione</button>
              </article>
            ))}
          </div>
        </section>

        <section className="sirio-section" id="qualita">
          <div className="sirio-section-head">
            <p className="sirio-kicker">Soglia qualita</p>
            <h2>Non bello. Risolto.</h2>
            <p>
              Prima di creare un componente, Sirio deve dimostrare leggibilita,
              orientamento, stato, accessibilita e resistenza su mobile.
            </p>
          </div>
          <ul className="sirio-quality-list">
            {quality.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
