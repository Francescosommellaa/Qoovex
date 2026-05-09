import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import {
  isClerkEvent,
  type ClerkWebhookResult,
} from "@shared/server/clerk-webhooks/clerk-webhook-event";
import { handleClerkWebhookEvent } from "@shared/server/clerk-webhooks/clerk-webhook-dispatcher";

function toNextResponse(result: ClerkWebhookResult) {
  return NextResponse.json(result.body, { status: result.status ?? 200 });
}

async function verifyClerkWebhook(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET non configurato");
    return {
      error: NextResponse.json({ error: "Misconfigured" }, { status: 500 }),
    };
  }

  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return {
      error: NextResponse.json(
        { error: "Missing svix headers" },
        { status: 400 },
      ),
    };
  }

  const payload = await req.text();
  const wh = new Webhook(webhookSecret);

  try {
    const verified = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    if (!isClerkEvent(verified)) {
      return {
        error: NextResponse.json(
          { error: "Invalid event shape" },
          { status: 400 },
        ),
      };
    }

    return { event: verified };
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid signature" }, { status: 400 }),
    };
  }
}

export async function POST(req: Request) {
  const { event, error } = await verifyClerkWebhook(req);
  if (error) return error;
  if (!event) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  return toNextResponse(await handleClerkWebhookEvent(event));
}
