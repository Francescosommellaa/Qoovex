import { NextResponse } from "next/server";
import { bootstrapUser } from "@shared/server/current-user-service";
import { getIngredientSuggestions } from "@shared/server/ingredient-service";
import { assertRateLimit, RateLimitExceededError } from "@shared/server/rate-limit";

export async function GET(request: Request) {
  const user = await bootstrapUser();
  if (!user) {
    return NextResponse.json({ message: "Sessione non valida." }, { status: 401 });
  }

  try {
    assertRateLimit({
      userId: user.id,
      bucket: "ingredients:search",
      limit: 60,
      windowMs: 60 * 1000,
    });
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return NextResponse.json({ message: error.message }, { status: 429 });
    }

    throw error;
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const suggestions = await getIngredientSuggestions(query);

  return NextResponse.json({ suggestions });
}
