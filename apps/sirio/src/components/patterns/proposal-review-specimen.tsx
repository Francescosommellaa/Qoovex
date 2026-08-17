import { IconArrowsExchange } from "@tabler/icons-react";
import { Badge } from "@qoovex/ui/components/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@qoovex/ui/components/card";
import {
  formatEuroFromMinorUnits,
  formatEuroRangeFromMinorUnits,
} from "@qoovex/ui/lib/money";

type ProposalComparison = {
  after: string;
  before: string;
  change?: string;
  label: string;
};

type ProposalDetail = {
  label: string;
  value: string;
};

type ProposalReviewSpecimenData = {
  actionPrimary: string;
  actionSecondary: readonly string[];
  baselineNote?: string;
  comparisons: readonly ProposalComparison[];
  dateTime: string;
  dateTimeLabel: string;
  details: readonly ProposalDetail[];
  proposedBy: string;
  reason: string;
  statusLabel: string;
  statusVariant: "info" | "warning";
  summary: string;
  title: string;
};

const proposalSpecimens = [
  {
    title: "Proposta con variazione economica",
    summary: "Sostituire il rivestimento previsto con gres porcellanato.",
    reason: "Il materiale indicato inizialmente non è più disponibile.",
    proposedBy: "Proposta dell’Azienda",
    dateTime: "2026-08-12T14:20:00+02:00",
    dateTimeLabel: "12 ago 2026, 14:20",
    statusLabel: "Proposta inviata",
    statusVariant: "info",
    comparisons: [{
      label: "Importo",
      before: formatEuroFromMinorUnits("125000"),
      after: formatEuroFromMinorUnits("150000"),
      change: `Aumento proposto: +${formatEuroFromMinorUnits("25000")}`,
    }],
    details: [{ label: "Condizioni proposte", value: "La sostituzione riguarda soltanto il rivestimento indicato." }],
    actionPrimary: "Accetta la proposta mostrata",
    actionSecondary: ["Rifiuta questa proposta", "Prepara controproposta"],
  },
  {
    title: "Proposta con impatto sui tempi",
    summary: "Posticipare la posa dei serramenti.",
    reason: "Il fornitore ha comunicato una nuova data di consegna.",
    proposedBy: "Proposta dell’Azienda",
    dateTime: "2026-08-13T09:30:00+02:00",
    dateTimeLabel: "13 ago 2026, 09:30",
    statusLabel: "Proposta inviata",
    statusVariant: "info",
    comparisons: [],
    details: [
      { label: "Nuova conclusione prevista", value: "15 ott 2026, 09:30" },
      { label: "Impatto sui tempi", value: "Conclusione prevista una settimana più tardi." },
      { label: "Variazione economica", value: "Nessuna variazione economica proposta." },
    ],
    actionPrimary: "Accetta la proposta mostrata",
    actionSecondary: ["Rifiuta questa proposta", "Prepara controproposta"],
  },
  {
    title: "Proposta con più campi modificati",
    summary: "Aggiornare materiali, importo indicativo e data prevista.",
    reason: "La soluzione aggiornata integra le modifiche richieste durante il sopralluogo.",
    proposedBy: "Controproposta del Cliente",
    dateTime: "2026-08-14T11:10:00+02:00",
    dateTimeLabel: "14 ago 2026, 11:10",
    statusLabel: "Controproposta presente",
    statusVariant: "warning",
    comparisons: [{
      label: "Importo",
      before: formatEuroFromMinorUnits("125000"),
      after: formatEuroRangeFromMinorUnits("140000", "160000"),
    }],
    details: [
      { label: "Nuova conclusione prevista", value: "22 ott 2026, 17:00" },
      { label: "Impatto sui tempi", value: "La conclusione prevista si sposta alla settimana successiva." },
      { label: "Condizioni proposte", value: "Il materiale sarà scelto tra le finiture già condivise dalle parti." },
    ],
    actionPrimary: "Accetta la proposta mostrata",
    actionSecondary: ["Rifiuta questa proposta", "Prepara controproposta"],
  },
  {
    title: "Proposta senza baseline confrontabile",
    summary: "Aggiungere una lavorazione non inclusa nel riepilogo precedente.",
    reason: "La lavorazione è emersa dopo l’apertura della parete.",
    proposedBy: "Proposta dell’Azienda",
    dateTime: "2026-08-15T16:45:00+02:00",
    dateTimeLabel: "15 ago 2026, 16:45",
    statusLabel: "Proposta inviata",
    statusVariant: "info",
    comparisons: [],
    baselineNote: "Non è disponibile un importo precedente affidabile: viene mostrata soltanto la variazione proposta.",
    details: [{ label: "Variazione economica proposta", value: `+${formatEuroFromMinorUnits("25000")}` }],
    actionPrimary: "Accetta la proposta mostrata",
    actionSecondary: ["Rifiuta questa proposta", "Prepara controproposta"],
  },
] as const satisfies readonly ProposalReviewSpecimenData[];

