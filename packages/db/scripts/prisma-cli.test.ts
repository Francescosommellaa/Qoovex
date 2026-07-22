import assert from "node:assert/strict";
import test from "node:test";
import { spawnPrisma } from "./prisma-cli";

test("spawnPrisma launches the local Prisma CLI without a package-manager shim", () => {
  const result = spawnPrisma(["--version"]);

  assert.ifError(result.error);
  assert.equal(result.status, 0);
  assert.match(`${result.stdout}${result.stderr}`, /prisma\s+:/iu);
});
