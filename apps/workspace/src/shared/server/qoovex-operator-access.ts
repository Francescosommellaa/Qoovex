import "server-only";

import { db } from "@qoovex/db";
import { AccessError } from "@shared/server/access-errors";
import { getDevAuthSession, isCurrentDevAuthIdentity } from "@shared/server/dev-auth";
import { isMfaSatisfiedForUser } from "@shared/server/mfa-service";

export async function requireQoovexOperatorById(userId: string) {
  const [user, isDev, devSession] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, platformRole: true, mfaEnabled: true, suspendedAt: true },
    }),
    isCurrentDevAuthIdentity(userId),
    getDevAuthSession(),
  ]);

  const effectiveRole = isDev ? devSession?.view : user?.platformRole;
  if (!user || user.suspendedAt || (effectiveRole !== "SUPPORT_AGENT" && effectiveRole !== "PLATFORM_ADMIN")) {
    throw new AccessError("Risorsa non disponibile.", 404);
  }
  if (!isDev && (!user.mfaEnabled || !(await isMfaSatisfiedForUser(user.id)))) {
    throw new AccessError("Conferma MFA richiesta.", 403);
  }

  return {
    id: user.id,
    email: user.email,
    platformRole: effectiveRole,
    isDev,
  };
}

export async function requirePlatformAdminById(userId: string) {
  const operator = await requireQoovexOperatorById(userId);
  if (operator.platformRole !== "PLATFORM_ADMIN") throw new AccessError("Risorsa non disponibile.", 404);
  return operator;
}
