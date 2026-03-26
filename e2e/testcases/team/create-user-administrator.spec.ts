import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import { loginWithNewUser, continueForm, login } from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS, LOGIN_URL } from '../../constants'

test('1. Create user -1', async ({ browser }) => {
  const page: Page = await browser.newPage()

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

  await test.step('1.1 User creation started by local system admin', async () => {
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
    await page.getByTestId('locationSearchInput').fill('Itumbwe')

    await page.getByText(/Itumbwe Health Post, Ibombo, Central/).click()

    await page.click('#add-user')
    await expect(page.getByText('User details')).toBeVisible()

    await test.step('1.1.1 Fill user details', async () => {
      await page.locator('#familyName').fill(userinfo.surname)

      await page.locator('#firstName').fill(userinfo.firstName)

      await page.locator('#email').fill(userinfo.email)

      await page.locator('#role').click()

      await page.getByText(userinfo.role, { exact: true }).click()

      await continueForm(page)
    })

    await test.step('1.1.2 Create user', async () => {
      await page.getByRole('button', { name: 'Create user' }).click()

      await expect(page.locator('#header')).toContainText('Itumbwe Health Post')

      await expect(
        page.getByText('Ibombo, Central', {
          exact: true
        })
      ).toBeVisible()
    })
  })

  await test.step('2.1 Login with newly created user credentials', async () => {
    await test.step('2.1.1 Enter your username and password', async () => {
      await loginWithNewUser(page, username)
    })
  })

  await page.close()
})
