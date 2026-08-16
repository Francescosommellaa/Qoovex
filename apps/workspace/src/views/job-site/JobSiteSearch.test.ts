import { describe, expect, it } from "vitest";
import { presentJobSiteSearchResult } from "./JobSiteSearch";

describe("presentazione dei risultati della ricerca cantiere", () => {
  it("usa titolo, stato e destinazione umani per una richiesta", () => {
    expect(presentJobSiteSearchResult({
      createdAt: "2026-08-16T10:00:00.000Z",
      id: "request-internal-id",
      resultType: "request",
      status: "OPEN",
      title: "Confermare il materiale",
    }, { fileSectionId: "file", jobSitePath: "/job-sites/job-site-internal-id" })).toEqual({
      date: "16 ago 2026",
      detail: "Richiesta aperta",
      href: "/job-sites/job-site-internal-id#richieste",
      title: "Confermare il materiale",
      typeLabel: "Richiesta",
    });
  });

  it("porta un file alla sezione corretta per Azienda e Cliente", () => {
    const item = { id: "file-internal-id", originalFileName: "preventivo.pdf", resultType: "attachment" };
    expect(presentJobSiteSearchResult(item, { fileSectionId: "file", jobSitePath: "/job-sites/site" }).href).toBe("/job-sites/site#file");
    expect(presentJobSiteSearchResult(item, { fileSectionId: "documenti", jobSitePath: "/client/job-sites/site" }).href).toBe("/client/job-sites/site#documenti");
  });

  it("non espone valori tecnici non riconosciuti", () => {
    const result = presentJobSiteSearchResult({ id: "record-internal-id", resultType: "BACKEND_ONLY" }, { fileSectionId: "file", jobSitePath: "/job-sites/site" });
    expect(result).toMatchObject({ detail: null, href: "/job-sites/site#riepilogo", title: "Risultato", typeLabel: "Risultato" });
    expect(JSON.stringify(result)).not.toContain("BACKEND_ONLY");
    expect(JSON.stringify(result)).not.toContain("record-internal-id");
  });
});