function ProposalReviewSpecimen({ specimen, index }: { specimen: ProposalReviewSpecimenData; index: number }) {
  const titleId = `proposal-review-specimen-${index}`;

  return (
    <Card aria-labelledby={titleId} role="article">
      <CardHeader className="flex min-w-0 flex-col items-start gap-3 sm:grid sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <CardTitle><h3 id={titleId}>{specimen.title}</h3></CardTitle>
          <CardDescription className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>{specimen.proposedBy}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={specimen.dateTime}>{specimen.dateTimeLabel}</time>
          </CardDescription>
        </div>
        <CardAction>
          <Badge variant={specimen.statusVariant}>
            <IconArrowsExchange aria-hidden="true" />
            {specimen.statusLabel}
          </Badge>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-5">
        <section aria-labelledby={`${titleId}-change`}>
          <h4 className="font-semibold" id={`${titleId}-change`}>Che cosa cambia</h4>
          <p className="mt-1 leading-6 text-muted-foreground">{specimen.summary}</p>
          <dl className="mt-3">
            <div>
              <dt className="text-sm font-medium">Motivazione</dt>
              <dd className="mt-1 text-sm leading-6 text-muted-foreground">{specimen.reason}</dd>
            </div>
          </dl>
        </section>

        {specimen.comparisons.length ? (
          <section aria-labelledby={`${titleId}-comparison`}>
            <h4 className="font-semibold" id={`${titleId}-comparison`}>Cosa cambia rispetto a prima</h4>
            <dl className="mt-3 grid gap-3">
              {specimen.comparisons.map((comparison) => (
                <div className="rounded-lg border bg-muted/20 p-4" key={comparison.label}>
                  <dt className="font-medium">{comparison.label}</dt>
                  <dd className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Prima</span>
                      <p className="mt-1 font-accent text-lg tabular-nums">{comparison.before}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Proposto</span>
                      <p className="mt-1 font-accent text-lg tabular-nums">{comparison.after}</p>
                    </div>
                  </dd>
                  {comparison.change ? <p className="mt-3 text-sm font-medium">{comparison.change}</p> : null}
                </div>
              ))}
            </dl>
          </section>
        ) : specimen.baselineNote ? (
          <p className="rounded-lg border border-dashed p-3 text-sm leading-6 text-muted-foreground">
            {specimen.baselineNote}
          </p>
        ) : null}

        {specimen.details.length ? (
          <section aria-labelledby={`${titleId}-details`}>
            <h4 className="font-semibold" id={`${titleId}-details`}>Conseguenze indicate</h4>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {specimen.details.map((detail) => (
                <div className="min-w-0" key={detail.label}>
                  <dt className="text-sm font-medium">{detail.label}</dt>
                  <dd className="mt-1 break-words text-sm leading-6 text-muted-foreground">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        <section aria-labelledby={`${titleId}-actions`} className="border-t pt-4">
          <h4 className="font-semibold" id={`${titleId}-actions`}>Azioni disponibili nella vista operativa</h4>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Azione principale</dt>
              <dd className="mt-1 font-medium">{specimen.actionPrimary}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Alternative</dt>
              <dd className="mt-1">{specimen.actionSecondary.join(" · ")}</dd>
            </div>
          </dl>
        </section>
      </CardContent>
    </Card>
  );
}

export function ProposalReviewSpecimens() {
  return (
    <div className="grid gap-6">
      {proposalSpecimens.map((specimen, index) => (
        <ProposalReviewSpecimen index={index} key={specimen.title} specimen={specimen} />
      ))}
    </div>
  );
}
