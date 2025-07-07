import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration-with-father-brother'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'

test.describe
  .serial("Qucik Search - Birth Event Declaration - Child's details", () => {
  let page: Page
  let record: Awaited<ReturnType<typeof createDeclaration>>
  let recordWithDefaultEmail: Awaited<ReturnType<typeof createDeclaration>>
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )

    recordWithDefaultEmail = await createDeclaration(
      token,
      {
        'informant.email': faker.internet.email()
      },
      'REGISTER',
      'HEALTH_FACILITY'
    )

    record = await createDeclaration(
      token,
      {
        'informant.email': faker.internet.email()
      },
      'REGISTER',
      'HEALTH_FACILITY'
    )
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.1 Search from home page with email', async () => {
    await loginToV2(page)
    await page
      .locator('#searchText')
      .fill(recordWithDefaultEmail.declaration['informant.email']) // search by email
    await page.locator('#searchIconButton').click()
    const searchResultRegex = /Search result for “([^”]+)”/
    const searchResult = await page.locator('#content-name').textContent()
    await expect(searchResult).toMatch(searchResultRegex)
    await expect(
      page.getByText(
        `${recordWithDefaultEmail.declaration['child.name'].firstname} ${recordWithDefaultEmail.declaration['child.name'].surname}`
      )
    ).toBeVisible()
  })

  test('1.2 Navigate to workqueue and search with email (case insensitive)', async () => {
    await page.locator('#navigation_workqueue_assigned-to-you').click()
    await expect(page.locator('#searchText')).toHaveValue('')

    await page
      .locator('#searchText')
      .fill(recordWithDefaultEmail.declaration['informant.email'].toUpperCase()) // Search by uppercase email
    await page.locator('#searchIconButton').click()
    const searchResultRegex = /Search result for “([^”]+)”/
    const searchResult = await page.locator('#content-name').textContent()
    await expect(searchResult).toMatch(searchResultRegex)
    await expect(
      page.getByText(
        `${recordWithDefaultEmail.declaration['child.name'].firstname} ${recordWithDefaultEmail.declaration['child.name'].surname}`
      )
    ).toBeVisible()
  })

  test('1.3 Navigate to workqueue and search with different email and get single result', async () => {
    await page.locator('#navigation_workqueue_assigned-to-you').click()
    await expect(page.locator('#searchText')).toHaveValue('')

    await page
      .locator('#searchText')
      .fill(record.declaration['informant.email']) // search by different email
    await page.locator('#searchIconButton').click()
    const searchResultRegex = /Search result for “([^”]+)”/
    const searchResult = await page.locator('#content-name').textContent()
    await expect(searchResult).toMatch(searchResultRegex)

    const results = await page.locator('[id^="row_"]')
    await expect(results).toHaveCount(1) // Expect exactly one result
    await expect(
      page.getByText(
        `${record.declaration['child.name'].firstname} ${record.declaration['child.name'].surname}`
      )
    ).toBeVisible()
  })

  test('1.4 Navigate to workqueue and do quick search with phone number', async () => {
    await page.locator('#navigation_workqueue_assigned-to-you').click()
    await expect(page.locator('#searchText')).toHaveValue('')
    await page
      .locator('#searchText')
      .fill(record.declaration['informant.phoneNo']) // search by phone
    await page.locator('#searchIconButton').click()
    const searchResultRegex = /Search result for “([^”]+)”/
    const searchResult = await page.locator('#content-name').textContent()
    await expect(searchResult).toMatch(searchResultRegex)
    await expect(
      page.getByText(
        `${record.declaration['child.name'].firstname} ${record.declaration['child.name'].surname}`
      )
    ).toBeVisible()
  })

  test('1.5 Navigate to workqueue and do quick search with id', async () => {
    await page.locator('#navigation_workqueue_assigned-to-you').click()
    await expect(page.locator('#searchText')).toHaveValue('')
    await page.locator('#searchText').fill(record.declaration['informant.nid']) // search by id
    await page.locator('#searchIconButton').click()
    const searchResultRegex = /Search result for “([^”]+)”/
    const searchResult = await page.locator('#content-name').textContent()
    await expect(searchResult).toMatch(searchResultRegex)
    await expect(
      page.getByText(
        `${record.declaration['child.name'].firstname} ${record.declaration['child.name'].surname}`
      )
    ).toBeVisible()
  })
})
