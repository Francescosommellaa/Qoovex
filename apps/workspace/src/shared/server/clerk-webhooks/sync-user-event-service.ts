import "server-only";

import {
  ClerkUserSyncConflictError,
  syncClerkUser,
} from "@shared/server/clerk-user-sync";
import {
  clerkWebhookError,
  clerkWebhookOk,
  getPrimaryClerkEmail,
  isClerkUserData,
  type ClerkEvent,
} from "./clerk-webhook-event";

export async function handleClerkUserSyncEvent(event: ClerkEvent) {
  if (!isClerkUserData(event.data)) {
    return clerkWebhookError("Invalid user shape", 400);
  }

  const primaryEmail = getPrimaryClerkEmail(event.data);
  if (!primaryEmail) {
    return clerkWebhookError("No email found", 400);
  }

  const phoneFromMetadata =
    typeof event.data.unsafe_metadata?.phoneNumber === "string" &&
    event.data.unsafe_metadata.phoneNumber.length > 0
      ? event.data.unsafe_metadata.phoneNumber
      : undefined;

  try {
    await syncClerkUser({
      clerkId: event.data.id,
      email: primaryEmail,
      username: event.data.username,
      firstName: event.data.first_name,
      lastName: event.data.last_name,
      phoneNumber: phoneFromMetadata,
    });
  } catch (error) {
    if (error instanceof ClerkUserSyncConflictError) {
      console.error("[clerk-webhook] user sync conflict", {
        clerkId: event.data.id,
        eventType: event.type,
      });

      return clerkWebhookError("User conflict", 409);
    }

    throw error;
  }

  return clerkWebhookOk();
}