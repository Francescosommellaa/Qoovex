import "server-only";

import { sendClerkEmailWithResend } from "@shared/server/clerk-email-delivery";
import {
  clerkWebhookError,
  clerkWebhookOk,
  type ClerkEvent,
} from "./clerk-webhook-event";

export async function handleClerkEmailCreatedEvent(event: ClerkEvent) {
  try {
    await sendClerkEmailWithResend(event.data);
    return clerkWebhookOk();
  } catch (error) {
    console.error("[clerk-webhook] email delivery failed", {
      eventType: event.type,
      message: error instanceof Error ? error.message : "Unknown email error",
    });

    return clerkWebhookError("Email delivery failed", 502);
  }
}
