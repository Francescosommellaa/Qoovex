import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@shared/server/access-errors", () => ({
  AccessError: class AccessError extends Error {
    constructor(message: string, public readonly status: number) {
      super(message);
    }
  },
}));

import { validateBinaryFileContent } from "./file-content-validation";

const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
const png = Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nWQAAAAASUVORK5CYII=", "base64"));

describe("binary file content validation", () => {
  it.each([
    ["application/pdf", [0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]],
    ["image/jpeg", [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]],
    ["image/png", png],
    ["image/webp", [0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]],
  ])("accepts detected %s content", async (mimeType, bytes) => {
    await expect(validateBinaryFileContent(Buffer.from(bytes), mimeType, allowed)).resolves.toBe(mimeType);
  });

  it("rejects spoofed and unknown content", async () => {
    await expect(validateBinaryFileContent(Buffer.from(png), "image/jpeg", allowed)).rejects.toMatchObject({ status: 409 });
    await expect(validateBinaryFileContent(Buffer.from("<html>not a pdf</html>"), "application/pdf", allowed)).rejects.toMatchObject({ status: 409 });
  });
});
