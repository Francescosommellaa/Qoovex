import { PageHeader } from "@/components/page-header";

const typeRoles = [
  {
    id: "display",
    role: "Display",
    classes: "text-4xl leading-10 font-semibold tracking-[-0.025em]",
    metrics: "General Sans · 36/40 · 600 · −0.025em",
    use: "Hero breve e valore focale nelle composizioni consumer.",
    avoid: "UI densa, testo lungo o titolo dinamico frequente.",
    sample: "Il lavoro, finalmente leggibile.",
  },
  {
    id: "headline",
    role: "Headline",
    classes: "text-3xl leading-9 font-semibold tracking-[-0.025em]",
    metrics: "General Sans · 30/36 · 600 · −0.025em",
    use: "Titolo principale di pagina; balance solo se breve.",
    avoid: "Label, card ripetute e contenuto operativo denso.",
    sample: "Ristrutturazione appartamento in Via Roma",
  },
  {
    id: "title",
    role: "Title",
    classes: "text-xl leading-7 font-semibold tracking-[-0.02em]",
    metrics: "General Sans · 20/28 · 600 · −0.02em",
    use: "Titolo di sezione, card o gruppo operativo.",
    avoid: "Paragrafi, metadata e istruzioni prolungate.",
    sample: "Documenti e avanzamento lavori",
  },
  {
    id: "body",
    role: "Body",
    classes: "text-base leading-7 font-normal",
    metrics: "General Sans · 16/28 · 400 · tracking normale",
    use: "Testo principale, descrizioni, note e istruzioni.",
    avoid: "Status compatti o dati che richiedono scansione tabellare.",
    sample:
      "Qoovex mantiene leggibili contesto, responsabilità e prossimi passi senza comprimere il contenuto importante.",
  },
  {
    id: "compact-control",
    role: "Compact / control",
    classes: "text-sm leading-5 font-medium",
    metrics: "General Sans · 14/20 · 500 · tracking normale",
    use: "Controlli, field label e annotazioni operative compatte.",
    avoid: "Lettura prolungata o grandi blocchi di testo.",
    sample: "Importo stimato della lavorazione",
  },
  {
    id: "label-metadata",
    role: "Label / metadata",
    classes: "font-accent text-xs leading-4 font-semibold tracking-[0.08em]",
    metrics: "Array · 12/16 · 600 · +0.08em",
    use: "ID, timestamp, counter, eyebrow e status brevi.",
    avoid: "Paragrafi, titoli lunghi, errori e istruzioni critiche.",
    sample: "CANTIERE ATTIVO · 22/08/2026",
  },
] as const;

const hostileStrings = [
  ["Titolo breve", "Nuovo sopralluogo"],
  [
    "Titolo molto lungo",
    "Coordinamento delle lavorazioni impiantistiche e strutturali dell’appartamento del terzo piano",
  ],
  ["Parola italiana lunga", "precipitevolissimevolmente"],
  ["Nome persona", "Maria Alessandra De Santis-Ramírez"],
  ["Nome Azienda", "Costruzioni e Restauri dell’Italia Nord-Occidentale Società Cooperativa"],
  ["Email", "amministrazione.cantieri.internazionali+archivio@impresa-edile-esempio.it"],
  ["Filename", "verbale_sopralluogo_impianti_termici_versione_definitiva_firmata_22-08-2026.pdf"],
  ["URL", "https://esempio.qoovex.test/documenti/condivisioni/verbale-sopralluogo-impianti-termici-versione-definitiva"],
  ["UUID", "018f8f8b-7e5f-7d2a-9a31-cfb6e589c410"],
  ["Accenti e apostrofi", "L’impresa verificherà perché l’area è già accessibile."],
  ["Valore numerico largo", "€ 125.000,50"],
] as const;

const longFileName =
  "verbale_sopralluogo_impianti_termici_versione_definitiva_firmata_22-08-2026.pdf";

function SectionHeading({ children, description }: { children: React.ReactNode; description: string }) {
  return (
    <div className="mb-5 max-w-3xl">
      <h2 className="text-xl font-semibold leading-7 tracking-[-0.02em]">{children}</h2>
      <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
    </div>
  );
}

