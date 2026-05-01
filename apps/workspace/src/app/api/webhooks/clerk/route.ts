import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { sendClerkEmailWithResend } from "@shared/server/clerk-email-delivery";
import {
  ClerkUserSyncConflictError,
  deleteClerkUser,
  syncClerkUser,
} from "@shared/server/clerk-user-sync";

interface ClerkEmailAddress {
  id?: string;
  email_address: string;
}

interface ClerkUserData {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  primary_email_address_id?: string | null;
  email_addresses?: ClerkEmailAddress[];
}

interface ClerkEvent {
  type: string;
  data: unknown;
}

function isClerkEvent(value: unknown): value is ClerkEvent {
  if (typeof value !== "object" || value === null) return false;

  const obj = value as Record<string, unknown>;
  return typeof obj.type === "string" && "data" in obj;
}

function isClerkUserData(value: unknown): value is ClerkUserData {
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

function getPrimaryEmail(data: ClerkUserData): string | undefined {
  return (
    data.email_addresses?.find(
      (emailAddress) => emailAddress.id === data.primary_email_address_id,
    )?.email_address ?? data.email_addresses?.[0]?.email_address
  );
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

async function handleUserSync(event: ClerkEvent) {
  if (!isClerkUserData(event.data)) {
    return NextResponse.json({ error: "Invalid user shape" }, { status: 400 });
  }

  const primaryEmail = getPrimaryEmail(event.data);
  if (!primaryEmail) {
    return NextResponse.json({ error: "No email found" }, { status: 400 });
  }

  try {
    await syncClerkUser({
      clerkId: event.data.id,
      email: primaryEmail,
      username: event.data.username,
      firstName: event.data.first_name,
      lastName: event.data.last_name,
    });
  } catch (error) {
    if (error instanceof ClerkUserSyncConflictError) {
      console.error("[clerk-webhook] user sync conflict", {
        clerkId: event.data.id,
        eventType: event.type,
      });
      return NextResponse.json({ error: "User conflict" }, { status: 409 });
    }

    throw error;
  }

  return NextResponse.json({ ok: true });
}

async function handleUserDeleted(event: ClerkEvent) {
  if (!isClerkUserData(event.data)) {
    return NextResponse.json({ error: "Invalid user shape" }, { status: 400 });
  }

  await deleteClerkUser(event.data.id);
  return NextResponse.json({ ok: true });
}

async function handleEmailCreated(event: ClerkEvent) {
  await sendClerkEmailWithResend(event.data);
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const { event, error } = await verifyClerkWebhook(req);
  if (error) return error;
  if (!event) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    return await handleUserSync(event);
  }

  if (event.type === "user.deleted") {
    return await handleUserDeleted(event);
  }

  if (event.type === "email.created" || event.type === "emails.created") {
    return await handleEmailCreated(event);
  }

  return NextResponse.json({ ok: true });
}
