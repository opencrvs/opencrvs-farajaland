import { expect, test, type Page } from '@playwright/test'
import { loginToV2 } from '../../helpers'
import { faker } from '@faker-js/faker'

test.describe
  .serial("Advanced Search - Birth Event Declaration - Informant's details", () => {
  let page: Page
  let firstname: string
  let surname: string

  test.beforeAll(async ({ browser }) => {
    firstname = faker.person.firstName()
    surname = faker.person.firstName()
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('7.1 Create a draft birth declaration by filling in child details', async () => {
    await loginToV2(page)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.locator('#firstname').fill(firstname)
    await page.locator('#surname').fill(surname)
    await page.locator('#child____gender').click()
    await page.getByText('Female', { exact: true }).click()

    await expect(
      page.getByRole('button', { name: 'Save & Exit' })
    ).toBeVisible()
    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText(/seconds ago/)).toBeVisible()
  })

  test('7.2 - Navigate to the advanced search page and select Birth event type', async () => {
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Birth').click()
  })

  test('7.3 - Search for birth declaration using child name and status filter', async () => {
    await page.getByText('Registration details').click()

    await page.locator('#event____status').click()
    await expect(page.getByText('Created')).toBeHidden()
    await page.getByText(/^Any status$/).click()

    await page.getByText('Child details').click()

    await page.locator('#firstname').fill(firstname)
    await page.locator('#surname').fill(surname)
    await page.click('#search')
    await expect(page).toHaveURL(/.*\/search-result/)
  })

  test('7.4 - Confirm that draft records do not appear in search results', async () => {
    await expect(page.getByText('Search results')).toBeVisible()
    const searchResult = await page.locator('#content-name').textContent()
    const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
    expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
    await expect(page.getByText('Search results (0)')).toBeVisible()
    expect(page.url()).toContain(`event.status=ALL`)
    expect(page.url()).toContain(
      `child.name=${encodeURIComponent(JSON.stringify({ firstname, middlename: '', surname }))}`
    )
  })
})
