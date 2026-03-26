import { test, expect, type Page } from '@playwright/test'
import { CREDENTIALS } from '../../constants'
import { formatV2ChildName } from '../birth/helpers'
import { createDeclaration } from '../test-data/birth-declaration'
import { getToken, login } from '../../helpers'
import { ActionType } from '@opencrvs/toolkit/events'
test("Registar General's 'Pending registration' -workqueue", async ({
  browser
}) => {
  const page: Page = await browser.newPage()
  let embassyDeclarationChildName: string
  let registrarDeclarationChildName: string

  try {
    await test.step('Declare a birth by Embassy Official', async () => {
      const token = await getToken(
        CREDENTIALS.EMBASSY_OFFICIAL.USERNAME,
        CREDENTIALS.EMBASSY_OFFICIAL.PASSWORD
      )
      const res = await createDeclaration(token, undefined, ActionType.DECLARE)
      embassyDeclarationChildName = formatV2ChildName(res.declaration)
    })
    await test.step('Declare a birth by Registrar', async () => {
      const token = await getToken(
        CREDENTIALS.REGISTRAR.USERNAME,
        CREDENTIALS.REGISTRAR.PASSWORD
      )
      const res = await createDeclaration(token, undefined, ActionType.DECLARE)
      registrarDeclarationChildName = formatV2ChildName(res.declaration)
    })
    await test.step('Login as Registrar General', async () => {
      await login(page, CREDENTIALS.REGISTRAR_GENERAL)
    })
    await test.step("Navigate to 'Pending registration' -workqueue", async () => {
      await page.getByText('Pending registration').click()
    })
    await test.step("Record declared by Embassy Official should show up on Registrar Generals 'Pending registration' -workqueue", async () => {
      await expect(
        page.getByRole('button', { name: embassyDeclarationChildName })
      ).toBeVisible()
    })
    await test.step("Record declared by Registrar should not show up on Registrar Generals 'Pending registration' -workqueue", async () => {
      await expect(
        page.getByRole('button', { name: registrarDeclarationChildName })
      ).not.toBeVisible()
    })
  } finally {
    await page.close()
  }
})
