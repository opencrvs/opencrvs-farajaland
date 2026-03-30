import { test, expect } from '@playwright/test'
import { login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { verifyMembersEnabled } from '../birth/helpers'

test('6. Organisation Page', async ({ browser }) => {
  const page = await browser.newPage()

  await test.step('6.1.0 Verify UI', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
    await page.getByRole('button', { name: 'Organisation' }).click()

    await expect(page.locator('#content-name')).toHaveText('Organisation')
    await expect(page.getByText('Farajaland', { exact: true })).toBeVisible()
  })

  await test.step('6.1.1 Verify team page member list of District Office', async () => {
    await page.getByRole('button', { name: /Organisation/ }).click()
    await page.getByRole('button', { name: /Central/ }).click()
    await page.getByRole('button', { name: /Ibombo/ }).click()

    await page.getByRole('button', { name: /Ibombo District Office/ }).click()

    const enabledMembers = ['Felix Katongo', 'Kennedy Mweene']

    await verifyMembersEnabled(page, enabledMembers)
  })

  await test.step('6.1.2 Verify Province -> District -> Health Facility(No Data)', async () => {
    for (let i = 0; i < 3; i++) {
      await page.goBack()
    }

    await page.getByRole('button', { name: /Central/ }).click()
    await page.getByRole('button', { name: /Ezhi/ }).click()
    const pageNavigator = page.getByRole('button', { name: '3', exact: true })
    await pageNavigator.scrollIntoViewIfNeeded()
    await pageNavigator.click()

    await expect(
      page.getByRole('button', { name: /Kanyelele Rural Health Centre/ })
    ).toBeDisabled()
  })

  // @TODO: https://github.com/opencrvs/opencrvs-core/issues/11756
  await test.step('6.1.3 Verify Province -> District -> District Office (skipped)', async () => {
    test.skip(
      true,
      'TODO: https://github.com/opencrvs/opencrvs-core/issues/11756'
    )
    for (let i = 0; i < 3; i++) {
      await page.goBack()
    }

    await page.getByRole('button', { name: /Sulaka/ }).click()
    await page.getByRole('button', { name: /Ilanga/ }).click()

    await expect(
      page.getByRole('button', { name: /Ilanga District Office/ })
    ).toBeDisabled()
  })

  await page.close()
})
