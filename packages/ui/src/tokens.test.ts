import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const tokenFile = resolve(__dirname, "../styles/tokens.css");
const baseFile = resolve(__dirname, "../styles/base.css");

describe("Measured Heat foundations", () => {
  it("exposes semantic tokens for the three operating modes", () => {
    const css = readFileSync(tokenFile, "utf8");

    expect(css).toContain("--qv-action-primary-bg");
    expect(css).toContain('[data-qv-mode="kitchen"]');
    expect(css).toContain('[data-qv-mode="review"]');
    expect(css).not.toMatch(/crystal|glass/i);
  });

  it("keeps base styles component-free", () => {
    const css = readFileSync(baseFile, "utf8");

    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).not.toMatch(/\\.qv-(button|card|surface|dialog)/);
  });
});
