import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@qoovex/db";

interface ClerkEmailAddress {
  email_address: string;
  primary: boolean;
}

interface ClerkUserCreatedData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email_addresses: ClerkEmailAddress[];
}

interface ClerkEvent {
  type: string;
  data: ClerkUserCreatedData;
}

function isClerkEvent(value: unknown): value is ClerkEvent {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj.type !== "string") return false;
  if (typeof obj.data !== "object" || obj.data === null) return false;
  return true;
}

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET non configurato");
    return NextResponse.json({ error: "Misconfigured" }, { status: 500 });
  }

  const headersList = await headers();
  const svixId = headersList.get("svix-id");
  const svixTimestamp = headersList.get("svix-timestamp");
  const svixSignature = headersList.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 },
    );
  }

  const payload = await req.text();
  const wh = new Webhook(webhookSecret);
  let event: ClerkEvent;

  try {
    const verified = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });

    if (!isClerkEvent(verified)) {
      return NextResponse.json(
        { error: "Invalid event shape" },
        { status: 400 },
      );
    }

    event = verified;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "user.created") {
    return NextResponse.json({ ok: true });
  }

  const { id, first_name, last_name, email_addresses } = event.data;

  const primaryEmail =
    email_addresses.find((e: ClerkEmailAddress) => e.primary)?.email_address ??
    email_addresses[0]?.email_address;

  if (!primaryEmail) {
    return NextResponse.json({ error: "No email found" }, { status: 400 });
  }

  const name =
    [first_name, last_name].filter(Boolean).join(" ").trim() || "Chef";

  await db.user.upsert({
    where: { clerkId: id },
    create: {
      clerkId: id,
      name,
      email: primaryEmail,
      plan: "FREE",
    },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
