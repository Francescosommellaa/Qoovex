import { expect, test } from "@playwright/test"

import { createInputContext, mobileUrls } from "./support/context"
import { trackRuntimeErrors } from "./support/diagnostics"

test("Field composes native semantics, stable spacing and consumer-backed horizontal layout", async ({ browser }) => {
  const context = await createInputContext(browser, { width: 1024, height: 900, touch: false })
  const page = await context.newPage()
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Field composition")
  await page.goto(`${mobileUrls.sirio}/components/field`)

  const basic = page.locator('[data-field-proof="basic"]')
  await expect(basic).not.toHaveAttribute("role")
  expect(await basic.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      direction: style.flexDirection,
      minWidth: style.minWidth,
      rowGap: style.rowGap,
      transform: style.transform,
      transitionDuration: style.transitionDuration,
    }
  })).toEqual({
    direction: "column",
    minWidth: "0px",
    rowGap: "6px",
    transform: "none",
    transitionDuration: "0s",
  })

  await basic.locator('[data-slot="label"]').click()
  await expect(basic.getByRole("textbox", { name: "Nome cantiere", exact: true })).toBeFocused()

  const complete = page.locator('[data-field-proof="complete"]')
  const completeInput = complete.getByRole("textbox", { name: "Responsabile", exact: true })
  await expect(completeInput).toHaveAttribute("aria-describedby", "label-description-help")
  await expect(completeInput).toHaveAccessibleDescription("La persona che coordina il lavoro operativo.")
  const basicDescription = complete.locator('[data-slot="field-description"]')
  await expect(basicDescription).toHaveJSProperty("tagName", "P")
  await expect(basicDescription).not.toHaveAttribute("role")
  await expect(basicDescription).not.toHaveAttribute("aria-live")
  expect(await basicDescription.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      minWidth: style.minWidth,
      opacity: style.opacity,
      transform: style.transform,
      transitionDuration: style.transitionDuration,
    }
  })).toEqual({
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "20px",
    minWidth: "0px",
    opacity: "1",
    transform: "none",
    transitionDuration: "0s",
  })
  const verticalBoxes = await complete.locator('[data-slot="label"], input, [data-slot="field-description"]').evaluateAll(
    (elements) => elements.map((element) => {
      const box = element.getBoundingClientRect()
      return { bottom: box.bottom, top: box.top }
    }),
  )
  expect(verticalBoxes[0].bottom).toBeLessThan(verticalBoxes[1].top)
  expect(verticalBoxes[1].bottom).toBeLessThan(verticalBoxes[2].top)

  const invalid = page.locator('[data-field-proof="invalid"]')
  await expect(invalid).not.toHaveAttribute("role")
  const invalidInput = invalid.getByRole("textbox", { name: "Codice cantiere", exact: true })
  await expect(invalidInput).toHaveAttribute("aria-invalid", "true")
  await expect(invalidInput).toHaveAttribute("aria-describedby", "label-invalid-help label-invalid-error")
  await expect(invalidInput).toHaveAccessibleDescription(
    "Usa il codice riportato nel piano operativo. Inserisci almeno sei caratteri.",
  )
  const basicError = invalid.locator('[data-slot="field-error"]')
  await expect(basicError).toBeVisible()
  await expect(basicError).not.toHaveAttribute("role")
  await expect(basicError).not.toHaveAttribute("aria-live")
  expect(await basicError.evaluate((element) => {
    const style = getComputedStyle(element)
    return {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      minWidth: style.minWidth,
      opacity: style.opacity,
      transform: style.transform,
      transitionDuration: style.transitionDuration,
    }
  })).toEqual({
    fontSize: "14px",
    fontWeight: "400",
    lineHeight: "20px",
    minWidth: "0px",
    opacity: "1",
    transform: "none",
    transitionDuration: "0s",
  })
  expect(await invalid.locator('[data-slot="label"]').evaluate((element) => getComputedStyle(element).color)).toBe(
    await basic.locator('[data-slot="label"]').evaluate((element) => getComputedStyle(element).color),
  )
  expect(await invalid.locator('[data-slot="field-description"]').evaluate((element) => getComputedStyle(element).color)).toBe(
    await basicDescription.evaluate((element) => getComputedStyle(element).color),
  )
  expect(await basicError.evaluate((element) => getComputedStyle(element).color)).not.toBe(
    await basicDescription.evaluate((element) => getComputedStyle(element).color),
  )

  const disabled = page.locator('[data-field-proof="disabled"]')
  const disabledInput = disabled.getByRole("textbox", { name: "Archivio esterno", exact: true })
  await expect(disabledInput).toBeDisabled()
  await expect(disabledInput).toHaveAccessibleDescription("Disponibile quando la connessione aziendale è attiva.")
  await expect(disabled).toHaveCSS("opacity", "1")
  await expect(disabled.locator('[data-slot="field-description"]')).toHaveCSS("opacity", "1")

  const long = page.locator('[data-description-proof="long"]')
  const inlineLink = long.locator('[data-description-proof="with-link"]')
  await expect(inlineLink).toHaveAttribute("data-slot", "link")
  await expect(inlineLink).toHaveAttribute("data-link", "inline")
  await expect(inlineLink).toHaveAttribute("href", "/patterns/form-validation")

  const withCounter = page.locator('[data-description-proof="with-counter"]')
  const note = withCounter.getByRole("textbox", { name: "Nota operativa", exact: true })
  await expect(note).toHaveAttribute("aria-describedby", "label-textarea-help label-textarea-count")
  await note.fill("Nota reale")
  await expect(withCounter.locator("#label-textarea-count")).toHaveText("10 / 500")
  await expect(note).toHaveAccessibleDescription("Massimo 500 caratteri. 10 caratteri su 500")
  const supportingRow = withCounter.locator("#label-textarea-help").locator("..")
  expect(await supportingRow.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)

  const multiple = page.locator('[data-error-proof="multiple"]')
  const multipleInput = multiple.getByRole("textbox", { name: "Riferimento cliente", exact: true })
  await expect(multipleInput).toHaveAttribute("aria-invalid", "true")
  await expect(multipleInput).toHaveAccessibleDescription(
    "Inserisci almeno tre caratteri. Usa soltanto lettere e numeri.",
  )
  await expect(multiple.getByRole("listitem")).toHaveCount(2)

  const interactive = page.locator('[data-error-proof="interactive"]')
  const interactiveInput = interactive.getByRole("textbox", { name: "Codice cantiere", exact: true })
  const interactiveField = interactive.locator('[data-slot="field"]')
  const inputBoxBefore = await interactiveInput.boundingBox()
  const formHeightBefore = (await interactive.boundingBox())?.height ?? 0
  await expect(interactive.locator('[data-slot="field-error"]')).toHaveCount(0)
  await interactive.getByRole("button", { name: "Verifica codice", exact: true }).click()
  await expect(interactiveInput).toBeFocused()
  await expect(interactiveInput).toHaveAttribute("aria-invalid", "true")
  await expect(interactiveInput).toHaveAttribute(
    "aria-describedby",
    "field-interactive-help field-interactive-error-message",
  )
  await expect(interactiveInput).toHaveAccessibleDescription(
    "Il codice deve essere univoco nel workspace. Questo codice è già in uso. Scegline uno diverso.",
  )
  await expect(interactiveField.locator('[data-slot="field-error"]')).not.toBeFocused()
  expect((await interactiveInput.boundingBox())?.height).toBe(inputBoxBefore?.height)
  expect((await interactive.boundingBox())?.height ?? 0).toBeGreaterThan(formHeightBefore)
  await interactiveInput.fill("QVX-205")
  await expect(interactiveInput).not.toHaveAttribute("aria-invalid")
  await expect(interactiveInput).toHaveAttribute("aria-describedby", "field-interactive-help")
  await expect(interactiveInput).toHaveAccessibleDescription("Il codice deve essere univoco nel workspace.")
  await expect(interactive.locator('[data-slot="field-error"]')).toHaveCount(0)

  const horizontal = page.locator('[data-field-proof="horizontal"]')
  await expect(page.getByRole("checkbox")).toHaveCount(1)
  await expect(page.getByRole("region", { name: "Convenzione", exact: true }).locator('[data-field-proof="horizontal"]')).toHaveCount(1)
  await expect(page.getByRole("region", { name: "Contenuto lungo", exact: true }).getByRole("checkbox")).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Checkbox con etichetta", exact: true })).toHaveCount(0)
  await expect(horizontal).toHaveCSS("flex-direction", "row")
  const requiredToggle = horizontal.getByRole("checkbox", { name: "Campo obbligatorio", exact: true })
  await expect(requiredToggle).toBeChecked()
  await horizontal.locator('[data-slot="label"]').click()
  await expect(requiredToggle).not.toBeChecked()
  await expect(page.locator('#label-required')).not.toHaveAttribute("required")
  await requiredToggle.press("Space")
  await expect(requiredToggle).toBeChecked()
  await expect(page.locator('#label-required')).toHaveAttribute("required", "")

  assertNoRuntimeErrors()
  await context.close()
})

