import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { canonicalize, fingerprintPayload, initialAgreementPayloadSchema, proposalPayloadSchema, jobSiteActionInputSchema } from "./job-site-contracts";

describe("current versioned public contracts", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("canonicalizes keys and BigInt deterministically", () => {
    expect(canonicalize({ z: BigInt(2), a: { y: 1, x: true } })).toEqual({ a: { x: true, y: 1 }, z: "2" });
    expect(fingerprintPayload({ b: 2, a: 1 })).toBe(fingerprintPayload({ a: 1, b: 2 }));
  });

  it("rejects unversioned or extended agreement snapshots", () => {
    const valid = { schemaVersion: 1, name: "Casa", address: null, description: null, participantSummary: [], initialEstimateMinor: null, estimatedCompletionAt: null, sharedCommercialNotes: null };
    expect(initialAgreementPayloadSchema.safeParse(valid).success).toBe(true);
    expect(initialAgreementPayloadSchema.safeParse({ ...valid, schemaVersion: 2 }).success).toBe(false);
    expect(initialAgreementPayloadSchema.safeParse({ ...valid, hidden: true }).success).toBe(false);
  });

  it("serializes money from strings and forbids generic actions", () => {
    const payment = jobSiteActionInputSchema.parse({ action: "PAYMENT_REQUEST_CREATE@1", expectedRevision: 1, paymentProfileId: "profile", amountMinor: "12345", reason: "Acconto", dueAt: null, stepIds: [], proposalIds: [] });
    expect(payment.action).toBe("PAYMENT_REQUEST_CREATE@1");
    if (payment.action === "PAYMENT_REQUEST_CREATE@1") expect(payment.amountMinor).toBe(BigInt(12345));
    expect(jobSiteActionInputSchema.safeParse({ action: "GENERIC_UPDATE", expectedRevision: 1 }).success).toBe(false);
  });

  it("requires coherent economic proposal snapshots", () => {
    const base = { schemaVersion: 1, changeSummary: "Sostituire materiale", reason: "Disponibilita", affectedStepIds: [], previousPriceMinor: "10000", scheduleImpact: null, estimatedCompletionAt: null, collaboratorParticipantIds: [], conditions: null };
    expect(proposalPayloadSchema.safeParse({ ...base, priceMode: "NO_PRICE_CHANGE", economicDeltaMinor: null, rangeMinimumMinor: null, rangeMaximumMinor: null }).success).toBe(true);
    expect(proposalPayloadSchema.safeParse({ ...base, priceMode: "FIXED_DELTA", economicDeltaMinor: null, rangeMinimumMinor: null, rangeMaximumMinor: null }).success).toBe(false);
    expect(proposalPayloadSchema.safeParse({ ...base, priceMode: "FIXED_DELTA", economicDeltaMinor: "-500", rangeMinimumMinor: null, rangeMaximumMinor: null }).success).toBe(true);
    expect(proposalPayloadSchema.safeParse({ ...base, priceMode: "RANGE", economicDeltaMinor: null, rangeMinimumMinor: "9000", rangeMaximumMinor: "8000" }).success).toBe(false);
  });
});
