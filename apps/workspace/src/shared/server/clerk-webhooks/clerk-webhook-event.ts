import "server-only";

export interface ClerkEmailAddress {
  id?: string;
  email_address: string;
}

export interface ClerkUserData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  image_url?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
  unsafe_metadata?: Record<string, unknown> | null;
}

export interface ClerkEvent {
  type: string;
  data: unknown;
}

export interface ClerkWebhookResult {
  body: { ok: true } | { error: string };
  status?: number;
}

export function clerkWebhookOk(): ClerkWebhookResult {
  return { body: { ok: true } };
}

export function clerkWebhookError(
  error: string,
  status: number,
): ClerkWebhookResult {
  return { body: { error }, status };
}

export function isClerkEvent(value: unknown): value is ClerkEvent {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;
  return typeof obj.type === "string" && "data" in obj;
}

export function isClerkUserData(value: unknown): value is ClerkUserData {
  if (typeof value !== "object" || value === null) return false;

  const data = value as Record<string, unknown>;
  const emailAddresses = data.email_addresses;

  return (
    typeof data.id === "string" &&
    (emailAddresses === undefined ||
      (Array.isArray(emailAddresses) &&
        emailAddresses.every(
          (emailAddress) =>
            typeof emailAddress === "object" &&
            emailAddress !== null &&
            typeof (emailAddress as Record<string, unknown>).email_address ===
              "string",
        )))
  );
}

export function getPrimaryClerkEmail(
  data: ClerkUserData,
): string | undefined {
  return (
    data.email_addresses?.find(
      (emailAddress) => emailAddress.id === data.primary_email_address_id,
    )?.email_address ?? data.email_addresses?.[0]?.email_address
  );
}
