import { PageHeader } from "@/components/page-header";

const typeScale: {
  role: string;
  useCase: string;
  classes: string;
  family: "General Sans" | "Array (Accent)";
  weight: string;
  size: string;
  lineHeight: string;
  sample: string;
}[] = [
  {
    role: "Display / Hero",
    useCase: "Titoli di copertina, grandi cifre di impatto",
    classes: "text-4xl font-semibold tracking-tight",
    family: "General Sans",
    weight: "600 (Semibold)",
    size: "2.25rem / 36px",
    lineHeight: "2.5rem / 40px",
    sample: "L'architettura del cantiere digitale.",
  },
  {
    role: "Heading 1",
    useCase: "Titoli principali delle pagine di lavoro",
    classes: "text-3xl font-semibold tracking-tight",
    family: "General Sans",
    weight: "600 (Semibold)",
    size: "1.875rem / 30px",
    lineHeight: "2.25rem / 36px",
    sample: "Ristrutturazione Appartamento Via Roma",
  },
  {
    role: "Heading 2",
    useCase: "Sezioni di livello 2 (Avanzamento, Documenti, Pagamenti)",
    classes: "text-2xl font-semibold tracking-tight",
    family: "General Sans",
    weight: "600 (Semibold)",
    size: "1.5rem / 24px",
    lineHeight: "2rem / 32px",
    sample: "Stato dei lavori e cronoprogramma",
  },
  {
    role: "Heading 3 / Subtitle",
    useCase: "Sottotitoli di scheda, schede cantiere",
    classes: "text-xl font-semibold tracking-tight",
    family: "General Sans",
    weight: "600 (Semibold)",
    size: "1.25rem / 20px",
    lineHeight: "1.75rem / 28px",
    sample: "Verifica impianti idraulici e termici",
  },
  {
    role: "Body Regular",
    useCase: "Testo principale, descrizioni, note di cantiere",
    classes: "text-base leading-7",
    family: "General Sans",
    weight: "400 (Regular)",
    size: "1rem / 16px",
    lineHeight: "1.75rem / 28px",
    sample: "Qoovex è lo spazio condiviso in cui un'impresa gestisce un lavoro edile con il cliente dalla creazione del cantiere alla chiusura.",
  },
  {
    role: "Body Small",
    useCase: "Testo compatto, descrizioni secondarie",
    classes: "text-sm text-muted-foreground",
    family: "General Sans",
    weight: "400 (Regular)",
    size: "0.875rem / 14px",
    lineHeight: "1.25rem / 20px",
    sample: "Aggiornato da Marco Rossi • 10 minuti fa",
  },
  {
    role: "Form Label",
    useCase: "Etichette dei campi di input",
    classes: "text-sm font-medium",
    family: "General Sans",
    weight: "500 (Medium)",
    size: "0.875rem / 14px",
    lineHeight: "1.25rem / 20px",
    sample: "Importo stimato lavorazione (€)",
  },
  {
    role: "Accent — Eyebrow / Label Uppercase",
    useCase: "Eyebrow di sezione, etichette speciali",
    classes: "font-accent text-xs font-normal uppercase tracking-widest text-primary",
    family: "Array (Accent)",
    weight: "400 (Regular)",
    size: "0.75rem / 12px",
    lineHeight: "1rem / 16px",
    sample: "CANTIERE ATTIVO • FASE 02",
  },
  {
    role: "Accent — Codice / ID Cantiere",
    useCase: "Codici identificativi cantiere, numeri protocollo",
    classes: "font-accent text-sm font-normal tracking-wider text-foreground",
    family: "Array (Accent)",
    weight: "400 (Regular)",
    size: "0.875rem / 14px",
    lineHeight: "1.25rem / 20px",
    sample: "QVX-2026-MI-0842",
  },
  {
    role: "Accent — Numeri & Importi Focali",
    useCase: "Cifre di riepilogo, contatori, importi evidenziati",
    classes: "font-accent text-2xl font-normal tracking-wide text-foreground",
    family: "Array (Accent)",
    weight: "400 (Regular)",
    size: "1.5rem / 24px",
    lineHeight: "2rem / 32px",
    sample: "€ 48.500,00",
  },
  {
    role: "Accent — Badge Speciali & Status",
    useCase: "Badge di stato cantiere, pillole identificative",
    classes: "font-accent text-xs font-normal uppercase tracking-widest",
    family: "Array (Accent)",
    weight: "400 (Regular)",
    size: "0.75rem / 12px",
    lineHeight: "1rem / 16px",
    sample: "APPROVATO DA COMMITTENTE",
  },
];

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-xs">
      <span className="text-muted-foreground min-w-24">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}

