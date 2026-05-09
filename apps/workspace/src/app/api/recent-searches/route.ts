import { NextResponse } from "next/server";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import {
  InvalidRecentSearchInputError,
  listRecentSearches,
  recordRecentSearch,
  removeRecentSearch,
} from "@shared/server/recent-search-service";

export async function GET() {
  const user = await bootstrapUser();
  if (!user) return NextResponse.json([], { status: 401 });

  return NextResponse.json(await listRecentSearches(user.id));
}

export async function POST(req: Request) {
  const user = await bootstrapUser();
  if (!user) return NextResponse.json(null, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    await recordRecentSearch(user.id, (body as { query?: unknown }).query);
  } catch (error) {
    if (error instanceof InvalidRecentSearchInputError) {
      return NextResponse.json(null, { status: 400 });
    }

    throw error;
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await bootstrapUser();
  if (!user) return NextResponse.json(null, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json(null, { status: 400 });
  }

  try {
    await removeRecentSearch(user.id, (body as { id?: unknown }).id);
  } catch (error) {
    if (error instanceof InvalidRecentSearchInputError) {
      return NextResponse.json(null, { status: 400 });
    }

    throw error;
  }

  return NextResponse.json({ ok: true });
}
