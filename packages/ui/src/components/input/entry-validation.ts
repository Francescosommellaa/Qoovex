/** Syntax checks only: no phone lookup, DNS, conversion or accounting. */
export function phoneNationalDigitLimit(dialCode: string): number {
  const prefixDigits = /^\+\d{1,3}$/.test(dialCode) ? dialCode.length - 1 : 0;
  return Math.max(0, 15 - prefixDigits);
}

export function sanitizePhoneEntry(text: string, dialCode: string, requestedMax?: number): string {
  const national = text.trim().startsWith(dialCode) ? text.trim().slice(dialCode.length) : text;
  const limit = Math.min(requestedMax ?? Number.POSITIVE_INFINITY, phoneNationalDigitLimit(dialCode));
  return national.replace(/\D/g, "").slice(0, limit);
}

export function phoneEntryError(text: string, dialCode: string): string | null {
  if (!text) return null;
  if (!/^\+\d{1,3}$/.test(dialCode)) return "Seleziona un prefisso valido.";
  if (!/^\d+$/.test(text)) return "Inserisci soltanto le cifre del numero nazionale.";
  if (text.length < 6 || text.length > phoneNationalDigitLimit(dialCode)) return "Controlla la lunghezza: almeno 6 cifre nazionali e massimo 15 con il prefisso.";
  return null;
}

export function urlEntryError(text: string): string | null {
  if (!text) return null;
  if (text.includes("://")) return "HTTPS è già presente: inserisci solo dominio e percorso.";
  if (/\s|\\/.test(text)) return "L’indirizzo non può contenere spazi o barre inverse.";
  try {
    const url = new URL(`https://${text}`);
    if (url.username || url.password || !url.hostname.includes(".") || url.hostname.split(".").some((part) => !part)) {
      return "Inserisci un dominio completo, per esempio esempio.it, senza credenziali.";
    }
  } catch { return "Controlla dominio, percorso e porta dell’indirizzo."; }
  return null;
}

export function currencyEntryRules(currency: string, locale: Intl.LocalesArgument = "it-IT") {
  const precision = new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  const parts = new Intl.NumberFormat(locale).formatToParts(123456789.1);
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ",";
  const group = parts.find((part) => part.type === "group")?.value ?? ".";
  const lengths = parts.filter((part) => part.type === "integer").map((part) => part.value.length);
  return { precision, decimal, group, primary: lengths.at(-1) ?? 3, secondary: lengths.at(-2) ?? 3 };
}

type CurrencyRules = ReturnType<typeof currencyEntryRules>;
const escapePattern = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function currencyParts(text: string, rules: CurrencyRules) {
  const group = escapePattern(rules.group);
  const integer = `(?:\\d+|\\d{1,${rules.secondary}}(?:${group}\\d{${rules.secondary}})*${group}\\d{${rules.primary}})`;
  const fraction = rules.precision ? `(?:${escapePattern(rules.decimal)}(\\d{0,${rules.precision}}))?` : "";
  const match = new RegExp(`^(-?)(${integer})${fraction}$`).exec(text);
  return match ? { sign: match[1]!, integer: match[2]!.split(rules.group).join(""), fraction: match[3] } : null;
}

export function currencyEntryError(text: string, rules: CurrencyRules, min?: number, max?: number): string | null {
  if (!text) return null;
  const parts = currencyParts(text, rules);
  if (!parts) return rules.precision
    ? `Usa ${rules.decimal} per i decimali (massimo ${rules.precision} cifre); controlla i gruppi delle migliaia. Non aggiungere simboli.`
    : "Questa valuta usa importi interi, senza decimali o simboli.";
  const minor = BigInt(parts.integer + (parts.fraction ?? "").padEnd(rules.precision, "0"));
  if (minor > BigInt(Number.MAX_SAFE_INTEGER)) return "Importo troppo grande per essere rappresentato con precisione.";
  // Number is used only to compare caller-provided bounds, never to format or store.
  const number = Number(`${parts.sign}${parts.integer}.${parts.fraction ?? "0"}`);
  if (min !== undefined && number < min) return `L’importo minimo è ${min}.`;
  if (max !== undefined && number > max) return `L’importo massimo è ${max}.`;
  return null;
}

export function editCurrencyEntry(text: string, rules: CurrencyRules): string {
  const parts = currencyParts(text, rules);
  if (!parts) return text;
  return parts.sign + parts.integer + (parts.fraction !== undefined ? rules.decimal + parts.fraction : "");
}

export function formatCurrencyEntry(text: string, rules: CurrencyRules): string {
  if (!text || currencyEntryError(text, rules)) return text;
  const parts = currencyParts(text, rules)!;
  let integer = parts.integer.replace(/^0+(?=\d)/, "");
  const groups: string[] = [];
  let size = rules.primary;
  while (integer.length > size) {
    groups.unshift(integer.slice(-size));
    integer = integer.slice(0, -size);
    size = rules.secondary;
  }
  groups.unshift(integer);
  return parts.sign + groups.join(rules.group) + (rules.precision ? rules.decimal + (parts.fraction ?? "").padEnd(rules.precision, "0") : "");
}
