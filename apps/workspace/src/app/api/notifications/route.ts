import { NextResponse } from "next/server";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import {
  deleteNotifications,
  getNotificationFeed,
  getNotificationInbox,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationsReadState,
} from "@shared/server/notification-service";
import type { NotificationQueryFilters } from "@shared/lib/workspace-types";

function parseNotificationFilters(req: Request): NotificationQueryFilters {
  const { searchParams } = new URL(req.url);
  const read = searchParams.get("read");
  const take = Number(searchParams.get("take"));

  return {
    read: read === "read" || read === "unread" || read === "all" ? read : undefined,
    type: searchParams.get("type") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    cursor: searchParams.get("cursor") || undefined,
    take: Number.isFinite(take) && take > 0 ? take : undefined,
  };
}

function hasInboxFilters(filters: NotificationQueryFilters) {
  return Boolean(
    filters.read ||
      filters.type ||
      filters.from ||
      filters.to ||
      filters.cursor ||
      filters.take,
  );
}

export async function GET(req: Request) {
  const user = await bootstrapUser();
  if (!user) return NextResponse.json(null, { status: 401 });

  const filters = parseNotificationFilters(req);
  if (hasInboxFilters(filters)) {
    return NextResponse.json(await getNotificationInbox(user.id, filters));
  }

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
      if (Array.isArray((body as { ids?: unknown }).ids)) {
        await markNotificationsReadState(
          user.id,
          (body as { ids?: unknown }).ids,
          true,
        );
        return NextResponse.json({ ok: true });
      }

      await markNotificationRead(user.id, (body as { id?: unknown }).id);
      return NextResponse.json({ ok: true });
    }

    if (action === "mark-unread") {
      await markNotificationsReadState(
        user.id,
        (body as { ids?: unknown }).ids,
        false,
        (body as { id?: unknown }).id,
      );
      return NextResponse.json({ ok: true });
    }

    if (action === "mark-read-state") {
      const read = (body as { read?: unknown }).read;
      if (typeof read !== "boolean") {
        return NextResponse.json(null, { status: 400 });
      }

      await markNotificationsReadState(
        user.id,
        (body as { ids?: unknown }).ids,
        read,
        (body as { id?: unknown }).id,
      );
      return NextResponse.json({ ok: true });
    }
  } catch {
    return NextResponse.json(null, { status: 400 });
  }

  return NextResponse.json(null, { status: 400 });
}

export async function DELETE(req: Request) {
  const user = await bootstrapUser();
  if (!user) return NextResponse.json(null, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    await deleteNotifications(
      user.id,
      (body as { ids?: unknown }).ids,
      (body as { id?: unknown }).id,
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(null, { status: 400 });
  }
}
