import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
test('3. Organisation Page', async ({ browser }) => {
  let page: Page
  page = await browser.newPage()

  //User: Registrar General(c.lungu)
  //WIP: https://github.com/opencrvs/opencrvs-core/issues/11697 , This ticket is to be resolved to have complete test case.

  test.describe('3.1 UI check', async () => {
    test('3.1.0 Verify Province -> District -> District Office', async () => {
      await login(page, CREDENTIALS.REGISTRAR_GENERAL)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
      await page.getByRole('button', { name: /Chuminga/ }).click()
      await page.getByRole('button', { name: /Soka/ }).click()

      await page.getByRole('button', { name: /Soka District Office/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Soka District Office/
      )
      await expect(
        page.getByText('Soka, Chuminga', { exact: true })
      ).toBeVisible()
    })
  })

  await page.close()
})
