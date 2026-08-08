import "server-only";

import { db } from "@qoovex/db";
import { z } from "zod";
import { AccessError } from "./access-errors";
import { requireOrganizationContext } from "./access-context-service";
import { encryptDataValue, paymentProfileAad } from "./data-encryption-service";
import { fingerprintPayload } from "./job-site-contracts";
import { runSerializableTransaction } from "./serializable-transaction";

const profileSchema = z.object({
  accountHolder: z.string().trim().min(2).max(200),
  iban: z.string().trim().transform((value) => value.toUpperCase().replace(/\s+/g, "")).refine((value) => /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(value), "IBAN non valido."),
  expectedRevision: z.number().int().positive().nullable().optional(),
}).strict();

export async function upsertOrganizationPaymentProfile(organizationId: string, rawInput: unknown) {
  const context = await requireOrganizationContext(organizationId);
  if (context.role !== "OWNER" || !context.permissions.includes("settings:update")) throw new AccessError("Risorsa non disponibile.", 404);
  const { requireIdentity } = await import("./access-context-service");
  const identity = await requireIdentity();
  if (!identity.mfaEnabled) throw new AccessError("MFA attiva e confermata richiesta.", 403, "MFA_REQUIRED");
  const input = profileSchema.parse(rawInput);
  return runSerializableTransaction(async (tx) => {
    let profile = await tx.organizationPaymentProfile.findFirst({ where: { organizationId, archivedAt: null }, select: { id: true, revision: true, _count: { select: { versions: true } } } });
    if (!profile) {
      profile = await tx.organizationPaymentProfile.create({ data: { organizationId, activeKey: `${organizationId}:PAYMENT_PROFILE` }, select: { id: true, revision: true, _count: { select: { versions: true } } } });
    }
    if (input.expectedRevision != null && profile.revision !== input.expectedRevision) throw new AccessError("Profilo pagamento modificato.", 409, "STALE_REVISION");
    const version = profile._count.versions + 1;
    const encrypted = encryptDataValue(input.iban, paymentProfileAad(organizationId, profile.id, version));
    const fingerprint = fingerprintPayload({ organizationId, profileId: profile.id, version, accountHolder: input.accountHolder, ibanLast4: input.iban.slice(-4) });
    const created = await tx.organizationPaymentProfileVersion.create({ data: { profileId: profile.id, version, accountHolder: input.accountHolder, ibanCiphertext: encrypted.ciphertext, ibanNonce: encrypted.nonce, ibanAuthTag: encrypted.authTag, encryptionKeyId: encrypted.keyId, ibanLast4: input.iban.slice(-4), fingerprint, createdByUserId: context.userId }, select: { id: true, version: true, accountHolder: true, ibanLast4: true, createdAt: true } });
    await tx.organizationPaymentProfile.update({ where: { id: profile.id }, data: { currentVersionId: created.id, revision: { increment: 1 } } });
    return { profileId: profile.id, revision: profile.revision + 1, currentVersion: created };
  });
}

export async function getOrganizationPaymentProfile(organizationId: string) {
  const context = await requireOrganizationContext(organizationId);
  if (!context.permissions.includes("settings:update")) throw new AccessError("Risorsa non disponibile.", 404);
  return db.organizationPaymentProfile.findFirst({ where: { organizationId, archivedAt: null }, select: { id: true, revision: true, currentVersion: { select: { id: true, version: true, accountHolder: true, ibanLast4: true, createdAt: true } } } });
}
