import { test, expect } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersClickable } from '../birth/helpers'

//User: Local System Admin(e.mayuka)
//Scope: Ibombo, Central,Farajaland
test('2. Organisation Page', async ({ browser }) => {
  const page = await browser.newPage()

  await test.step('2.1 UI check', async () => {
    // 2.1.0 Verify UI
    await login(page, CREDENTIALS.LOCAL_SYSTEM_ADMIN)
    await page.getByRole('button', { name: 'Organisation' }).click()

    await expect(page.locator('#content-name')).toHaveText('Organisation')
    await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()

    // 2.1.1 Verify Province -> District -> Health Facility(No Data)
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

    // 2.1.2 Verify Province -> District -> District Office
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

    // 2.1.3 Verify Team Members Status
    const ibomboMembers = ['Felix Katongo', 'Kennedy Mweene']
    await verifyMembersClickable(page, ibomboMembers, 'Ibombo District Office')
  })

  await test.step('2.2 Out of Scope Access', async () => {
    // 2.2.1 Verify Province -> District -> Health Facility
    for (let i = 0; i < 3; i++) {
      await page.goBack()
    }
    await page.getByRole('button', { name: /Organisation/ }).click()
    await page.getByRole('button', { name: /Sulaka/ }).click()
    await page.getByRole('button', { name: /Ilanga/ }).click()

    await expect(
      page.getByRole('button', { name: /Ilanga District Hospital/ })
    ).toBeDisabled()

    // 2.2.2 Verify Province -> District -> District Office
    for (let i = 0; i < 2; i++) {
      await page.goBack()
    }
    await page.getByRole('button', { name: /Chuminga/ }).click()
    await page.getByRole('button', { name: /Ama/ }).click()

    await expect(
      page.getByRole('button', { name: /Ama District Office/ })
    ).toBeDisabled()

    // 2.2.3 Verify Embassy
    await page.getByRole('button', { name: /Organisation/ }).click()

    await expect(
      page.getByRole('button', { name: /UK Embassy Office/ })
    ).toBeDisabled()
  })
})
