import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { PrismaClient } from "../generated/prisma/client";

export interface LocalMigration {
  name: string;
  checksum: string;
}

export interface AppliedMigration {
  name: string;
  checksum: string;
  finished: boolean;
  rolledBack: boolean;
}

export interface MigrationHistoryResult {
  applied: AppliedMigration[];
  local: LocalMigration[];
  pending: LocalMigration[];
}

const PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const MIGRATIONS_DIRECTORY = path.join(PACKAGE_ROOT, "prisma", "migrations");

export async function readLocalMigrations(directory = MIGRATIONS_DIRECTORY) {
  const entries = await readdir(directory, { withFileTypes: true });
  const names = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  return await Promise.all(
    names.map(async (name): Promise<LocalMigration> => {
      const sql = await readFile(path.join(directory, name, "migration.sql"));
      return {
        name,
        checksum: createHash("sha256").update(sql).digest("hex"),
      };
    }),
  );
}

export function validateMigrationHistory(input: {
  applied: AppliedMigration[];
  local: LocalMigration[];
  allowPending: boolean;
}): MigrationHistoryResult {
  const { applied, local, allowPending } = input;
  const incomplete = applied.find((migration) => !migration.finished || migration.rolledBack);
  if (incomplete) {
    throw new Error(`[prisma-history] Migration non completata: ${incomplete.name}.`);
  }
  if (applied.length > local.length) {
    throw new Error("[prisma-history] Il database contiene piu migration della storia locale.");
  }

  for (const [index, databaseMigration] of applied.entries()) {
    const localMigration = local[index];
    if (!localMigration || localMigration.name !== databaseMigration.name) {
      throw new Error(
        `[prisma-history] Cronologia divergente alla posizione ${index + 1}: database=${databaseMigration.name}, locale=${localMigration?.name ?? "mancante"}.`,
      );
    }
    if (localMigration.checksum !== databaseMigration.checksum) {
      throw new Error(`[prisma-history] Checksum divergente per ${databaseMigration.name}.`);
    }
  }

  const pending = local.slice(applied.length);
  if (!allowPending && pending.length > 0) {
    throw new Error(`[prisma-history] Migration pendenti: ${pending.map(({ name }) => name).join(", ")}.`);
  }
  return { applied, local, pending };
}

export async function readAppliedMigrations(prisma: PrismaClient): Promise<AppliedMigration[]> {
  const table = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `SELECT to_regclass('public."_prisma_migrations"') IS NOT NULL AS "exists"`,
  );
  if (!table[0]?.exists) return [];

  const rows = await prisma.$queryRawUnsafe<
    Array<{
      migration_name: string;
      checksum: string;
      finished_at: Date | null;
      rolled_back_at: Date | null;
    }>
  >(
    `SELECT migration_name, checksum, finished_at, rolled_back_at
     FROM "_prisma_migrations"
     ORDER BY started_at ASC`,
  );

  return rows.map((row) => ({
    name: row.migration_name,
    checksum: row.checksum,
    finished: row.finished_at !== null,
    rolledBack: row.rolled_back_at !== null,
  }));
}

export async function inspectMigrationHistory(
  prisma: PrismaClient,
  options: { allowPending: boolean },
) {
  return validateMigrationHistory({
    applied: await readAppliedMigrations(prisma),
    local: await readLocalMigrations(),
    allowPending: options.allowPending,
  });
}

