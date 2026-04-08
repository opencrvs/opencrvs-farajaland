import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { loginWithNewUser, continueForm, login } from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../constants'

test.describe.serial('1. Create user -1', () => {
  let page: Page
  const userinfo = {
    firstName: faker.person.firstName('male'),
    surname: faker.person.lastName('male'),
    email: faker.internet.email(),
    role: 'Community Leader'
  }
  const signaturePath = path.resolve(__dirname, '../../assets/sign1.png')
  const username = `${userinfo.firstName[0]}.${userinfo.surname}`.toLowerCase()
  const question00 = 'What city were you born in?'
  const question01 = 'What is your favorite movie?'
  const question02 = 'What is your favorite food?'

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('1.1 User creation started by local system admin', async () => {
    test.beforeAll(async () => {
      await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
      await page.getByRole('button', { name: 'Team' }).click()
      await expect(page.locator('#content-name')).toHaveText(
        'Central Province Office'
      )

      await page
        .getByRole('button', {
          name: /Central Province Office, Central/
        })
        .click()
      await page.getByTestId('locationSearchInput').fill('Zobwe')

      await page.getByText(/Zobwe District Hospital, Zobwe, Sulaka/).click()

      await page.click('#add-user')
      await expect(page.getByText('User details')).toBeVisible()
    })

    test('1.1.1 Fill user details', async () => {
      await page.locator('#surname').fill(userinfo.surname)
      await page.locator('#firstname').fill(userinfo.firstName)
      await page.locator('#email').fill(userinfo.email)
      await page.locator('#role').click()
      await page.getByText(userinfo.role, { exact: true }).click()
      await continueForm(page)
    })

    test('1.1.2 Create user', async () => {
      await page.getByRole('button', { name: 'Create user' }).click()

      await expect(page.locator('#header')).toContainText(
        'Zobwe District Hospital'
      )

      await expect(
        page.getByText('Zobwe, Sulaka', {
          exact: true
        })
      ).toBeVisible()
    })
  })

  test.describe('2.1 Login with newly created user credentials', () => {
    test('2.1.1 Enter your username and password', async ({ page }) => {
      await loginWithNewUser(page, username)
    })
  })
})
