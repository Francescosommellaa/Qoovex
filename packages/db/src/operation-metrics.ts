import { AsyncLocalStorage } from "node:async_hooks";

export interface DatabaseOperationMetric {
  model: string;
  operation: string;
  count: number;
  durationMs: number;
}

export interface DatabaseOperationMeasurement {
  label: "Prisma Client calls - proxy, non metrica ufficiale Prisma Postgres";
  flow: string;
  total: number;
  durationMs: number;
  operations: DatabaseOperationMetric[];
}

interface MutableDatabaseOperationMeasurement {
  flow: string;
  startedAt: number;
  total: number;
  operations: Map<string, DatabaseOperationMetric>;
}

const operationMeasurementStorage = new AsyncLocalStorage<MutableDatabaseOperationMeasurement>();
const SAFE_FLOW_NAME = /^[a-z0-9][a-z0-9:_-]{0,79}$/i;

export function isDatabaseOperationMetricsEnabled() {
  return process.env.QOOVEX_DB_OPERATION_METRICS === "1";
}

export function recordDatabaseOperation(input: { model?: string; operation: string; durationMs: number }) {
  if (!isDatabaseOperationMetricsEnabled()) return;
  const measurement = operationMeasurementStorage.getStore();
  if (!measurement) return;
  const model = input.model ?? "client";
  const key = `${model}:${input.operation}`;
  const current = measurement.operations.get(key) ?? {
    model,
    operation: input.operation,
    count: 0,
    durationMs: 0,
  };
  current.count += 1;
  current.durationMs += input.durationMs;
  measurement.operations.set(key, current);
  measurement.total += 1;
}

export async function withDatabaseOperationMeasurement<T>(flow: string, run: () => Promise<T>) {
  if (!SAFE_FLOW_NAME.test(flow)) throw new Error("[qoovex/db] Invalid database measurement flow name.");
  if (!isDatabaseOperationMetricsEnabled()) {
    return { result: await run(), measurement: null };
  }

  const startedAt = performance.now();
  const state: MutableDatabaseOperationMeasurement = {
    flow,
    startedAt,
    total: 0,
    operations: new Map(),
  };
  const result = await operationMeasurementStorage.run(state, run);
  const measurement: DatabaseOperationMeasurement = {
    label: "Prisma Client calls - proxy, non metrica ufficiale Prisma Postgres",
    flow,
    total: state.total,
    durationMs: performance.now() - startedAt,
    operations: [...state.operations.values()].sort((left, right) =>
      left.model.localeCompare(right.model) || left.operation.localeCompare(right.operation)),
  };
  return { result, measurement };
}
