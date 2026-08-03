import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { isAuthorizedCronRequest } from "./cron-auth";

describe("cron auth", () => {
  afterEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("accepts only the exact Bearer secret", () => {
    process.env.CRON_SECRET = "cron-secret-long-enough-for-tests";
    expect(isAuthorizedCronRequest(new Request("https://app.qoovex.com", {
      headers: { authorization: "Bearer cron-secret-long-enough-for-tests" },
    }))).toBe(true);
    expect(isAuthorizedCronRequest(new Request("https://app.qoovex.com?secret=cron-secret-long-enough-for-tests", {
      headers: { "x-qoovex-cron-secret": "cron-secret-long-enough-for-tests" },
    }))).toBe(false);
    expect(isAuthorizedCronRequest(new Request("https://app.qoovex.com", {
      headers: { authorization: "Bearer wrong" },
    }))).toBe(false);
  });
});
