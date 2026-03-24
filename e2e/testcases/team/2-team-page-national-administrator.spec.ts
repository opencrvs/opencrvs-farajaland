import { test, expect, type Page } from '@playwright/test'
import { continueForm, continueUntilReview, login } from '../../helpers'
import { CREDENTIALS } from '../../constants'

test.describe('2. Team Page', () => {
  test.describe.serial('2.1 Basic UI check', async () => {
    let page: Page

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })

    test('2.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
      await page.getByRole('button', { name: 'Team' }).click()
      await expect(page.locator('#content-name')).toHaveText('HQ Office')
    })

    test('2.1.1 Verify Team Members Status', async () => {
      const row1 = page.getByRole('row', { name: /Mutale Musonda/ })
      await expect(row1.getByText('Active')).toBeVisible()
      const row2 = page.getByRole('row', { name: /Chipo Lungu/ })
      await expect(row2.getByText('Active')).toBeVisible()
      const row3 = page.getByRole('row', { name: /Jonathan Campbell/ })
      await expect(row3.getByText('Active')).toBeVisible()
    })
  })

  test.describe.serial('2.2 User Account Actions', () => {
    let page: Page

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
      await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)

      await page.getByRole('button', { name: 'Team' }).click()
      await page.locator('//nav[@id="user-item-0-menu-dropdownMenu"]').click()
      await page
        .locator('//ul[@id="user-item-0-menu-Dropdown-Content"]')
        .getByText('Edit details')
        .click()
    })

    test.afterAll(async () => {
      await page.close()
    })
    test('2.2.1 Edit User Details', async () => {
      await expect(page.getByText('Confirm details')).toBeVisible()
      await expect(
        page
          .getByTestId('accordion-Accordion_user.office')
          .filter({ hasText: 'Registration Office' })
      ).toBeVisible()
    })

    /**
     * Skip latter part until implementing new user scopes.
     */
    const phoneNumber = '0785963214'
    test('2.2.2 Change Phone Number', async () => {
      await page.getByTestId('change-button-phoneNumber').click()
      await page.locator('input[name="phoneNumber"]').fill(phoneNumber)
      await continueUntilReview(page)
      await page.getByRole('button', { name: 'Confirm' }).click()
      expect(page.url()).toContain('view')
    })

    test('2.2.3 Verify Phone Number Changed', async () => {
      await expect(page.getByTestId('row-value-phoneNumber')).toContainText(
        phoneNumber
      )
    })
  })
})
