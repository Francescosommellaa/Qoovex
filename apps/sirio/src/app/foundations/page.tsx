import type { CSSProperties } from "react";
import { Button, Card, Container, Field, Input, Panel, Section, Switch } from "@qoovex/ui";
import styles from "./foundations.module.css";

const spacingSteps = [
  ["1", "4 px"],
  ["2", "8 px"],
  ["3", "12 px"],
  ["4", "16 px"],
  ["5", "24 px"],
  ["6", "32 px"],
  ["7", "48 px"],
  ["8", "64 px"],
] as const;

const surfaceTokens = [
  ["Canvas", "Piano continuo della pagina", styles.swatchCanvas],
  ["Raised", "Contenuto che richiede attenzione", styles.swatchRaised],
  ["Surface", "Raggruppamento operativo", styles.swatchSurface],
  ["Sunken", "Controllo o area contenuta", styles.swatchSunken],
  ["Content", "Gerarchia e leggibilità", styles.swatchContent],
] as const;

const accentTokens = [
  ["Primary", "Blu cielo", "Azioni, link e focus", styles.swatchAccent],
  ["Emphasis", "Corallo", "Evidenza editoriale rara", styles.swatchEmphasis],
  ["Feature", "Violetto", "Visual e categorie di prodotto", styles.swatchFeature],
] as const;

