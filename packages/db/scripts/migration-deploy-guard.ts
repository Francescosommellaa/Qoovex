export const JOB_SITE_EMPTY_DATABASE_RESET_REF =
  "QOOVEX_JOB_SITE_FROM_ZERO_USER_AUTHORIZATION_2026_08_03";
export const JOB_SITE_EMPTY_DATABASE_MIGRATION =
  "20260803230000_qoovex_vnext_from_zero";

export function assertCiEphemeralDatabase(databaseUrl: string) {
  const database = new URL(databaseUrl);
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  if (!localHosts.has(database.hostname) || database.pathname.replace(/^\//, "") !== "qoovex_ci") {
    throw new Error("[migrate-deploy] --ci-ephemeral e consentito solo sul database locale qoovex_ci.");
  }
}

export function assertProductionApproval(input: {
  approved: string | undefined;
  backupRef: string | undefined;
  destructiveResetRef?: string | undefined;
  expectedLastMigration: string | undefined;
  lastMigration: string | undefined;
}) {
  if (input.approved !== "1") {
    throw new Error("[migrate-deploy] Imposta QOOVEX_MIGRATE_DEPLOY_APPROVED=1 dopo l'approvazione della finestra.");
  }
  const hasBackup = Boolean(input.backupRef?.trim());
  const hasAuthorizedEmptyReset =
    input.destructiveResetRef === JOB_SITE_EMPTY_DATABASE_RESET_REF &&
    input.lastMigration === JOB_SITE_EMPTY_DATABASE_MIGRATION;
  if (!hasBackup && !hasAuthorizedEmptyReset) {
    throw new Error(
      "[migrate-deploy] Serve QOOVEX_MIGRATION_BACKUP_REF oppure l'attestazione current empty-database esatta.",
    );
  }
  const expected = input.expectedLastMigration?.trim();
  if (!expected || expected !== input.lastMigration) {
    throw new Error(`[migrate-deploy] Target inatteso: atteso=${expected || "mancante"}, locale=${input.lastMigration ?? "mancante"}.`);
  }
}

