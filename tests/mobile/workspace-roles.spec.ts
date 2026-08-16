import { expect, test, type Page } from "@playwright/test";

import { createInputContext, mobileUrls, selectDevView } from "./support/context";
import { trackRuntimeErrors } from "./support/diagnostics";
import { expectNoDocumentOverflow, expectTouchTarget } from "./support/geometry";

test.describe.configure({ mode: "serial" });

test("BUSINESS view exposes a usable mobile workspace drawer", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "BUSINESS mobile workspace");
  await selectDevView(page, "BUSINESS");
  await page.goto(`${mobileUrls.workspace}/`);
  if (page.url().includes("/account/organization")) {
    await page.getByRole("textbox", { name: "Nome azienda" }).fill("Qoovex Mobile CI");
    await page.getByRole("button", { name: "Crea la tua azienda" }).tap();
    await page.waitForURL(`${mobileUrls.workspace}/`);
  }
  await assertWorkspaceDrawer(page, "BUSINESS", ["Panoramica", "Cantieri"], ["Profilo pagamento", "Collaboratori", "Gestisci azienda", "Gestisci account", "Impostazioni"], "Azienda e impostazioni");
  assertNoRuntimeErrors();
  await context.close();
});

test("PROFESSIONAL view preserves its invite or authorized workspace path at mobile width", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "PROFESSIONAL mobile workspace");
  await selectDevView(page, "PROFESSIONAL");
  await page.goto(`${mobileUrls.workspace}/`);
  if (page.url().includes("/account/invitations")) {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/inviti/i);
    await expectNoDocumentOverflow(page, "PROFESSIONAL invitations");
  } else {
    await assertWorkspaceDrawer(page, "PROFESSIONAL", ["Panoramica", "Cantieri"], ["Profilo pagamento", "Collaboratori", "Gestisci azienda", "Gestisci account", "Impostazioni"], "Azienda e impostazioni");
  }
  assertNoRuntimeErrors();
  await context.close();
});

test("CLIENT view exposes only its client mobile navigation", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 390, height: 844, touch: true });
  const page = await context.newPage();
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "CLIENT mobile workspace");
  await selectDevView(page, "CLIENT");
  await page.goto(`${mobileUrls.workspace}/client`);
  await assertWorkspaceDrawer(page, "CLIENT", ["I tuoi lavori", "Account e dati"], [], "Account e dati");
  await expect(page.getByRole("link", { name: "Cantieri" })).toHaveCount(0);
  assertNoRuntimeErrors();
  await context.close();
});

async function assertWorkspaceDrawer(page: Page, role: string, expectedLinks: string[], excludedLinks: string[] = [], accountLink?: string) {
  await expectNoDocumentOverflow(page, `${role} workspace`);
  const trigger = page.getByRole("button", { name: "Apri navigazione" }).first();
  await expectTouchTarget(trigger, `${role} drawer trigger`);
  await trigger.tap();
  const navigation = page.getByRole("navigation", { name: "Navigazione workspace" });
  await expect(navigation).toBeVisible();
  for (const label of expectedLinks) {
    await expect(navigation.getByRole("link", { name: label })).toBeVisible();
  }
  await expect(navigation.getByRole("link", { name: expectedLinks[0] })).toHaveAttribute("aria-current", "page");
  for (const label of excludedLinks) {
    await expect(navigation.getByRole("link", { name: label, exact: true })).toHaveCount(0);
  }
  if (accountLink) await expect(navigation.getByRole("link", { name: accountLink, exact: true })).toBeVisible();
  await expect(navigation.getByText("mario.rossi.dev.profile.email.molto.lunga@qoovex.local")).toBeVisible();
  await expectNoDocumentOverflow(page, `${role} open drawer with long content`);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
}
