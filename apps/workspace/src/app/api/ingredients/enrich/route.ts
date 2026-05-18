import { NextResponse } from "next/server";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { enrichIngredientForUser } from "@shared/server/ingredient-service";

export async function POST(request: Request) {
  const user = await bootstrapUser();
  if (!user) {
    return NextResponse.json({ message: "Sessione non valida." }, { status: 401 });
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
