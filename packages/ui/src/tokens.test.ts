import { describe, expect, it } from "vitest";

import { qoovexTokens } from "./tokens";

function relativeLuminance(hex: string) {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);

  if (!channels || channels.length !== 3) throw new Error(`Colore hex non valido: ${hex}`);
  return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
}

function contrastRatio(foreground: string, background: string) {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

describe("qoovexTokens", () => {
  it("mantiene il target operativo a 48 px", () => {
    expect(qoovexTokens.target.minimum).toBe(48);
  });

  it("usa le famiglie Fontshare canoniche senza perdere il font dati", () => {
    expect(qoovexTokens.font.family.display).toContain("Cabinet Grotesk");
    expect(qoovexTokens.font.family.body).toContain("General Sans");
    expect(qoovexTokens.font.family.data).toContain("IBM Plex Mono");
  });

  it("espone tutte le categorie foundation", () => {
    expect(qoovexTokens).toMatchObject({
      color: { primitive: {}, semantic: {} },
      font: { family: {}, size: {}, lineHeight: {}, weight: {}, letterSpacing: {} },
      space: {},
      radius: {},
      border: {},
      opacity: {},
      blur: {},
      shadow: {},
      motion: {},
      zIndex: {},
      breakpoint: {},
      layout: {},
    });
  });

  it("mantiene distinti successo, warning, pericolo e informazione", () => {
    const { danger, info, success, warning } = qoovexTokens.color.semantic;
    expect(new Set([success, warning, danger, info]).size).toBe(4);
  });

  it("ordina i breakpoint dal mobile al wide", () => {
    const values = Object.values(qoovexTokens.breakpoint).map((value) => Number.parseFloat(value));
    expect(values).toEqual([...values].sort((left, right) => left - right));
  });

  it.each([
    ["foreground/background", qoovexTokens.color.semantic.foreground, qoovexTokens.color.semantic.background],
    ["accent", qoovexTokens.color.semantic.accentForeground, qoovexTokens.color.semantic.accent],
    ["danger", qoovexTokens.color.semantic.dangerForeground, qoovexTokens.color.semantic.danger],
    ["warning", qoovexTokens.color.semantic.warningForeground, qoovexTokens.color.semantic.warning],
    ["success", qoovexTokens.color.semantic.successForeground, qoovexTokens.color.semantic.success],
    ["info", qoovexTokens.color.semantic.infoForeground, qoovexTokens.color.semantic.info],
  ])("garantisce contrasto AA per %s", (_name, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
  });
});
