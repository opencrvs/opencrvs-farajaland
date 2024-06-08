import { expect, test } from '@playwright/test'
import { createPIN, login } from '../../helpers'

test.describe('7. Validate Witness 1 details page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'k.mweene', 'test')
    await createPIN(page)
    await page.click('#header_new_event')
    await page.getByText('Marriage', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()
  })

  // TODO: Jaa nämä testit pieniempiin kokonaisuuksiin.
  test('1. Validate "First Name(s)" text field', async ({ page }) => {
    // label: "First name(s)" input id: "#firstNamesEng"
    // 1.1. Enter Non-English characters
    await page.locator('#firstNamesEng').fill('*')
    await expect(
      page.getByText(
        `Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-), apostrophes(') and underscores (_)`,
        { exact: true }
      )
    ).toBeVisible()

    // 1.2. Enter less than 33 English characters
    // There is no such an error case.

    // 1.3. Enter Field as NULL
    await page.locator('#firstNamesEng').click()
    await page.locator('#relationship').click()
    await expect(
      page.getByText('Required for registration', { exact: true })
    ).toBeVisible()

    // 1.4. Enter more than 32 English characters
    // There is no such an error case and the input field maxLength is 32.
  })

  test('2. Validate "First Name(s)" text field', async ({ page }) => {
    // label: "Last name" input id: "#familyNameEng"
    // 2.1. Enter Non-English characters
    await page.locator('#familyNameEng').fill('O’Neill')
    await expect(
      page.getByText(
        `Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-), apostrophes(') and underscores (_)`,
        { exact: true }
      )
    ).toBeVisible()

    // 2.2. Enter less than 33 English characters
    // There is no such an error case.

    // 2.3. Enter Field as NULL
    await page.locator('#familyNameEng').click()
    await page.locator('#relationship').click()
    await expect(
      page.getByText('Required for registration', { exact: true })
    ).toBeVisible()

    // 2.4. Enter more than 32 English characters
    // There is no such an error case and the input field maxLength is 32.
  })
  // Done
  test('3. Select any to the following option from Relationship to spouses:', async ({
    page
  }) => {
    // label: "Relationship to spouses" input id: "#relationship"
    await page.locator('#relationship').click()
    await page.getByText('Other', { exact: true }).click()
    await expect(page.getByText('Other', { exact: true })).toBeVisible()
  })
  // Done
  test('4. Click continue', async ({ page }) => {
    await page.getByText('Continue', { exact: true }).click()
    await expect(
      page.getByText('Witness 2 details', { exact: true })
    ).toBeVisible()
  })
})
