import { test, expect, type Page } from '@playwright/test'
import path from 'path' //imports Node.js's built-in path module to provide utilities for working with file
import {
  assignRecord,
  ensureLoginPageReady,
  auditRecord,
  continueForm,
  createPIN,
  drawSignature,
  expectAddress,
  expectOutboxToBeEmpty,
  formatDateObjectTo_ddMMMMyyyy,
  formatName,
  getAction,
  getRandomDate,
  goToSection,
  login
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS, LOGIN_URL } from '../../constants'

test.describe.serial('1. Create user -1', () => {
  let page: Page
  const userinfo = {
    firstName: faker.person.firstName('male'),
    surname: faker.person.lastName('male'),
    email: faker.internet.email(),
    role: 'Local Registrar'
  }
  const filePath = path.resolve(__dirname, '../../assets/sign1.png') //filepath for signature
  const username = `${userinfo.firstName[0]}.${userinfo.surname}`.toLowerCase() //newly created user's username
  const question00 = 'What city were you born in?'
  const question01 = 'What is your favorite movie?'
  const question02 = 'What is your favorite food?'

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('1.1 User creation started by national system admin', async () => {
    test.beforeAll(async () => {
      await login(
        page,
        CREDENTIALS.NATIONAL_SYSTEM_ADMIN.USERNAME,
        CREDENTIALS.NATIONAL_SYSTEM_ADMIN.PASSWORD
      )
      await createPIN(page)
      await page.click('#navigation_team')
      await expect(page.locator('text=HQ Office')).toBeVisible()
      await page.click('#add-user')
      await expect(page.locator('text=User details')).toBeVisible()
    })

    test('1.1.1 Fill user details', async () => {
      await page.locator('#familyName').fill(userinfo.surname)
      await page.locator('#firstName').fill(userinfo.firstName)
      await page.locator('#email').fill(userinfo.email)
      await page.locator('#role').click()
      await page.getByText(userinfo.role, { exact: true }).click()
      await continueForm(page)
    })

    test('1.1.2 Upload Signture', async () => {
      await page.setInputFiles('input[type="file"]', filePath)
      await continueForm(page)
    })

    test('1.1.2 Create user', async () => {
      await Promise.all([
        page.waitForNavigation(), // waits for the navigation
        page.getByRole('button', { name: 'Create user' }).click() // performs the click
      ])

      await expect(page.locator('text=Embe, Pualula')).toBeVisible()
    })
  })

  test.describe('2.1 Login with newly created user credentials', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(LOGIN_URL)
      await ensureLoginPageReady(page)
    })

    test('2.1.1 Navigate to the login URL', async ({ page }) => {
      // Expected result: User should be redirected to the login page
      await expect(page.locator('#login-step-one-box')).toBeVisible()
    })

    test('2.1.2 Enter your username and password', async ({ page }) => {
      await page.fill('#username', username)
      await page.fill('#password', 'test')
      await Promise.all([
        page.waitForNavigation(),
        page.click('#login-mobile-submit')
      ])

      await expect(page.locator('text=Welcome to Farajaland CRS')).toBeVisible()
      await page.click('#user-setup-start-button')

      //set up password
      await page.fill('#NewPassword', 'Bangladesh23')
      await page.fill('#ConfirmPassword', 'Bangladesh23')
      await expect(page.locator('text=Passwords match')).toBeVisible()
      await page.click('#Continue')

      //set up security question
      await page.locator('#question-0').click()
      await page.getByText(question00, { exact: true }).click()
      await page.fill('#answer-0', 'Chittagong')
      await page.locator('#question-1').click()
      await page.getByText(question01, { exact: true }).click()
      await page.fill('#answer-1', 'Into the wild')
      await page.locator('#question-2').click()
      await page.getByText(question02, { exact: true }).click()
      await page.fill('#answer-2', 'Burger')
      await page.click('#submit-security-question')

      await page.click('#Confirm')
      await expect(page.locator('text=Account setup complete')).toBeVisible()
    })
  })
})
