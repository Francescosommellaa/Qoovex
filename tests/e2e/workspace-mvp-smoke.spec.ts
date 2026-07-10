import { expect, test, type APIRequestContext, type APIResponse, type Page } from "@playwright/test";

type JsonRecord = Record<string, unknown>;

const workspacePages = [
  "/dashboard",
  "/workers",
  "/job-sites",
  "/documents",
  "/deadlines",
  "/checklists",
  "/evidence",
  "/document-packages",
  "/data-control",
] as const;

async function json(response: APIResponse): Promise<JsonRecord> {
  return await response.json() as JsonRecord;
}

async function expectJson(response: APIResponse, status: number): Promise<JsonRecord> {
  const body = await json(response);
  expect(response.status(), JSON.stringify(body)).toBe(status);
  return body;
}

async function pageJsonRequest(page: Page, method: string, url: string, data?: JsonRecord, expectedStatus = 200): Promise<JsonRecord> {
  const result = await page.evaluate(async ({ body, expectedMethod, targetUrl }) => {
    const response = await fetch(targetUrl, {
      method: expectedMethod,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);
    return { status: response.status, body: payload };
  }, { body: data, expectedMethod: method, targetUrl: url });
  expect(result.status, JSON.stringify(result.body)).toBe(expectedStatus);
  return result.body as JsonRecord;
}

async function pagePostJson(page: Page, url: string, data?: JsonRecord): Promise<JsonRecord> {
  return pageJsonRequest(page, "POST", url, data, 201);
}

async function getContext(page: Page): Promise<JsonRecord> {
  return pageJsonRequest(page, "GET", "/api/context");
}

async function ensureOrganization(page: Page, runId: string): Promise<JsonRecord> {
  let context = await getContext(page);
  if (!context.membership) {
    const response = await page.evaluate(async (name) => {
      const result = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      return { status: result.status, body: await result.json().catch(() => null) };
    }, `Qoovex E2E ${runId}`);
    expect([201, 409], JSON.stringify(response.body)).toContain(response.status);
    context = await getContext(page);
  }

  const membership = context.membership as JsonRecord | null;
  const organization = membership?.organization as JsonRecord | undefined;
  expect(organization?.id).toEqual(expect.any(String));
  expect(organization?.code).toEqual(expect.any(String));
  return organization;
}

async function createDomainData(page: Page, runId: string) {
  const worker = await pagePostJson(page, "/api/workers", {
    displayName: `Operatore E2E ${runId}`,
    roleLabel: "Addetto cantiere",
  });
  const jobSite = await pagePostJson(page, "/api/job-sites", {
    name: `Cantiere E2E ${runId}`,
    address: "Via Test 1",
    clientName: "Cliente E2E",
  });
  const documentType = await pagePostJson(page, "/api/document-types", {
    name: `Tipo documento E2E ${runId}`,
    appliesTo: "JOB_SITE",
    requiresExpiryDate: true,
  });
  const document = await pagePostJson(page, "/api/documents", {
    title: `Documento E2E ${runId}`,
    documentTypeId: documentType.id,
    ownerType: "JOB_SITE",
    jobSiteId: jobSite.id,
    status: "TO_REVIEW",
  });
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const deadline = await pagePostJson(page, "/api/deadlines", {
    title: `Scadenza E2E ${runId}`,
    dueDate,
    sourceType: "DOCUMENT",
    documentId: document.id,
    jobSiteId: jobSite.id,
  });
  const checklist = await pagePostJson(page, "/api/checklists", {
    name: `Checklist E2E ${runId}`,
    jobSiteId: jobSite.id,
  });
  const checklistItem = await pagePostJson(page, `/api/checklists/${checklist.id}/items`, {
    label: `Voce E2E ${runId}`,
  });
  const evidenceResponse = await pagePostJson(page, "/api/evidence", {
    type: "NOTE",
    title: `Prova E2E ${runId}`,
    description: "Nota operativa creata dallo smoke e2e.",
    jobSiteId: jobSite.id,
    checklistItemId: checklistItem.id,
  });
  const evidence = evidenceResponse.evidence as JsonRecord;
  const documentPackage = await pagePostJson(page, "/api/document-packages", {
    title: `Pacchetto E2E ${runId}`,
    description: "Pacchetto creato dallo smoke e2e.",
    jobSiteId: jobSite.id,
    status: "READY_FOR_REVIEW",
  });
  await pagePostJson(page, `/api/document-packages/${documentPackage.id}/items`, {
    itemType: "NOTE",
    note: `Nota pacchetto E2E ${runId}`,
  });

  for (const created of [worker, jobSite, documentType, document, deadline, checklist, checklistItem, evidence, documentPackage]) {
    expect(created.id).toEqual(expect.any(String));
  }

  return { documentPackage };
}

async function verifyWorkspacePages(page: Page) {
  for (const path of workspacePages) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), path).toBeLessThan(400);
    await expect(page.locator("body")).not.toContainText("Sessione non valida");
  }
}

