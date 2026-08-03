import "server-only";

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { AccessError } from "./access-errors";

type EncryptedValue = { ciphertext: string; nonce: string; authTag: string; keyId: string };

function getKeyRing() {
  const raw = process.env.QOOVEX_DATA_ENCRYPTION_KEYS?.trim();
  const activeKeyId = process.env.QOOVEX_DATA_ENCRYPTION_ACTIVE_KEY_ID?.trim();
  if (!raw || !activeKeyId) throw new AccessError("Cifratura dati non configurata.", 409, "DATA_ENCRYPTION_NOT_CONFIGURED");
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new AccessError("Key ring dati non valido.", 409, "DATA_ENCRYPTION_NOT_CONFIGURED"); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new AccessError("Key ring dati non valido.", 409, "DATA_ENCRYPTION_NOT_CONFIGURED");
  const keys = new Map<string, Buffer>();
  for (const [keyId, encoded] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof encoded !== "string") throw new AccessError("Key ring dati non valido.", 409, "DATA_ENCRYPTION_NOT_CONFIGURED");
    const key = Buffer.from(encoded, "base64");
    if (key.byteLength !== 32) throw new AccessError("Ogni chiave dati deve contenere 32 byte.", 409, "DATA_ENCRYPTION_NOT_CONFIGURED");
    keys.set(keyId, key);
  }
  if (!keys.has(activeKeyId)) throw new AccessError("Chiave dati attiva non disponibile.", 409, "DATA_ENCRYPTION_NOT_CONFIGURED");
  return { keys, activeKeyId };
}

export function paymentProfileAad(organizationId: string, profileId: string, version: number) {
  return Buffer.from(`qoovex:payment-profile:${organizationId}:${profileId}:v${version}`, "utf8");
}

export function encryptDataValue(plaintext: string, aad: Buffer): EncryptedValue {
  const { keys, activeKeyId } = getKeyRing();
  const key = keys.get(activeKeyId)!;
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return { ciphertext: ciphertext.toString("base64"), nonce: nonce.toString("base64"), authTag: cipher.getAuthTag().toString("base64"), keyId: activeKeyId };
}

export function decryptDataValue(value: EncryptedValue, aad: Buffer) {
  const { keys } = getKeyRing();
  const key = keys.get(value.keyId);
  if (!key) throw new AccessError("Chiave dati storica non disponibile.", 409, "DATA_ENCRYPTION_KEY_MISSING");
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(value.nonce, "base64"));
  decipher.setAAD(aad);
  decipher.setAuthTag(Buffer.from(value.authTag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(value.ciphertext, "base64")), decipher.final()]).toString("utf8");
}
