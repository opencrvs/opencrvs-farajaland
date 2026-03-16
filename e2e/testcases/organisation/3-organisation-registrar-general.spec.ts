import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersClickable } from '../birth/helpers'
test.describe.serial('3. Organisation Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe.serial('3.1 UI check', async () => {
    test('3.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.REGISTRAR_GENERAL)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test('3.1.1 Verify Province -> District -> Health Facility(No Data)', async () => {
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page
        .getByRole('button', { name: /Kaparu Rural Health Centre/ })
        .click()
      await expect(page.locator('#content-name')).toHaveText(
        /Kaparu Rural Health Centre/
      )
      await expect(
        page.getByText('Ibombo, Central', { exact: true })
      ).toBeVisible()
      await expect(page.getByText('No result')).toBeVisible()
    })
    test('3.1.2 Verify Province -> District -> District Office(No Data)', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Pualula/ }).click()
      await page.getByRole('button', { name: /Funabuli/ }).click()

      await page
        .getByRole('button', { name: /Chishi Rural Health Centre/ })
        .click()
      await expect(page.locator('#content-name')).toHaveText(
        /Chishi Rural Health Centre/
      )
      await expect(
        page.getByText('Funabuli, Pualula', { exact: true })
      ).toBeVisible()
      await expect(page.getByText('No result')).toBeVisible()
    })

    test('3.1.2 Verify Province -> District -> District Office', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Pualula/ }).click()
      await page.getByRole('button', { name: /Embe/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page.getByRole('button', { name: /HQ Office/ }).click()
      await expect(page.locator('#content-name')).toHaveText(/HQ Office/)
      await expect(
        page.getByText('Embe, Pualula', { exact: true })
      ).toBeVisible()
    })
    test('1.1.3 Verify team page member list', async () => {
      const members = ['Joseph Musonda', 'Edgar Kazembe', 'Jonathan Campbell']

      await verifyMembersClickable(page, members, 'HQ Office')
    })
  })
})