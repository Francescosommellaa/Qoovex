import { describe, expect, it } from "vitest";

import { estimatePasswordStrength } from "./password-strength";

describe("estimatePasswordStrength", () => {
  it("keeps empty, short and sufficiently varied passwords distinct", () => {
    expect(estimatePasswordStrength("")).toEqual({ label: "Non valutata", value: 0 });
    expect(estimatePasswordStrength("short").value).toBe(1);
    expect(estimatePasswordStrength("twelvecharsx")).toEqual({ label: "Buona", value: 2 });
    expect(estimatePasswordStrength("Qoovex-demo-2026")).toEqual({ label: "Forte", value: 3 });
  });

  it("treats the estimate as progressive guidance rather than validity", () => {
    expect(estimatePasswordStrength("abcdefghijklmn")).toEqual({ label: "Buona", value: 2 });
    expect(estimatePasswordStrength("Abcdef123456")).toEqual({ label: "Buona", value: 2 });
  });
});
