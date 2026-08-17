import {
  formatEuroFromMinorUnits,
  formatEuroRangeFromMinorUnits,
  formatOptionalEuroFromMinorUnits,
  type MinorUnitValue,
} from "@qoovex/ui/lib/money";

export {
  formatEuroFromMinorUnits,
  formatEuroRangeFromMinorUnits,
  formatOptionalEuroFromMinorUnits,
  parseEuroInputToMinorUnits,
} from "@qoovex/ui/lib/money";
export type { EuroInputParseResult, MinorUnitValue } from "@qoovex/ui/lib/money";

export interface ProposalMoneyValues {
  previousPriceMinor: MinorUnitValue | null | undefined;
  economicDeltaMinor: MinorUnitValue | null | undefined;
  rangeMinimumMinor: MinorUnitValue | null | undefined;
  rangeMaximumMinor: MinorUnitValue | null | undefined;
}

export interface MoneyPresentationItem {
  label: string;
  value: string;
}

export function formatInitialEstimateFromPayload(payload: unknown): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "Non indicata";
  return formatOptionalEuroFromMinorUnits((payload as Record<string, unknown>).initialEstimateMinor, "Non indicata");
}

export function getProposalMoneyPresentation(values: ProposalMoneyValues): MoneyPresentationItem[] {
  const items: MoneyPresentationItem[] = [];
  if (values.previousPriceMinor !== null && values.previousPriceMinor !== undefined) items.push({ label: "Importo precedente", value: formatEuroFromMinorUnits(values.previousPriceMinor) });
  if (values.economicDeltaMinor !== null && values.economicDeltaMinor !== undefined) items.push({ label: "Variazione", value: formatEuroFromMinorUnits(values.economicDeltaMinor) });
  if (values.rangeMinimumMinor !== null && values.rangeMinimumMinor !== undefined && values.rangeMaximumMinor !== null && values.rangeMaximumMinor !== undefined) {
    items.push({ label: "Intervallo", value: formatEuroRangeFromMinorUnits(values.rangeMinimumMinor, values.rangeMaximumMinor) });
  } else {
    if (values.rangeMinimumMinor !== null && values.rangeMinimumMinor !== undefined) items.push({ label: "Importo minimo", value: formatEuroFromMinorUnits(values.rangeMinimumMinor) });
    if (values.rangeMaximumMinor !== null && values.rangeMaximumMinor !== undefined) items.push({ label: "Importo massimo", value: formatEuroFromMinorUnits(values.rangeMaximumMinor) });
  }
  return items;
}
