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
test.describe.serial('5. Organisation Page -1', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })
  test.describe.serial('5.1 Basic UI check', async () => {
    test('5.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.PERFORMANCE_MANAGER)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test('5.1.1 Verify Province-> Distric -> Health Facility(No Data)', async () => {
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
    test('5.1.2 Verify Province-> Distric -> District Office(No Data)', async () => {
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
    test('5.1.3 Verify Province-> Distric -> District Office', async () => {
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
    test('5.1.4 Verify team page member list of District Office', async () => {
      const row1 = page.getByRole('row', { name: /Alex Ngonga/ })
      await expect(row1.getByText('Active')).toBeVisible()
      const button1 = row1.getByRole('button', { name: 'Alex Ngonga' })
      await expect(button1).toBeDisabled()

      const row2 = page.getByRole('row', { name: /Derrick Bulaya/ })
      await expect(row2.getByText('Active')).toBeVisible()
      const button2 = row2.getByRole('button', { name: 'Derrick Bulaya' })
      await expect(button2).toBeDisabled()

      const row3 = page.getByRole('row', { name: /Joshua Mutale/ })
      await expect(row3.getByText('Active')).toBeVisible()
      const button3 = row3.getByRole('button', { name: 'Joshua Mutale' })
      await expect(button3).toBeDisabled()

      const row5 = page.getByRole('row', { name: /Patrick Gondwe/ })
      await expect(row5.getByText('Active')).toBeVisible()
      const button5 = row5.getByRole('button', { name: 'Patrick Gondwe' })
      await expect(button5).toBeDisabled()
    })
    test('5.1.5 Verify Embassy Office', async () => {
      await page.getByRole('button', { name: 'Organisation' }).click()
      await page.getByRole('button', { name: 'France Embassy Office' }).click()
      await expect(page.locator('#content-name')).toHaveText(
        'France Embassy Office'
      )
      const row1 = page.getByRole('row', { name: /Taohid Laurila/ })
      await expect(row1.getByText('Active')).toBeVisible()
      await expect(row1.getByText('Embassy Official')).toBeVisible()
      const button1 = row1.getByRole('button', { name: 'Taohid Laurila' })
      await expect(button1).toBeDisabled()
    })
  })
})
