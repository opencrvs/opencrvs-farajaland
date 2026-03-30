import { expect, test } from '@playwright/test'
import { joinValuesWith, login } from '../../helpers'
import { faker } from '@faker-js/faker'
import { ensureOutboxIsEmpty, type } from '../../utils'

test("Advanced Search - Birth Event Declaration - Informant's details", async ({
  browser
}) => {
  const page = await browser.newPage()
  const firstname: string = faker.person.firstName()
  const surname: string = faker.person.firstName()

  await test.step('7.1 Create a draft birth declaration by filling in child details', async () => {
    await login(page)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await type(page, '#firstname', firstname)
    await type(page, '#surname', surname)
    await page.locator('#child____gender').click()
    await page.getByText('Female', { exact: true }).click()

    await expect(
      page.getByRole('button', { name: 'Save & Exit' })
    ).toBeVisible()

    await page.getByRole('button', { name: 'Save & Exit' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await ensureOutboxIsEmpty(page)

    //@todo: The user should be navigated to "my-drafts" tab by default
    await page.getByText('Drafts').click()

    await expect(
      page.getByText(joinValuesWith([firstname, surname]))
    ).toBeVisible()
  })

  await test.step('7.2 - Navigate to the advanced search page and select Birth event type', async () => {
    await page.click('#searchType')

    await expect(page).toHaveURL(/.*\/advanced-search/)

    await page.getByText('Birth').click()
  })

  await test.step('7.3 - Search for birth declaration using child name and status filter', async () => {
    await page.getByText('Registration details').click()
    await page.locator('#event____status').click()

    await expect(page.getByText('Created')).toBeHidden()

    await page.getByText(/^Any status$/).click()
    await page.getByText('Child details').click()
    await type(page, '#firstname', firstname)
    await type(page, '#surname', surname)
    await page.click('#search')

    await expect(page).toHaveURL(/.*\/search-result/)
  })

  await test.step('7.4 - Confirm that draft records do not appear in search results', async () => {
    await expect(page.getByText('Search results')).toBeVisible()

    const searchResult = await page.locator('#content-name').textContent()
    const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/

    expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
    expect(page.url()).toContain(`event.status=ALL`)
    expect(page.url()).toContain(
      `child.name=${encodeURIComponent(JSON.stringify({ firstname, middlename: '', surname }))}`
    )

    await expect(
      page.getByRole('button', { name: joinValuesWith([firstname, surname]) })
    ).not.toBeVisible()
  })

  await page.close()
})
