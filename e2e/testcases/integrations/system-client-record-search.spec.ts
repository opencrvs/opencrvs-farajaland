import { test, type Page, expect } from '@playwright/test'
import { CREDENTIALS } from '../../constants'
import { createPIN, login } from '../../helpers'

test.describe.serial('1. Birth declaration case - 1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Searching records as a system client', async () => {
    test.beforeAll(async () => {
      await login(
        page,
        CREDENTIALS.NATIONAL_SYSTEM_ADMIN.USERNAME,
        CREDENTIALS.NATIONAL_SYSTEM_ADMIN.PASSWORD
      )
      await createPIN(page)
    })

    test('Create a system client', async () => {
      await expect(
        page.getByText('Organisation', { exact: true }).first()
      ).toBeVisible()
      await page.getByText('Configuration', { exact: true }).click()
      await page.getByText('Integrations', { exact: true }).click()
      await page.getByText('Create client', { exact: true }).click()
      await page.locator('#client_name').fill('Test client ' + Date.now())
      await page.locator('#permissions-selectors').click()
      await page.getByText('Record search', { exact: true }).last().click()
      await page.getByText('Create', { exact: true }).click()
      await expect(page.getByText('Client ID', { exact: true })).toBeVisible()

      await page.waitForSelector('#Spinner', { state: 'detached' })

      const clientId = await page
        .getByText('Client ID', { exact: true })
        .locator('..')
        .locator(':nth-child(2) :first-child')
        .first()
        .textContent()
      const secret = await page
        .getByText('Client secret', { exact: true })
        .locator('..')
        .locator(':nth-child(2) :first-child')
        .first()
        .textContent()
      const sha = await page
        .getByText('SHA secret', { exact: true })
        .locator('..')
        .locator(':nth-child(2) :first-child')
        .first()
        .textContent()
      console.log({
        clientId,
        secret,
        sha
      })
    })
  })
})
