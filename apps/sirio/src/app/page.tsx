import { ArrowRight, Brain, Calculator, CheckCircle, Desktop, DeviceMobile, Warning } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { preparationFixture as prep } from "./event-data";

const cycle = ["Insegna", "Struttura", "Calcola", "Propone", "Chef approva", "Brigata produce", "Verifica"];

export default function DirectionPage() {
  return (
    <>
      <section className="hero pre-service-hero">
        <div className="hero-copy">
          <p className="eyebrow">Qoovex / Pre-Service Brain</p>
          <h1>Prima del servizio.<br />Numeri che reggono.</h1>
          <p className="hero-lead">Qoovex trasforma eventi e regole interne in quantità, briefing e preparazioni verificabili. L’AI comprende la domanda. I dati e le regole producono la risposta.</p>
          <div className="hero-actions"><Link className="button primary" href="/components">Esplora i componenti <ArrowRight aria-hidden="true" /></Link><a className="button secondary" href="#scope">Leggi lo scope</a></div>
          <dl className="hero-proof"><div><dt>Centro</dt><dd>Pre-Service</dd></div><div><dt>Autorità</dt><dd>Lo chef decide</dd></div><div><dt>Vincolo</dt><dd>Nessun numero inventato</dd></div></dl>
        </div>
        <div className="brain-sheet" aria-label="Calcolo verificabile cotolette bambini">
          <header><div><small>DOMANI · {prep.event.toUpperCase()}</small><h2>{prep.item}</h2></div><span><Warning aria-hidden="true" /> Da verificare</span></header>
          <div className="calculation-spine"><div><small>DATO</small><strong>{prep.children} bambini</strong></div><i>×</i><div><small>REGOLA</small><strong>1 cad. + 10%</strong></div><i>=</i><div><small>RICHIESTO</small><strong>{prep.required}</strong></div></div>
          <div className="quantity-ledger"><div><small>Approvato</small><strong>{prep.approved}</strong><span>Chef</span></div><div><small>Prodotto</small><strong>{prep.produced}</strong><span>{prep.location}</span></div><div><small>Assegnato</small><strong>{prep.assigned}</strong><span>Domani</span></div><div data-theoretical><small>Extra teoriche</small><strong>{prep.theoretical}</strong><span>Non verificate</span></div></div>
          <footer><div><CheckCircle aria-hidden="true" /><span><small>STATO</small><strong>OK — verifica fisica consigliata</strong></span></div><button type="button"><Brain aria-hidden="true" /> Chiedi a Qoovex</button></footer>
        </div>
      </section>

      <section id="scope" className="content-section scope-section">
        <div className="section-intro"><p className="eyebrow">Tesi</p><h2>Assistente operativo.<br />Non gestionale live.</h2><p>Il prodotto prepara persone e reparti prima dell’arrivo degli ospiti. Durante il servizio resta una superficie stabile da consultare, non un altro lavoro da aggiornare.</p></div>
        <div className="scope-grid"><article><span>Dentro</span><h3>Conoscenza applicata</h3><p>Eventi, regole, calcoli, briefing, proposte, approvazioni e verifiche.</p></article><article><span>Fuori</span><h3>Controllo continuo</h3><p>KDS, input live obbligatori, CRM, fatture e magazzino contabile completo.</p></article><article><span>Prova</span><h3>Trenta secondi</h3><p>Futuro, anticipabile, approvato, prodotto, mancante, teorico e verificato.</p></article></div>
      </section>

      <section className="content-section role-section">
        <div className="section-intro"><p className="eyebrow">Accesso minimo necessario</p><h2>Una struttura.<br />Quattro viste isolate.</h2><p>Il dato comune resta coerente, ma ogni reparto riceve soltanto campi, azioni e notifiche pertinenti. I controlli sono applicati lato server.</p></div>
        <div className="role-grid">
          <article><span>Admin</span><h3>Direttore</h3><p>Accesso completo alla struttura. Invita, revoca e supervisiona sala e cucina.</p></article>
          <article><span>Sala</span><h3>Capo sala</h3><p>Briefing, coperti, bambini, allergeni pertinenti, orari e note di servizio.</p></article>
          <article><span>Cucina</span><h3>Capo cucina</h3><p>Fabbisogni, acquisti, piani, approvazioni, produzione e gestione brigata.</p></article>
          <article><span>Task assegnati</span><h3>Brigata</h3><p>Solo piani approvati. Registra fatto, quantità prodotta, posizione e nota.</p></article>
          <article><span>Qoovex</span><h3>Super Admin</h3><p>Supporto temporaneo con MFA, motivo, banner persistente e audit completo.</p></article>
        </div>
      </section>

      <section className="content-section support-section">
        <div className="section-intro"><p className="eyebrow">Supporto auditato</p><h2>Il codice identifica.<br />Non autentica.</h2><p>Il dipendente Qoovex cerca la struttura, conferma MFA, dichiara il motivo e apre una sessione di trenta minuti. Ogni azione conserva la sua identità.</p></div>
        <div className="change-contract"><div><small>Ingresso</small><strong>MFA + motivo + codice struttura</strong></div><div><span>Sessione temporanea</span><span>Banner sempre visibile</span><span>Azioni registrate</span><span>Notifica al direttore</span></div></div>
      </section>

      <section className="content-section cycle-section">
        <div className="section-intro"><p className="eyebrow">Ciclo operativo</p><h2>Dal linguaggio naturale.<br />Alla prova fisica.</h2><p>Ogni passaggio aggiunge certezza. Nessuna proposta diventa ordine senza la decisione dello chef.</p></div>
        <ol className="cycle-grid">{cycle.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span><strong>{step}</strong>{index < cycle.length - 1 ? <ArrowRight aria-hidden="true" /> : <CheckCircle aria-hidden="true" />}</li>)}</ol>
      </section>

      <section className="content-section mode-section">
        <div className="section-intro"><p className="eyebrow">Tre modalità</p><h2>Impara. Prepara.<br />Poi resta essenziale.</h2></div>
        <div className="mode-grid"><article><span>Setup</span><Calculator aria-hidden="true" /><h3>Insegna le regole</h3><p>Grammature, pezzi, vassoi, rese, margini, formule ed eccezioni.</p><small>Usato quando cambia la conoscenza</small></article><article data-primary><span>Pre-Service</span><Brain aria-hidden="true" /><h3>Decide prima</h3><p>Intake, calcoli, briefing, criticità, piano preparazioni e approvazione chef.</p><small>Cuore del prodotto</small></article><article><span>Service</span><DeviceMobile aria-hidden="true" /><h3>Consulta soltanto</h3><p>Allergeni, evento in corso, prossima portata, note critiche e domanda rapida.</p><small>Nessun input continuo</small></article></div>
      </section>

      <section className="content-section principles-section">
        <div className="section-intro"><p className="eyebrow">Direzione grafica</p><h2>Registro di preparazione.<br />Ogni numero ha una traccia.</h2></div>
        <div className="principles-grid"><article><strong>01</strong><h3>Event Spine</h3><p>Data, sala e persone mantengono stabile l’identità dell’evento.</p></article><article><strong>02</strong><h3>Calculation Trace</h3><p>Dato, regola, formula, risultato e provenienza formano una catena leggibile.</p></article><article><strong>03</strong><h3>Autorità visibile</h3><p>Richiesto non è approvato. Prodotto non è verificato. Lo scostamento resta esplicito.</p></article><article><strong>04</strong><h3>Teorico dichiarato</h3><p>Ogni rimanenza calcolata porta l’etichetta “teorico” o “da verificare”.</p></article></div>
      </section>

      <section className="content-section architecture-section">
        <div className="section-intro"><p className="eyebrow">Superfici future</p><h2>Una semantica.<br />Rendering adatto.</h2><p>Token e contratti sono comuni; DOM/CSS e primitive native divergono dove serve.</p></div>
        <div className="architecture-map"><article><Desktop aria-hidden="true" /><span>qoovex.com</span><h3>Web</h3><p>Marketing.</p></article><article><Desktop aria-hidden="true" /><span>app.qoovex.com</span><h3>Workspace</h3><p>Next.js responsive.</p></article><article><DeviceMobile aria-hidden="true" /><span>iOS · Android</span><h3>Mobile</h3><p>Futura app Expo.</p></article><article><Calculator aria-hidden="true" /><span>sirio.qoovex.com</span><h3>Sirio</h3><p>Scope e design system.</p></article></div>
      </section>

      <section className="closing-callout"><p className="eyebrow">Criterio</p><h2>Risposta secca.<br />Calcolo verificabile.</h2><Link className="button light" href="/components">Apri il catalogo <ArrowRight aria-hidden="true" /></Link></section>
    </>
  );
}
