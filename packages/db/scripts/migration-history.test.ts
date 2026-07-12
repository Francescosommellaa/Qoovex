import assert from "node:assert/strict";
import test from "node:test";

import { assertCiEphemeralDatabase, assertProductionApproval } from "./migration-deploy-guard";
import { validateMigrationHistory } from "./migration-history";

const baseline = { name: "20260712010000_single_company_baseline", checksum: "baseline" };
const forward = { name: "20260712020000_single_membership_forward", checksum: "forward" };

test("accetta un prefisso canonico con una migration pendente", () => {
  const result = validateMigrationHistory({
    applied: [{ ...baseline, finished: true, rolledBack: false }],
    local: [baseline, forward],
    allowPending: true,
  });
  assert.deepEqual(result.pending, [forward]);
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

test("richiede approvazione, backup e target esatto in produzione", () => {
  assert.throws(
    () => assertProductionApproval({ approved: undefined, backupRef: undefined, expectedLastMigration: undefined, lastMigration: forward.name }),
    /APPROVED/,
  );
  assert.throws(
    () => assertProductionApproval({ approved: "1", backupRef: undefined, expectedLastMigration: forward.name, lastMigration: forward.name }),
    /BACKUP_REF/,
  );
  assert.throws(
    () => assertProductionApproval({ approved: "1", backupRef: "dump-sha256", expectedLastMigration: baseline.name, lastMigration: forward.name }),
    /Target inatteso/,
  );
  assert.doesNotThrow(
    () => assertProductionApproval({ approved: "1", backupRef: "dump-sha256", expectedLastMigration: forward.name, lastMigration: forward.name }),
  );
});