async function expectPageJson(page: Page, url: string, status: number): Promise<JsonRecord> {
  const result = await page.evaluate(async (targetUrl) => {
    const response = await fetch(targetUrl);
    const body = await response.json().catch(() => null);
    return { status: response.status, body };
  }, url);
  expect(result.status, JSON.stringify(result.body)).toBe(status);
  return result.body as JsonRecord;
}

async function verifyAnonymousShareLink(
  publicApi: APIRequestContext,
  token: string,
  expectedStatus: number,
  expectedMessage?: string,
) {
  const response = await publicApi.get(`/api/shared/document-packages/${token}`);
  const body = await json(response);
  expect(response.status(), JSON.stringify(body)).toBe(expectedStatus);

  if (expectedMessage) {
    expect(body).toEqual({ message: expectedMessage });
    return;
  }

  const serialized = JSON.stringify(body);
  expect(body.title).toEqual(expect.any(String));
  expect(serialized).not.toContain("tokenHash");
  expect(serialized).not.toContain("blobKey");
  expect(serialized).not.toContain("organizationId");
  expect(serialized).not.toMatch(/https?:\/\/[^"]*blob/i);
  expect(serialized).not.toMatch(/vercel-storage\.com/i);
}

async function applyDevAuthCookie(page: Page, response: APIResponse, baseURL: string) {
  const setCookie = response.headers()["set-cookie"];
  expect(setCookie, "POST /api/dev-auth must set qv-dev-auth").toContain("qv-dev-auth=");
  const [pair] = setCookie.split(";", 1);
  const [name, ...valueParts] = pair.split("=");
  const value = valueParts.join("=");
  await page.context().addCookies([{ name, value, url: baseURL }]);
  return `${name}=${value}`;
}

test("workspace MVP smoke with dev-auth, anonymous share link, and logout", async ({ page, request }, testInfo) => {
  const baseURL = String(testInfo.project.use.baseURL ?? "http://localhost:3001");
  const runId = `${Date.now()}`;
  const anonymousApi = request;

  await expectJson(await anonymousApi.get("/api/context"), 401);

  const devAuth = await page.context().request.post("/api/dev-auth");
  expect(devAuth.status(), await devAuth.text()).toBe(200);
  await applyDevAuthCookie(page, devAuth, baseURL);
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await ensureOrganization(page, runId);
  const { documentPackage } = await createDomainData(page, runId);

  await verifyWorkspacePages(page);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const shareLinkResponse = await pagePostJson(page, `/api/document-packages/${documentPackage.id}/share-links`, { expiresAt });
  const shareLink = shareLinkResponse.shareLink as JsonRecord;
  const token = shareLinkResponse.token;

  expect(token).toEqual(expect.any(String));
  expect(shareLink.id).toEqual(expect.any(String));

  await verifyAnonymousShareLink(anonymousApi, token as string, 200);

  await pageJsonRequest(page, "DELETE", `/api/document-packages/${documentPackage.id}/share-links/${shareLink.id}`);
  await verifyAnonymousShareLink(anonymousApi, token as string, 404, "Link non disponibile.");

  await pageJsonRequest(page, "DELETE", "/api/dev-auth");
  await page.context().clearCookies({ name: "qv-dev-auth" });
  await expectPageJson(page, "/api/context", 401);
});
