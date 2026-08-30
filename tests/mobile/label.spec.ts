import { expect, test, type Locator } from "@playwright/test"

import { createInputContext, mobileUrls } from "./support/context"
import { trackRuntimeErrors } from "./support/diagnostics"

async function labelMetrics(label: Locator) {
  return label.evaluate((element) => {
    const computed = getComputedStyle(element)
    const box = element.getBoundingClientRect()
    return {
      color: computed.color,
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      height: box.height,
      lineHeight: computed.lineHeight,
      opacity: computed.opacity,
      transitionDuration: computed.transitionDuration,
      transform: computed.transform,
    }
  })
}

test("Label provides native names, click focus and truthful required, optional, invalid and disabled states", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false })
  const page = await context.newPage()
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Label semantics and states")
  await page.goto(`${mobileUrls.sirio}/components/field`)

  const basicField = page.locator('[data-label-proof="basic"]')
  const basicLabel = basicField.locator('[data-slot="label"]')
  const basicInput = page.getByRole("textbox", { name: "Nome cantiere", exact: true })
  await basicLabel.click()
  await expect(basicInput).toBeFocused()

  const requiredField = page.locator('[data-label-proof="required"]')
  const requiredInput = requiredField.getByRole("textbox", { name: "Codice cantiere", exact: true })
  await expect(requiredInput).toHaveAttribute("required", "")
  const requiredLabel = requiredField.locator('[data-slot="label"]')
  const requiredMarker = requiredLabel.locator('[data-slot="label-required"]')
  await expect(requiredInput).toHaveAccessibleName("Codice cantiere")
  await expect(requiredMarker).toBeVisible()
  await expect(requiredMarker).toHaveAttribute("aria-hidden", "true")
  await expect(requiredMarker).toHaveText("*")
  await expect(requiredInput).not.toHaveAttribute("aria-required")
  await expect(requiredInput).not.toHaveAttribute("aria-invalid")
  await requiredLabel.click()
  await expect(requiredInput).toBeFocused()
  expect(await requiredInput.evaluate((element: HTMLInputElement) => element.validity.valueMissing)).toBe(true)
  const requiredSpecimen = requiredInput.locator('xpath=ancestor::div[h3][1]')
  await expect(requiredSpecimen.getByRole("heading", { name: "Obbligatorietà", exact: true })).toBeVisible()
  const requiredToggle = requiredSpecimen.getByRole("checkbox", { name: "Campo obbligatorio", exact: true })
  await requiredToggle.uncheck()
  await expect(requiredInput).not.toHaveAttribute("required")
  await expect(requiredMarker).toHaveCount(0)
  await expect(requiredLabel.locator('[data-slot="label-optional"]')).toBeVisible()
  await expect(requiredInput).toHaveAccessibleName("Codice cantiere")
  await requiredToggle.check()
  await expect(requiredMarker).toBeVisible()
  await expect(requiredLabel.locator('[data-slot="label-optional"]')).toHaveCount(0)

  const optionalInput = page.getByRole("textbox", { name: "Riferimento interno", exact: true })
  await expect(optionalInput).not.toHaveAttribute("required", "")
  await expect(page.locator('[data-label-proof="optional"] [data-slot="label-optional"]')).toHaveText("Facoltativo")

  const invalidField = page.locator('[data-label-proof="invalid"]')
  const invalidInput = invalidField.getByRole("textbox", { name: "Codice cantiere", exact: true })
  await expect(invalidInput).toHaveAttribute("aria-invalid", "true")
  await expect(invalidInput).toHaveAttribute("required", "")
  expect(await invalidField.locator('[data-slot="label-required"]').evaluate((el) => getComputedStyle(el).color)).toBe(
    await requiredMarker.evaluate((el) => getComputedStyle(el).color),
  )
  await expect(invalidInput).toHaveAttribute("aria-describedby", "label-invalid-help label-invalid-error")
  await expect(invalidField.locator('[data-slot="field-error"]')).toHaveText("Inserisci almeno sei caratteri.")
  expect((await labelMetrics(invalidField.locator('[data-slot="label"]'))).color).toBe(
    (await labelMetrics(basicLabel)).color,
  )

  const disabledField = page.locator('[data-label-proof="disabled"]')
  const disabledInput = disabledField.getByRole("textbox", { name: "Archivio esterno", exact: true })
  await expect(disabledInput).toBeDisabled()
  await expect(disabledInput).toHaveAttribute("required", "")
  await expect(disabledField.locator('[data-slot="label-required"]')).toBeVisible()
  const disabledMetrics = await labelMetrics(disabledField.locator('[data-slot="label"]'))
  expect(disabledMetrics.opacity).toBe("1")
  expect(disabledMetrics.color).not.toBe((await labelMetrics(basicLabel)).color)

  const typography = await labelMetrics(basicLabel)
  expect(typography).toMatchObject({
    fontSize: "14px",
    fontWeight: "500",
    lineHeight: "20px",
    opacity: "1",
    transform: "none",
    transitionDuration: "0s",
  })
  expect(typography.fontFamily).toContain("General Sans")

  for (const name of ["Nota operativa", "Giorni stimati"]) {
    const control = page.getByRole("textbox", { name, exact: true })
    await page.locator(`[data-slot="label"]`, { hasText: name }).click()
    await expect(control).toBeFocused()
  }

  const select = page.getByRole("combobox", { name: "Priorità", exact: true })
  await page.locator('[data-slot="label"]', { hasText: "Priorità" }).click()
  await expect(select).toHaveAttribute("aria-expanded", "true")
  await expect(page.getByRole("listbox")).toBeVisible()

  assertNoRuntimeErrors()
  await context.close()
})

test("Label wraps long content at 320px and remains readable in both global themes", async ({ browser }) => {
  const context = await createInputContext(browser, {
    width: 320,
    height: 720,
    touch: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Label narrow reflow and themes")
  await page.goto(`${mobileUrls.sirio}/components/field`)

  const longField = page.locator('[data-label-proof="long"]')
  const longLabel = longField.locator('[data-slot="label"]')
  const lightMetrics = await labelMetrics(longLabel)
  expect(lightMetrics.height).toBeGreaterThan(40)
  expect(await longLabel.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

  await page.getByRole("button", { name: /^Cambia tema/ }).click()
  await page.getByRole("menuitem", { name: /Scuro/ }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  const darkMetrics = await labelMetrics(longLabel)
  expect(darkMetrics.opacity).toBe("1")
  expect(darkMetrics.color).not.toBe(lightMetrics.color)

  await longLabel.click()
  await expect(longField.getByRole("textbox", { name: "Riferimento operativo condiviso con il responsabile del cantiere e con il cliente invitato", exact: true })).toBeFocused()
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%" })
  for (const proof of ["long", "long-required"]) {
    const label = page.locator('[data-label-proof="' + proof + '"] [data-slot="label"]')
    expect(await label.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true)
    expect((await labelMetrics(label)).height).toBeGreaterThan(40)
  }
  const readonly = page.locator('#label-long-required')
  const optionalMetadata = longLabel.locator('[data-slot="label-optional"]')
  expect(await optionalMetadata.evaluate((el) => el.getBoundingClientRect().height)).toBe(32)
  expect(await optionalMetadata.evaluate((el) => getComputedStyle(el).whiteSpace)).toBe("nowrap")
  await expect(readonly).toHaveAttribute("readonly", "")
  await expect(readonly).toHaveAttribute("required", "")
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  assertNoRuntimeErrors()
  await context.close()
})
