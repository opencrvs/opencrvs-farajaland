import { test, expect, Page } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersClickable } from '../birth/helpers'

test.describe('2. Organisation Page', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
  })

  test.afterEach(async () => {
    await page.close()
  })

  //User: Local System Admin(e.mayuka)
  //Scope: Ibombo, Central,Farajaland
  test('2.1 UI check', async () => {
    await test.step('2.1.0 Verify UI', async () => {
      await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
      await page.getByRole('button', { name: 'Organisation' }).click()
      await expect(page.locator('#content-name')).toHaveText('Organisation')
      await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
    })

    await test.step('2.1.1 Verify Province -> District -> Health Facility(No Data)', async () => {
      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()
      const pageNavigator = page.getByRole('button', { name: '2' })
      await pageNavigator.scrollIntoViewIfNeeded()
      await pageNavigator.click()

      await page
        .getByRole('button', { name: /Golden Valley Rural Health Centre/ })
        .click()
      await expect(page.locator('#content-name')).toHaveText(
        /Golden Valley Rural Health Centre/
      )
      await expect(
        page.getByText('Ibombo, Central', { exact: true })
      ).toBeVisible()
      await expect(page.getByText('No result')).toBeVisible()
    })

    await test.step('2.1.2 Verify Province -> District -> District Office', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Central/ }).click()
      await page.getByRole('button', { name: /Ibombo/ }).click()

      await page.getByRole('button', { name: /Ibombo District Office/ }).click()
      await expect(page.locator('#content-name')).toHaveText(
        /Ibombo District Office/
      )
      await expect(
        page.getByText('Ibombo, Central', { exact: true })
      ).toBeVisible()
    })

    await test.step('2.1.3 Verify Team Members Status', async () => {
      const ibomboMembers = ['Felix Katongo', 'Kennedy Mweene']
      await verifyMembersClickable(
        page,
        ibomboMembers,
        'Ibombo District Office'
      )
    })
  })

  test('2.2 Out of Scope Access', async () => {
    await test.step('2.2.1 Verify Province -> District -> Health Facility', async () => {
      for (let i = 0; i < 3; i++) {
        await page.goBack()
      }
      await page.getByRole('button', { name: /Organisation/ }).click()
      await page.getByRole('button', { name: /Sulaka/ }).click()
      await page.getByRole('button', { name: /Ilanga/ }).click()
      await expect(
        page.getByRole('button', { name: /Ilanga District Hospital/ })
      ).toBeDisabled()
    })

    await test.step('2.2.2 Verify Province -> District -> District Office', async () => {
      for (let i = 0; i < 2; i++) {
        await page.goBack()
      }

      await page.getByRole('button', { name: /Chuminga/ }).click()
      await page.getByRole('button', { name: /Ama/ }).click()

      await expect(
        page.getByRole('button', { name: /Ama District Office/ })
      ).toBeDisabled()
    })

    await test.step('2.2.3 Verify Embassy', async () => {
      await page.getByRole('button', { name: /Organisation/ }).click()

      await expect(
        page.getByRole('button', { name: /UK Embassy Office/ })
      ).toBeDisabled()
    })
  })
})
