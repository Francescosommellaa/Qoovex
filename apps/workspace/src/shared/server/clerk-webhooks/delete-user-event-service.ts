import "server-only";

import { deleteClerkUser } from "@shared/server/clerk-user-sync";
import {
  clerkWebhookError,
  clerkWebhookOk,
  isClerkUserData,
  type ClerkEvent,
} from "./clerk-webhook-event";

export async function handleClerkUserDeletedEvent(event: ClerkEvent) {
  if (!isClerkUserData(event.data)) {
    return clerkWebhookError("Invalid user shape", 400);
  }

  await deleteClerkUser(event.data.id);
  return clerkWebhookOk();
}
