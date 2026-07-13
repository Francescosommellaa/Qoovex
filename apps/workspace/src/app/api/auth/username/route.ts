import { NextResponse } from "next/server";
import { auth } from "@shared/server/auth/config";
import { getUsernameAvailability } from "@shared/server/username-service";
import { findUserIdentityById } from "@shared/server/repositories/user-repository";
import {
  RateLimitExceededError,
  assertPersistentRateLimit,
} from "@shared/server/rate-limit";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = url.searchParams.get("username") ?? "";
  const firstName = url.searchParams.get("firstName") ?? "";
  const lastName = url.searchParams.get("lastName") ?? "";
  const email = url.searchParams.get("email") ?? "";
  const session = await auth();
  const userId = session?.user?.id;
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "anonymous";
  const rateLimitId = userId ?? forwardedFor.split(",")[0]?.trim() ?? "anonymous";

  try {
    await assertPersistentRateLimit({
      identifier: rateLimitId,
      bucket: "auth:username-availability",
      limit: 90,
      windowMs: 60_000,
      userId,
    });

    const currentUser = userId ? await findUserIdentityById(userId) : null;
    const result = await getUsernameAvailability({
      username,
      currentUserId: currentUser?.id,
      firstName,
      lastName,
      email,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RateLimitExceededError) {
      return NextResponse.json({ message: error.message }, { status: 429 });
    }

    return NextResponse.json(
      { message: "Disponibilita username non verificata." },
      { status: 500 },
    );
  }
}
