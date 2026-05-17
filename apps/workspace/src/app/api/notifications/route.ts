import { NextResponse } from "next/server";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import {
  getNotificationFeed,
  markAllNotificationsRead,
  markNotificationRead,
} from "@shared/server/notification-service";

export async function GET() {
  const user = await bootstrapUser();
  if (!user) return NextResponse.json(null, { status: 401 });

  return NextResponse.json(await getNotificationFeed(user.id));
}

export async function PATCH(req: Request) {
  const user = await bootstrapUser();
  if (!user) return NextResponse.json(null, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(null, { status: 400 });
  }

  const action = (body as { action?: unknown }).action;

  try {
    if (action === "mark-all-read") {
      await markAllNotificationsRead(user.id);
      return NextResponse.json({ ok: true });
    }

    if (action === "mark-read") {
      await markNotificationRead(user.id, (body as { id?: unknown }).id);
      return NextResponse.json({ ok: true });
    }
  } catch {
    return NextResponse.json(null, { status: 400 });
  }

  return NextResponse.json(null, { status: 400 });
}
