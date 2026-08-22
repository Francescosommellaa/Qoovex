import Link from "next/link";
import { Badge } from "@qoovex/ui/components/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@qoovex/ui/components/card";
import { Separator } from "@qoovex/ui/components/separator";
import { IconArrowRight } from "@tabler/icons-react";
import { PageHeader } from "@/components/page-header";

const patternDefinition = [
  { term: "Quando usarlo", description: "Il contesto e il problema UX per cui la composizione è appropriata." },
  { term: "Informazioni", description: "I contenuti necessari per comprendere stato, contesto e prossimo passo." },
  { term: "Azioni", description: "La gerarchia tra azione primaria, alternative e azioni non disponibili." },
  { term: "Stati", description: "Gli stati reali da rappresentare, inclusi attesa, errore, vuoto e completamento." },
  { term: "Accessibilità", description: "Semantica, tastiera, focus e annunci necessari per usare il pattern." },
  { term: "Errori da evitare", description: "Le composizioni ambigue o tecniche che il pattern non deve introdurre." },
] as const;

const patterns = [
  { name: "Work Queue", href: "/patterns/work-queue", status: "Documentato" as const, desc: "Coda di lavorazioni con priorità e assegnazione" },
  { name: "Timeline Event", href: "/patterns/timeline-event", status: "Documentato" as const, desc: "Eventi cronologici di avanzamento cantiere" },
  { name: "Status Presentation", href: "/patterns/status-presentation", status: "Documentato" as const, desc: "Rappresentazione unificata dello stato operativo" },
  { name: "Form Validation", href: "/patterns/form-validation", status: "Documentato" as const, desc: "Validazione contestuale e messaggi d'errore" },
  { name: "Money", href: "/patterns/money", status: "Documentato" as const, desc: "Formattazione e input di importi monetari" },
  { name: "Proposal Review", href: "/patterns/proposal-review", status: "Documentato" as const, desc: "Revisione e approvazione preventivi ed extra" },
  { name: "Contextual Attachment", href: "/patterns/contextual-attachment", status: "Documentato" as const, desc: "Allegati tecnici vincolati a fasi e note" },
  { name: "Invitation", href: "/patterns/invitation", status: "Documentato" as const, desc: "Invito collaboratori e clienti allo spazio cantiere" },
  { name: "Confirmation Review", status: "Previsto" as const, desc: "Conferma guidata per operazioni irreversibili" },
] as const;

export default function PatternsOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Patterns"
        description="Composizioni operative canoniche che spiegano come usare le primitive di Qoovex per costruire esperienze coerenti. I componenti restano documentati separatamente nel catalogo Componenti UI."
      />

      <div className="flex flex-col gap-12">
        {/* ── 1. Che cosa definisce un pattern ─────────── */}
        <section aria-labelledby="pattern-definition-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="pattern-definition-title" className="text-2xl font-semibold tracking-tight">
              Che cosa definisce un pattern
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Un pattern documenta le decisioni di composizione necessarie per una situazione ricorrente,
              senza duplicare l’API o gli esempi dei singoli componenti.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {patternDefinition.map((p) => (
              <Card key={p.term} size="sm">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{p.term}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs leading-relaxed">
                    {p.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* ── 2. Indice dei Pattern ────────────────────── */}
        <section aria-labelledby="pattern-index-title">
          <div className="mb-5 max-w-3xl">
            <h2 id="pattern-index-title" className="text-2xl font-semibold tracking-tight">
              Indice dei pattern
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              I pattern documentati sono disponibili come pagine dedicate con specimen interattivi.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {patterns.map((pattern) => (
              "href" in pattern && pattern.href ? (
                <Link
                  key={pattern.name}
                  href={pattern.href}
                  className="group flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-xs"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground group-hover:underline underline-offset-4">
                        {pattern.name}
                      </span>
                      <IconArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{pattern.desc}</p>
                  </div>
                  <Badge variant="success" size="sm" className="w-fit font-mono text-2xs">
                    {pattern.status}
                  </Badge>
                </Link>
              ) : (
                <div
                  key={pattern.name}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-dashed border-border/70 bg-muted/20 p-4"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {pattern.name}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">{pattern.desc}</p>
                  </div>
                  <Badge variant="secondary" size="sm" className="w-fit font-mono text-2xs">
                    {pattern.status}
                  </Badge>
                </div>
              )
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
