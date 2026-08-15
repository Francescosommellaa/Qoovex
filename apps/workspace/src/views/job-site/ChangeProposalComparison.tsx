import type { ChangeProposalPayload } from "@shared/server/job-site-contracts";
import { proposalPayloadSchema } from "@shared/server/job-site-contracts";
import { formatEuroFromMinorUnits, formatEuroRangeFromMinorUnits } from "@shared/lib/money";

type ProposalComparison = { after: string; before: string; change?: string; label: string };
type ProposalDetail = { label: string; value: string };

export type ChangeProposalPresentation = {
  comparisons: ProposalComparison[];
  details: ProposalDetail[];
  summary: string;
};

function formatProposedDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function formatSignedEuro(value: string) {
  const formatted = formatEuroFromMinorUnits(value);
  return value.startsWith("-") ? formatted : `+${formatted}`;
}

function getMoneyPresentation(payload: ChangeProposalPayload) {
  const comparisons: ProposalComparison[] = [];
  const details: ProposalDetail[] = [];

  if (payload.priceMode === "FIXED_DELTA" && payload.economicDeltaMinor !== null) {
    if (payload.previousPriceMinor !== null) {
      comparisons.push({
        label: "Importo",
        before: formatEuroFromMinorUnits(payload.previousPriceMinor),
        after: formatEuroFromMinorUnits((BigInt(payload.previousPriceMinor) + BigInt(payload.economicDeltaMinor)).toString()),
        change: `Variazione proposta: ${formatSignedEuro(payload.economicDeltaMinor)}`,
      });
    } else {
      details.push({ label: "Variazione economica proposta", value: formatSignedEuro(payload.economicDeltaMinor) });
    }
  }

  if (payload.priceMode === "RANGE" && payload.rangeMinimumMinor !== null && payload.rangeMaximumMinor !== null) {
    const proposedRange = formatEuroRangeFromMinorUnits(payload.rangeMinimumMinor, payload.rangeMaximumMinor);
    if (payload.previousPriceMinor !== null) {
      comparisons.push({ label: "Importo", before: formatEuroFromMinorUnits(payload.previousPriceMinor), after: proposedRange });
    } else {
      details.push({ label: "Intervallo economico proposto", value: proposedRange });
    }
  }

  if (payload.priceMode === "NO_PRICE_CHANGE") details.push({ label: "Variazione economica", value: "Nessuna variazione economica proposta." });
  return { comparisons, details };
}

export function getChangeProposalPresentation(payload: unknown): ChangeProposalPresentation | null {
  const parsed = proposalPayloadSchema.safeParse(payload);
  if (!parsed.success) return null;

  const money = getMoneyPresentation(parsed.data);
  const details: ProposalDetail[] = [
    { label: "Motivazione", value: parsed.data.reason },
    ...money.details,
    ...(parsed.data.estimatedCompletionAt ? [{ label: "Nuova conclusione prevista", value: formatProposedDate(parsed.data.estimatedCompletionAt) }] : []),
    ...(parsed.data.scheduleImpact ? [{ label: "Impatto sui tempi", value: parsed.data.scheduleImpact }] : []),
    ...(parsed.data.conditions ? [{ label: "Condizioni proposte", value: parsed.data.conditions }] : []),
  ];

  return { comparisons: money.comparisons, details, summary: parsed.data.changeSummary };
}

export function ChangeProposalComparison({ payload }: { payload: unknown }) {
  const presentation = getChangeProposalPresentation(payload);
  if (!presentation) return <p className="mt-3 text-sm text-muted-foreground">I dettagli di questa proposta non sono disponibili.</p>;

  return <div className="mt-3 space-y-4 text-sm">
    <section>
      <h3 className="font-medium">Modifica proposta</h3>
      <p className="mt-1 text-muted-foreground">{presentation.summary}</p>
    </section>
    {presentation.comparisons.length ? <section>
      <h3 className="font-medium">Cosa cambia rispetto a prima</h3>
      <dl className="mt-2 grid gap-3">
        {presentation.comparisons.map((comparison) => <div className="rounded-md border p-3" key={comparison.label}>
          <dt className="font-medium">{comparison.label}</dt>
          <dd className="mt-2 grid gap-3 sm:grid-cols-2">
            <div><span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Prima</span><p className="mt-1">{comparison.before}</p></div>
            <div><span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Proposto</span><p className="mt-1">{comparison.after}</p></div>
          </dd>
          {comparison.change ? <p className="mt-2 text-muted-foreground">{comparison.change}</p> : null}
        </div>)}
      </dl>
    </section> : null}
    <section>
      <h3 className="font-medium">Dettagli della proposta</h3>
      <dl className="mt-2 grid gap-3 sm:grid-cols-2">
        {presentation.details.map((detail) => <div key={detail.label}><dt className="font-medium">{detail.label}</dt><dd className="mt-1 text-muted-foreground">{detail.value}</dd></div>)}
      </dl>
    </section>
  </div>;
}
