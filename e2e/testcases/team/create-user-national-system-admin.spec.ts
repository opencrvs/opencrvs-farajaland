import { test, expect, type Page } from '@playwright/test'
import path from 'path'
import {
  ensureLoginPageReady,
  continueForm,
  login,
  loginWithNewUser
} from '../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS, LOGIN_URL } from '../../constants'

test('1. Create user -1', async ({ browser }) => {

  
  let page: Page
  page = await browser.newPage()

  
  const userinfo = {
    firstName: faker.person.firstName('male'),
    surname: faker.person.lastName('male'),
    email: faker.internet.email(),
    role: 'Registrar'
  }

  
  const signaturePath = path.resolve(__dirname, '../../assets/sign1.png')

  
  const username = `${userinfo.firstName[0]}.${userinfo.surname}`.toLowerCase()

  await test.step('1.1 User creation started by national system admin', async () => {

    await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
          await page.getByRole('button', { name: 'Team' }).click()
          await expect(page.getByText('HQ Office')).toBeVisible()
    
          await page.getByRole('button', { name: /HQ Office/ }).click()
          await page.getByTestId('locationSearchInput').fill('Klow')
    
          await page.getByText(/Klow Village Hospital/).click()
    
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

    

    // @TODO: requires file upload support in events service.
    test.skip('1.1.2 Upload Signture', async () => {
      await page.setInputFiles('input[type="file"]', signaturePath)
      await continueForm(page)
    })

    await test.step('1.1.2 Create user', async () => {

      
      await page.getByRole('button', { name: 'Create user' }).click()

      

      await expect(page.locator('#header')).toContainText(
        'Klow Village Hospital'
      )

      

      await expect(
        page.getByText('Klow, Ibombo, Central', {
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

  await page.close()})
