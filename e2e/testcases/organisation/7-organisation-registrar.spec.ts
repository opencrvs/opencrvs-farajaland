import { test, expect } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersClickable } from '../birth/helpers'
test('7. Organisation Page', async ({ browser }) => {
  const page = await browser.newPage()

  await test.step('7.1.0 Verify UI', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
    await page.getByRole('button', { name: 'Organisation' }).click()
    await expect(page.locator('#content-name')).toHaveText('Organisation')
    await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
  })

  await test.step('7.1.1 Verify Province -> District -> Health Facility(No Data)', async () => {
    await page.getByRole('button', { name: /Chuminga/ }).click()
    await page.getByRole('button', { name: /Soka/ }).click()
    const pageNavigator = page.getByRole('button', { name: '2', exact: true })
    await pageNavigator.scrollIntoViewIfNeeded()
    await pageNavigator.click()

    await expect(
      page.getByRole('button', { name: /Mulunda Health Post/ })
    ).toBeDisabled()
  })

  await test.step('7.1.2 Verify Province -> District -> District Office', async () => {
    for (let i = 0; i < 3; i++) {
      await page.goBack()
    }
    await page.getByRole('button', { name: /Organisation/ }).click()
    await page.getByRole('button', { name: /Chuminga/ }).click()
    await page.getByRole('button', { name: /Ama/ }).click()

    await expect(
      page.getByRole('button', { name: /Ama District Office/ })
    ).toBeDisabled()
  })

  await test.step('7.1.3 Verify Province -> District -> Different District Office', async () => {
    for (let i = 0; i < 3; i++) {
      await page.goBack()
    }
    await page.getByRole('button', { name: /Organisation/ }).click()

    await page.getByRole('button', { name: /Sulaka/ }).click()
    await page.getByRole('button', { name: /Ilanga/ }).click()

    await expect(
      page.getByRole('button', { name: /Ilanga District Office/ })
    ).toBeDisabled()
  })

  await test.step('7.1.4 Verify team page member list of District Office', async () => {
    for (let i = 0; i < 3; i++) {
      await page.goBack()
    }

    await page.getByRole('button', { name: /Organisation/ }).click()
    await page.getByRole('button', { name: /Central/ }).click()
    await page.getByRole('button', { name: /Ibombo/ }).click()

    await page.getByRole('button', { name: /Ibombo District Office/ }).click()

    const members = ['Felix Katongo', 'Kennedy Mweene']

    await verifyMembersClickable(page, members, 'Ibombo District Office')
  })

  await test.step('7.1.5 Verify Embassy Office', async () => {
    await page.getByRole('button', { name: 'Organisation' }).click()
    await expect(
      page.getByRole('button', { name: 'French Embassy Office' })
    ).toBeDisabled()
  })

  await page.close()
})
