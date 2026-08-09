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
  expectedLastMigration: string | undefined;
  lastMigration: string | undefined;
}) {
  if (input.approved !== "1") {
    throw new Error("[migrate-deploy] Imposta QOOVEX_MIGRATE_DEPLOY_APPROVED=1 dopo l'approvazione della finestra.");
  }
  const hasBackup = Boolean(input.backupRef?.trim());
  if (!hasBackup) {
    throw new Error(
      "[migrate-deploy] Serve QOOVEX_MIGRATION_BACKUP_REF verificato prima del deploy.",
    );
  }
  const expected = input.expectedLastMigration?.trim();
  if (!expected || expected !== input.lastMigration) {
    throw new Error(`[migrate-deploy] Target inatteso: atteso=${expected || "mancante"}, locale=${input.lastMigration ?? "mancante"}.`);
  }
}