export default function TypographyPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Tipografia"
        description="Il sistema tipografico di Qoovex. Utilizziamo General Sans per la quasi totalità dell'interfaccia (90%) e Array come font di accento (10-15%) per codici cantiere, etichette speciali, cifre rilevanti e timestamp."
      />

      <div className="flex flex-col gap-12">
        {/* ── Font Families ────────────────────────────── */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Font Families</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border p-6">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-base font-semibold">General Sans</span>
                <code className="text-xs text-muted-foreground">--font-sans (90%)</code>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Fontshare • Sans-Serif Geometrica</p>
              <p className="text-3xl tracking-tight mb-3" style={{ fontFamily: "var(--font-sans)" }}>
                AaBbCc 0123
              </p>
              <p className="text-sm text-muted-foreground">
                Usata per tutto il testo di prodotto: titoli, paragrafi, form, pulsanti, navigazione e schede.
              </p>
            </div>

            <div className="rounded-lg border p-6 bg-accent/20">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-base font-semibold font-accent tracking-wider">ARRAY (Fontshare)</span>
                <code className="text-xs text-muted-foreground">.font-accent</code>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Fontshare • Display Accent</p>
              <p className="font-accent text-3xl tracking-wider mb-3">
                AABBCC 0123
              </p>
              <p className="text-sm text-muted-foreground">
                Font d'accento riservata a: ID cantiere, etichette uppercase, cifre salienti, timestamp e badge.
              </p>
            </div>

            <div className="rounded-lg border p-6 bg-accent/20">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-base font-semibold font-pixelify tracking-wider">PIXELIFY SANS (Google Fonts)</span>
                <code className="text-xs text-muted-foreground">.font-pixelify</code>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Google Fonts • Pixel/Dot Matrix Display</p>
              <p className="font-pixelify text-3xl tracking-wider mb-3">
                AABBCC 0123
              </p>
              <p className="text-sm text-muted-foreground">
                Alternativa Google Fonts a matrice di punti / pixel.
              </p>
            </div>

            <div className="rounded-lg border p-6 bg-accent/20">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-base font-semibold font-chakra tracking-wider">CHAKRA PETCH (Google Fonts)</span>
                <code className="text-xs text-muted-foreground">.font-chakra</code>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Google Fonts • Technical Geometric Accent</p>
              <p className="font-chakra text-3xl tracking-wider mb-3">
                AABBCC 0123
              </p>
              <p className="text-sm text-muted-foreground">
                Alternativa Google Fonts moderna e tecnica.
              </p>
            </div>
          </div>
        </section>

        {/* ── Type Scale ────────────────────────────── */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Type Scale & Applicazioni</h2>
          <div className="flex flex-col divide-y rounded-lg border">
            {typeScale.map((t) => (
              <div key={t.role} className="flex flex-col gap-4 p-6 sm:flex-row sm:gap-8">
                {/* Meta */}
                <div className="flex w-full flex-col gap-1.5 sm:w-64 sm:shrink-0">
                  <span className="text-sm font-semibold">{t.role}</span>
                  <span className="text-xs text-muted-foreground">{t.useCase}</span>
                  <div className="mt-2 flex flex-col gap-1">
                    <MetaRow label="Famiglia" value={t.family} />
                    <MetaRow label="Weight" value={t.weight} />
                    <MetaRow label="Size" value={t.size} />
                    <MetaRow label="Line height" value={t.lineHeight} />
                  </div>
                </div>
                {/* Preview */}
                <div className="flex min-w-0 flex-1 flex-col gap-2 justify-center">
                  <div className={t.classes}>{t.sample}</div>
                  <code className="mt-1 text-xs text-muted-foreground">{t.classes}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Pesi & Stili ────────────────────────────── */}
        <section>
          <h2 className="mb-6 text-2xl font-semibold tracking-tight">Pesi e Stili</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border p-6">
              <h3 className="mb-4 text-sm font-semibold">General Sans (Pesi)</h3>
              <div className="flex flex-col gap-3">
                {([
                  ["400", "Regular — Testi e descrizioni"],
                  ["500", "Medium — Label e pulsanti"],
                  ["600", "Semibold — Titoli e card header"],
                  ["700", "Bold — Enfasi forte"],
                ] as const).map(([w, desc]) => (
                  <div key={w} className="flex items-baseline justify-between border-b pb-2 last:border-0 last:pb-0">
                    <span style={{ fontWeight: Number(w) }} className="text-base">
                      Cantiere Ristrutturazione
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">{w} ({desc.split(" ")[0]})</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-6 bg-accent/20">
              <h3 className="mb-4 text-sm font-semibold">Array (Accent Use-cases)</h3>
              <div className="flex flex-col gap-4">
                <div className="border-b pb-3">
                  <span className="font-accent text-xs uppercase tracking-widest text-muted-foreground block mb-1">Eyebrow / Header label</span>
                  <span className="font-accent text-sm tracking-wider">DOCUMENTAZIONE CANTIERE</span>
                </div>
                <div className="border-b pb-3">
                  <span className="font-accent text-xs uppercase tracking-widest text-muted-foreground block mb-1">ID Cantiere & Protocollo</span>
                  <span className="font-accent text-base tracking-wider">JOB-SITE #8942-2026</span>
                </div>
                <div>
                  <span className="font-accent text-xs uppercase tracking-widest text-muted-foreground block mb-1">Importo & Totale</span>
                  <span className="font-accent text-xl tracking-wide">€ 12.450,00</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
