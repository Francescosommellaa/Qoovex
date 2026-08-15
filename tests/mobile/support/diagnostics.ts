import { expect, type Page } from "@playwright/test";

export function trackRuntimeErrors(page: Page, label: string) {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(`console.error: ${message.text()}`);
    }
  });

  return () => {
    expect(errors, `${label} emitted runtime, hydration, or console errors`).toEqual([]);
  };
}
