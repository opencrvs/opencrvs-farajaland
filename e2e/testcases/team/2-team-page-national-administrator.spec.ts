import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { ensureLoginPageReady, continueForm, login } from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS, LOGIN_URL } from '../../constants'
import { getUserByRole } from '@countryconfig/data-generator/users'
import _, { has, nth, slice } from 'lodash'
import { isPageHeaderFieldType } from '@opencrvs/toolkit/events'
import { type } from '../../utils'
import exp from 'constants'

test.describe.serial('2. Team Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('2.1 Basic UI check', async () => {
    test('2.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
      await page.getByRole('button', { name: 'Team' }).click()
      await expect(page.locator('#content-name')).toHaveText('HQ Office')
      await expect(
        page.locator('.LocationInfoValue-sc-1ou3q8c-5.cCnjTR')
      ).toHaveText('Embe, Pualula')
    })
    test('2.1.1 Verify Team Members Status', async ({ page }) => {
      // const button = page.getByRole('button', {
      //   name: 'Joseph Musonda'
      // })
      // const parentRow = button.locator(
      //   'xpath=ancestor::*[starts-with(@class, "UserRow-")]'
      // )
      // await expect(parentRow.locator('span')).toHaveText('Active');
      const row = page.getByRole('row', { name: /Joseph Musonda/ })

      await expect(row.getByText('Active')).toBeVisible()
    })
  })
  test.describe('2.2 User Account Actions', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
    })

    test('2.2.1 Edit User Details', async () => {
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
  })
})
