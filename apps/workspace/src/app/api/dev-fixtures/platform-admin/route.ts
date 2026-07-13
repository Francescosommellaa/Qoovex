import crypto from "crypto";
import { db } from "@qoovex/db";
import { AccessError, asAccessResponse } from "@shared/server/access-errors";
import { requireIdentity } from "@shared/server/access-context-service";
import { hashPassword } from "@shared/server/auth-password";
import { deletePrivateBlobs, listPrivateBlobs } from "@shared/server/blob-storage-service";
import { isCurrentDevAuthIdentity } from "@shared/server/dev-auth";

async function requireDevFixtureAccess() {
  if (process.env.QOOVEX_E2E_MODE !== "1" || process.env.NODE_ENV === "production") throw new AccessError("Risorsa non disponibile.", 404);
  const identity = await requireIdentity();
  if (!(await isCurrentDevAuthIdentity(identity.id))) throw new AccessError("Risorsa non disponibile.", 404);
  return identity;
}

function requireFixtureRunId(value?: string) {
  const runId = value?.trim() ?? "";
  if (!/^\d{8,20}$/.test(runId)) throw new AccessError("Fixture non valida.", 409);
  return runId;
}

function getFixtureSecret(name: "QOOVEX_MFA_ENCRYPTION_KEY" | "QOOVEX_AUTH_CODE_SECRET") {
  const value = process.env[name] ?? process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? process.env.DEV_AUTH_SECRET;
  if (!value || value.length < 32) throw new AccessError("Fixture non disponibile.", 409);
  return value;
}

function encryptMfaFixtureSecret(secret: string) {
  const key = crypto.createHash("sha256").update(getFixtureSecret("QOOVEX_MFA_ENCRYPTION_KEY")).digest();
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, nonce);
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final(), cipher.getAuthTag()]);
  return { encrypted: encrypted.toString("base64"), nonce: nonce.toString("base64") };
}

function hashRecoveryFixtureCode(email: string, code: string) {
  return crypto.createHmac("sha256", getFixtureSecret("QOOVEX_AUTH_CODE_SECRET"))
    .update(`MFA_RECOVERY:${email.trim().toLowerCase()}:${code}`)
    .digest("hex");
}

async function createMfaSuiteFixture(runId: string) {
  const password = `Qoovex-E2E-${runId}!`;
  const passwordHash = await hashPassword(password);
  const ownerSecret = "JBSWY3DPEHPK3PXP";
  const workerSecret = "KRSXG5DSNFXGOIDB";
  const ownerEncrypted = encryptMfaFixtureSecret(ownerSecret);
  const workerEncrypted = encryptMfaFixtureSecret(workerSecret);
  const now = new Date();

  const result = await db.$transaction(async (tx) => {
    const owner = await tx.user.create({
      data: {
        email: `mfa-owner-${runId}@example.test`,
        username: `mfa_owner_${runId}`,
        firstName: "Owner",
        lastName: "MFA E2E",
        emailVerified: now,
        mfaEnabled: true,
        totpSecretEncrypted: ownerEncrypted.encrypted,
        totpSecretNonce: ownerEncrypted.nonce,
        totpVerifiedAt: now,
        credential: { create: { passwordHash } },
      },
      select: { id: true, email: true },
    });
    const worker = await tx.user.create({
      data: {
        email: `mfa-worker-${runId}@example.test`,
        username: `mfa_worker_${runId}`,
        firstName: "Worker",
        lastName: "MFA E2E",
        emailVerified: now,
        mfaEnabled: true,
        totpSecretEncrypted: workerEncrypted.encrypted,
        totpSecretNonce: workerEncrypted.nonce,
        totpVerifiedAt: now,
        credential: { create: { passwordHash } },
      },
      select: { id: true, email: true },
    });
    const organization = await tx.organization.create({
      data: {
        name: `Azienda MFA E2E ${runId}`,
        code: `MFA-${runId}`,
        createdById: owner.id,
        memberships: {
          create: [
            { userId: owner.id, role: "OWNER" },
            { userId: worker.id, role: "WORKER" },
          ],
        },
      },
      select: { id: true },
    });
    return { owner, worker, organization };
  });

  return {
    organizationId: result.organization.id,
    password,
    owner: { ...result.owner, secret: ownerSecret },
    worker: { ...result.worker, secret: workerSecret },
  };
}

