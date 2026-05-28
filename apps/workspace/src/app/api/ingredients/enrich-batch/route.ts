import { NextResponse } from "next/server";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { enrichIngredientsForUser } from "@shared/server/ingredient-service";
import { assertRateLimit, RateLimitExceededError } from "@shared/server/rate-limit";

export async function POST(request: Request) {
  const user = await bootstrapUser();
  if (!user) {
    return NextResponse.json({ message: "Sessione non valida." }, { status: 401 });
  }

  try {
    assertRateLimit({
      userId: user.id,
      bucket: "ingredients:enrich-batch",
      limit: 4,
      windowMs: 10 * 60 * 1000,
    });
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return NextResponse.json({ message: error.message }, { status: 429 });
    }

    throw error;
  }

  const payload = (await request.json().catch(() => null)) as { names?: unknown } | null;
  if (!payload || !Array.isArray(payload.names)) {
    return NextResponse.json({ message: "Ingredienti non validi." }, { status: 400 });
  }

  const names = payload.names.filter((name): name is string => typeof name === "string");
  if (names.length === 0) {
    return NextResponse.json({ message: "Aggiungi almeno un ingrediente." }, { status: 400 });
  }

  try {
    const results = await enrichIngredientsForUser({ userId: user.id, names });
    return NextResponse.json({ results });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Impossibile verificare gli ingredienti.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
