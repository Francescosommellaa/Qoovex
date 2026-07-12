import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schema = readFileSync(resolve(process.cwd(), "../../packages/db/prisma/schema.prisma"), "utf8");

describe("single-company baseline", () => {
  it("stores the only company and role directly on User", () => {
    expect(schema).toContain("organizationId             String?");
    expect(schema).toContain("organizationRole           OrganizationRole?");
  });
});
