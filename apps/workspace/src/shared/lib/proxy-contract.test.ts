import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Workspace proxy contract", () => {
  const source = readFileSync(resolve(process.cwd(), "src/proxy.ts"), "utf8");

  it("redirects protected pages with a relative callback", () => {
    expect(source).toContain('new URL("/sign-in", request.url)');
    expect(source).toContain('"callbackUrl"');
    expect(source).toContain('"/dashboard/:path*"');
    expect(source).toContain('"/documents/:path*"');
    expect(source).toContain('"/calendar/:path*"');
    expect(source).toContain('"/workers/:path*"');
  });

  it("keeps API auth narrow so unknown API routes reach Next.js 404", () => {
    expect(source).not.toContain('["/api/:path*"]');
    expect(source).toContain('pathname.startsWith("/api/")');
    expect(source).toContain('{ status: 401 }');
  });
});
