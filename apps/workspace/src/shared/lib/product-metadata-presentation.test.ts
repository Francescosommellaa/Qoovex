import { describe, expect, it } from "vitest";
import {
  formatDateTime,
  formatFileSize,
  presentDataInventoryCategory,
  presentProposalVersion,
} from "./product-metadata-presentation";

describe("product metadata presentation", () => {
  it("formats stored file sizes without exposing raw byte counts", () => {
    expect(formatFileSize(0)).toBe("0 KB");
    expect(formatFileSize(640)).toBe("Meno di 1 KB");
    expect(formatFileSize(1_500)).toBe("1,5 KB");
    expect(formatFileSize(2_500_000)).toBe("2,5 MB");
  });

  it("uses a neutral fallback for an invalid file size", () => {
    expect(formatFileSize(Number.NaN)).toBe("Dimensione non disponibile");
    expect(formatFileSize(-1)).toBe("Dimensione non disponibile");
  });

  it("formats file upload dates for people and safely falls back for invalid values", () => {
    expect(formatDateTime("2026-08-13T09:30:00.000Z")).toMatch(/13 ago 2026/);
    expect(formatDateTime("not-a-date")).toBe("Data non disponibile");
  });

  it("gives proposal versions the context users need", () => {
    expect(presentProposalVersion(1)).toBe("Proposta iniziale");
    expect(presentProposalVersion(3)).toBe("Proposta aggiornata");
    expect(presentProposalVersion(null)).toBe("Proposta");
  });

  it("presents data inventory keys without leaking backend property names", () => {
    expect(presentDataInventoryCategory("attachments")).toBe("File dei cantieri");
    expect(presentDataInventoryCategory("authSessions")).toBe("Sessioni di accesso");
    expect(presentDataInventoryCategory("futureBackendKey")).toBe("Altri dati");
  });
});
