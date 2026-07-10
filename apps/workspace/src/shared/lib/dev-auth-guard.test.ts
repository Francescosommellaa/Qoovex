import { afterEach, describe, expect, it, vi } from "vitest";
import { isDevAuthAllowedForHost, isLocalDevHost } from "./dev-auth-guard";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("dev auth guard", () => {
  it("recognizes only loopback hosts", () => {
    expect(isLocalDevHost("localhost:3001")).toBe(true);
    expect(isLocalDevHost("127.0.0.1:3001")).toBe(true);
    expect(isLocalDevHost("[::1]:3001")).toBe(true);
    expect(isLocalDevHost("192.168.1.20:3001")).toBe(false);
    expect(isLocalDevHost("app.qoovex.com")).toBe(false);
  });

  it("allows dev auth only in local development", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("VERCEL_ENV", "");
    vi.stubEnv("NEXT_PHASE", "");
    expect(isDevAuthAllowedForHost("localhost:3001")).toBe(true);
    expect(isDevAuthAllowedForHost("10.0.0.2:3001")).toBe(false);

    vi.stubEnv("VERCEL", "1");
    expect(isDevAuthAllowedForHost("localhost:3001")).toBe(false);
  });
});
