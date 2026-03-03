import { test, expect, type Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersClickable } from '../birth/helpers'
import { navigateToWorkqueue } from '../../utils'
test.describe.serial('4. Organisation Page', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe.serial('4.1 UI check', async () => {
    test('4.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.PROVINCIAL_REGISTRAR)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })
    test.describe('4.1.1 My jurisdiction ', async () => {
      test('4.1.1.0 Verify Province -> District -> Health Facility(No Data)', async () => {
        await page.getByRole('button', { name: /Central/ }).click()
        await page.getByRole('button', { name: /Ibombo/ }).click()
        const pageNavigator = page.getByRole('button', {
          name: '3',
          exact: true
        })
        await pageNavigator.scrollIntoViewIfNeeded()
        await pageNavigator.click()

        await page
          .getByRole('button', { name: /Mwachisompola Rural Health Centre/ })
          .click()
        await expect(page.locator('#content-name')).toHaveText(
          /Mwachisompola Rural Health Centre/
        )
        await expect(
          page.getByText('Ibombo, Central', { exact: true })
        ).toBeVisible()
        await expect(page.getByText('No result')).toBeVisible()
      })
      test('4.1.1.1 Verify Province -> District -> District Office', async () => {
        for (let i = 0; i < 3; i++) {
          await page.goBack()
        }

        await page.getByRole('button', { name: /Central/ }).click()
        await page.getByRole('button', { name: /Ibombo/ }).click()
        const pageNavigator = page.getByRole('button', {
          name: '4',
          exact: true
        })
        await pageNavigator.scrollIntoViewIfNeeded()
        await pageNavigator.click()

        await page
          .getByRole('button', { name: /Ibombo District Office/ })
          .click()
        await expect(page.locator('#content-name')).toHaveText(
          /Ibombo District Office/
        )
        await expect(
          page.getByText('Ibombo, Central', { exact: true })
        ).toBeVisible()
      })
      test('4.1.1.2 Verify team page member list', async () => {
        const members = [
          'Mitchell Owen',
          'Emmanuel Mayuka',
          'Kennedy Mweene',
          'Felix Katongo',
          'Kalusha Bwalya'
        ]

        await verifyMembersClickable(page, members, 'Ibombo District Office')
      })
    })
    test.describe('4.1.2 Outside of Jurisdiction', async () => {
      test('4.1.2.0 Verify Embassy Official', async () => {
        await navigateToWorkqueue(page, 'Organisation')
        await expect(
          page.getByRole('button', { name: /France Embassy Office/ })
        ).toBeDisabled()
      })
      test('4.1.2.1 Verify Province -> District -> District Office', async () => {
        await navigateToWorkqueue(page, 'Organisation')
        await page.getByRole('button', { name: /Pualula/ }).click()
        await page.getByRole('button', { name: /Embe/ }).click()
        const pageNavigator = page.getByRole('button', {
          name: '2',
          exact: true
        })
        await pageNavigator.scrollIntoViewIfNeeded()
        await pageNavigator.click()

        await expect(
          page.getByRole('button', { name: /HQ Office/ })
        ).toBeDisabled()
      })
      test('4.1.2.2 Verify Province -> District -> Health Facility', async () => {
        await navigateToWorkqueue(page, 'Team') // Adjustment for known Bug #11756
        await navigateToWorkqueue(page, 'Organisation')
        await page.getByRole('button', { name: /Pualula/ }).click()
        await page.getByRole('button', { name: /Funabuli/ }).click()

        await expect(
          page.getByRole('button', { name: /Chishi Rural Health Centre/ })
        ).toBeDisabled()
      })
    })
  })
})
