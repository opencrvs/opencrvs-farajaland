import { expect, test } from '@playwright/test'
import { createPIN, login } from '../../helpers'

test.describe('6. Validate Marriage details page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, 'k.mweene', 'test')
    await createPIN(page)
    await page.click('#header_new_event')
    await page.getByText('Marriage', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()
    await page.getByPlaceholder('dd').fill('02')
    await page.getByPlaceholder('mm').fill('03')
    await page.getByPlaceholder('yyyy').fill('1995')
    await page.getByText('Continue', { exact: true }).click()
    await page.getByPlaceholder('dd').fill('01')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1993')
    await page.getByText('Continue', { exact: true }).click()
  })

  test('1.1. Enter date Less than the current date But after Groom and Bride DOB', async ({
    page
  }) => {
    // Tästä vois tehdä utils function
    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - 2)
    const day = String(currentDate.getDate()).padStart(2, '0')
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const year = currentDate.getFullYear().toString()

    await page.getByPlaceholder('dd').fill(day)
    await page.getByPlaceholder('mm').fill(month)
    await page.getByPlaceholder('yyyy').fill(year)
    await expect(
      page.getByText('Illegal age of marriage', { exact: true })
    ).toBeHidden()
    await expect(
      page.getByText('Required for registration. Enter a valid date', {
        exact: true
      })
    ).toBeHidden()
  })

  // Jostain syystä validation errorit ei tule näkyviin.
  test('1.2. Enter future date', async ({ page }) => {
    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() + 5)
    const day = String(currentDate.getDate()).padStart(2, '0')
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const year = currentDate.getFullYear().toString()

    await page.getByPlaceholder('dd').fill(day)
    await page.getByPlaceholder('mm').fill(month)
    await page.getByPlaceholder('yyyy').fill(year)
    await expect(
      page.getByText('Required for registration. Enter a valid date', {
        exact: true
      })
    ).toBeVisible()
  })
  test('1.3. Keep field as null', async ({ page }) => {
    await page.getByText('Continue', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()
    await page.getByText('Continue', { exact: true }).click()
    await expect(
      page.getByText('Required for registration', {
        exact: true
      })
    ).toBeVisible()
  })
  // Jostain syystä validation errorit ei tule näkyviin.
  test('1.4. Enter date Less than the current date But before Groom and Bride DOB', async ({
    page
  }) => {
    await page.getByPlaceholder('dd').fill('01')
    await page.getByPlaceholder('mm').fill('05')
    await page.getByPlaceholder('yyyy').fill('1980')
    await expect(
      page.getByText('Illegal age of marriage', {
        exact: true
      })
    ).toBeVisible()
  })

  test('2.1. Select any country from the "Country" dropdown field, Default value is Farajaland', async ({
    page
  }) => {})
  test('2.2. Select any Province from "Province" dropdown field, Default value is Central', async ({
    page
  }) => {})
  test('2.3. Select any district from "District" dropdown field, Default value is Ibombo', async ({
    page
  }) => {})
  test('2.4. Select Urban address', async ({ page }) => {})
  test('2.5. Select Rural address', async ({ page }) => {})
  test('3 Select any of the following options from Type of marriage dropdown', async ({
    page
  }) => {})
  test('4 Navigate to Witness 1 details page', async ({ page }) => {})
})
