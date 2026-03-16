import { test, expect, type Page } from '@playwright/test'
import { continueForm, login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyTeamMembers } from '../birth/helpers'

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

      expect(
        page.getByText('Embe, Pualula', {
          exact: true
        })
      ).toBeVisible()
    })
     const team = [
        { name: 'Joseph Musonda', role: 'Registrar General' },
        { name: 'Edgar Kazembe', role: 'Operations Manager' },
        { name: 'Jonathan Campbell' , role: 'National Administrator' }
      ]

    test('2.1.1 Verify Team Members Status', async () => {
      

        await verifyTeamMembers(page, team)
      
    })
  })

  test.describe.serial('2.2 User Account Actions', () => {
    let page: Page

    test.beforeAll(async ({ browser }) => {
      page = await browser.newPage()
    })

    test.afterAll(async () => {
      await page.close()
    })
    test('2.2.1 Edit User Details', async () => {
      await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)

      await page.getByRole('button', { name: 'Team' }).click()
      await page.locator('//nav[@id="user-item-0-menu-dropdownMenu"]').click()
      await page
        .locator('//ul[@id="user-item-0-menu-Dropdown-Content"]')
        .getByText('Edit details')
        .click()

      await expect(page.getByText('Confirm details')).toBeVisible()
      await expect(
        page
          .getByTestId('list-view-label')
          .filter({ hasText: 'Registration Office' })
      ).toBeVisible()
    })

    /**
     * Skip latter part until implementing new user scopes.
     */
    test.skip('2.2.2 Change Phone Number', async () => {
      const phoneNumber = '0785963214'
      await page.locator('#btn_change_phoneNumber:visible').click()
      await page.locator('input[name="phoneNumber"]').fill(phoneNumber)
      await page.getByRole('button', { name: 'Continue' }).click()

      await continueForm(page)

      await page.getByRole('button', { name: 'Confirm' }).click()
    })

    test.skip('2.2.3 Verify Phone Number Changed', async () => {
      await page.locator('//nav[@id="user-item-0-menu-dropdownMenu"]').click()
      await page
        .locator('//ul[@id="user-item-0-menu-Dropdown-Content"]')
        .getByText('Edit details')
        .click()
      await expect(
        page
          .locator('div')
          .filter({ hasText: /^Phone number0785963214$/ })
          .locator('#value_3')
      ).toBeVisible()
    })
  })
})
