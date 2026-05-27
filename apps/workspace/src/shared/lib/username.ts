export const USERNAME_EMAIL_MESSAGE =
  "Lo username non puo essere un indirizzo email.";

export const USERNAME_FORMAT_MESSAGE =
  "Usa 3-32 caratteri: lettere minuscole, numeri o underscore. Non iniziare o finire con underscore.";

export const USERNAME_RESERVED_MESSAGE =
  "Questo username non puo essere usato. Scegline uno piu personale.";

export const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9_]{1,30}[a-z0-9])$/;
const USERNAME_REPEATED_SEPARATOR_PATTERN = /__/;
const USERNAME_RESERVED_WORDS = new Set([
  "admin",
  "administrator",
  "assistenza",
  "billing",
  "help",
  "moderator",
  "owner",
  "qoovex",
  "root",
  "security",
  "staff",
  "support",
]);
const USERNAME_BLOCKED_FRAGMENTS = [
  "bastard",
  "cazz",
  "cretin",
  "fancul",
  "fuck",
  "merd",
  "porc",
  "stronz",
  "troia",
  "vaff",
];

export function isLikelyEmail(value: string): boolean {
  return value.includes("@") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizeUsernameInput(value: string): string {
  const lowered = value.toLowerCase().replace(/\s+/g, "").replace(/^@+/, "");
  const withoutEmailDomain = lowered.includes("@")
    ? lowered.split("@")[0]
    : lowered;

  return withoutEmailDomain
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .slice(0, 32);
}

export function isReservedUsername(value: string): boolean {
  const normalized = normalizeUsernameInput(value);
  if (USERNAME_RESERVED_WORDS.has(normalized)) return true;

  return USERNAME_BLOCKED_FRAGMENTS.some((fragment) =>
    normalized.includes(fragment),
  );
}

export function validateUsername(value: string): string | undefined {
  if (isLikelyEmail(value)) return USERNAME_EMAIL_MESSAGE;
  if (isReservedUsername(value)) return USERNAME_RESERVED_MESSAGE;
  if (!USERNAME_PATTERN.test(value)) return USERNAME_FORMAT_MESSAGE;
  if (USERNAME_REPEATED_SEPARATOR_PATTERN.test(value)) return USERNAME_FORMAT_MESSAGE;
  return undefined;
}

export function buildUsernameSuggestions(input: {
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  const first = normalizeUsernameInput(input.firstName ?? "");
  const last = normalizeUsernameInput(input.lastName ?? "");
  const emailLocal = normalizeUsernameInput(input.email?.split("@")[0] ?? "");
  const year = new Date().getFullYear().toString().slice(-2);

  return Array.from(
    new Set(
      [
        first && last ? `${first}_${last}` : "",
        first && last ? `${first}${last}` : "",
        emailLocal,
        first ? `${first}${year}` : "",
        last ? `${last}${year}` : "",
      ].filter((value) => validateUsername(value) === undefined),
    ),
  ).slice(0, 5);
}
