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

  // 1.1. Enter Non-English characters
  test('1.1. Validate "First Name(s)" text field', async ({ page }) => {
    await page.locator('#firstNamesEng').fill('*')
    await expect(
      page.getByText(
        `Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-), apostrophes(') and underscores (_)`,
        { exact: true }
      )
    ).toBeVisible()
  })

  // 1.2. Enter less than 33 English characters
  test('1.2. Enter less than 33 English characters', async ({ page }) => {
    await page.locator('#firstNamesEng').fill('Rakibul Islam')
    await page.getByText('Birth declaration').click()

    await expect(page.locator('#firstNamesEng_error')).toBeHidden()
  })

  // 1.3. Enter Field as NULL
  test('1.3. Enter Field as NULL', async ({ page }) => {
    await page.locator('#firstNamesEng').click()
    await page.locator('#relationship').click()
    await expect(
      page.getByText('Required for registration', { exact: true })
    ).toBeVisible()
  })

  // 1.4. Enter more than 32 English characters
  test('1.4. Enter more than 32 English characters', async ({ page }) => {
    const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
    await page.locator('#firstNamesEng').fill(LONG_NAME)
    await page.getByText('Witness 1 details').click()

    await expect(page.locator('#firstNamesEng')).toHaveValue(
      LONG_NAME.slice(0, 32)
    )
  })
})

// 2.1. Enter Non-English characters
test('2.1. Validate "Last Name(s)" text field', async ({ page }) => {
  await page.locator('#familyNameEng').fill('O’Neill')
  await expect(
    page.getByText(
      `Input contains invalid characters. Please use only letters (a-z, A-Z), numbers (0-9), hyphens (-), apostrophes(') and underscores (_)`,
      { exact: true }
    )
  ).toBeVisible()
})

// 2.2. Enter less than 33 English characters
test('2.2. Enter less than 33 English characters', async ({ page }) => {
  await page.locator('#familyNamesEng').fill('Rakibul Islam')
  await page.getByText('Witness 1 details').click()

  await expect(page.locator('#familyNamesEng_error')).toBeHidden()
})

// 2.3. Enter Field as NULL
test('2.3. Enter Field as NULL', async ({ page }) => {
  await page.locator('#familyNameEng').click()
  await page.locator('#relationship').click()
  await expect(
    page.getByText('Required for registration', { exact: true })
  ).toBeVisible()
})

// 2.4. Enter more than 32 English characters
test('2.4. Enter more than 32 English characters', async ({ page }) => {
  const LONG_NAME = 'Ovuvuevuevue Enyetuenwuevue Ugbemugbem Osas'
  await page.locator('#familyNamesEng').fill(LONG_NAME)
  await page.getByText('Witness 1 details').click()

  await expect(page.locator('#familyNamesEng')).toHaveValue(
    LONG_NAME.slice(0, 32)
  )
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