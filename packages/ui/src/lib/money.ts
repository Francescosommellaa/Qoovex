export type MinorUnitValue = bigint | string;

export type EuroInputParseResult =
  | { ok: true; minorUnits: string | null }
  | { ok: false; error: string };

const INVALID_EURO_INPUT = "Inserisci un importo in euro valido, usando al massimo due cifre decimali.";
const MINOR_UNITS_PATTERN = /^-?\d+$/;
const EURO_INPUT_PATTERN = /^(\d{1,3}(?:\.\d{3})*|\d+)(?:,(\d{1,2}))?$/;
const ZERO = BigInt(0);
const ONE_HUNDRED = BigInt(100);

export function formatEuroFromMinorUnits(value: MinorUnitValue): string {
  const canonical = typeof value === "bigint" ? value.toString() : value;
  if (!MINOR_UNITS_PATTERN.test(canonical)) return "Importo non disponibile";

  const minorUnits = BigInt(canonical);
  const negative = minorUnits < ZERO;
  const absolute = negative ? -minorUnits : minorUnits;
  const euros = (absolute / ONE_HUNDRED).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const cents = (absolute % ONE_HUNDRED).toString().padStart(2, "0");

  return `${negative ? "-" : ""}${euros},${cents} €`;
}

export function formatOptionalEuroFromMinorUnits(value: unknown, fallback = "Non indicato"): string {
  if (value === null || value === undefined || value === "") return fallback;
  if (typeof value !== "string" && typeof value !== "bigint") return "Importo non disponibile";
  return formatEuroFromMinorUnits(value);
}

export function formatEuroRangeFromMinorUnits(minimum: MinorUnitValue, maximum: MinorUnitValue): string {
  return `${formatEuroFromMinorUnits(minimum)} – ${formatEuroFromMinorUnits(maximum)}`;
}

export function parseEuroInputToMinorUnits(input: string, options: { allowNegative?: boolean } = {}): EuroInputParseResult {
  let normalized = input.trim();
  if (!normalized) return { ok: true, minorUnits: null };

  normalized = normalized.replace(/\s*€\s*$/, "").trim();
  const negative = normalized.startsWith("-");
  if (negative) normalized = normalized.slice(1);

  const match = EURO_INPUT_PATTERN.exec(normalized);
  if (!match || (negative && !options.allowNegative)) return { ok: false, error: INVALID_EURO_INPUT };

  const euros = BigInt(match[1]!.replace(/\./g, ""));
  const cents = BigInt((match[2] ?? "").padEnd(2, "0"));
  const minorUnits = euros * ONE_HUNDRED + cents;

  return { ok: true, minorUnits: (negative ? -minorUnits : minorUnits).toString() };
}