test("Field and supporting content reflow without overflow at 320px and 200 percent equivalent", async ({ browser }) => {
  const context = await createInputContext(browser, {
    width: 320,
    height: 720,
    touch: true,
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  const assertNoRuntimeErrors = trackRuntimeErrors(page, "Field narrow reflow")
  await page.goto(`${mobileUrls.sirio}/components/field`)

  const long = page.locator('[data-field-proof="long"]')
  const longDescription = long.locator('[data-slot="field-description"]')
  const lightDescriptionColor = await longDescription.evaluate((element) => getComputedStyle(element).color)
  for (const slot of ["label", "field-description"]) {
    expect(await long.locator(`[data-slot="${slot}"]`).evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }))).toMatchObject({
      clientWidth: expect.any(Number),
      scrollWidth: expect.any(Number),
    })
    expect(await long.locator(`[data-slot="${slot}"]`).evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

  const longError = page.locator('[data-error-proof="long"] [data-slot="field-error"]')
  const lightErrorColor = await longError.evaluate((element) => getComputedStyle(element).color)
  expect(await longError.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)

  await page.addStyleTag({ content: "html { font-size: 200%; }" })
  await expect(long).toBeVisible()
  expect(await longDescription.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(40)
  expect(await longError.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(40)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

  const narrowCounterField = page.locator('[data-description-proof="with-counter"]')
  const supportingBoxes = await narrowCounterField
    .locator('[data-slot="field-description"], [data-slot="character-counter"]')
    .evaluateAll((elements) => elements.map((element) => {
      const box = element.getBoundingClientRect()
      return { bottom: box.bottom, top: box.top, width: box.width }
    }))
  expect(supportingBoxes[0].width).toBeGreaterThan(100)
  expect(supportingBoxes[1].top).toBeGreaterThanOrEqual(supportingBoxes[0].bottom)

  await page.getByRole("button", { name: /^Cambia tema/ }).click()
  await page.getByRole("menuitem", { name: /Scuro/ }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)
  await expect(longDescription).toHaveCSS("opacity", "1")
  await expect(longError).toHaveCSS("opacity", "1")
  expect(await longError.evaluate((element) => getComputedStyle(element).color)).not.toBe(lightErrorColor)
  expect(await longDescription.evaluate((element) => getComputedStyle(element).color)).not.toBe(lightDescriptionColor)
  await long.locator('[data-slot="label"]').click()
  await expect(long.getByRole("textbox", { name: /Riferimento operativo condiviso/ })).toBeFocused()

  assertNoRuntimeErrors()
  await context.close()
})
