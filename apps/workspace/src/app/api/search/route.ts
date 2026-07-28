import type { UniversalSearchRequest } from "@qoovex/types";
import { universalSearch } from "@features/universal-search/server/universal-search-service";
import { AccessError, asAccessResponse } from "@shared/server/access-errors";

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (contentLength > 8_192) throw new AccessError("Richiesta di ricerca troppo grande.", 400);
    const input = await request.json() as UniversalSearchRequest;
    return Response.json(await universalSearch(input), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    return asAccessResponse(error);
  }
}
