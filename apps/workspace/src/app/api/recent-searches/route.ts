import { NextResponse } from "next/server";
import { db } from "@qoovex/db";
import { bootstrapUser } from "@shared/actions/bootstrap-user";

const MAX_RECENT = 7;

export async function GET() {
  const user = await bootstrapUser();
  if (!user) return NextResponse.json([], { status: 401 });

  const results = await db.recentSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: MAX_RECENT,
    select: { id: true, query: true, createdAt: true },
  });

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const user = await bootstrapUser();
  if (!user) return NextResponse.json(null, { status: 401 });

  const { query } = await req.json();
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json(null, { status: 400 });
  }

  await db.recentSearch.upsert({
    where: { userId_query: { userId: user.id, query: query.trim() } },
    create: { userId: user.id, query: query.trim() },
    update: { createdAt: new Date() },
  });

  const old = await db.recentSearch.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    skip: MAX_RECENT,
    select: { id: true },
  });

  if (old.length > 0) {
    await db.recentSearch.deleteMany({
      where: { id: { in: old.map((r: { id: string }) => r.id) } },    
    });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await bootstrapUser();
  if (!user) return NextResponse.json(null, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json(null, { status: 400 });

  await db.recentSearch.deleteMany({
    where: { id, userId: user.id },
  });

  return NextResponse.json({ ok: true });
}