export default function TypographyPage() {
  return (
    <main
      className="mx-auto w-full min-w-0 max-w-6xl"
      data-typography-foundation
      data-visual-specimen="typography-foundation"
    >
      <PageHeader
        title="Typography foundation"
        description="Gerarchia, pesi realmente disponibili, numeri e comportamento di wrapping della tipografia canonica Qoovex. La pagina misura leggibilità e overflow: non è una composizione promozionale."
      />

      <div className="flex min-w-0 flex-col gap-12">
        <section aria-labelledby="families-title">
          <SectionHeading description="General Sans porta l’interfaccia. Array compare soltanto quando un dato breve beneficia di un accento riconoscibile.">
            <span id="families-title">Famiglie e fallback</span>
          </SectionHeading>
          <div className="grid min-w-0 gap-4 md:grid-cols-3">
            <article className="min-w-0 rounded-xl border p-5" data-font-proof="general-sans">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Default</p>
              <p className="mt-3 font-sans text-3xl font-semibold leading-9 tracking-[-0.025em]">General Sans Aa 0123</p>
              <p className="mt-3 text-sm leading-5 text-muted-foreground">Titoli, body, controlli, label di form, navigazione e lettura prolungata.</p>
            </article>

            <article className="min-w-0 rounded-xl border p-5" data-font-proof="array">
              <p className="font-accent text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Accento raro</p>
              <p className="mt-3 font-accent text-3xl font-semibold leading-9 tracking-[0.08em]">ARRAY AA 0123</p>
              <p className="mt-3 text-sm leading-5 text-muted-foreground">ID, timestamp, counter, metadata, status e valori numerici molto brevi.</p>
            </article>

            <article
              className="min-w-0 rounded-xl border p-5"
              data-font-proof="fallback"
              style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Fallback deterministico</p>
              <p className="mt-3 text-3xl font-semibold leading-9 tracking-[-0.025em]">System Sans Aa 0123</p>
              <p className="mt-3 text-sm leading-5 text-muted-foreground">La gerarchia resta comprensibile durante swap o failure del font; non cerca una copia metrica artificiale.</p>
            </article>
          </div>
        </section>

        <section aria-labelledby="roles-title">
          <SectionHeading description="Sei ruoli condivisi. I valori sono combinazioni della scala Tailwind esistente, non una seconda collezione di token.">
            <span id="roles-title">Scala e ruoli</span>
          </SectionHeading>
          <div className="divide-y rounded-xl border">
            {typeRoles.map((type) => (
              <article
                className="grid min-w-0 gap-5 p-5 lg:grid-cols-[minmax(13rem,0.72fr)_minmax(0,1.28fr)] lg:p-6"
                data-type-role={type.id}
                key={type.id}
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold leading-5">{type.role}</h3>
                  <p className="mt-1 font-mono text-xs leading-4 text-muted-foreground [overflow-wrap:anywhere]">{type.metrics}</p>
                  <dl className="mt-3 grid gap-2 text-sm leading-5">
                    <div><dt className="font-medium">Usa per</dt><dd className="text-muted-foreground">{type.use}</dd></div>
                    <div><dt className="font-medium">Non usare per</dt><dd className="text-muted-foreground">{type.avoid}</dd></div>
                  </dl>
                </div>
                <div className="flex min-w-0 items-center rounded-lg bg-muted/45 p-4 sm:p-5">
                  <p className={`${type.classes} min-w-0 [overflow-wrap:anywhere]`} data-type-sample>{type.sample}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="weights-title">
          <SectionHeading description="Ogni specimen usa un file realmente richiesto dal loader Fontshare. ARRAY 500 non viene richiesto né sintetizzato.">
            <span id="weights-title">Pesi caricati</span>
          </SectionHeading>
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <article className="rounded-xl border p-5">
              <h3 className="text-sm font-semibold leading-5">General Sans · 400 / 500 / 600 / 700</h3>
              <div className="mt-4 grid gap-3">
                <p className="text-base font-normal leading-7">400 — body e lettura prolungata</p>
                <p className="text-base font-medium leading-7">500 — compact e controlli</p>
                <p className="text-base font-semibold leading-7">600 — gerarchia e titoli</p>
                <p className="text-base font-bold leading-7">700 — enfasi forte, con parsimonia</p>
              </div>
            </article>
            <article className="rounded-xl border p-5">
              <h3 className="text-sm font-semibold leading-5">Array · 400 / 600 / 700</h3>
              <div className="mt-4 grid gap-3 font-accent">
                <p className="text-base font-normal leading-7 tracking-wide">400 — QVX-2026-MI-0842 · 14:07</p>
                <p className="text-base font-semibold leading-7 tracking-[0.08em]">600 — CANTIERE ATTIVO</p>
                <p className="text-base font-bold leading-7 tracking-wide tabular-nums">700 — € 125.000,50</p>
              </div>
            </article>
          </div>
        </section>

        <section aria-labelledby="numbers-title" data-typography-proof="numbers">
          <SectionHeading description="Proportional per copy e valori isolati; tabular soltanto quando allineamento o stabilità in-place hanno un beneficio concreto.">
            <span id="numbers-title">Numeri operativi</span>
          </SectionHeading>
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <article className="rounded-xl border p-5">
              <h3 className="text-sm font-semibold leading-5">Proportional · lettura naturale</h3>
              <div className="mt-4 grid gap-2 text-base leading-7">
                <p>Il preventivo è di € 1.250,00.</p>
                <p>Valore isolato: € 125.000,50</p>
                <p>ID breve: QVX-842</p>
                <p className="[overflow-wrap:anywhere]">ID lungo: QVX-2026-MI-RISTRUTTURAZIONE-0842</p>
              </div>
            </article>
            <article className="rounded-xl border p-5">
              <h3 className="text-sm font-semibold leading-5">Tabular · stabilità e confronto</h3>
              <dl className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-2 text-base leading-7">
                <dt className="text-muted-foreground">Importo corrente</dt><dd className="font-accent tabular-nums">€ 1.250,00</dd>
                <dt className="text-muted-foreground">Importo aggiornato</dt><dd className="font-accent tabular-nums">€ 125.000,50</dd>
                <dt className="text-muted-foreground">Data</dt><dd className="font-accent tabular-nums">22/08/2026</dd>
                <dt className="text-muted-foreground">Ora</dt><dd className="font-accent tabular-nums">14:07</dd>
              </dl>
            </article>
          </div>
        </section>

        <section aria-labelledby="wrap-title" data-typography-proof="wrap">
          <SectionHeading description="Wrap è il default. Balance è limitato a heading corti; il titolo dinamico lungo torna al wrapping normale.">
            <span id="wrap-title">Heading e wrapping</span>
          </SectionHeading>
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <article className="rounded-xl border p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Breve · balance ammesso</p>
              <h3 className="mt-3 max-w-xl text-balance text-3xl font-semibold leading-9 tracking-[-0.025em]">Contesto chiaro, decisioni migliori</h3>
            </article>
            <article className="rounded-xl border p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Lungo · wrap naturale</p>
              <h3 className="mt-3 text-3xl font-semibold leading-9 tracking-[-0.025em] [overflow-wrap:anywhere]">Coordinamento delle lavorazioni impiantistiche e strutturali dell’appartamento del terzo piano</h3>
            </article>
          </div>
        </section>

        <section aria-labelledby="hostile-title" data-typography-proof="hostile-strings">
          <SectionHeading description="Le stringhe indivisibili ricevono overflow-wrap mirato. Nessuna usa word-break aggressivo e nessun contenitore impone un’altezza fissa al testo.">
            <span id="hostile-title">Stringhe ostili</span>
          </SectionHeading>
          <dl className="grid min-w-0 gap-3 sm:grid-cols-2">
            {hostileStrings.map(([label, value]) => (
              <div className="min-w-0 rounded-lg border p-4" key={label}>
                <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</dt>
                <dd className="mt-2 min-w-0 text-sm leading-5 [overflow-wrap:anywhere]">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="truncate-title" data-typography-proof="intentional-truncation">
          <SectionHeading description="La perdita visiva è ammessa soltanto in una riga realmente vincolata; il valore importante resta nel DOM ed è recuperabile esplicitamente.">
            <span id="truncate-title">Truncation intenzionale</span>
          </SectionHeading>
          <article className="max-w-xl rounded-xl border p-5">
            <p className="text-sm font-medium leading-5">Riga compatta da 14rem</p>
            <p className="mt-3 w-56 truncate rounded-md bg-muted px-3 py-2 text-sm" title={longFileName}>{longFileName}</p>
            <details className="mt-3 text-sm leading-5">
              <summary className="cursor-pointer font-medium">Mostra il valore completo</summary>
              <p className="mt-2 [overflow-wrap:anywhere]">{longFileName}</p>
            </details>
          </article>
        </section>

        <section aria-labelledby="stability-title">
          <SectionHeading description="La gerarchia non dipende dal caricamento del font, dal tema o dal movimento.">
            <span id="stability-title">Stabilità</span>
          </SectionHeading>
          <div className="grid gap-3 text-sm leading-5 md:grid-cols-3">
            <p className="rounded-lg border p-4"><strong>Font loading.</strong> <code>display=swap</code> usa lo stack di sistema finché Fontshare non è pronto.</p>
            <p className="rounded-lg border p-4"><strong>Motion.</strong> Font-size, peso, tracking e line-height non vengono animati.</p>
            <p className="rounded-lg border p-4"><strong>Reduced motion.</strong> La stessa scala e lo stesso ordine informativo restano intatti.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
