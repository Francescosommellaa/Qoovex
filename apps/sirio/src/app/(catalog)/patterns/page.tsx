import Link from "next/link";
import { Badge } from "@qoovex/ui/components/badge";
import { IconArrowRight } from "@tabler/icons-react";
import { PageHeader } from "@/components/page-header";

const patternDefinition = [
  ["Quando usarlo", "Il contesto e il problema UX per cui la composizione è appropriata."],
  ["Informazioni", "I contenuti necessari per comprendere stato, contesto e prossimo passo."],
  ["Azioni", "La gerarchia tra azione primaria, alternative e azioni non disponibili."],
  ["Stati", "Gli stati reali da rappresentare, inclusi attesa, errore, vuoto e completamento."],
  ["Accessibilità", "Semantica, tastiera, focus e annunci necessari per usare il pattern."],
  ["Errori da evitare", "Le composizioni ambigue o tecniche che il pattern non deve introdurre."],
] as const;

const patterns = [
  { name: "Work Queue", href: "/patterns/work-queue", status: "Documentato" },
  { name: "Timeline Event", href: "/patterns/timeline-event", status: "Documentato" },
  { name: "Status Presentation", href: "/patterns/status-presentation", status: "Documentato" },
  { name: "Form Validation", href: "/patterns/form-validation", status: "Documentato" },
  { name: "Money", href: "/patterns/money", status: "Documentato" },
  { name: "Proposal Review", href: "/patterns/proposal-review", status: "Documentato" },
  { name: "Confirmation Review", status: "Previsto" },
  { name: "Contextual Attachment", href: "/patterns/contextual-attachment", status: "Documentato" },
  { name: "Invitation", status: "Previsto" },
] as const;

export default function PatternsOverviewPage() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <PageHeader
        title="Patterns"
        description="Composizioni operative canoniche che spiegano come usare le primitive di Qoovex per costruire esperienze coerenti. I componenti restano documentati separatamente nel catalogo Componenti UI."
      />

      <div className="flex flex-col gap-12">
        <section aria-labelledby="pattern-definition-title">
          <div className="max-w-3xl">
            <h2 id="pattern-definition-title" className="text-2xl font-semibold tracking-tight">
              Che cosa definisce un pattern
            </h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              Un pattern documenta le decisioni di composizione necessarie per una situazione ricorrente,
              senza duplicare l’API o gli esempi dei singoli componenti.
            </p>
          </div>

          <dl className="mt-6 divide-y divide-border rounded-xl border bg-card px-4 sm:px-6">
            {patternDefinition.map(([term, description]) => (
              <div key={term} className="grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
                <dt className="font-semibold text-foreground">{term}</dt>
                <dd className="leading-6 text-muted-foreground">{description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="pattern-index-title">
          <div className="max-w-3xl">
            <h2 id="pattern-index-title" className="text-2xl font-semibold tracking-tight">
              Indice dei pattern
            </h2>
            <p className="mt-2 leading-7 text-muted-foreground">
              I pattern documentati sono disponibili come pagine dedicate. Gli altri restano indicizzati
              senza anticipare regole o comportamenti non ancora verificati.
            </p>
          </div>

          <ul className="mt-6 divide-y divide-border rounded-xl border bg-card" aria-label="Indice dei pattern">
            {patterns.map((pattern) => (
              <li key={pattern.name} className="flex min-h-14 items-center justify-between gap-4 px-4 py-3 sm:px-6">
                {"href" in pattern ? (
                  <Link className="group inline-flex min-h-11 items-center gap-2 font-medium text-foreground underline-offset-4 hover:underline focus-visible:rounded-sm" href={pattern.href}>
                    {pattern.name}
                    <IconArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : <span className="font-medium text-foreground">{pattern.name}</span>}
                <Badge variant={pattern.status === "Documentato" ? "success" : "secondary"}>{pattern.status}</Badge>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
