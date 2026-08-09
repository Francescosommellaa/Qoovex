import "server-only";

import { db } from "@qoovex/db";
import type { AccountRole } from "@qoovex/types";
import { AccessError } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";

const accountRoles = new Set<AccountRole>(["BUSINESS", "PROFESSIONAL", "CLIENT"]);

export async function selectAccountRole(role: AccountRole) {
  if (!accountRoles.has(role)) throw new AccessError("Ruolo account non valido.", 409);

  const identity = await requireIdentity();
  const user = await db.user.findUnique({
    where: { id: identity.id },
    select: { id: true, accountRole: true },
  });
  if (!user) throw new AccessError("Sessione non valida.", 401);
  if (user.accountRole === role) return { accountRole: role, selected: false };
  if (user.accountRole) throw new AccessError("Il ruolo account non può essere modificato.", 409);

  const updated = await db.user.updateMany({
    where: { id: identity.id, accountRole: null },
    data: { accountRole: role },
  });
  if (updated.count !== 1) throw new AccessError("Il ruolo account è stato modificato da un'altra sessione.", 409);

  await db.securityAuditEvent.create({
    data: {
      userId: identity.id,
      email: identity.email,
      type: "ACCOUNT_ROLE_SELECTED",
      metadata: { accountRole: role },
    },
  });
  return { accountRole: role, selected: true };
}

export async function requireAccountRole(...allowed: readonly AccountRole[]) {
  const identity = await requireIdentity();
  if (identity.isDev && identity.accountRole) {
    if (!allowed.includes(identity.accountRole)) throw new AccessError("Il ruolo account non puÃ² eseguire questa azione.", 403);
    return identity;
  }
  const user = await db.user.findUnique({
    where: { id: identity.id },
    select: { accountRole: true },
  });
  if (!user?.accountRole) throw new AccessError("Completa la scelta del ruolo account.", 403, "ACCOUNT_ROLE_REQUIRED");
  if (!allowed.includes(user.accountRole)) throw new AccessError("Il ruolo account non può eseguire questa azione.", 403);
  return { ...identity, accountRole: user.accountRole };
}
