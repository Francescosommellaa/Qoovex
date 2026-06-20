import { describe, expect, it } from "vitest";

import { qoovexTokens } from "./tokens";

describe("qoovexTokens", () => {
  it("mantiene il target operativo a 48 px", () => {
    expect(qoovexTokens.target.minimum).toBe(48);
  });

  it("mantiene distinti pronto, attenzione e critico", () => {
    expect(new Set([qoovexTokens.color.ready, qoovexTokens.color.attention, qoovexTokens.color.critical]).size).toBe(3);
  });
});
