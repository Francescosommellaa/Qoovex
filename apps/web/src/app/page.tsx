import Image from "next/image";
import { ArrowRight, Button, Container, Icon, Trace, TraceGap, TraceNode, TraceTerminal } from "@qoovex/ui";
import { contactEmail, contactHref, workspaceUrl } from "./site-config";
import { SiteShell } from "./site-chrome";

export default function HomePage() {
  return (
    <SiteShell>
      <section className="hero">
        <Container size="wide">
          <div className="hero__grid">
            <div className="hero__copy">
              <p className="hero__eyebrow">Documenti, scadenze, prove</p>
              <h1>Il lavoro aperto, finalmente leggibile.</h1>
              <p>Qoovex ricostruisce ciò che esiste, ciò che manca e il punto esatto da cui ripartire.</p>
              <div className="hero__actions">
                <Button href={workspaceUrl} size="lg">Accedi al workspace <Icon glyph={ArrowRight} /></Button>
                <Button href={contactHref} size="lg" variant="secondary">Richiedi informazioni</Button>
              </div>
            </div>
            <figure className="hero__media">
              <Image
                alt="Documenti, planimetrie e prova fotografica raccolti durante un'attività operativa"
                fill
                priority
                sizes="(max-width: 820px) 100vw, 56vw"
                src="/brand/qoovex-document-trace.png"
              />
            </figure>
          </div>
        </Container>
      </section>

      <section className="fragment-section">
        <Container size="wide">
          <div className="fragment-grid">
            <p>File tra chat, email e cartelle.</p>
            <p>Date registrate ma difficili da seguire.</p>
            <p>Prove senza un contesto chiaro.</p>
          </div>
          <div className="fragment-answer">
            <span>Qoovex non aggiunge rumore.</span>
            <h2>Rende visibile la situazione.</h2>
          </div>
        </Container>
      </section>

      <section className="mechanism" id="cosa-fa">
        <Container size="wide">
          <div className="mechanism__grid">
            <div className="section-copy">
              <h2>Ogni situazione conserva la propria traccia.</h2>
              <p>Stato, conseguenza, responsabilità e azione restano nello stesso campo visivo. Anche quando un elemento manca.</p>
            </div>
            <Trace aria-label="Esempio di situazione documentale">
              <TraceNode label="Presente" title="Documento aziendale" description="L'ultima versione è disponibile nel workspace." />
              <TraceNode label="Da verificare" title="Scadenza registrata" description="La data richiede un controllo proporzionato." />
              <TraceGap label="Mancante" title="Prova del cantiere" description="Il pacchetto resta incompleto finché la prova non viene collegata." />
              <TraceTerminal label="Prossima azione" title="Richiedi la prova" action={<Button size="sm">Prepara richiesta</Button>} />
            </Trace>
          </div>
        </Container>
      </section>

      <section className="evidence-story">
        <Container size="wide">
          <div className="evidence-story__grid">
            <figure className="evidence-story__media">
              <Image
                alt="Acquisizione fotografica di un dettaglio installato, collegata a una checklist cartacea"
                fill
                loading="eager"
                sizes="(max-width: 820px) 100vw, 58vw"
                src="/brand/qoovex-evidence-capture.png"
              />
            </figure>
            <div className="evidence-story__copy">
              <h2>La prova non è una foto isolata.</h2>
              <p>Origine, cantiere, data e contesto restano collegati. Chi apre l'elemento capisce cosa documenta e cosa può fare dopo.</p>
              <a href="/manuale-operativo">Leggi il manuale operativo <Icon glyph={ArrowRight} size={16} /></a>
            </div>
          </div>
        </Container>
      </section>

      <section className="audience" id="per-chi">
        <Container size="wide">
          <div className="section-copy">
            <h2>Costruito per chi deve intervenire.</h2>
            <p>Non per chi vuole soltanto registrare dati.</p>
          </div>
          <div className="audience__grid">
            <article><strong>Piccole imprese</strong><p>Per mantenere leggibili azienda, lavoratori e cantieri attivi.</p></article>
            <article><strong>Subappaltatori</strong><p>Per rispondere alle richieste con elementi raccolti nel contesto corretto.</p></article>
            <article><strong>Consulenti</strong><p>Per vedere cosa richiede controllo e indicare il passo successivo.</p></article>
          </div>
        </Container>
      </section>

      <section className="boundary">
        <Container>
          <div className="boundary__content">
            <span>Un confine chiaro</span>
            <h2>Qoovex organizza. Non certifica.</h2>
            <p>Il sistema non decide obblighi, requisiti o valutazioni al posto di responsabili, consulenti o utenti competenti.</p>
          </div>
        </Container>
      </section>

      <section className="contact" id="richiedi-informazioni">
        <Container size="wide">
          <div className="contact__grid">
            <div><h2>Porta ordine nel prossimo lavoro aperto.</h2><p>Per accesso pilota o informazioni operative scrivi a <a href={contactHref}>{contactEmail}</a>.</p></div>
            <Button href={contactHref} size="lg">Richiedi informazioni <Icon glyph={ArrowRight} /></Button>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
