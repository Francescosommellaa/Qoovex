import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@qoovex/db";

const MAX_RECENT = 7;

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json([], { status: 401 });

  const results = await db.recentSearch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: MAX_RECENT,
    select: { id: true, query: true, createdAt: true },
  });

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json(null, { status: 401 });

  const { query } = await req.json();
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json(null, { status: 400 });
  }

  await db.recentSearch.upsert({
    where: { userId_query: { userId, query: query.trim() } },
    create: { userId, query: query.trim() },
    update: { createdAt: new Date() },
  });

  const old = await db.recentSearch.findMany({
    where: { userId },
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
  const { userId } = await auth();
  if (!userId) return NextResponse.json(null, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json(null, { status: 400 });

  await db.recentSearch.deleteMany({
    where: { id, userId },
  });

  return NextResponse.json({ ok: true });
}
