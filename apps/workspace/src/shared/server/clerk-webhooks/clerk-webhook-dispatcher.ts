import "server-only";

import { clerkWebhookOk, type ClerkEvent } from "./clerk-webhook-event";
import { handleClerkEmailCreatedEvent } from "./deliver-email-event-service";
import { handleClerkUserDeletedEvent } from "./delete-user-event-service";
import { handleClerkUserSyncEvent } from "./sync-user-event-service";

export async function handleClerkWebhookEvent(event: ClerkEvent) {
  if (event.type === "user.created" || event.type === "user.updated") {
    return await handleClerkUserSyncEvent(event);
  }

  if (event.type === "user.deleted") {
    return await handleClerkUserDeletedEvent(event);
  }

  if (event.type === "email.created" || event.type === "emails.created") {
    return await handleClerkEmailCreatedEvent(event);
  }

  return clerkWebhookOk();
}