export default function FoundationsPage() {
  return (
    <main className={styles.page}>
      <a className={styles.skipLink} href="#foundation-materials">Vai alle superfici</a>

      <header className={styles.hero}>
        <Container size="wide">
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>Fondazioni Qoovex</p>
              <h1>Superfici tattili, lavoro chiaro.</h1>
              <p className={styles.heroLead}>
                Uno skeuomorphism contemporaneo e minimale: superfici quasi monocromatiche, profondità per orientare e colore solo quando comunica qualcosa.
              </p>
            </div>

            <div className={styles.materialPreview} aria-label="Anteprima della nuova materialità">
              <div className={styles.previewHeader}>
                <div>
                  <span>Oggi</span>
                  <strong>Attività essenziali</strong>
                </div>
                <span className={styles.previewCount}>3</span>
              </div>
              <div className={styles.previewGrid}>
                <div className={styles.previewTile}>
                  <span>Documenti</span>
                  <strong>12 pronti</strong>
                </div>
                <div className={styles.previewTile}>
                  <span>Scadenze</span>
                  <strong>2 da vedere</strong>
                </div>
              </div>
              <div className={styles.previewAction}>
                <span>Riepilogo aggiornato</span>
                <Button size="sm">Apri</Button>
              </div>
            </div>
          </div>
        </Container>
      </header>

      <Section
        id="foundation-materials"
        title="Neutrali prima. Profondità con una funzione"
        description="Bianco morbido, grafite e grigi costruiscono quasi tutta l’interfaccia. Raised evidenzia, surface raggruppa e sunken contiene."
      >
        <Container>
          <div className={styles.surfaceGrid}>
            {surfaceTokens.map(([name, description, swatchClass]) => (
              <article key={name}>
                <div className={`${styles.colorSwatch} ${swatchClass}`} aria-hidden="true" />
                <strong>{name}</strong>
                <span>{description}</span>
              </article>
            ))}
          </div>

          <div className={styles.depthProof}>
            <div className={styles.raisedProof}>
              <span>Raised</span>
              <strong>Priorità visibile</strong>
              <p>La luce interna definisce il bordo. L’ombra esterna separa il livello dal canvas.</p>
            </div>
            <div className={styles.sunkenProof}>
              <span>Sunken</span>
              <strong>Contenuto nel piano</strong>
              <p>L’ombra interna segnala una zona contenuta o uno stato premuto.</p>
            </div>
          </div>

          <div className={styles.accentContract}>
            <div className={styles.accentCopy}>
              <span>Contratto cromatico</span>
              <h3>Il colore segnala, non riempie.</h3>
              <p>
                Il blu resta l’unico colore interattivo predefinito. Corallo e violetto entrano solo in evidenze rare, visual marketing o categorie riconoscibili.
              </p>
              <div className={styles.accentSpectrum} aria-hidden="true" />
            </div>
            <div className={styles.accentList}>
              {accentTokens.map(([role, name, usage, swatchClass]) => (
                <article key={role}>
                  <div className={`${styles.accentSwatch} ${swatchClass}`} aria-hidden="true" />
                  <div><strong>{role}</strong><span>{name}</span></div>
                  <p>{usage}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      <Section
        title="Una voce più precisa"
        description="General Sans mantiene leggibile il lavoro quotidiano. Cabinet Grotesk rende i titoli più riconoscibili senza rallentare la lettura."
        tone="muted"
      >
        <Container>
          <div className={styles.typeLayout}>
            <div className={styles.typeSpecimens}>
              <article>
                <span>Display</span>
                <p className="font-display text-qv-display font-bold tracking-qv-tight">Tutto sotto controllo.</p>
              </article>
              <article>
                <span>Title</span>
                <p className="font-display text-qv-title font-bold tracking-qv-tight">Cosa richiede attenzione</p>
              </article>
              <article>
                <span>Heading</span>
                <p className="font-display text-qv-heading font-bold">Scadenze registrate</p>
              </article>
              <article>
                <span>Body</span>
                <p className="text-qv-body">Le informazioni essenziali arrivano prima. I dettagli restano vicini quando servono.</p>
              </article>
              <article>
                <span>Label</span>
                <p className="text-qv-label font-semibold">Ultimo aggiornamento</p>
              </article>
            </div>

            <Panel className={styles.foundationSummary}>
              <dl>
                <div><dt>Base</dt><dd>4 px</dd></div>
                <div><dt>Target</dt><dd>44 px</dd></div>
                <div><dt>Gutter</dt><dd>16-32 px</dd></div>
                <div><dt>Testo</dt><dd>42 rem</dd></div>
              </dl>
            </Panel>
          </div>
        </Container>
      </Section>

      <Section
        title="Ritmo mobile-first"
        description="La scala resta corta. Il contenuto nasce in una colonna e guadagna spazio solo quando migliora la comprensione."
      >
        <Container>
          <div className={styles.rhythmLayout}>
            <ol className={styles.spacingList} aria-label="Scala di spaziatura Qoovex">
              {spacingSteps.map(([step, value]) => (
                <li key={step}>
                  <code>qv-{step}</code>
                  <span
                    aria-hidden="true"
                    className={styles.spacingBar}
                    style={{ inlineSize: `var(--spacing-qv-${step})` } as CSSProperties}
                  />
                  <span>{value}</span>
                </li>
              ))}
            </ol>

            <div className={styles.layoutProof}>
              <span>Reading 42 rem</span>
              <h3>Una riga semplice da seguire</h3>
              <p>
                Descrizioni, istruzioni e messaggi di recupero mantengono una misura leggibile. I riferimenti lunghi vanno a capo senza rompere la pagina.
              </p>
              <div className={styles.layoutMeta}>
                <div><span>Pagina</span><strong>16-32 px</strong></div>
                <div><span>Sezione</span><strong>56-112 px</strong></div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section
        title="Interazioni che sembrano fisiche"
        description="Hover solleva di un pixel. Pressed rientra nel piano. Focus, disabled e stato del controllo restano leggibili senza dipendere dalla sola ombra."
        tone="muted"
      >
        <Container>
          <Card className={styles.interactionProof}>
            <div className={styles.interactionIntro}>
              <span>Prova con Tab</span>
              <h3>Focus visibile e target comodi</h3>
              <p>Ogni controllo mantiene almeno 44 px. Il feedback tattile si disattiva con reduced motion.</p>
            </div>
            <Field htmlFor="foundation-company" label="Nome Azienda" description="Esempio locale, nessun dato viene salvato.">
              <Input id="foundation-company" placeholder="Inserisci il nome" />
            </Field>
            <label className={styles.switchRow}>
              <span><strong>Riepilogo settimanale</strong><small>Ricevi solo gli aggiornamenti operativi.</small></span>
              <Switch aria-label="Attiva riepilogo settimanale" defaultChecked />
            </label>
            <div className={styles.actions}>
              <Button>Continua</Button>
              <Button variant="secondary">Indietro</Button>
              <Button disabled>Non disponibile</Button>
            </div>
          </Card>
        </Container>
      </Section>

      <Section
        title="La gerarchia resta in entrambi i temi"
        description="Light è sempre il default. Dark esiste solo quando il prodotto lo richiede esplicitamente; il sito marketing resta esclusivamente light."
      >
        <Container size="wide">
          <div className={styles.themeGrid}>
            <ThemeProof theme="light" label="Light" />
            <ThemeProof theme="dark" label="Dark" />
          </div>
        </Container>
      </Section>
    </main>
  );
}

function ThemeProof({ label, theme }: { label: string; theme: "light" | "dark" }) {
  return (
    <article className={styles.themeProof} data-theme={theme}>
      <div className={styles.themeHeader}>
        <span>{label}</span>
        <strong>Stato documentale</strong>
      </div>
      <div className={styles.themeInset}>
        <span>Da verificare</span>
        <strong>2 documenti</strong>
      </div>
      <Button size="sm">Apri elenco</Button>
    </article>
  );
}
