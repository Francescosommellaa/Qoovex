import { expect, request, test, type APIRequestContext, type Browser, type BrowserContext, type Page } from "@playwright/test";

type FixtureUser = { email: string; id: string };
type Fixture = {
  runId: string;
  password: string;
  organizationA: { id: string };
  organizationB: { id: string };
  organizationAUser: FixtureUser;
  clientAUser: FixtureUser;
  organizationBUser: FixtureUser;
  clientBUser: FixtureUser;
  jobSiteA: { id: string };
  jobSiteB: { id: string };
  verification: { clientMemberships: number };
};

let fixtureApi: APIRequestContext;
let fixture: Fixture;
let requestId = "";
let currentRevision = 1;

async function login(browser: Browser, email: string, password: string) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/sign-in");
  await page.getByLabel("Email o username").fill(email);
  await page.getByRole("textbox", { name: "Password", exact: true }).fill(password);
  await page.getByRole("button", { name: "Accedi", exact: true }).click();
  await expect(page).not.toHaveURL(/\/sign-in/);
  return { context, page };
}

function captureApplicationErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

function collectKeys(value: unknown, keys = new Set<string>()) {
  if (Array.isArray(value)) value.forEach((entry) => collectKeys(entry, keys));
  else if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      keys.add(key.toLowerCase());
      collectKeys(entry, keys);
    }
  }
  return keys;
}

test.describe.serial("openedByParticipant authenticated runtime", () => {
  test.beforeAll(async () => {
    fixtureApi = await request.newContext({ baseURL: process.env.E2E_WORKSPACE_URL ?? "http://localhost:3001" });
    const authResponse = await fixtureApi.post("/api/dev-auth", { data: { view: "BUSINESS" } });
    expect(authResponse.status()).toBe(200);
    const runId = `${Date.now()}`;
    const setupResponse = await fixtureApi.post("/api/dev-fixtures/opened-by-participant", { data: { runId } });
    expect(setupResponse.status()).toBe(201);
    fixture = await setupResponse.json() as Fixture;
    expect(new Set([
      fixture.organizationAUser.id,
      fixture.clientAUser.id,
      fixture.organizationBUser.id,
      fixture.clientBUser.id,
    ]).size).toBe(4);
    expect(fixture.organizationA.id).not.toBe(fixture.organizationB.id);
    expect(fixture.jobSiteA.id).not.toBe(fixture.jobSiteB.id);
    expect(fixture.verification.clientMemberships).toBe(0);
  });

  test.afterAll(async () => {
    if (fixture) {
      const cleanup = await fixtureApi.delete("/api/dev-fixtures/opened-by-participant", {
        data: {
          runId: fixture.runId,
          organizationIds: [fixture.organizationA.id, fixture.organizationB.id],
          jobSiteIds: [fixture.jobSiteA.id, fixture.jobSiteB.id],
          userIds: [fixture.organizationAUser.id, fixture.clientAUser.id, fixture.organizationBUser.id, fixture.clientBUser.id],
        },
      });
      expect(cleanup.status()).toBe(200);
      expect(await cleanup.json()).toMatchObject({ deleted: true, remaining: 0 });
    }
    await fixtureApi?.dispose();
  });

  test("Azienda opens JobSite A and sees the real request opener", async ({ browser }) => {
    const { context, page } = await login(browser, fixture.organizationAUser.email, fixture.password);
    const errors = captureApplicationErrors(page);
    const creation = await context.request.post(`/api/job-sites/${fixture.jobSiteA.id}/requests`, {
      headers: { "Idempotency-Key": `e2e-open-request-${fixture.runId}` },
      data: { expectedRevision: 1, type: "INFORMATION", title: `Richiesta E2E ${fixture.runId}`, body: "Richiesta sintetica per verificare la relazione opener.", blocking: false },
    });
    expect(creation.status()).toBe(201);
    const creationBody = await creation.json() as { result: { requestId: string }; revision: number };
    requestId = creationBody.result.requestId;
    currentRevision = creationBody.revision;

    await page.goto(`/job-sites/${fixture.jobSiteA.id}`);
    await expect(page.getByRole("heading", { name: `Cantiere E2E A ${fixture.runId}`, level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: `Richiesta E2E ${fixture.runId}`, level: 3 })).toBeVisible();
    await expect(page.getByText(/Aperta da Azienda Fixture A/)).toBeVisible();
    expect(errors).toEqual([]);
    await context.close();
  });

  test("Cliente A sees the opener through the privacy-safe projection", async ({ browser }) => {
    const { context, page } = await login(browser, fixture.clientAUser.email, fixture.password);
    const errors = captureApplicationErrors(page);
    const detailResponse = await context.request.get(`/api/client/job-sites/${fixture.jobSiteA.id}`);
    expect(detailResponse.status()).toBe(200);
    const detailText = await detailResponse.text();
    const detail = JSON.parse(detailText) as unknown;
    const keys = collectKeys(detail);
    for (const forbidden of ["email", "phonenumber", "phone", "membershipid", "permissionkeys", "accessversion", "authversion", "platformrole"]) {
      expect(keys.has(forbidden), forbidden).toBe(false);
    }
    expect(detailText).not.toContain(fixture.organizationAUser.email);

    await page.goto(`/client/job-sites/${fixture.jobSiteA.id}`);
    await expect(page.getByRole("heading", { name: `Cantiere E2E A ${fixture.runId}`, level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: `Richiesta E2E ${fixture.runId}`, level: 3 })).toBeVisible();
    await expect(page.getByText(/Aperta da Azienda Fixture A/)).toBeVisible();
    expect(await page.locator("body").innerText()).not.toContain(fixture.organizationAUser.email);
    expect(errors).toEqual([]);
    await context.close();
  });

  test("Cliente B is denied access to JobSite A", async ({ browser }) => {
    const { context } = await login(browser, fixture.clientBUser.email, fixture.password);
    const response = await context.request.get(`/api/client/job-sites/${fixture.jobSiteA.id}`);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain(`Cantiere E2E A ${fixture.runId}`);
    await context.close();
  });

  test("Organization B is denied access to JobSite A", async ({ browser }) => {
    const { context } = await login(browser, fixture.organizationBUser.email, fixture.password);
    const response = await context.request.get(`/api/job-sites/${fixture.jobSiteA.id}`);
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain(`Cantiere E2E A ${fixture.runId}`);
    await context.close();
  });

  test("only the opener can withdraw the request", async ({ browser }) => {
    const client = await login(browser, fixture.clientAUser.email, fixture.password);
    const denied = await client.context.request.post(`/api/client/job-sites/${fixture.jobSiteA.id}/requests/${requestId}`, {
      headers: { "Idempotency-Key": `e2e-client-withdraw-${fixture.runId}` },
      data: { expectedRevision: currentRevision, action: "WITHDRAW", message: "Tentativo non autorizzato." },
    });
    expect(denied.status()).toBe(403);
    await client.context.close();

    const organization = await login(browser, fixture.organizationAUser.email, fixture.password);
    const allowed = await organization.context.request.post(`/api/job-sites/${fixture.jobSiteA.id}/requests/${requestId}`, {
      headers: { "Idempotency-Key": `e2e-opener-withdraw-${fixture.runId}` },
      data: { expectedRevision: currentRevision, action: "WITHDRAW", message: "Ritiro autorizzato della fixture." },
    });
    expect(allowed.status()).toBe(200);
    expect(await allowed.json()).toMatchObject({ result: { requestId, status: "WITHDRAWN" } });
    await organization.context.close();
  });
});
