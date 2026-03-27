import { expect, test } from '@playwright/test'
import { login } from '../../helpers'

test('Advanced Search - Birth Event Declaration', async ({ browser }) => {
  const page = await browser.newPage()

  await test.step('0.1 - Validate navigating to advanced search', async () => {
    await login(page)

    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await expect(
      page.getByText('Select the options to build an advanced search.')
    ).toBeVisible()
  })

  await test.step('0.3 - Validate display child details when selecting Birth', async () => {
    await page.getByText('Birth').click()
    await expect(page.getByText('Child details')).toBeVisible()
  })

  await test.step('0.4 - Validate Search button disabled when form is incomplete', async () => {
    const searchButton = page.locator('#search')
    await expect(searchButton).toBeDisabled()
  })

  await page.close()
})
