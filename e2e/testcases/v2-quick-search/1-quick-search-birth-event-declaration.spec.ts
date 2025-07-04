import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../helpers'
import { createDeclaration } from '../v2-test-data/birth-declaration-with-father-brother'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'

function generateCustomPhoneNumber() {
  // Starts with 0
  // Second digit is 7 or 9
  // Followed by 8 digits (0-9)
  const secondDigit = Math.random() < 0.5 ? '7' : '9'
  let rest = ''
  for (let i = 0; i < 8; i++) {
    rest += Math.floor(Math.random() * 10)
  }
  return `0${secondDigit}${rest}`
}

test.describe
  .serial("Qucik Search - Birth Event Declaration - Child's details", () => {
  let page: Page
  let record: Awaited<ReturnType<typeof createDeclaration>>
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage()
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )

    record = await createDeclaration(
      token,
      {
        'informant.email': faker.internet.email(),
        'informant.phoneNo': generateCustomPhoneNumber()
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
      .fill(record.declaration['informant.email'])
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
