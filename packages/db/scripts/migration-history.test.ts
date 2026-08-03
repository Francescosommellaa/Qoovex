import assert from "node:assert/strict";
import test from "node:test";

import {
  assertCiEphemeralDatabase,
  assertProductionApproval,
  VNEXT_EMPTY_DATABASE_MIGRATION,
  VNEXT_EMPTY_DATABASE_RESET_REF,
} from "./migration-deploy-guard";
import { calculateMigrationChecksum, calculateMigrationChecksums, validateMigrationHistory } from "./migration-history";

const baseline = { name: "20260712010000_single_company_baseline", checksum: "baseline" };
const forward = { name: "20260712020000_single_membership_forward", checksum: "forward" };
const mfa = { name: "20260713010000_mfa_hardening", checksum: "mfa" };
const privacy = { name: "20260713020000_rate_limit_privacy_atomicity", checksum: "privacy" };

test("calcola lo stesso checksum per migration LF e CRLF", () => {
  const lf = "CREATE TYPE \"Example\" AS ENUM ('ONE');\nSELECT 1;\n";
  const crlf = lf.replace(/\n/g, "\r\n");

  assert.equal(calculateMigrationChecksum(crlf), calculateMigrationChecksum(lf));
  assert.notEqual(calculateMigrationChecksum(`${lf}SELECT 2;\n`), calculateMigrationChecksum(lf));
});

test("accetta checksum Prisma LF o CRLF dello stesso SQL", () => {
  const sql = "CREATE TABLE \"Example\" (\"id\" TEXT NOT NULL);\n";
  const [lfChecksum, crlfChecksum] = calculateMigrationChecksums(sql);
  const local = { name: baseline.name, checksum: lfChecksum, compatibleChecksums: [crlfChecksum] };

  assert.doesNotThrow(() => validateMigrationHistory({
    applied: [{ name: baseline.name, checksum: crlfChecksum, finished: true, rolledBack: false }],
    local: [local],
    allowPending: false,
  }));
});

test("accetta un prefisso canonico con una migration pendente", () => {
  const result = validateMigrationHistory({
    applied: [{ ...baseline, finished: true, rolledBack: false }],
    local: [baseline, forward, mfa, privacy],
    allowPending: true,
  });
  assert.deepEqual(result.pending, [forward, mfa, privacy]);
});

test("rifiuta checksum divergenti", () => {
  assert.throws(
    () => validateMigrationHistory({
      applied: [{ ...baseline, checksum: "database", finished: true, rolledBack: false }],
      local: [baseline],
      allowPending: true,
    }),
    /Checksum divergente/,
  );
});

test("rifiuta storie senza prefisso comune", () => {
  assert.throws(
    () => validateMigrationHistory({
      applied: [{ name: "database_only", checksum: "x", finished: true, rolledBack: false }],
      local: [baseline],
      allowPending: true,
    }),
    /Cronologia divergente/,
  );
});

test("rifiuta migration fallite o pendenti nel gate finale", () => {
  assert.throws(
    () => validateMigrationHistory({
      applied: [{ ...baseline, finished: false, rolledBack: false }],
      local: [baseline],
      allowPending: true,
    }),
    /non completata/,
  );
  assert.throws(
    () => validateMigrationHistory({ applied: [], local: [baseline], allowPending: false }),
    /Migration pendenti/,
  );
});

test("limita la modalita CI al database locale qoovex_ci", () => {
  assert.doesNotThrow(() => assertCiEphemeralDatabase("postgresql://postgres:postgres@localhost:5432/qoovex_ci"));
  assert.throws(
    () => assertCiEphemeralDatabase("postgresql://postgres:postgres@localhost:5432/postgres"),
    /qoovex_ci/,
  );
  assert.throws(
    () => assertCiEphemeralDatabase("postgresql://postgres:postgres@db.example.com:5432/qoovex_ci"),
    /database locale/,
  );
});

test("richiede approvazione, prova di ripristino o reset vuoto e target esatto in produzione", () => {
  assert.throws(
    () => assertProductionApproval({ approved: undefined, backupRef: undefined, expectedLastMigration: undefined, lastMigration: privacy.name }),
    /APPROVED/,
  );
  assert.throws(
    () => assertProductionApproval({ approved: "1", backupRef: undefined, expectedLastMigration: privacy.name, lastMigration: privacy.name }),
    /BACKUP_REF|empty-database/,
  );
  assert.throws(
    () => assertProductionApproval({ approved: "1", backupRef: "dump-sha256", expectedLastMigration: baseline.name, lastMigration: privacy.name }),
    /Target inatteso/,
  );
  assert.doesNotThrow(
    () => assertProductionApproval({ approved: "1", backupRef: "dump-sha256", expectedLastMigration: privacy.name, lastMigration: privacy.name }),
  );
  assert.doesNotThrow(
    () => assertProductionApproval({
      approved: "1",
      backupRef: undefined,
      destructiveResetRef: VNEXT_EMPTY_DATABASE_RESET_REF,
      expectedLastMigration: VNEXT_EMPTY_DATABASE_MIGRATION,
      lastMigration: VNEXT_EMPTY_DATABASE_MIGRATION,
    }),
  );
});