export async function POST(request: Request) {
  try {
    await requireDevFixtureAccess();
    const body = await request.json() as { runId?: string; kind?: "platform-admin" | "mfa-suite" | "mfa-recovery-code"; userId?: string };
    const runId = requireFixtureRunId(body.runId);
    if (body.kind === "mfa-suite") {
      return Response.json(await createMfaSuiteFixture(runId), { status: 201 });
    }
    if (body.kind === "mfa-recovery-code") {
      const user = await db.user.findFirst({
        where: { id: body.userId ?? "", email: `mfa-worker-${runId}@example.test` },
        select: { id: true, email: true },
      });
      if (!user) throw new AccessError("Fixture non valida.", 409);
      const code = "654321";
      const now = new Date();
      await db.$transaction([
        db.authCode.updateMany({ where: { email: user.email, purpose: "MFA_RECOVERY", consumedAt: null }, data: { consumedAt: now } }),
        db.authCode.create({
          data: {
            email: user.email,
            userId: user.id,
            purpose: "MFA_RECOVERY",
            codeHash: hashRecoveryFixtureCode(user.email, code),
            maxAttempts: 5,
            expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
          },
        }),
      ]);
      return Response.json({ code }, { status: 201 });
    }
    const [user, runtimeError] = await db.$transaction([
      db.user.create({
        data: { email: `platform-e2e-${runId}@example.test`, username: `platform_e2e_${runId}`, firstName: "Cliente", lastName: "E2E", emailVerified: new Date() },
        select: { id: true, email: true },
      }),
      db.runtimeErrorEvent.create({
        data: { fingerprint: `e2e-${runId}`, source: "e2e", routePath: "/api/e2e-fixture", requestMethod: "GET", errorName: "E2EFixtureError", message: `Errore fixture sanitizzato ${runId}` },
        select: { id: true },
      }),
    ]);
    return Response.json({ user, runtimeError }, { status: 201 });
  } catch (error) { return asAccessResponse(error); }
}

export async function DELETE(request: Request) {
  try {
    await requireDevFixtureAccess();
    const body = await request.json() as { userId?: string; userIds?: string[]; fixtureEmails?: string[]; organizationId?: string; runtimeErrorId?: string };
    const userIds = [body.userId, ...(body.userIds ?? [])].filter((value): value is string => Boolean(value));
    const fixtureEmails = (body.fixtureEmails ?? []).filter((value) => /^signup-e2e-\d{8,20}@example\.test$/.test(value));
    const fixtureOrganization = body.organizationId
      ? await db.organization.findFirst({ where: { id: body.organizationId, code: { startsWith: "MFA-" } }, select: { id: true } })
      : null;
    await db.$transaction([
      db.runtimeErrorEvent.deleteMany({ where: { id: body.runtimeErrorId ?? "", source: "e2e", fingerprint: { startsWith: "e2e-" } } }),
      db.organization.deleteMany({ where: { id: fixtureOrganization?.id ?? "" } }),
      db.user.deleteMany({
        where: {
          email: { endsWith: "@example.test" },
          AND: [
            { OR: [{ id: { in: userIds } }, { email: { in: fixtureEmails } }] },
            { OR: [
              { username: { startsWith: "platform_e2e_" } },
              { username: { startsWith: "mfa_owner_" } },
              { username: { startsWith: "mfa_worker_" } },
              { username: { startsWith: "signup_e2e_" } },
            ] },
          ],
        },
      }),
    ]);
    let deletedBlobs = 0;
    if (fixtureOrganization) {
      const prefix = `organizations/${fixtureOrganization.id}/`;
      while (true) {
        const page = await listPrivateBlobs({ prefix, limit: 100 });
        const pathnames = page.blobs.filter((blob) => blob.pathname.startsWith(prefix)).map((blob) => blob.pathname);
        if (!pathnames.length) break;
        await deletePrivateBlobs(pathnames);
        deletedBlobs += pathnames.length;
      }
    }
    const [remainingUsers, organizationExists, remainingBlobPage] = await Promise.all([
      db.user.count({ where: { OR: [{ id: { in: userIds } }, { email: { in: fixtureEmails } }] } }),
      fixtureOrganization ? db.organization.count({ where: { id: fixtureOrganization.id } }) : Promise.resolve(0),
      fixtureOrganization
        ? listPrivateBlobs({ prefix: `organizations/${fixtureOrganization.id}/`, limit: 1 })
        : Promise.resolve({ blobs: [] }),
    ]);
    return Response.json({ deleted: true, deletedBlobs, remainingUsers, organizationExists, remainingBlobs: remainingBlobPage.blobs.length });
  } catch (error) { return asAccessResponse(error); }
}
