export const USERNAME_EMAIL_MESSAGE =
  "Lo username non puo essere un indirizzo email. Usa lettere, numeri, punto, trattino o underscore.";

export const USERNAME_FORMAT_MESSAGE =
  "Lo username deve avere 3-32 caratteri: lettere minuscole, numeri, punto, trattino o underscore.";

export const USERNAME_PATTERN = /^[a-z0-9._-]{3,32}$/;

export function isLikelyEmail(value: string): boolean {
  return value.includes("@") || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizeUsernameInput(value: string): string {
  const lowered = value.toLowerCase().replace(/\s+/g, "").replace(/^@+/, "");
  const withoutEmailDomain = lowered.includes("@")
    ? lowered.split("@")[0]
    : lowered;

  return withoutEmailDomain.replace(/[^a-z0-9._-]/g, "").slice(0, 32);
}

export function validateUsername(value: string): string | undefined {
  if (isLikelyEmail(value)) return USERNAME_EMAIL_MESSAGE;
  if (!USERNAME_PATTERN.test(value)) return USERNAME_FORMAT_MESSAGE;
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
        first && last ? `${first}.${last}` : "",
        first && last ? `${first}_${last}` : "",
        first && last ? `${first}${last}` : "",
        emailLocal,
        first ? `${first}${year}` : "",
        last ? `${last}${year}` : "",
      ].filter((value) => USERNAME_PATTERN.test(value)),
    ),
  ).slice(0, 5);
}
