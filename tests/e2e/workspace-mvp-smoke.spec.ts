import crypto from "crypto";
import { expect, test, type APIRequestContext, type APIResponse, type Page } from "@playwright/test";
import type { DocumentCategoryKey, MyResourceScopeResponse } from "../../packages/types/src/index";

type JsonRecord = Record<string, unknown>;

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const E2E_PNG_BYTES = Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=", "base64"));
const JOB_SITE_DOCUMENT_CATEGORY = "SITE_START_AUTHORIZATIONS" satisfies DocumentCategoryKey;
const WORKER_DOCUMENT_CATEGORY = "WORKER_TRAINING_QUALIFICATIONS" satisfies DocumentCategoryKey;

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

async function signInWithCredentials(page: Page, email: string, password: string) {
  await page.goto("/sign-in?callbackUrl=%2Fdashboard", { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email o username").fill(email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
  await page.getByRole("button", { name: "Accedi", exact: true }).click();
  await page.waitForURL("**/dashboard");
}

async function satisfyMfaGate(page: Page, secret: string) {
  await expect(page.getByRole("heading", { name: "Conferma MFA" })).toBeVisible();
  await page.locator("#mfa-gate-code").fill(currentTotp(secret));
  await page.getByRole("button", { name: "Apri il workspace" }).click();
  await expect(page.getByRole("heading", { name: "Panoramica", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Come lavora il motore Qoovex", exact: true })).toBeVisible();
  await expect(page.getByText("IA non attiva", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cosa serve da te", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cosa ha fatto Qoovex", exact: true })).toBeVisible();
}

async function openWorkspaceAccountMenu(page: Page) {
  const navigation = page.getByRole("navigation", { name: "Navigazione workspace" });
  let accountTrigger = navigation.getByRole("button", { name: "Azienda e account", exact: true });

  if (!(await accountTrigger.isVisible())) {
    const sidebarTriggers = page.getByRole("button", { name: "Toggle Sidebar", exact: true });
    let openedSidebar = false;

    for (let index = 0; index < (await sidebarTriggers.count()); index += 1) {
      const candidate = sidebarTriggers.nth(index);

      if (await candidate.isVisible()) {
        await candidate.click();
        openedSidebar = true;
        break;
      }
    }

    expect(openedSidebar).toBe(true);
    accountTrigger = navigation.getByRole("button", { name: "Azienda e account", exact: true });
  }

  await expect(accountTrigger).toBeVisible();
  await accountTrigger.click();
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
    operationalPhase: "IN_PROGRESS",
  });
  const jobSiteDocumentType = await pagePostJson(page, "/api/document-types", {
    name: `Tipo cantiere E2E ${runId}`,
    appliesTo: "JOB_SITE",
    categoryKey: JOB_SITE_DOCUMENT_CATEGORY,
    sensitivity: "STANDARD",
    requiresExpiryDate: true,
  });
  const workerDocumentType = await pagePostJson(page, "/api/document-types", {
    name: `Tipo lavoratore E2E ${runId}`,
    appliesTo: "WORKER",
    categoryKey: WORKER_DOCUMENT_CATEGORY,
    sensitivity: "STANDARD",
    requiresExpiryDate: true,
  });
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const jobSiteDocument = await pagePostJson(page, "/api/documents", {
    title: `Documento cantiere E2E ${runId}`,
    documentTypeId: jobSiteDocumentType.id,
    ownerType: "JOB_SITE",
    jobSiteId: jobSite.id,
    status: "TO_REVIEW",
    expiryDate: dueDate,
  });
  const workerDocument = await pagePostJson(page, "/api/documents", {
    title: `Documento lavoratore E2E ${runId}`,
    documentTypeId: workerDocumentType.id,
    ownerType: "WORKER",
    workerId: worker.id,
    status: "TO_REVIEW",
    expiryDate: dueDate,
  });
  const deadline = await pagePostJson(page, "/api/deadlines", {
    title: `Scadenza E2E ${runId}`,
    dueDate,
    sourceType: "DOCUMENT",
    documentId: jobSiteDocument.id,
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

  for (const created of [worker, jobSite, jobSiteDocumentType, workerDocumentType, jobSiteDocument, workerDocument, deadline, checklist, checklistItem, evidence, documentPackage]) {
    expect(created.id).toEqual(expect.any(String));
  }

  return { documentPackage, jobSite, jobSiteDocument, jobSiteDocumentType, worker, workerDocument, workerDocumentType };
}

const primaryNavigationQuickActions = ["Aggiungi prova", "Carica documento", "Aggiungi collaboratore"] as const;
type PrimaryNavigationQuickAction = (typeof primaryNavigationQuickActions)[number];

async function expectPrimaryNavigation(page: Page, expectedQuickActions: readonly PrimaryNavigationQuickAction[]) {
  const navigation = page.getByRole("navigation", { name: "Navigazione workspace" });
  await expect(navigation.getByRole("link", { name: "Panoramica", exact: true })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Tutti i cantieri", exact: true })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Lavoratori", exact: true })).toHaveCount(0);
  await expect(navigation.getByRole("link", { name: "Azienda", exact: true })).toHaveCount(0);
  await expect(navigation.getByRole("button", { name: "Analytics, disponibile in futuro", exact: true })).toBeDisabled();
  await expect(navigation.getByRole("button", { name: "Calendario, disponibile in futuro", exact: true })).toBeDisabled();
  await expect(navigation.getByText("Preferiti", { exact: true })).toHaveCount(0);
  await expect(navigation.getByText("Azioni rapide", { exact: true })).toBeVisible();
  const quickActions = navigation.getByRole("group", { name: "Azioni rapide" });
  for (const action of primaryNavigationQuickActions) {
    const link = quickActions.getByRole("link", { name: action, exact: true });
    if (expectedQuickActions.includes(action)) await expect(link).toBeVisible();
    else await expect(link).toHaveCount(0);
  }
  await expect(quickActions.getByRole("link", { name: "Crea cantiere", exact: true })).toHaveCount(0);
  await expect(navigation.getByRole("button", { name: "Cerca nel workspace", exact: true })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Ricerca", exact: true })).toHaveCount(0);
  await expect(navigation.getByText("Analisi", { exact: true })).toHaveCount(0);
  await expect(navigation.getByRole("link", { name: "Notifiche", exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Riduci menu", exact: true }).click();
  await expect(navigation.getByRole("link", { name: "Tutti i cantieri", exact: true })).toBeHidden();
  await navigation.getByRole("link", { name: "Panoramica", exact: true }).hover();
  await expect(navigation.getByRole("link", { name: "Tutti i cantieri", exact: true })).toBeHidden();
  await page.getByRole("button", { name: "Espandi menu", exact: true }).click();
}

async function runOperationalEngine(page: Page, times: number) {
  const secret = process.env.CRON_SECRET;
  expect(secret).toEqual(expect.any(String));
  for (let index = 0; index < times; index += 1) {
    await expectJson(await page.request.get("/api/operations/run", { headers: { Authorization: `Bearer ${secret}` } }), 200);
  }
}

async function findOperationalProcessByArtifact(page: Page, type: string, artifactId: string) {
  const pageResult = await expectJson(await page.request.get(`/api/operations/processes?type=${encodeURIComponent(type)}&take=50`), 200);
  for (const item of pageResult.items as JsonRecord[]) {
    const detail = await expectJson(await page.request.get(`/api/operations/processes/${item.id}`), 200);
    if ((detail.artifacts as JsonRecord[]).some((artifact) => artifact.id === artifactId)) return detail;
  }
  throw new Error(`Operational process not found for ${type}:${artifactId}`);
}

async function createGuidedDocument(page: Page, input: {
  area: "Cantiere" | "Lavoratore";
  category: string;
  contextLabel: string;
  contextPrompt: string;
  documentTypeName: string;
}) {
  await page.goto("/documents", { waitUntil: "domcontentloaded" });
  const trigger = page.getByRole("button", { name: "Aggiungi documento", exact: true });
  const dialog = page.getByRole("dialog", { name: "Aggiungi documento" });
  await expect(async () => {
    await trigger.click();
    await expect(dialog).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 10_000 });
  await expect(dialog.getByRole("heading", { name: "Dove va il documento?" })).toBeVisible();
  await dialog.getByRole("button", { name: new RegExp(`^${input.area}\\b`) }).click();
  await dialog.getByRole("combobox", { name: input.contextPrompt }).click();
  await page.getByRole("option", { name: input.contextLabel, exact: true }).click();
  await dialog.getByRole("button", { name: new RegExp(`^${input.category}`) }).click();
  await dialog.getByRole("combobox", { name: "Tipo documento" }).click();
  await page.getByRole("option", { name: input.documentTypeName, exact: true }).click();
  await dialog.getByLabel(/Scadenza registrata dall'utente/).fill(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
  await dialog.getByLabel("File", { exact: true }).setInputFiles({
    name: "e2e-document.png",
    mimeType: "image/png",
    buffer: Buffer.from(E2E_PNG_BYTES),
  });
  await dialog.getByRole("button", { name: new RegExp("^Salva in ") }).click();
  await page.waitForURL((url) => url.pathname.startsWith("/documents/") && url.pathname.includes("--") && url.searchParams.get("result") === "file-uploaded");
  const documentId = new URL(page.url()).pathname.match(/--([^/]+)$/)?.[1] ?? "";
  const response = await expectJson(await page.context().request.get(`/api/documents/${documentId}`), 200);
  return response;
}

async function uploadAndDownloadDocument(page: Page, documentId: unknown) {
  const uploaded = await page.evaluate(async ({ bytes, id }) => {
    const form = new FormData();
    form.set("file", new File([new Uint8Array(bytes)], "e2e-document.png", { type: "image/png" }));
    const response = await fetch(`/api/documents/${id}/versions`, { method: "POST", body: form });
    return { status: response.status, body: await response.json().catch(() => null) };
  }, { bytes: E2E_PNG_BYTES, id: String(documentId) });
  expect(uploaded.status, JSON.stringify(uploaded.body)).toBe(201);
  const version = (uploaded.body as JsonRecord).version as JsonRecord;
  expect(version.id).toEqual(expect.any(String));

  const downloaded = await page.evaluate(async ({ id, versionId }) => {
    const response = await fetch(`/api/documents/${id}/versions/${versionId}/download`);
    return { status: response.status, bytes: Array.from(new Uint8Array(await response.arrayBuffer())) };
  }, { id: String(documentId), versionId: String(version.id) });
  expect(downloaded).toEqual({ status: 200, bytes: E2E_PNG_BYTES });
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

async function waitForSinkTemplate(api: APIRequestContext, sinkUrl: string, email: string, kind: string): Promise<JsonRecord> {
  let template: JsonRecord | null = null;
  await expect.poll(async () => {
    const response = await api.get(`${sinkUrl}?to=${encodeURIComponent(email)}`);
    if (!response.ok()) return null;
    const body = await response.json() as { messages?: Array<{ template?: JsonRecord }> };
    template = body.messages?.find((message) => message.template?.kind === kind)?.template ?? null;
    return template?.kind ?? null;
  }).toBe(kind);
  return template!;
}

test("credentials signup verifies the real OTP through the authenticated E2E email sink", async ({ page, playwright, baseURL }) => {
  const runId = `${Date.now()}`;
  const email = `signup-e2e-${runId}@example.test`;
  const username = `signup_e2e_${runId}`;
  const password = `Qoovex-Signup-${runId}!`;
  const sinkUrl = process.env.QOOVEX_E2E_EMAIL_SINK_URL!;
  const sinkApi = await playwright.request.newContext({
    extraHTTPHeaders: { Authorization: `Bearer ${process.env.QOOVEX_E2E_EMAIL_SINK_SECRET}` },
  });
  const adminApi = await playwright.request.newContext({ baseURL });

  try {
    expect((await sinkApi.delete(sinkUrl)).status()).toBe(200);
    await page.goto("/sign-up", { waitUntil: "domcontentloaded" });
    await page.getByLabel("Email").fill(email);
    await page.getByRole("button", { name: "Invia codice" }).click();
    await expect(page.getByRole("textbox", { name: "Codice email", exact: true })).toBeVisible();

    let code: string | null = null;
    await expect.poll(async () => {
      const response = await sinkApi.get(`${sinkUrl}?to=${encodeURIComponent(email)}`);
      if (!response.ok()) return null;
      const body = await response.json() as { messages?: Array<{ template?: { kind?: string; code?: string } }> };
      code = body.messages?.find((message) => message.template?.kind === "auth-code")?.template?.code ?? null;
      return code;
    }).toMatch(/^\d{6}$/);
    await page.getByRole("textbox", { name: "Codice email", exact: true }).fill(String(code));
    await page.getByRole("button", { name: "Verifica email" }).click();
    await page.getByLabel("Username").fill(username);
    await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
    await page.getByRole("button", { name: "Crea account" }).click();
    await expect.poll(async () => (await page.context().request.get("/api/context")).status()).toBe(200);
  } finally {
    expect((await adminApi.post("/api/dev-auth")).status()).toBe(200);
    const cleanup = await adminApi.delete("/api/dev-fixtures/platform-admin", { data: { fixtureEmails: [email] } });
    expect(cleanup.status()).toBe(200);
    expect(await cleanup.json()).toMatchObject({ remainingUsers: 0, organizationExists: 0, remainingBlobs: 0 });
    await Promise.all([sinkApi.dispose(), adminApi.dispose()]);
  }
});

test("workspace MVP smoke with isolated credentials fixture, Blob, anonymous share link, and cleanup", async ({ page, request, playwright, baseURL }) => {
  test.setTimeout(120_000);
  const runId = `${Date.now()}`;
  const anonymousApi = request;
  const adminApi = await playwright.request.newContext({ baseURL });
  let fixture: JsonRecord | null = null;

  try {
    await expectJson(await anonymousApi.get("/api/context"), 401);
    await expectJson(await anonymousApi.get("/api/platform-admin/overview"), 401);
    expect((await adminApi.post("/api/dev-auth")).status()).toBe(200);
    fixture = await expectJson(await adminApi.post("/api/dev-fixtures/platform-admin", { data: { kind: "mfa-suite", runId } }), 201);
    const owner = fixture.owner as JsonRecord;
    await signInWithCredentials(page, String(owner.email), String(fixture.password));
    await satisfyMfaGate(page, String(owner.secret));
    await expectPrimaryNavigation(page, primaryNavigationQuickActions);
    await page.getByRole("navigation", { name: "Navigazione workspace" }).getByRole("button", { name: "Cerca nel workspace", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Cerca nel workspace" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", { name: /^Apri notifiche(?:, \d+ non lett[ae])?$/ })).toBeVisible();

    const incompleteFixture = await expectJson(await adminApi.post("/api/dev-fixtures/platform-admin", { data: { kind: "operational-incomplete-document", runId, organizationId: fixture.organizationId } }), 201);
    const incompleteDocument = incompleteFixture.document as JsonRecord;
    const incompleteProcess = incompleteFixture.process as JsonRecord;
    await runOperationalEngine(page, 2);
    let incompleteDetail = await expectJson(await page.request.get(`/api/operations/processes/${incompleteProcess.id}`), 200);
    const expiryDecision = (incompleteDetail.decisions as JsonRecord[]).find((decision) => decision.type === "CONFIRM_EXPIRY_DATE" && decision.status === "OPEN")!;
    expect(expiryDecision).toBeTruthy();
    await pageJsonRequest(page, "POST", `/api/operations/decisions/${expiryDecision.id}/resolve`, { kind: "CONFIRM_DATE", optionKey: "enter-date", value: "2099-12-31", reason: "Data confermata nello scenario E2E." });
    await runOperationalEngine(page, 6);
    incompleteDetail = await expectJson(await page.request.get(`/api/operations/processes/${incompleteProcess.id}`), 200);
    expect(incompleteDetail.status).toBe("COMPLETED");
    expect(await expectJson(await page.request.get(`/api/documents/${incompleteDocument.id}`), 200)).toMatchObject({ expiryDate: expect.stringContaining("2099-12-31") });

    const missingType = await pagePostJson(page, "/api/document-types", { name: `Requisito lavoratore E2E ${runId}`, appliesTo: "WORKER", categoryKey: WORKER_DOCUMENT_CATEGORY, sensitivity: "STANDARD", requiresExpiryDate: false });
    await pagePostJson(page, "/api/document-requirements", { name: `Documento richiesto E2E ${runId}`, targetType: "WORKER", documentTypeId: missingType.id, jobSiteId: null, isRequired: true });
    const exceptionWorker = await pagePostJson(page, "/api/workers", { displayName: `Worker eccezione E2E ${runId}` });
    await runOperationalEngine(page, 3);
    let workerProcess = await findOperationalProcessByArtifact(page, "WORKER_CREATED", String(exceptionWorker.id));
    const missingException = (workerProcess.exceptions as JsonRecord[]).find((exception) => exception.type === "DOCUMENT_MISSING")!;
    expect(missingException).toMatchObject({ status: "OPEN", canResolve: false });
    await pagePostJson(page, "/api/documents", { title: `Documento risolutivo E2E ${runId}`, documentTypeId: missingType.id, ownerType: "WORKER", workerId: exceptionWorker.id, status: "TO_REVIEW" });
    await runOperationalEngine(page, 6);
    workerProcess = await findOperationalProcessByArtifact(page, "WORKER_CREATED", String(exceptionWorker.id));
    expect((workerProcess.exceptions as JsonRecord[]).find((exception) => exception.id === missingException.id)).toMatchObject({ status: "RESOLVED" });
    expect(workerProcess.status).toBe("COMPLETED");

    const { documentPackage, jobSite, jobSiteDocument, jobSiteDocumentType, worker, workerDocument, workerDocumentType } = await createDomainData(page, runId);
    await uploadAndDownloadDocument(page, jobSiteDocument.id);
    await uploadAndDownloadDocument(page, workerDocument.id);
    const guidedWorkerDocument = await createGuidedDocument(page, {
      area: "Lavoratore",
      category: "Formazione e abilitazioni",
      contextLabel: String(worker.displayName),
      contextPrompt: "2. A quale lavoratore appartiene?",
      documentTypeName: String(workerDocumentType.name),
    });
    expect(guidedWorkerDocument).toMatchObject({ ownerType: "WORKER", workerId: worker.id, categoryKey: WORKER_DOCUMENT_CATEGORY });
    const guidedJobSiteDocument = await createGuidedDocument(page, {
      area: "Cantiere",
      category: "Avvio e autorizzazioni",
      contextLabel: String(jobSite.name),
      contextPrompt: "2. A quale cantiere appartiene?",
      documentTypeName: String(jobSiteDocumentType.name),
    });
    expect(guidedJobSiteDocument).toMatchObject({ ownerType: "JOB_SITE", jobSiteId: jobSite.id, categoryKey: JOB_SITE_DOCUMENT_CATEGORY });
    await page.goto("/documents/job-sites", { waitUntil: "domcontentloaded" });
    const jobSiteDocumentTypeHeadings = page.getByRole("heading", { name: String(jobSiteDocumentType.name), exact: true });
    await expect(jobSiteDocumentTypeHeadings).toHaveCount(2);
    await expect(jobSiteDocumentTypeHeadings.nth(0)).toBeVisible();
    await expect(jobSiteDocumentTypeHeadings.nth(1)).toBeVisible();
    await page.goto("/documents/workers", { waitUntil: "domcontentloaded" });
    const workerDocumentTypeHeadings = page.getByRole("heading", { name: String(workerDocumentType.name), exact: true });
    await expect(workerDocumentTypeHeadings).toHaveCount(2);
    await expect(workerDocumentTypeHeadings.nth(0)).toBeVisible();
    await expect(workerDocumentTypeHeadings.nth(1)).toBeVisible();
    await verifyWorkspacePages(page);

    await page.goto("/job-sites", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Fasi operative", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Coda di attenzione", exact: true })).toBeVisible();
    await page.goto(`/job-sites/all?search=${encodeURIComponent(String(jobSite.name))}`, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: String(jobSite.name), exact: true })).toBeVisible();
    for (const section of ["overview", "updates", "documents", "people", "activities", "evidence", "sharing", "settings"]) {
      await page.goto(`/job-sites/${jobSite.id}?section=${section}`, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("navigation", { name: "Sezioni cantiere" })).toBeVisible();
    }
    await page.goto("/job-sites/all", { waitUntil: "domcontentloaded" });
    const jobSiteNavigation = page.getByRole("navigation", { name: "Navigazione workspace" });
    const jobSiteLink = jobSiteNavigation.getByRole("link", { name: `${jobSite.name} In corso`, exact: true });
    const jobSiteHref = await jobSiteLink.getAttribute("href");
    expect(jobSiteHref).toMatch(new RegExp(`^/job-sites/.+--${jobSite.id}$`));
    await jobSiteLink.click();
    await expect(page).toHaveURL(new RegExp(`--${jobSite.id}$`));
    await page.goto("/job-sites/all", { waitUntil: "domcontentloaded" });
    await jobSiteNavigation.getByRole("button", { name: `Mostra aggiornamenti di ${jobSite.name}`, exact: true }).click();
    await expect(page).toHaveURL(/\/job-sites\/all$/);
    const timelineLink = jobSiteNavigation.getByRole("link", { name: "Vai all'aggiornamento: Prova registrata", exact: true });
    await expect(timelineLink).toBeVisible();
    const timelineHref = await timelineLink.getAttribute("href");
    expect(timelineHref?.startsWith(`${jobSiteHref}?section=updates#timeline-`)).toBe(true);
    await timelineLink.click();
    await expect.poll(() => {
      const url = new URL(page.url());
      return `${url.pathname}${url.search}${url.hash}`;
    }).toBe(timelineHref);
    await expect(jobSiteNavigation.locator('a[aria-current="location"]')).toHaveAttribute("href", timelineHref!);
    const timelineAnchor = new URL(page.url()).hash;
    await expect(page.locator(timelineAnchor)).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/job-sites/${jobSite.id}?section=overview`, { waitUntil: "domcontentloaded" });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await page.setViewportSize({ width: 1280, height: 900 });

    await runOperationalEngine(page, 3);
    const searchPage = await pageJsonRequest(page, "POST", "/api/search", { query: String(guidedJobSiteDocument.title), take: 20 }, 200);
    const documentSearchResult = (searchPage.items as JsonRecord[]).find((item) => item.type === "DOCUMENT" && item.id === guidedJobSiteDocument.id)!;
    expect(documentSearchResult).toMatchObject({ href: `/documents/${guidedJobSiteDocument.id}`, timelineHref: expect.any(String) });
    const artifactTimeline = await expectJson(await page.request.get(`/api/operations/artifacts/DOCUMENT/${guidedJobSiteDocument.id}/events`), 200);
    expect((artifactTimeline.items as JsonRecord[]).length).toBeGreaterThan(0);
    await page.goto(String(documentSearchResult.href), { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: String(guidedJobSiteDocument.title), exact: true })).toBeVisible();

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const shareProposal = await pagePostJson(page, `/api/document-packages/${documentPackage.id}/share-proposals`, {
      targetKind: "NAMED_RECIPIENT",
      recipientLabel: `Destinatario E2E ${runId}`,
      purpose: "Verifica condivisione E2E",
      expiresAt,
      allowDownload: true,
    });
    expect(shareProposal).toMatchObject({ status: "READY_FOR_REVIEW", canConfirm: true, revision: { fingerprint: expect.stringMatching(/^[a-f0-9]{64}$/) } });
    const revision = shareProposal.revision as JsonRecord;
    const shareLinkResponse = await pagePostJson(page, `/api/document-packages/${documentPackage.id}/share-proposals/${shareProposal.id}/confirm`, {
      confirmation: "APPROVE_AND_CREATE",
      fingerprint: revision.fingerprint,
    });
    const shareLink = shareLinkResponse.shareLink as JsonRecord;
    const token = shareLinkResponse.token;
    expect(token).toEqual(expect.any(String));
    await verifyAnonymousShareLink(anonymousApi, token as string, 200);
    await pageJsonRequest(page, "DELETE", `/api/document-packages/${documentPackage.id}/share-links/${shareLink.id}`);
    await verifyAnonymousShareLink(anonymousApi, token as string, 404, "Link non disponibile.");

    await openWorkspaceAccountMenu(page);
    await page.getByRole("button", { name: "Esci" }).click();
    await page.waitForURL("**/sign-in");
    await expectPageJson(page, "/api/context", 401);
  } finally {
    if (fixture) {
      const owner = fixture.owner as JsonRecord;
      const safety = fixture.safety as JsonRecord;
      const worker = fixture.worker as JsonRecord;
      const cleanup = await adminApi.delete("/api/dev-fixtures/platform-admin", { data: { organizationId: fixture.organizationId, userIds: [owner.id, safety.id, worker.id] } });
      expect(cleanup.status()).toBe(200);
      expect(await cleanup.json()).toMatchObject({ remainingUsers: 0, organizationExists: 0, remainingBlobs: 0 });
    }
    await adminApi.dispose();
  }
});

test("invitation acceptance enforces SITE_MANAGER and WORKER resource scopes", async ({ browser, playwright, baseURL }) => {
  const runId = `${Date.now()}`;
  const siteManagerEmail = `signup-e2e-${runId}@example.test`;
  const siteManagerUsername = `signup_e2e_${runId}`;
  const siteManagerPassword = `Qoovex-Invite-${runId}!`;
  const invitedWorkerEmail = `worker-invite-e2e-${runId}@example.test`;
  const invitedWorkerUsername = `worker_invite_e2e_${runId}`;
  const invitedWorkerPassword = `Qoovex-Worker-${runId}!`;
  const sinkUrl = process.env.QOOVEX_E2E_EMAIL_SINK_URL!;
  const sinkApi = await playwright.request.newContext({ extraHTTPHeaders: { Authorization: `Bearer ${process.env.QOOVEX_E2E_EMAIL_SINK_SECRET}` } });
  const adminApi = await playwright.request.newContext({ baseURL });
  const ownerContext = await browser.newContext({ baseURL });
  const inviteeContext = await browser.newContext({ baseURL });
  const scopedSiteManagerContext = await browser.newContext({ baseURL });
  const safetyContext = await browser.newContext({ baseURL });
  const workerContext = await browser.newContext({ baseURL });
  const invitedWorkerContext = await browser.newContext({ baseURL });
  let fixture: JsonRecord | null = null;

  try {
    expect((await adminApi.post("/api/dev-auth")).status()).toBe(200);
    fixture = await expectJson(await adminApi.post("/api/dev-fixtures/platform-admin", { data: { kind: "mfa-suite", runId } }), 201);
    const owner = fixture.owner as JsonRecord;
    const safety = fixture.safety as JsonRecord;
    const worker = fixture.worker as JsonRecord;
    const ownerPage = await ownerContext.newPage();
    await signInWithCredentials(ownerPage, String(owner.email), String(fixture.password));
    await satisfyMfaGate(ownerPage, String(owner.secret));

    const safetyPage = await safetyContext.newPage();
    await signInWithCredentials(safetyPage, String(safety.email), String(fixture.password));
    await satisfyMfaGate(safetyPage, String(safety.secret));
    await expectPrimaryNavigation(safetyPage, ["Aggiungi prova"]);
    await expect(safetyPage.getByRole("button", { name: /^Apri notifiche(?:, \d+ non lett[ae])?$/ })).toBeVisible();

    expect((await sinkApi.delete(sinkUrl)).status()).toBe(200);
    await expectJson(await ownerPage.request.post("/api/organization/invitations", {
      data: { email: siteManagerEmail, role: "COLLABORATOR", preset: "SITE_MANAGER", scopeMode: "ASSIGNED" },
    }), 201);
    const invitationTemplate = await waitForSinkTemplate(sinkApi, sinkUrl, siteManagerEmail, "organization-invitation");
    const invitationToken = new URL(String(invitationTemplate.acceptUrl)).searchParams.get("token");
    expect(invitationToken).toEqual(expect.any(String));

    const inviteePage = await inviteeContext.newPage();
    await inviteePage.goto("/sign-up", { waitUntil: "domcontentloaded" });
    await inviteePage.getByLabel("Email").fill(siteManagerEmail);
    await inviteePage.getByRole("button", { name: "Invia codice" }).click();
    const signupTemplate = await waitForSinkTemplate(sinkApi, sinkUrl, siteManagerEmail, "auth-code");
    await inviteePage.getByRole("textbox", { name: "Codice email", exact: true }).fill(String(signupTemplate.code));
    await inviteePage.getByRole("button", { name: "Verifica email" }).click();
    await inviteePage.getByLabel("Username").fill(siteManagerUsername);
    await inviteePage.getByRole("textbox", { name: "Password", exact: true }).fill(siteManagerPassword);
    await inviteePage.getByRole("button", { name: "Crea account" }).click();
    await expect.poll(async () => (await inviteePage.request.get("/api/context")).status()).toBe(200);
    await expectJson(await inviteePage.request.post("/api/organization/invitations/accept", { data: { token: invitationToken } }), 200);

    const members = await expectJson(await ownerPage.request.get("/api/organization/members"), 200) as unknown as JsonRecord[];
    const siteManager = members.find((member) => (member.user as JsonRecord).email === siteManagerEmail)!;
    const assignedJobSite = await pagePostJson(ownerPage, "/api/job-sites", { name: `Cantiere assegnato ${runId}`, operationalPhase: "IN_PROGRESS" });
    await pagePostJson(ownerPage, "/api/job-sites", { name: `Cantiere non assegnato ${runId}`, operationalPhase: "PREPARATION" });
    await pagePostJson(ownerPage, "/api/resource-assignments/job-site-user-assignments", {
      jobSiteId: assignedJobSite.id,
      userId: (siteManager.user as JsonRecord).id,
    });
    const invitedWorkerProfile = await pagePostJson(ownerPage, "/api/workers", { displayName: `Worker invitato ${runId}`, email: invitedWorkerEmail });
    await expectJson(await ownerPage.request.post("/api/workers", { data: { displayName: `Duplicato ${runId}`, email: invitedWorkerEmail } }), 409);
    expect((await sinkApi.delete(sinkUrl)).status()).toBe(200);
    await expectJson(await ownerPage.request.post("/api/organization/invitations", {
      data: { email: invitedWorkerEmail, role: "COLLABORATOR", preset: "LIMITED_UPLOAD", scopeMode: "ASSIGNED", workerId: invitedWorkerProfile.id },
    }), 201);
    const workerInvitationTemplate = await waitForSinkTemplate(sinkApi, sinkUrl, invitedWorkerEmail, "organization-invitation");
    const workerInvitationToken = new URL(String(workerInvitationTemplate.acceptUrl)).searchParams.get("token");
    expect(workerInvitationToken).toEqual(expect.any(String));

    const invitedWorkerPage = await invitedWorkerContext.newPage();
    await invitedWorkerPage.goto("/sign-up", { waitUntil: "domcontentloaded" });
    await invitedWorkerPage.getByLabel("Email").fill(invitedWorkerEmail);
    await invitedWorkerPage.getByRole("button", { name: "Invia codice" }).click();
    const workerSignupTemplate = await waitForSinkTemplate(sinkApi, sinkUrl, invitedWorkerEmail, "auth-code");
    await invitedWorkerPage.getByRole("textbox", { name: "Codice email", exact: true }).fill(String(workerSignupTemplate.code));
    await invitedWorkerPage.getByRole("button", { name: "Verifica email" }).click();
    await invitedWorkerPage.getByLabel("Username").fill(invitedWorkerUsername);
    await invitedWorkerPage.getByRole("textbox", { name: "Password", exact: true }).fill(invitedWorkerPassword);
    await invitedWorkerPage.getByRole("button", { name: "Crea account" }).click();
    await expect.poll(async () => (await invitedWorkerPage.request.get("/api/context")).status()).toBe(200);
    await expectJson(await invitedWorkerPage.request.post("/api/organization/invitations/accept", { data: { token: workerInvitationToken } }), 200);
    await expectJson(await invitedWorkerPage.request.get("/api/context"), 401);
    await signInWithCredentials(invitedWorkerPage, invitedWorkerEmail, invitedWorkerPassword);
    const invitedWorkerScope = await expectJson(await invitedWorkerPage.request.get("/api/resource-assignments/my-scope"), 200) as unknown as MyResourceScopeResponse;
    expect(invitedWorkerScope.worker?.id).toBe(invitedWorkerProfile.id);
    const invitedWorkerRecords = await expectJson(await invitedWorkerPage.request.get("/api/workers"), 200) as unknown as JsonRecord[];
    expect(invitedWorkerRecords.map((record) => record.id)).toEqual([invitedWorkerProfile.id]);

    const linkedWorker = await pagePostJson(ownerPage, "/api/workers", { displayName: `Worker assegnato ${runId}` });
    await pagePostJson(ownerPage, "/api/resource-assignments/worker-user-links", { workerId: linkedWorker.id, userId: worker.id });

    const siteManagerPage = await scopedSiteManagerContext.newPage();
    await signInWithCredentials(siteManagerPage, siteManagerEmail, siteManagerPassword);
    await expectPrimaryNavigation(siteManagerPage, ["Aggiungi prova"]);
    const siteManagerJobSites = await expectJson(await siteManagerPage.request.get("/api/job-sites"), 200) as unknown as JsonRecord;
    expect((siteManagerJobSites.items as JsonRecord[]).map((jobSite) => jobSite.id)).toEqual([assignedJobSite.id]);
    await expectJson(await siteManagerPage.request.post("/api/job-sites", { data: { name: "Vietato" } }), 404);

    const workerPage = await workerContext.newPage();
    await signInWithCredentials(workerPage, String(worker.email), String(fixture.password));
    await satisfyMfaGate(workerPage, String(worker.secret));
    await expectPrimaryNavigation(workerPage, ["Aggiungi prova", "Carica documento"]);
    await expect(workerPage.getByRole("navigation", { name: "Navigazione workspace" }).getByRole("link", { name: "Condivisioni", exact: true })).toHaveCount(0);
    const workerRecords = await expectJson(await workerPage.request.get("/api/workers"), 200) as unknown as JsonRecord[];
    expect(workerRecords.map((record) => record.id)).toEqual([linkedWorker.id]);
    await expectJson(await workerPage.request.post("/api/workers", { data: { displayName: "Vietato" } }), 404);
  } finally {
    if (fixture) {
      const owner = fixture.owner as JsonRecord;
      const safety = fixture.safety as JsonRecord;
      const worker = fixture.worker as JsonRecord;
      const cleanup = await adminApi.delete("/api/dev-fixtures/platform-admin", {
        data: { organizationId: fixture.organizationId, userIds: [owner.id, safety.id, worker.id], fixtureEmails: [siteManagerEmail, invitedWorkerEmail] },
      });
      expect(cleanup.status()).toBe(200);
      expect(await cleanup.json()).toMatchObject({ remainingUsers: 0, organizationExists: 0, remainingBlobs: 0 });
    }
    await Promise.all([sinkApi.dispose(), adminApi.dispose(), ownerContext.close(), inviteeContext.close(), scopedSiteManagerContext.close(), safetyContext.close(), workerContext.close(), invitedWorkerContext.close()]);
  }
});

test("Qoovex operator manages a customer, support session, and runtime error", async ({ page }) => {
  const runId = `${Date.now()}`;
  const email = `platform-e2e-${runId}@example.test`;
  let targetUserId: string | null = null;
  let runtimeErrorId: string | null = null;
  let organizationFixture: JsonRecord | null = null;

  try {
    expect((await page.context().request.post("/api/dev-auth")).status()).toBe(200);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/dashboard$/);
    await page.getByRole("combobox", { name: "Vista di sviluppo" }).click();
    await page.getByRole("option", { name: "Platform Admin", exact: true }).click();
    await expect(page).toHaveURL(/\/qoovex-admin$/);
    organizationFixture = await pagePostJson(page, "/api/dev-fixtures/platform-admin", { kind: "mfa-suite", runId });
    const organization = { id: organizationFixture.organizationId, code: `MFA-${runId}` };

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

    await openWorkspaceAccountMenu(page);
    await page.getByRole("button", { name: "Esci" }).click();
    await page.waitForURL("**/sign-in");
    await expectPageJson(page, "/api/context", 401);
  } finally {
    if (runtimeErrorId || targetUserId || organizationFixture) {
      await page.context().request.post("/api/dev-auth");
      if (runtimeErrorId || targetUserId) {
        await page.context().request.delete("/api/dev-fixtures/platform-admin", { data: { userId: targetUserId, runtimeErrorId } });
      }
      if (organizationFixture) {
        const owner = organizationFixture.owner as JsonRecord;
        const safety = organizationFixture.safety as JsonRecord;
        const worker = organizationFixture.worker as JsonRecord;
        await page.context().request.delete("/api/dev-fixtures/platform-admin", {
          data: { organizationId: organizationFixture.organizationId, userIds: [owner.id, safety.id, worker.id] },
        });
      }
    }
  }
});

test("ordinary MFA gates workspace, replaces the factor, logs out, and recovers with OWNER approval", async ({ browser, playwright, baseURL }) => {
  test.setTimeout(120_000);
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

    await openWorkspaceAccountMenu(ownerPage);
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
      const safety = fixture.safety as JsonRecord;
      const worker = fixture.worker as JsonRecord;
      await adminApi.delete("/api/dev-fixtures/platform-admin", {
        data: { organizationId: fixture.organizationId, userIds: [owner.id, safety.id, worker.id] },
      });
    }
    await Promise.all([ownerContext.close(), workerContext.close(), adminApi.dispose()]);
  }
});
