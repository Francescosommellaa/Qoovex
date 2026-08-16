import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Breadcrumb } from "@qoovex/ui/components/breadcrumb";
import { buildWorkspaceBreadcrumb } from "./workspace-breadcrumb-policy";

function labels(pathname: string, pageLabel: string | null = null, sectionLabel: string | null = null) {
  return buildWorkspaceBreadcrumb({ fallbackLabel: "Qoovex", pageLabel, pathname, sectionLabel });
}

describe("breadcrumb Workspace", () => {
  it("orienta home e lista cantieri senza livelli generici", () => {
    expect(labels("/")).toEqual([expect.objectContaining({ label: "Panoramica" })]);
    expect(labels("/job-sites")).toEqual([expect.objectContaining({ label: "Cantieri" })]);
    expect(labels("/client")).toEqual([expect.objectContaining({ label: "I tuoi lavori" })]);
  });

  it("usa il nome reale del cantiere Azienda e la sezione profonda", () => {
    expect(labels("/job-sites/internal-id", "Ristrutturazione via Roma", "Pagamenti")).toEqual([
      expect.objectContaining({ label: "Cantieri", href: "/job-sites" }),
      expect.objectContaining({ label: "Ristrutturazione via Roma", href: "/job-sites/internal-id", mobileBehavior: "back" }),
      expect.objectContaining({ label: "Pagamenti", mobileLabel: "Ristrutturazione via Roma · Pagamenti" }),
    ]);
  });

  it("usa il contesto Cliente e non espone l'identificativo nel testo", () => {
    const items = labels("/client/job-sites/internal-id", "Nuova cucina", "Decisioni");
    expect(items.map((item) => item.label)).toEqual(["Lavori", "Nuova cucina", "Decisioni"]);
    expect(items.map((item) => item.label).join(" ")).not.toContain("internal-id");
  });

  it("non duplica Panoramica nel dettaglio del cantiere", () => {
    expect(labels("/job-sites/internal-id", "Nuova cucina", "Panoramica").map((item) => item.label)).toEqual(["Cantieri", "Nuova cucina"]);
  });

  it("mantiene le configurazioni sotto un livello utile", () => {
    expect(labels("/account/notifications", "Preferenze notifiche")).toEqual([
      expect.objectContaining({ label: "Azienda e impostazioni", href: "/settings" }),
      expect.objectContaining({ label: "Preferenze notifiche" }),
    ]);
  });

  it("rende la pagina corrente come testo semantico, non come link", () => {
    const html = renderToStaticMarkup(createElement(Breadcrumb, { items: labels("/job-sites/internal-id", "Nuova cucina", "Pagamenti") }));
    expect(html).toContain('aria-label="Percorso di navigazione"');
    expect(html).toContain('aria-current="page"');
    expect(html).not.toContain('role="link"');
    expect(html).not.toContain('aria-disabled="true"');
  });
});
