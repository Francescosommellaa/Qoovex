import { NextResponse } from "next/server";
import { bootstrapUser } from "@shared/actions/bootstrap-user";
import { getIngredientSuggestions } from "@shared/server/ingredient-service";

export async function GET(request: Request) {
  const user = await bootstrapUser();
  if (!user) {
    return NextResponse.json({ message: "Sessione non valida." }, { status: 401 });
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const suggestions = await getIngredientSuggestions(query);

  return NextResponse.json({ suggestions });
}
