import { expect, type Locator, type Page } from "@playwright/test";
import { surfaceTarget, type VisualSurface } from "./stability";

type InteractionSetup = (page: Page, surface: VisualSurface) => Promise<void>;

async function targetFor(page: Page, surface: VisualSurface): Promise<Locator> {
  const target = surfaceTarget(page, surface);
  await expect(target).toBeVisible();
  return target;
}

export const INTERACTION_SETUPS: Readonly<Record<string, InteractionSetup>> = Object.freeze({
  none: async () => {},
  "focus-visible": async (page, surface) => {
    const button = (await targetFor(page, surface)).getByRole("button").first();
    await page.keyboard.press("Tab");
    await button.focus();
    await expect(button).toBeFocused();
  },
  "dialog-open": async (page, surface) => {
    await (await targetFor(page, surface)).getByRole("button", { name: "Nuovo Cantiere", exact: true }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  },
  "dropdown-open": async (page, surface) => {
    await (await targetFor(page, surface)).getByRole("button", { name: "Azioni Cantiere", exact: true }).click();
    await expect(page.getByRole("menu")).toBeVisible();
  },
  "select-open": async (page, surface) => {
    await (await targetFor(page, surface)).getByRole("combobox").click();
    await expect(page.getByRole("listbox")).toBeVisible();
  },
  "tooltip-open": async (page, surface) => {
    await (await targetFor(page, surface)).getByRole("button", { name: "Superiore (Top)", exact: true }).hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
  },
  "collapsible-expanded": async (page, surface) => {
    const trigger = (await targetFor(page, surface)).getByRole("button").first();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  },
  "tabs-selected": async (page, surface) => {
    const tab = (await targetFor(page, surface)).getByRole("tab", { name: /Timeline/ });
    await tab.click();
    await expect(tab).toHaveAttribute("aria-selected", "true");
  },
  "checked-controls": async (page, surface) => {
    const target = await targetFor(page, surface);
    await expect(target.getByRole("checkbox", { checked: true }).first()).toBeChecked();
    await expect(target.getByRole("radio", { checked: true }).first()).toBeChecked();
  },
});

export async function applyInteractionSetup(page: Page, surface: VisualSurface): Promise<void> {
  const setupId = surface.setupId ?? "none";
  const setup = INTERACTION_SETUPS[setupId];
  if (!setup) throw new Error(`unknown visual interaction setup: ${setupId}`);
  await setup(page, surface);
}

export function captureTarget(page: Page, surface: VisualSurface): Page | Locator {
  if (["dialog-open", "dropdown-open", "select-open", "tooltip-open"].includes(surface.setupId ?? "")) {
    return page;
  }
  if (surface.app !== "sirio") return page;
  return surfaceTarget(page, surface);
}

