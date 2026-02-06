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
      await login(page, CREDENTIALS.REGISTRATION_OFFICER)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test('5.1.1 Verify Province-> Distric -> Health Facility(No Data)', async () => {
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ezhi/ }).click()
      const pageNavigator = page.getByRole('button', { name: '3', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await expect(
        page.getByRole('button', { name: /Nthonkho Rural Health Centre/ })
      ).toBeDisabled()
    })
    test('5.1.2 Verify Province-> Distric -> District Office(No Data)', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Pualula/ }).click()
      await page.getByRole('button', { name: /Funabuli/ }).click()

      await expect(
        page.getByRole('button', { name: /Chishi Rural Health Centre/ })
      ).toBeDisabled()
    })
    test('5.1.3 Verify Province-> Distric -> District Office', async () => {
      for (let i = 0; i < 2; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Sulaka/ }).click()
      await page.getByRole('button', { name: /Ilanga/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await expect(
        page.getByRole('button', { name: /Ilanga District Office/ })
      ).toBeDisabled()
    })
    test('5.1.4 Verify team page member list of District Office', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      const pageNavigator = page.getByRole('button', { name: '4', exact: true })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()
      await page.getByRole('button', { name: /Ibombo District Office/ }).click()

      const row1 = page.getByRole('row', { name: /Mitchell Owen/ })
      await expect(row1.getByText('Active')).toBeVisible()
      const button1 = row1.getByRole('button', { name: 'Mitchell Owen' })
      await expect(button1).toBeDisabled()

      const row2 = page.getByRole('row', { name: /Emmanuel Mayuka/ })
      await expect(row2.getByText('Active')).toBeVisible()
      const button2 = row2.getByRole('button', { name: 'Emmanuel Mayuka' })
      await expect(button2).toBeDisabled()

      const row3 = page.getByRole('row', { name: /Kennedy Mweene/ })
      await expect(row3.getByText('Active')).toBeVisible()
      const button3 = row3.getByRole('button', { name: 'Kennedy Mweene' })
      await expect(button3).toBeDisabled()

      const row5 = page.getByRole('row', { name: /Kalusha Bwalya/ })
      await expect(row5.getByText('Active')).toBeVisible()
      const button5 = row5.getByRole('button', { name: 'Kalusha Bwalya' })
      await expect(button5).toBeDisabled()

      const row4 = page.getByRole('row', { name: /Felix Katongo/ })
      await expect(row4.getByText('Active')).toBeVisible()

      await row4.getByRole('button', { name: 'Felix Katongo' }).click()
      await expect(page.locator('#content-name')).toHaveText('Felix Katongo')
      await page.getByRole('button', { name: 'Ibombo District Office' }).click()
      await expect(page).toHaveURL(/.*\/team/)
    })
  })
})
