import { test, expect } from '@playwright/test'
import { LOGIN_URL } from '../../constants'

test.describe('2. Login with invalid information', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL)
    /*
     * Wait until config for loading page has been loaded
     */
    await page.waitForSelector('#Box img', { state: 'attached' })
    await page.waitForFunction(() => {
      const img = document.querySelector<HTMLImageElement>('#Box img')!
      return img && img.src && img.src.trim() !== ''
    })
  })

  test('2.1. Navigate to the login URL', async ({ page }) => {
    // Expected result: User should be redirected to the login page
    await expect(page.getByText('Login to Farajaland CRVS')).toBeVisible()
  })

  test('2.2. Enter invalid username and valid password', async ({ page }) => {
    await page.fill('#username', 'j.kimmich')
    await page.fill('#password', 'test')
    await page.getByText('Login', { exact: true }).click()

    // Expected result: Should show toast saying: Incorrect username or password
    await expect(page.getByText('Incorrect username or password')).toBeVisible()
  })

  test('2.3. Enter valid username and invalid password', async ({ page }) => {
    await page.fill('#username', 'k.bwalya')
    await page.fill('#password', 'tests')
    await page.getByText('Login', { exact: true }).click()

    // Expected result: Should show toast saying: Incorrect username or password
    await expect(page.getByText('Incorrect username or password')).toBeVisible()
  })

  test('2.4. Enter expired 2fa code', async ({ page }) => {
    await page.fill('#username', 'k.bwalya')
    await page.fill('#password', 'test')
    await page.getByText('Login', { exact: true }).click()

    // Expected result: User should navigate to the next page to verify through mobile number or email address
    await expect(page.getByText('Verify your account')).toBeVisible()

    await page.getByText('Verify', { exact: true }).click()
    await page.fill('#code', 'expire')

    // Expected result: User should navigate to the next page to verify through mobile number or email address
    await expect(page.getByText('Incorrect verification code.')).toBeVisible()
  })
})
