import { expect, test, type Page } from '@playwright/test'
import { getToken, loginToV2 } from '../../../helpers'
import { createDeclaration } from '../../v2-test-data/death-declaration'
import { CREDENTIALS } from '../../../constants'
import { faker } from '@faker-js/faker'
import { formatDateToLongString } from '../utils'

test.describe
  .serial("Advanced Search - Death Event Declaration - Deceased's details", () => {
  let page: Page
  let [yyyy, mm, dd] = ['', '', '']
  let fullNameOfDeceased = ''
  let facilityId = ''
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
        'eventDetails.date': faker.date
          // Randomly chosen date between 2010-01-01 and 2020-12-31
          // Ensures the created record appears on the first page of search results
          .between({ from: '2010-01-01', to: '2020-12-31' })
          .toISOString()
          .split('T')[0],
        'eventDetails.reasonForLateRegistration': 'Other' // needed for late registration date
      },
      'REGISTER',
      'HEALTH_FACILITY'
    )
    ;[yyyy, mm, dd] = record.declaration['deceased.dob'].split('-')
    fullNameOfDeceased =
      record.declaration['deceased.name'].firstname +
      ' ' +
      record.declaration['deceased.name'].surname
    facilityId = record.declaration['eventDetails.deathLocation'] ?? ''
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('2.1 - Validate log in and load search page', async () => {
    await loginToV2(page)
    await page.click('#searchType')
    await expect(page).toHaveURL(/.*\/advanced-search/)
    await page.getByText('Death').click()
  })

  test.describe
    .serial("2.5 - Validate search by Deceased's DOB & Gender", () => {
    test('2.5.1 - Validate filling DOB and gender filters', async () => {
      await page.getByText('Deceased details').click()

      await page
        .getByTestId('text__firstname')
        .fill(record.declaration['deceased.name'].firstname)
      await page
        .getByTestId('text__surname')
        .fill(record.declaration['deceased.name'].surname)

      await page.locator('[data-testid="deceased____dob-dd"]').fill(dd)
      await page.locator('[data-testid="deceased____dob-mm"]').fill(mm)
      await page.locator('[data-testid="deceased____dob-yyyy"]').fill(yyyy)

      await page.locator('#deceased____gender').click()
      await page.getByText('Male', { exact: true }).click()

      await page.getByText('Event details').click()
      await page.locator('#eventDetails____deathLocation').fill('Ibombo Rural')
      await expect(page.getByText('Ibombo Rural Health Centre')).toBeVisible()
      await page.getByText('Ibombo Rural Health Centre').click()
    })

    test('2.5.2 - Validate search and show results', async () => {
      await page.click('#search')
      await expect(page).toHaveURL(/.*\/search-result/)
      await expect(page.url()).toContain(`deceased.dob=${yyyy}-${mm}-${dd}`)
      await expect(page.url()).toContain(`deceased.gender=male`)
      await expect(page.url()).toContain(
        `eventDetails.deathLocation=${facilityId}`
      )
      await expect(page.getByText('Search results')).toBeVisible()

      const searchResult = await page.locator('#content-name').textContent()
      const searchResultCountNumberInBracketsRegex = /\((\d+)\)$/
      await expect(searchResult).toMatch(searchResultCountNumberInBracketsRegex)
      await expect(page.getByText('Event: V2 death')).toBeVisible()
      await expect(
        page.getByText(
          `Deceased's Date of birth: ${formatDateToLongString(record.declaration['deceased.dob'])}`
        )
      ).toBeVisible()
      await expect(page.getByText("Deceased's Sex: Male")).toBeVisible()
      await expect(
        page.getByText(
          "Deceased's Health Institution: Ibombo Rural Health Centre, Ibombo, Central, Farajaland"
        )
      ).toBeVisible()
      await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
      await expect(page.getByText(fullNameOfDeceased).last()).toBeVisible()
    })

    test('2.5.3 - Validate clicking on the search edit button', async () => {
      await page.getByRole('button', { name: 'Edit' }).click()
      await expect(page).toHaveURL(/.*\/advanced-search/)
      await expect(page.url()).toContain(
        `eventDetails.deathLocation=${facilityId}`
      )
      await expect(page.url()).toContain(`deceased.dob=${yyyy}-${mm}-${dd}`)
      await expect(page.url()).toContain(`deceased.gender=male`)
      await expect(page.url()).toContain(`eventType=v2.death`)
      await expect(page.locator('#tab_v2\\.death')).toHaveText('Death')

      await expect(page.getByTestId('deceased____dob-dd')).toHaveValue(dd)
      await expect(page.getByTestId('deceased____dob-mm')).toHaveValue(mm)
      await expect(page.getByTestId('deceased____dob-yyyy')).toHaveValue(yyyy)

      await expect(
        page.getByTestId('select__deceased____gender')
      ).toContainText('Male')
      await expect(page.locator('#eventDetails____deathLocation')).toHaveValue(
        'Ibombo Rural Health Centre'
      )
    })
  })
})
