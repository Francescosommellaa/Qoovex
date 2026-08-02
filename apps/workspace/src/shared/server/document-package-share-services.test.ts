import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@qoovex/db", () => ({ db: {} }));
vi.mock("@shared/server/domain-access-service", () => ({ requireOrganizationDomainAccess: vi.fn() }));
vi.mock("@shared/server/operational-process-service", () => ({ enqueueOperationalProcess: vi.fn() }));
vi.mock("@shared/server/product-audit-service", () => ({ auditActorFromContext: vi.fn() }));
vi.mock("@shared/server/support-access-service", () => ({ recordSupportAccess: vi.fn() }));

import { buildDocumentPackageRevisionManifest } from "./document-package-share-proposal-service";
import { hashShareToken } from "./share-token-service";

const now = new Date("2026-07-27T10:00:00.000Z");

function packageRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "package-1",
    organizationId: "org-1",
    title: "Pacchetto ingresso",
    description: "Condivisione controllata",
    status: "DRAFT" as const,
    updatedAt: now,
    archivedAt: null,
    items: [],
    ...overrides,
  };
}

describe("document package immutable revision manifest", () => {
  it("freezes only allow-listed metadata and never exposes Blob keys", () => {
    const manifest = buildDocumentPackageRevisionManifest(packageRecord({
      items: [{
        id: "item-1",
        itemType: "DOCUMENT_VERSION",
        position: 0,
        note: null,
        documentId: null,
        documentVersionId: "version-1",
        evidenceId: null,
        checklistId: null,
        createdAt: now,
        document: null,
        documentVersion: {
          id: "version-1",
          originalFileName: "duvri.pdf",
          mimeType: "application/pdf",
          size: 128,
          reviewStatus: "CURRENT",
          archivedAt: null,
          document: {
            id: "document-1",
            title: "DUVRI",
            status: "VALID",
            expiryDate: new Date("2027-07-27T10:00:00.000Z"),
            archivedAt: null,
            documentType: { categoryKey: "SAFETY", sensitivity: "STANDARD" },
          },
        },
        evidence: null,
        checklist: null,
      }],
    }) as never, now);

    expect(manifest.items).toEqual([expect.objectContaining({
      sourceItemId: "item-1",
      documentVersionId: "version-1",
      title: "DUVRI",
      included: true,
      hasFile: true,
    })]);
    expect(manifest.issues).toEqual([]);
    expect(JSON.stringify(manifest)).not.toContain("blobKey");
  });

  it("blocks archived or non-standard document references instead of substituting them", () => {
    const manifest = buildDocumentPackageRevisionManifest(packageRecord({
      items: [{
        id: "item-sensitive",
        itemType: "DOCUMENT",
        position: 0,
        note: null,
        documentId: "document-sensitive",
        documentVersionId: null,
        evidenceId: null,
        checklistId: null,
        createdAt: now,
        document: {
          id: "document-sensitive",
          title: "Documento riservato",
          status: "VALID",
          expiryDate: null,
          archivedAt: now,
          documentType: { categoryKey: "SAFETY", sensitivity: "RESTRICTED" },
        },
        documentVersion: null,
        evidence: null,
        checklist: null,
      }],
    }) as never, now);

    expect(manifest.items[0]).toMatchObject({ included: false, documentId: "document-sensitive" });
    expect(manifest.issues.map((item) => item.code)).toEqual(expect.arrayContaining(["ARCHIVED_REFERENCE", "SENSITIVE_DOCUMENT"]));
  });

  it("keeps an expired document in review and records attention without silently excluding it", () => {
    const manifest = buildDocumentPackageRevisionManifest(packageRecord({ items: [{
      id: "expired", itemType: "DOCUMENT", position: 0, note: null, documentId: "doc-expired", documentVersionId: null, evidenceId: null, checklistId: null, createdAt: now,
      document: { id: "doc-expired", title: "DURC", status: "EXPIRED", expiryDate: new Date("2026-07-01T00:00:00.000Z"), archivedAt: null, documentType: { categoryKey: "COMPANY_IDENTITY_REGISTRATIONS", sensitivity: "STANDARD" } },
      documentVersion: null, evidence: null, checklist: null,
    }] }) as never, now);
    expect(manifest.items[0]).toMatchObject({ included: true, title: "DURC" });
    expect(manifest.issues).toEqual([expect.objectContaining({ code: "EXPIRED_DOCUMENT", severity: "ATTENTION" })]);
  });

  it("marks a document to review without granting automatic authority", () => {
    const manifest = buildDocumentPackageRevisionManifest(packageRecord({ items: [{
      id: "review", itemType: "DOCUMENT", position: 0, note: null, documentId: "doc-review", documentVersionId: null, evidenceId: null, checklistId: null, createdAt: now,
      document: { id: "doc-review", title: "Attestato", status: "TO_REVIEW", expiryDate: null, archivedAt: null, documentType: { categoryKey: "TRAINING", sensitivity: "STANDARD" } },
      documentVersion: null, evidence: null, checklist: null,
    }] }) as never, now);
    expect(manifest.items[0].included).toBe(true);
    expect(manifest.issues[0]).toMatchObject({ code: "DOCUMENT_TO_VERIFY", severity: "ATTENTION" });
  });

  it("includes an active evidence reference while retaining only mediated file metadata", () => {
    const manifest = buildDocumentPackageRevisionManifest(packageRecord({ items: [{
      id: "evidence", itemType: "EVIDENCE", position: 0, note: null, documentId: null, documentVersionId: null, evidenceId: "evidence-1", checklistId: null, createdAt: now,
      document: null, documentVersion: null, evidence: { id: "evidence-1", title: "Foto accesso", type: "PHOTO", sensitivity: "SHAREABLE", reviewStatus: "ACCEPTED", originalFileName: "accesso.jpg", mimeType: "image/jpeg", size: 42, blobKey: "secret/blob/key", archivedAt: null }, checklist: null,
    }] }) as never, now);
    expect(manifest.items[0]).toMatchObject({ included: true, hasFile: true, evidenceId: "evidence-1", originalFileName: "accesso.jpg" });
    expect(JSON.stringify(manifest)).not.toContain("secret/blob/key");
  });

  it("excludes archived evidence rather than switching to a newer file", () => {
    const manifest = buildDocumentPackageRevisionManifest(packageRecord({ items: [{
      id: "evidence", itemType: "EVIDENCE", position: 0, note: null, documentId: null, documentVersionId: null, evidenceId: "evidence-1", checklistId: null, createdAt: now,
      document: null, documentVersion: null, evidence: { id: "evidence-1", title: "Foto", type: "PHOTO", originalFileName: "foto.jpg", mimeType: "image/jpeg", size: 42, blobKey: "blob", archivedAt: now }, checklist: null,
    }] }) as never, now);
    expect(manifest.items[0]).toMatchObject({ included: false, evidenceId: "evidence-1" });
    expect(manifest.issues[0].code).toBe("MISSING_REFERENCE");
  });

  it("freezes an active checklist by identifier and display snapshot", () => {
    const manifest = buildDocumentPackageRevisionManifest(packageRecord({ items: [{
      id: "checklist", itemType: "CHECKLIST", position: 0, note: null, documentId: null, documentVersionId: null, evidenceId: null, checklistId: "checklist-1", createdAt: now,
      document: null, documentVersion: null, evidence: null, checklist: { id: "checklist-1", name: "Apertura cantiere", status: "ACTIVE", archivedAt: null },
    }] }) as never, now);
    expect(manifest.items[0]).toMatchObject({ included: true, checklistId: "checklist-1", title: "Apertura cantiere" });
  });

  it("excludes archived checklists and reports a blocking issue", () => {
    const manifest = buildDocumentPackageRevisionManifest(packageRecord({ items: [{
      id: "checklist", itemType: "CHECKLIST", position: 0, note: null, documentId: null, documentVersionId: null, evidenceId: null, checklistId: "checklist-1", createdAt: now,
      document: null, documentVersion: null, evidence: null, checklist: { id: "checklist-1", name: "Apertura", status: "ARCHIVED", archivedAt: now },
    }] }) as never, now);
    expect(manifest.items[0].included).toBe(false);
    expect(manifest.issues[0]).toMatchObject({ code: "MISSING_REFERENCE", severity: "BLOCKING" });
  });

  it("keeps a note as an explicit non-file item", () => {
    const manifest = buildDocumentPackageRevisionManifest(packageRecord({ items: [{
      id: "note", itemType: "NOTE", position: 0, note: "Accesso solo su appuntamento", documentId: null, documentVersionId: null, evidenceId: null, checklistId: null, createdAt: now,
      document: null, documentVersion: null, evidence: null, checklist: null,
    }] }) as never, now);
    expect(manifest.items[0]).toMatchObject({ included: true, hasFile: false, note: "Accesso solo su appuntamento" });
  });
});

describe("share token storage", () => {
  it("produces a deterministic hash without retaining the raw token", () => {
    expect(hashShareToken("token-once")).toBe(hashShareToken("token-once"));
    expect(hashShareToken("token-once")).not.toContain("token-once");
  });

  it("produces different hashes for different one-time tokens", () => {
    expect(hashShareToken("token-one")).not.toBe(hashShareToken("token-two"));
  });
});

describe("DOCUMENT_PACKAGE_SHARING@1 implementation contract", () => {
  it("keeps every declared step owned by the canonical sharing service", () => {
    const source = readFileSync(resolve(process.cwd(), "src/shared/server/document-package-share-proposal-service.ts"), "utf8");
    for (const stepKey of ["capture-package", "validate-artifacts", "prepare-revision", "wait-for-approval", "activate-share"]) {
      expect(source).toContain(`\"${stepKey}\"`);
    }
    expect(source).toContain("Conferma autorizzata registrata.");
    expect(source).toContain("Link creato dalla revisione approvata.");
  });
});
