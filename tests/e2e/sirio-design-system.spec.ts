import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const baseUrl = "http://localhost:3002";
const isPhone = (name: string) => name.includes("390") || name.includes("375");
const isDesktopChromium = (name: string) => name === "chromium-1440";
const isChromium = (name: string) => name.startsWith("chromium");

test.beforeEach(async ({ page }) => { await page.goto(baseUrl); });

test("presenta il cervello operativo pre-servizio", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /Prima del servizio.*Numeri che reggono/i })).toBeVisible();
  await expect(page.getByText("OK — verifica fisica consigliata", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Assistente operativo.*Non gestionale live/i })).toBeVisible();
  await expect(page.getByText(/React Native Web|apps\/product/i)).toHaveCount(0);
});

test("apre l’assistente con un click e mostra la regola", async ({ page }, testInfo) => {
  test.skip(!isChromium(testInfo.project.name));
  await page.goto(`${baseUrl}/components#assistant-launcher`);
  const section = page.locator("#assistant-launcher");
  await section.getByRole("button", { name: "Chiedi a Qoovex" }).click();
  await expect(section.getByRole("dialog", { name: "Assistente operativo" })).toBeVisible();
  await expect(section.getByText("Prepara 25 cotolette.", { exact: true })).toBeVisible();
  await expect(section.locator(".sample-trace footer")).toContainText("22 × 1,10 = 24,2 → 25");
});

test("struttura il testo libero e restituisce dati da verificare", async ({ page }) => {
  await page.goto(`${baseUrl}/components#free-text-intake`);
  const section = page.locator("#free-text-intake");
  await section.getByRole("button", { name: "Struttura evento" }).click();
  await expect(section.getByRole("button", { name: "Evento strutturato" })).toBeVisible();
  await expect(section.getByRole("status")).toContainText("8 dati estratti");
});

test("salva una regola mancante nello specimen", async ({ page }) => {
  await page.goto(`${baseUrl}/components#missing-data`);
  const button = page.locator("#missing-data").getByRole("button", { name: "Salva 1 cad. + 10%" });
  await button.click();
  await expect(page.locator("#missing-data").getByRole("button", { name: /Regola salvata/ })).toBeDisabled();
});

test("mantiene separati richiesto approvato prodotto teorico e verificato", async ({ page }) => {
  await page.goto(`${baseUrl}/components#quantity-status`);
  const section = page.locator("#quantity-status");
  await expect(section.getByText("Richiesto", { exact: true })).toBeVisible();
  await expect(section.getByText("Extra teorico", { exact: true })).toBeVisible();
  await expect(section.getByText("Non ancora", { exact: true })).toBeVisible();
});

test("approva la proposta chef e registra la produzione", async ({ page }, testInfo) => {
  test.skip(!isChromium(testInfo.project.name));
  await page.goto(`${baseUrl}/components#chef-approval`);
  const approval = page.locator("#chef-approval");
  await approval.getByRole("button", { name: "Approva preparazione" }).click();
  await expect(approval.getByRole("button", { name: "Approvate 35 cotolette" })).toBeDisabled();

  const completion = page.locator("#production-completion");
  await completion.scrollIntoViewIfNeeded();
  await completion.getByRole("button", { name: "Registra produzione" }).click();
  await expect(completion.getByRole("button", { name: "Produzione registrata" })).toBeVisible();
});

test("espone briefing cucina e sala", async ({ page }) => {
  await page.goto(`${baseUrl}/components#kitchen-briefing`);
  await expect(page.locator("#kitchen-briefing").getByText("BRIEFING CUCINA · DOMANI")).toBeVisible();
  await expect(page.locator("#service-briefing").getByText("BRIEFING SALA · DOMANI")).toBeVisible();
});

test("il menu phone ripristina il focus", async ({ page }, testInfo) => {
  test.skip(!isPhone(testInfo.project.name));
  const trigger = page.getByRole("button", { name: "Apri menu" });
  await trigger.click();
  await expect(page.getByRole("button", { name: "Chiudi menu" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("non genera overflow orizzontale e rispetta reduced motion", async ({ page }, testInfo) => {
  test.skip(!isChromium(testInfo.project.name));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const state = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth, behavior: getComputedStyle(document.documentElement).scrollBehavior }));
  expect(state.scroll).toBeLessThanOrEqual(state.client);
  expect(state.behavior).toBe("auto");
});

test("non presenta violazioni Axe serie o critiche", async ({ page }, testInfo) => {
  test.skip(!isDesktopChromium(testInfo.project.name));
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(({ impact }) => impact === "critical" || impact === "serious")).toEqual([]);
});

test("documenta ruoli isolati e supporto auditato", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Direttore" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Capo sala" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Capo cucina" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Brigata" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Super Admin" })).toBeVisible();
  await expect(page.getByText(/Il codice identifica.*Non autentica/i)).toBeVisible();
});

test("nasconde una destinazione non autorizzata nello shell", async ({ page }) => {
  await page.goto(`${baseUrl}/components#adaptive-shell`);
  const shell = page.locator("#adaptive-shell");
  await expect(shell.getByRole("link", { name: "Prepara" })).toBeVisible();
  await expect(shell.getByRole("link", { name: "Direzione" })).toHaveCount(0);
});

test("espone inviti e sessione supporto come componenti canonici", async ({ page }) => {
  await page.goto(`${baseUrl}/components#invitation-composer`);
  await expect(page.locator("#invitation-composer").getByRole("button", { name: "Invia invito" })).toBeVisible();
  await expect(page.locator("#support-access").getByRole("button", { name: "Apri sessione" })).toBeVisible();
  await expect(page.locator("#support-banner").getByLabel("Sessione supporto attiva")).toBeVisible();
});
