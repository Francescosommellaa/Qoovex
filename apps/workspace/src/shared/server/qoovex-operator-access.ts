import "server-only";

import { db } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { isCurrentDevAuthIdentity } from "@shared/server/dev-auth";
import { isMfaSatisfiedForUser } from "@shared/server/mfa-service";

export async function requireQoovexOperatorById(userId: string) {
  const [user, isDev] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, platformRole: true, mfaEnabled: true, suspendedAt: true },
    }),
    isCurrentDevAuthIdentity(userId),
  ]);

  if (!user || user.suspendedAt || (!isDev && user.platformRole !== "SUPER_ADMIN")) {
    throw new AccessError("Risorsa non disponibile.", 404);
  }
  if (!isDev && (!user.mfaEnabled || !(await isMfaSatisfiedForUser(user.id)))) {
    throw new AccessError("Conferma MFA richiesta.", 403);
  }

  return {
    id: user.id,
    email: user.email,
    platformRole: "SUPER_ADMIN" as const,
    isDev,
  };
}
