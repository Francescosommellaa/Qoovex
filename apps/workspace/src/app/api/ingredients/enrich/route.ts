import { NextResponse } from "next/server";
import { bootstrapUser } from "@shared/server/current-user-service";
import { enrichIngredientForUser } from "@shared/server/ingredient-service";
import { assertRateLimit, RateLimitExceededError } from "@shared/server/rate-limit";

export async function POST(request: Request) {
  const user = await bootstrapUser();
  if (!user) {
    return NextResponse.json({ message: "Sessione non valida." }, { status: 401 });
  }

  try {
    assertRateLimit({
      userId: user.id,
      bucket: "ingredients:enrich",
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return NextResponse.json({ message: error.message }, { status: 429 });
    }

    throw error;
  }

  const payload = (await request.json().catch(() => null)) as { name?: unknown } | null;
  if (!payload || typeof payload.name !== "string") {
    return NextResponse.json({ message: "Nome ingrediente non valido." }, { status: 400 });
  }

  try {
    const enrichment = await enrichIngredientForUser({
      userId: user.id,
      name: payload.name,
    });

    return NextResponse.json(enrichment);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossibile verificare ingrediente.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
