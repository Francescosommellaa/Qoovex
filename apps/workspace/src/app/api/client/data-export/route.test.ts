import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  asJobSiteApiError: vi.fn(),
  buildClientDataExport: vi.fn(),
}));

vi.mock("@shared/server/client-job-site-export-service", () => ({ buildClientDataExport: mocks.buildClientDataExport }));
vi.mock("@shared/server/job-site-api-response", () => ({ asJobSiteApiError: mocks.asJobSiteApiError }));

import { GET } from "./route";

describe("GET /api/client/data-export", () => {
  it("mantiene il download diretto dei dati personali", async () => {
    mocks.buildClientDataExport.mockResolvedValueOnce({ profile: { email: "cliente@example.com" } });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-disposition")).toMatch(/^attachment; filename="qoovex-client-data-\d+\.json"$/);
    await expect(response.json()).resolves.toEqual({ profile: { email: "cliente@example.com" } });
  });

  it("mantiene la risposta di errore del flusso esistente", async () => {
    const failure = new Error("non disponibile");
    const errorResponse = Response.json({ error: { message: "Operazione non disponibile." } }, { status: 403 });
    mocks.buildClientDataExport.mockRejectedValueOnce(failure);
    mocks.asJobSiteApiError.mockReturnValueOnce(errorResponse);

    await expect(GET()).resolves.toBe(errorResponse);
    expect(mocks.asJobSiteApiError).toHaveBeenCalledWith(failure);
  });
});
