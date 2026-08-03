import assert from "node:assert/strict";
import test from "node:test";
import {
  recordDatabaseOperation,
  withDatabaseOperationMeasurement,
} from "../src/operation-metrics";

test("operation metrics stay disabled by default", async () => {
  const previous = process.env.QOOVEX_DB_OPERATION_METRICS;
  delete process.env.QOOVEX_DB_OPERATION_METRICS;
  try {
    const measured = await withDatabaseOperationMeasurement("dashboard", async () => {
      recordDatabaseOperation({ model: "Document", operation: "findMany", durationMs: 2 });
      return "ok";
    });
    assert.equal(measured.result, "ok");
    assert.equal(measured.measurement, null);
  } finally {
    if (previous === undefined) delete process.env.QOOVEX_DB_OPERATION_METRICS;
    else process.env.QOOVEX_DB_OPERATION_METRICS = previous;
  }
});

test("operation metrics aggregate safe metadata inside one async flow", async () => {
  const previous = process.env.QOOVEX_DB_OPERATION_METRICS;
  process.env.QOOVEX_DB_OPERATION_METRICS = "1";
  try {
    const measured = await withDatabaseOperationMeasurement("document-package-detail", async () => {
      recordDatabaseOperation({ model: "Document", operation: "findMany", durationMs: 2 });
      await Promise.resolve();
      recordDatabaseOperation({ model: "Document", operation: "findMany", durationMs: 3 });
      recordDatabaseOperation({ model: "Worker", operation: "findMany", durationMs: 1 });
      return 42;
    });

    assert.equal(measured.result, 42);
    assert.equal(measured.measurement?.total, 3);
    assert.deepEqual(measured.measurement?.operations.map(({ model, operation, count, durationMs }) => ({ model, operation, count, durationMs })), [
      { model: "Document", operation: "findMany", count: 2, durationMs: 5 },
      { model: "Worker", operation: "findMany", count: 1, durationMs: 1 },
    ]);
    assert.deepEqual(Object.keys(measured.measurement ?? {}).sort(), ["durationMs", "flow", "label", "operations", "total"]);
  } finally {
    if (previous === undefined) delete process.env.QOOVEX_DB_OPERATION_METRICS;
    else process.env.QOOVEX_DB_OPERATION_METRICS = previous;
  }
});

test("operation metrics reject arbitrary flow labels", async () => {
  await assert.rejects(
    withDatabaseOperationMeasurement("organization user@example.test", async () => undefined),
    /Invalid database measurement flow name/,
  );
});
