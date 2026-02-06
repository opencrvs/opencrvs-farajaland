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
test.describe.serial('1. Organisation Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })
  test.describe.serial('1.1 Basic UI check', async () => {
    test('1.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.NATIONAL_SYSTEM_ADMIN)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test('1.1.1 Verify Province-> Distric -> Health Facility(No Data)', async () => {
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      const pageNavigator = page.getByRole('button', { name: '3' })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page.getByRole('button', { name: /Musopelo Health Post/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Musopelo Health Post/
      )
      await expect(
        page.getByText('Ibombo, Central', { exact: true })
      ).toBeVisible()
      await expect(page.getByText('No result')).toBeVisible()
    })
    test('1.1.2 Verify Province-> Distric -> District Office(No Data)', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Pualula/ }).click()
      await page.getByRole('button', { name: /Funabuli/ }).click()

      await page
        .getByRole('button', { name: /Chishi Rural Health Centre/ })
        .click()
      await expect(page.locator('#content-name')).toHaveText(
        /Chishi Rural Health Centre/
      )
      await expect(
        page.getByText('Funabuli, Pualula', { exact: true })
      ).toBeVisible()
      await expect(page.getByText('No result')).toBeVisible()
    })
    test('1.1.2 Verify Province-> Distric -> District Office', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Sulaka/ }).click()
      await page.getByRole('button', { name: /Ilanga/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2' })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page.getByRole('button', { name: /Ilanga District Office/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Ilanga District Office/
      )
      await expect(
        page.getByText('Ilanga, Sulaka', { exact: true })
      ).toBeVisible()
    })
    test('1.1.3 Verify team page member list', async () => {
      const row1 = page.getByRole('row', { name: /Alex Ngonga/ })
      await expect(row1.getByText('Active')).toBeVisible()
      const button1 = row1.getByRole('button', { name: 'Alex Ngonga' })
      await button1.click()
      await expect(page.locator('#content-name')).toHaveText('Alex Ngonga')
      await page.getByRole('button', { name: 'Ilanga District Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)

      const row2 = page.getByRole('row', { name: /Derrick Bulaya/ })
      await expect(row2.getByText('Active')).toBeVisible()
      const button2 = row2.getByRole('button', { name: 'Derrick Bulaya' })
      await button2.click()
      await expect(page.locator('#content-name')).toHaveText('Derrick Bulaya')
      await page.getByRole('button', { name: 'Ilanga District Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)

      const row3 = page.getByRole('row', { name: /Joshua Mutale/ })
      await expect(row3.getByText('Active')).toBeVisible()
      const button3 = row3.getByRole('button', { name: 'Joshua Mutale' })
      await button3.click()
      await expect(page.locator('#content-name')).toHaveText('Joshua Mutale')
      await page.getByRole('button', { name: 'Ilanga District Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)

      const row5 = page.getByRole('row', { name: /Patrick Gondwe/ })
      await expect(row5.getByText('Active')).toBeVisible()
      await row5.getByRole('button', { name: 'Patrick Gondwe' }).click()
      await expect(page.locator('#content-name')).toHaveText('Patrick Gondwe')
      await page.getByRole('button', { name: 'Ilanga District Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)
    })
  })
  test.describe.serial('1.2 User Creation ', async () => {
    const userinfo = {
      firstName: faker.person.firstName('male'),
      surname: faker.person.lastName('male'),
      email: faker.internet.email(),
      role: 'Hospital Clerk'
    }

    test('1.2.1 Prerequisite of user creation', async () => {
      await page.getByRole('button', { name: 'Organisation' }).click()
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2' })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page
        .getByRole('button', { name: /Keembe Rural Health Centre/ })
        .click()
      await expect(page.locator('#content-name')).toHaveText(
        /Keembe Rural Health Centre/
      )
      await page.click('#add-user')
      await expect(page.getByText('User details')).toBeVisible()
    })
    test('1.2.2 Fill user details', async () => {
      await page.locator('#familyName').fill(userinfo.surname)
      await page.locator('#firstName').fill(userinfo.firstName)
      await page.locator('#email').fill(userinfo.email)
      await page.locator('#role').click()
      await page.getByText(userinfo.role, { exact: true }).click()
      await continueForm(page)
    })
    test('1.2.3 Create user', async () => {
      await page.getByRole('button', { name: 'Create user' }).click()

      await expect(
        page.getByText('Ibombo, Central', { exact: true })
      ).toBeVisible()
    })
    test('1.2.4 Verify user created in team page', async () => {
      const fullName = `${userinfo.firstName} ${userinfo.surname}`
      const row = page.getByRole('row', { name: fullName })
      await expect(row.getByText('Pending')).toBeVisible()
      await row.getByRole('button', { name: fullName }).click()
      await expect(page.locator('#content-name')).toHaveText(fullName)
    })
  })
})
