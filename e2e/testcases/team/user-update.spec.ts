import { test, expect, type Page } from '@playwright/test'
import { login, createPIN, getToken } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'
import { createUser } from './helper'

test.describe.serial('Update user', () => {
  let page: Page
  let createdUser: { username: string; fullName: string }
  const updatedEmail = faker.internet.email()
  const updatedRole = 'Hospital Clerk'
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    await login(
      page,
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN.USERNAME,
      CREDENTIALS.NATIONAL_SYSTEM_ADMIN.PASSWORD
    )
    await createPIN(page)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('Shortcut user creation', async () => {
    const token = await getToken('j.campbell', 'test')
    createdUser = await createUser(token)
  })

  test('Open user list and click "Edit details" for created user', async () => {
    await page.getByRole('button', { name: 'Team' }).click()
    await expect(page.locator('#content-name')).toHaveText('HQ Office')

    await page.getByRole('button', { name: createdUser.fullName }).click()

    await page.locator('#sub-page-header-munu-button-dropdownMenu').click()

    await page.getByText('Edit Details').click()

    await expect(page.locator('#content-name')).toHaveText('Confirm details')

    await page
      .locator('[data-testid="list-view-actions"]')
      .locator('#btn_change_email')
      .click()

    await page.locator('#email').fill(updatedEmail)
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.locator('#content-name')).toHaveText('Confirm details')

    await page
      .locator('[data-testid="list-view-actions"]')
      .locator('#btn_change_role')
      .click()

    await page.getByText('Field Agent').click()
    await page.getByText(updatedRole, { exact: true }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.locator('#content-name')).toHaveText('Confirm details')

    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText(/Updating user/i)).toBeVisible()

    await expect(page.locator('#content-name')).toHaveText('HQ Office')
  })
})
