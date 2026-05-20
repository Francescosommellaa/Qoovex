import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUsernameAvailability } from "@shared/server/username-service";
import { findUserIdentityByClerkId } from "@shared/server/repositories/user-repository";
import {
  RateLimitExceededError,
  assertRateLimit,
} from "@shared/server/rate-limit";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const username = url.searchParams.get("username") ?? "";
  const firstName = url.searchParams.get("firstName") ?? "";
  const lastName = url.searchParams.get("lastName") ?? "";
  const email = url.searchParams.get("email") ?? "";
  const { userId } = await auth();
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "anonymous";
  const rateLimitId = userId ?? forwardedFor.split(",")[0]?.trim() ?? "anonymous";

  try {
    assertRateLimit({
      userId: rateLimitId,
      bucket: "auth:username-availability",
      limit: 90,
      windowMs: 60_000,
    });

    const currentUser = userId ? await findUserIdentityByClerkId(userId) : null;
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
