import { describe, expect, it } from "vitest";
import { assertOperationalProcessTransition, assertOperationalStepTransition, getOperationalDefinition } from "./definitions";
import { getOperationalExecutionMode } from "./execution-policy";

describe("operational definitions", () => {
  it("keeps five versioned definitions aligned with the canonical package-sharing service", () => {
    expect(getOperationalDefinition("DOCUMENT_RECEIVED")).toMatchObject({ version: 1, steps: expect.any(Array) });
    expect(getOperationalDefinition("WORKER_CREATED").steps).toHaveLength(3);
    expect(getOperationalDefinition("JOB_SITE_CREATED").steps).toHaveLength(3);
    expect(getOperationalDefinition("CONTINUOUS_CONTROL").steps).toHaveLength(5);
    expect(getOperationalDefinition("DOCUMENT_PACKAGE_SHARING").steps.map((step) => step.key)).toEqual([
      "capture-package", "validate-artifacts", "prepare-revision", "wait-for-approval", "activate-share",
    ]);
  });

  it("rejects impossible lifecycle transitions", () => {
    expect(() => assertOperationalProcessTransition("RECEIVED", "COMPLETED")).toThrow("INVALID_OPERATIONAL_PROCESS_TRANSITION");
    expect(() => assertOperationalStepTransition("COMPLETED", "READY")).toThrow("INVALID_OPERATIONAL_STEP_TRANSITION");
    expect(() => assertOperationalProcessTransition("RECEIVED", "READY")).not.toThrow();
  });

  it("never makes sensitive or irreversible work automatic", () => {
    expect(getOperationalExecutionMode({ reliability: "VERIFIED", impact: "SENSITIVE", deterministic: true, reversible: true, authorized: true })).toBe("DECISION_REQUIRED");
    expect(getOperationalExecutionMode({ reliability: "VERIFIED", impact: "IRREVERSIBLE", deterministic: true, reversible: true, authorized: true })).toBe("FORBIDDEN");
    expect(getOperationalExecutionMode({ reliability: "HIGH", impact: "LOW", deterministic: true, reversible: true, authorized: true })).toBe("AUTOMATIC");
  });
});
