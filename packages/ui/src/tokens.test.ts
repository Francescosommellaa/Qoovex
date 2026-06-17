import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const tokenFile = resolve(__dirname, "../styles/tokens.css");
const baseFile = resolve(__dirname, "../styles/base.css");

describe("fondazioni Calore Misurato", () => {
  it("espone token semantici per le tre modalita operative", () => {
    const css = readFileSync(tokenFile, "utf8");

    expect(css).toContain("--qv-action-primary-bg");
    expect(css).toContain('[data-qv-mode="kitchen"]');
    expect(css).toContain('[data-qv-mode="review"]');
    expect(css).not.toMatch(/crystal|glass/i);
  });

  it("mantiene gli stili base senza classi componente", () => {
    const css = readFileSync(baseFile, "utf8");

    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).not.toMatch(/\\.qv-(button|card|surface|dialog)/);
  });
});
