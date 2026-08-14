import { describe, expect, it } from "vitest";
import { prioritizeClientHomeJobSites } from "./client-home-work-queue";

describe("prioritizeClientHomeJobSites", () => {
  it("mantiene i lavori attivi davanti agli altri senza cambiare l'ordine all'interno dei gruppi", () => {
    const jobSites = [
      { id: "in-attesa", status: "PENDING_INITIAL_CONFIRMATION" },
      { id: "attivo-uno", status: "ACTIVE" },
      { id: "chiuso", status: "CLOSED" },
      { id: "attivo-due", status: "ACTIVE" },
    ];

    expect(prioritizeClientHomeJobSites(jobSites).map((jobSite) => jobSite.id)).toEqual(["attivo-uno", "attivo-due", "in-attesa", "chiuso"]);
  });
});
