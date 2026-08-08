import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("./access-errors", () => ({ AccessError: class AccessError extends Error { constructor(message: string, public readonly status: number, public readonly code?: string) { super(message); } } }));

import { decryptDataValue, encryptDataValue, paymentProfileAad } from "./data-encryption-service";

afterEach(() => {
  delete process.env.QOOVEX_DATA_ENCRYPTION_KEYS;
  delete process.env.QOOVEX_DATA_ENCRYPTION_ACTIVE_KEY_ID;
  delete process.env.AUTH_SECRET;
  delete process.env.QOOVEX_MFA_ENCRYPTION_KEY;
});

describe("dedicated current data encryption key ring", () => {
  it("round-trips with AES-256-GCM and AAD-bound context", () => {
    process.env.QOOVEX_DATA_ENCRYPTION_KEYS = JSON.stringify({ "test-v1": Buffer.alloc(32, 7).toString("base64") });
    process.env.QOOVEX_DATA_ENCRYPTION_ACTIVE_KEY_ID = "test-v1";
    const aad = paymentProfileAad("org-1", "profile-1", 1);
    const encrypted = encryptDataValue("IT60X0542811101000000123456", aad);
    expect(encrypted.keyId).toBe("test-v1");
    expect(encrypted.ciphertext).not.toContain("IT60");
    expect(decryptDataValue(encrypted, aad)).toBe("IT60X0542811101000000123456");
    expect(() => decryptDataValue(encrypted, paymentProfileAad("org-2", "profile-1", 1))).toThrow();
  });

  it("never falls back to Auth or MFA secrets", () => {
    process.env.AUTH_SECRET = Buffer.alloc(32, 1).toString("base64");
    process.env.QOOVEX_MFA_ENCRYPTION_KEY = Buffer.alloc(32, 2).toString("base64");
    expect(() => encryptDataValue("secret", Buffer.from("aad"))).toThrow(/Cifratura dati non configurata/);
  });
});
