import Image from "next/image";

const principles = [
  {
    label: "Autorità silenziosa",
    text: "Qoovex non alza la voce. Struttura, spazio e linguaggio guidano senza rumore decorativo.",
  },
  {
    label: "Chiarezza operativa",
    text: "Uno chef deve capire in pochi secondi dove si trova, cosa guarda, qual è lo stato e cosa può fare.",
  },
  {
    label: "Calore professionale",
    text: "Il sistema resta preciso e tecnico, ma ricorda acciaio, calore, ritmo e servizio reale.",
  },
  {
    label: "Informazione prima della decorazione",
    text: "Leggibilità, gerarchia e azione vengono prima dell’effetto visivo. La bellezza nasce dalla precisione.",
  },
  {
    label: "Un’azione, un significato",
    text: "Ogni colore, stato e controllo ha un solo compito. Nessun segnale è decorativo.",
  },
] as const;

const colors = [
  ["Porcellana", "#FAF9F6", "Piano di lavoro"],
  ["Grafite", "#111111", "Struttura"],
  ["Acciaio", "#8A8A84", "Separazione"],
  ["Calore", "#D96B2B", "Azione primaria"],
  ["Erba", "#5F7A4F", "Verificato"],
  ["Grano", "#C9A646", "Attenzione"],
] as const;

const modes = [
  {
    name: "Pianificazione",
    intent: "Costruire ricette, menu e quantità con abbastanza spazio per ragionare.",
    density: "Densità media",
  },
  {
    name: "Preparazione",
    intent: "Raggruppare lavoro, ingredienti e prossime attività visibili.",
    density: "Densità ordinata",
  },
  {
    name: "Servizio",
    intent: "Target grandi, meno scelte, contrasto più forte e stato immediato.",
    density: "Densità cucina",
  },
  {
    name: "Revisione",
    intent: "Controllare allergeni, costi, QR e pubblicazione prima che qualcosa diventi pubblico.",
    density: "Densità analitica",
  },
] as const;

const states = [
  ["Non salvato", "Superficie calore", "Una modifica locale richiede attenzione."],
  ["Allergene critico", "Superficie errore", "Il rischio resta legato all’ingrediente che lo genera."],
  ["Quantità scalata", "Bordo acciaio", "Il sistema ha ricalcolato i valori collegati."],
  ["Pronto per il servizio", "Superficie erba", "La preparazione può avanzare."],
] as const;

const quality = [
  "Test dei 5 secondi",
  "Test da lontano",
  "Test senza colore",
  "Una sola azione primaria",
  "Stress test in cucina",
  "Audit pixel",
] as const;

export default function SirioPage() {
  return (
    <main className="sirio-shell">
      <header className="sirio-nav" aria-label="Navigazione Sirio">
        <a className="sirio-brand" href="#top">
          <Image
            alt=""
            aria-hidden="true"
            height={28}
            priority
            src="/logo-icon/sirio-icon.svg"
            style={{ height: 28, width: 28 }}
            width={28}
          />
          <span>Sirio</span>
        </a>
        <nav aria-label="Sezioni design">
          <a href="#principles">Principi</a>
          <a href="#tokens">Tokens</a>
          <a href="#modes">Modalità</a>
          <a href="#quality">Qualità</a>
        </nav>
      </header>

      <section className="sirio-hero" id="top">
        <div className="sirio-hero-copy">
          <p className="sirio-kicker">Fondazione Calore Misurato v0</p>
          <h1>Finalmente tutto è al suo posto.</h1>
          <p>
            Una fondazione pre-componenti per Qoovex: autorità silenziosa,
            chiarezza operativa e calore professionale per chef che lavorano
            sotto pressione reale.
          </p>
        </div>

        <div className="sirio-instrument" aria-label="Binario operativo di servizio">
          <div className="sirio-instrument-head">
            <span>Binario servizio</span>
            <strong>18:42</strong>
          </div>
          <div className="sirio-rail-row" data-tone="heat">
            <span>Ravioli ricotta</span>
            <strong>Scala 24 porzioni</strong>
          </div>
          <div className="sirio-rail-row" data-tone="wheat">
            <span>Pasta fresca</span>
            <strong>Controllo allergeni</strong>
          </div>
          <div className="sirio-rail-row" data-tone="herb">
            <span>Fondo vegetale</span>
            <strong>Pronto</strong>
          </div>
          <div className="sirio-rail-row">
            <span>Lista spesa</span>
            <strong>Generata</strong>
          </div>
        </div>
      </section>

      <section className="sirio-section" id="principles">
        <div className="sirio-section-head">
          <p className="sirio-kicker">Principi di design</p>
          <h2>L’interfaccia si guadagna il suo posto.</h2>
        </div>
        <div className="sirio-principles">
          {principles.map((principle) => (
            <article className="sirio-principle" key={principle.label}>
              <h3>{principle.label}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sirio-section sirio-token-section" id="tokens">
        <div className="sirio-section-head">
          <p className="sirio-kicker">Fondazione token</p>
          <h2>Prima il materiale, sempre la semantica.</h2>
          <p>
            I futuri componenti non useranno valori primitivi direttamente. La
            fondazione separa colore materiale, azione, stato, superficie e
            testo.
          </p>
        </div>

        <div className="sirio-color-grid">
          {colors.map(([name, value, purpose]) => (
            <article className="sirio-swatch" key={name}>
              <span style={{ backgroundColor: value }} />
              <div>
                <h3>{name}</h3>
                <p>{value}</p>
                <small>{purpose}</small>
              </div>
            </article>
          ))}
        </div>

        <div className="sirio-type-board" aria-label="Esempi tipografici">
          <p className="sirio-kicker">Scala tipografica</p>
          <p className="sirio-display-sample">La precisione diventa bellezza.</p>
          <p className="sirio-body-sample">
            Ricette, allergeni, quantità e passaggi di preparazione devono
            restare leggibili su tablet, in cucina e durante il servizio.
          </p>
          <p className="sirio-data-sample">24 porzioni / 1.250 kg / 18 min</p>
        </div>
      </section>

      <section className="sirio-section" id="modes">
        <div className="sirio-section-head">
          <p className="sirio-kicker">Modalità operative</p>
          <h2>Qoovex segue lo stato della cucina.</h2>
        </div>
        <div className="sirio-mode-grid">
          {modes.map((mode) => (
            <article className="sirio-mode" key={mode.name}>
              <span>{mode.density}</span>
              <h3>{mode.name}</h3>
              <p>{mode.intent}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="sirio-section sirio-state-section">
        <div className="sirio-section-head">
          <p className="sirio-kicker">Linguaggio degli stati</p>
          <h2>Ogni stato spiega cosa è cambiato.</h2>
        </div>
        <div className="sirio-state-list">
          {states.map(([name, tone, meaning]) => (
            <div className="sirio-state-row" key={name}>
              <strong>{name}</strong>
              <span>{tone}</span>
              <p>{meaning}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="sirio-section sirio-quality" id="quality">
        <div className="sirio-section-head">
          <p className="sirio-kicker">Soglia qualità</p>
          <h2>Non bello. Risolto.</h2>
          <p>
            Un futuro componente dovrà superare questi controlli prima di
            entrare in `packages/ui`.
          </p>
        </div>
        <ul>
          {quality.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
