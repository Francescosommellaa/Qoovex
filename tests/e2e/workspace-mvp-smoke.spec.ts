import crypto from "crypto";
import { expect, test, type APIRequestContext, type APIResponse, type Page } from "@playwright/test";

type JsonRecord = Record<string, unknown>;

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function decodeBase32(value: string) {
  let bits = 0;
  let current = 0;
  const bytes: number[] = [];
  for (const char of value.replace(/=+$/g, "").toUpperCase()) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index < 0) continue;
    current = (current << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((current >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function currentTotp(secret: string) {
  const counter = Math.floor(Date.now() / 1000 / 30);
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", decodeBase32(secret)).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary = ((hmac[offset] & 0x7f) << 24) | ((hmac[offset + 1] & 0xff) << 16) | ((hmac[offset + 2] & 0xff) << 8) | (hmac[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
}

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

async function signInWithCredentials(page: Page, email: string, password: string) {
  await page.goto("/sign-in?callbackUrl=%2Fdashboard", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email o username").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Accedi", exact: true }).click();
  await page.waitForURL("**/dashboard");
}

async function satisfyMfaGate(page: Page, secret: string) {
  await expect(page.getByRole("heading", { name: "Conferma MFA" })).toBeVisible();
  await page.locator("#mfa-gate-code").fill(currentTotp(secret));
  await page.getByRole("button", { name: "Apri il workspace" }).click();
  await expect(page.getByRole("heading", { name: "Stato documentale" })).toBeVisible();
}

async function ensureOrganization(page: Page, runId: string): Promise<JsonRecord> {
  let context = await getContext(page);
  if (!context.company) {
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

  const company = context.company as JsonRecord | null;
  const organization = company?.organization as JsonRecord | undefined;
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

test("workspace MVP smoke with dev-auth, anonymous share link, and logout", async ({ page, request }) => {
  const runId = `${Date.now()}`;
  const anonymousApi = request;

  await expectJson(await anonymousApi.get("/api/context"), 401);
  await expectJson(await anonymousApi.get("/api/platform-admin/overview"), 401);

  await page.goto("/sign-in", { waitUntil: "domcontentloaded" });
  const devButton = page.getByRole("button", { name: "Accedi come dev" });
  await expect(devButton).toBeVisible();
  await devButton.click();
  await page.waitForURL("**/qoovex-admin");
  await expect(page.getByRole("heading", { name: "Console Qoovex" })).toBeVisible();

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

  await page.getByRole("button", { name: "Esci" }).click();
  await page.waitForURL("**/sign-in");
  await expectPageJson(page, "/api/context", 401);
});

test("Qoovex operator manages a customer, support session, and runtime error", async ({ page }) => {
  const runId = `${Date.now()}`;
  const email = `platform-e2e-${runId}@example.test`;
  let targetUserId: string | null = null;
  let runtimeErrorId: string | null = null;

  try {
    await page.goto("/sign-in", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Accedi come dev" }).click();
    await page.waitForURL("**/qoovex-admin");
    const organization = await ensureOrganization(page, runId);

    const fixtures = await pagePostJson(page, "/api/dev-fixtures/platform-admin", { runId });
    const target = fixtures.user as JsonRecord;
    const runtimeError = fixtures.runtimeError as JsonRecord;
    targetUserId = String(target.id);
    runtimeErrorId = String(runtimeError.id);

    await page.goto("/qoovex-admin/users");
    await page.getByLabel("Email, username o azienda").fill(email);
    await page.getByRole("button", { name: "Cerca" }).click();
    await page.getByRole("link", { name: "Apri dettaglio" }).click();
    await page.getByLabel("Motivo operativo").fill("Verifica sospensione account richiesta dal test E2E");
    await page.getByRole("button", { name: "Sospendi account" }).click();
    await expect(page.getByText("Operazione completata e registrata nell'audit.")).toBeVisible();
    await expect.poll(async () => (await pageJsonRequest(page, "GET", `/api/platform-admin/users/${target.id}`)).suspendedAt).not.toBeNull();

    await page.getByLabel("Motivo operativo").fill("Riattivazione account verificata dal test E2E");
    await page.getByRole("button", { name: "Riattiva account" }).click();
    await expect.poll(async () => (await pageJsonRequest(page, "GET", `/api/platform-admin/users/${target.id}`)).suspendedAt).toBeNull();
    await page.getByLabel("Motivo operativo").fill("Revoca sessioni richiesta dal test E2E");
    await page.getByRole("button", { name: "Revoca sessioni" }).click();
    await expect(page.getByText("Operazione completata e registrata nell'audit.")).toBeVisible();

    await page.goto("/qoovex-admin/organizations");
    await page.getByLabel("Nome, codice o email owner").fill(String(organization.code));
    await page.getByRole("button", { name: "Cerca" }).click();
    await page.getByLabel("Motivo del supporto").fill("Assistenza controllata avviata dal test E2E");
    await page.getByRole("button", { name: "Apri supporto" }).click();
    await page.waitForURL("**/dashboard");
    await expect(page.getByText(/Supporto:/)).toBeVisible();
    await page.getByRole("button", { name: "Chiudi supporto" }).click();
    await page.waitForURL("**/qoovex-admin");

    await page.goto("/qoovex-admin/errors?status=OPEN");
    const errorRecord = page.getByRole("article").filter({ hasText: runId });
    await expect(errorRecord).toBeVisible();
    await errorRecord.getByLabel("Motivo").fill("Errore fixture verificato e risolto dal test E2E");
    await errorRecord.getByRole("button", { name: "Segna risolto" }).click();
    await expect.poll(async () => {
      const body = await pageJsonRequest(page, "GET", "/api/platform-admin/errors?status=RESOLVED");
      return (body.errors as JsonRecord[]).find((item) => item.id === runtimeError.id)?.status;
    }).toBe("RESOLVED");

    await pageJsonRequest(page, "DELETE", "/api/dev-fixtures/platform-admin", { userId: targetUserId, runtimeErrorId });
    targetUserId = null;
    runtimeErrorId = null;

    await page.getByRole("button", { name: "Esci" }).click();
    await page.waitForURL("**/sign-in");
    await expectPageJson(page, "/api/context", 401);
  } finally {
    if (runtimeErrorId || targetUserId) {
      await page.context().request.post("/api/dev-auth");
      await page.context().request.delete("/api/dev-fixtures/platform-admin", { data: { userId: targetUserId, runtimeErrorId } });
    }
  }
});

test("ordinary MFA gates workspace, replaces the factor, logs out, and recovers with OWNER approval", async ({ browser, playwright, baseURL }) => {
  const runId = `${Date.now()}`;
  const adminApi = await playwright.request.newContext({ baseURL });
  let fixture: JsonRecord | null = null;
  const ownerContext = await browser.newContext({ baseURL });
  const workerContext = await browser.newContext({ baseURL });

  try {
    expect((await adminApi.post("/api/dev-auth")).status()).toBe(200);
    const fixtureResponse = await adminApi.post("/api/dev-fixtures/platform-admin", { data: { kind: "mfa-suite", runId } });
    fixture = await expectJson(fixtureResponse, 201);
    const password = String(fixture.password);
    const owner = fixture.owner as JsonRecord;
    const worker = fixture.worker as JsonRecord;

    const ownerPage = await ownerContext.newPage();
    await signInWithCredentials(ownerPage, String(owner.email), password);
    const blockedContext = await pageJsonRequest(ownerPage, "GET", "/api/context", undefined, 403);
    expect(blockedContext.code).toBe("MFA_REQUIRED");
    await satisfyMfaGate(ownerPage, String(owner.secret));
    await expectPageJson(ownerPage, "/api/context", 200);

    await ownerPage.goto("/account/security", { waitUntil: "domcontentloaded" });
    await ownerPage.locator("#mfa-replace-code").fill(currentTotp(String(owner.secret)));
    await ownerPage.getByRole("button", { name: "Avvia sostituzione" }).click();
    await expect(ownerPage.getByRole("heading", { name: "Configura l'app Authenticator" })).toBeVisible();
    const replacementSecret = (await ownerPage.locator("code").textContent())?.trim() ?? "";
    expect(replacementSecret).toMatch(/^[A-Z2-7]+$/);
    await ownerPage.locator("#mfa-new-code").fill(currentTotp(replacementSecret));
    await ownerPage.getByRole("button", { name: "Conferma nuovo fattore" }).click();
    await expect(ownerPage.getByRole("heading", { name: "Conserva i codici di recupero" })).toBeVisible();
    await ownerPage.getByRole("button", { name: "Ho salvato i codici, accedi di nuovo" }).click();
    await ownerPage.waitForURL("**/sign-in");

    await signInWithCredentials(ownerPage, String(owner.email), password);
    await satisfyMfaGate(ownerPage, replacementSecret);

    const workerPage = await workerContext.newPage();
    await signInWithCredentials(workerPage, String(worker.email), password);
    await expect(workerPage.getByRole("heading", { name: "Conferma MFA" })).toBeVisible();
    await pageJsonRequest(workerPage, "POST", "/api/account/mfa", {}, 403);
    await pageJsonRequest(workerPage, "DELETE", "/api/account/mfa", {}, 403);
    await pageJsonRequest(workerPage, "POST", "/api/account/mfa/confirm", { code: currentTotp(String(worker.secret)) }, 409);

    const recoveryCodeResponse = await adminApi.post("/api/dev-fixtures/platform-admin", {
      data: { kind: "mfa-recovery-code", runId, userId: worker.id },
    });
    const recoveryCode = await expectJson(recoveryCodeResponse, 201);
    const recovery = await pageJsonRequest(workerPage, "POST", "/api/account/mfa/recovery", { emailCode: recoveryCode.code as string });
    expect(recovery.status).toBe("PENDING");
    await workerPage.reload({ waitUntil: "domcontentloaded" });
    await expect(workerPage.getByRole("heading", { name: "Recupero MFA" })).toBeVisible();
    await expect(workerPage.getByText("In attesa dell'OWNER")).toBeVisible();

    await ownerPage.goto("/account/security", { waitUntil: "domcontentloaded" });
    await expect(ownerPage.getByText(String(worker.email))).toBeVisible();
    await ownerPage.getByLabel("Il tuo fattore MFA").fill(currentTotp(replacementSecret));
    await ownerPage.getByRole("button", { name: "Approva" }).click();
    await expect(ownerPage.getByText("Recupero approvato e notificato.")).toBeVisible();

    await ownerPage.getByRole("button", { name: "Esci" }).click();
    await ownerPage.waitForURL("**/sign-in");
    await expectPageJson(ownerPage, "/api/context", 401);

    await workerPage.getByRole("button", { name: "Aggiorna stato" }).click();
    await expect(workerPage.getByText("Richiesta approvata")).toBeVisible();
    await workerPage.getByRole("button", { name: "Configura nuovo fattore" }).click();
    const workerReplacementSecret = (await workerPage.locator("code").textContent())?.trim() ?? "";
    await workerPage.locator("#mfa-new-code").fill(currentTotp(workerReplacementSecret));
    await workerPage.getByRole("button", { name: "Conferma nuovo fattore" }).click();
    await expect(workerPage.getByRole("heading", { name: "Conserva i codici di recupero" })).toBeVisible();
  } finally {
    if (fixture) {
      const owner = fixture.owner as JsonRecord;
      const worker = fixture.worker as JsonRecord;
      await adminApi.delete("/api/dev-fixtures/platform-admin", {
        data: { organizationId: fixture.organizationId, userIds: [owner.id, worker.id] },
      });
    }
    await Promise.all([ownerContext.close(), workerContext.close(), adminApi.dispose()]);
  }
});
