import { expect, test, type Page } from '@playwright/test'

import { formatName, login } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { faker } from '@faker-js/faker'
import { ensureOutboxIsEmpty } from '../../utils'

test('Validate draft with partial name', async ({ browser }) => {
  const page: Page = await browser.newPage()

  const name1 = {
    firstNames: faker.person.firstName('male')
  }

  const name2 = {
    familyName: faker.person.lastName('male')
  }

  await test.step('Record does not appear in draft', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)

    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name1)
    )

    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name2)
    )
  })

  await test.step('Create a draft with only firstname', async () => {
    await page.click('#header-new-event')

    await page.getByLabel('Birth').click()

    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#firstname').fill(name1.firstNames)

    await page.getByRole('button', { name: 'Save & Exit' }).click()

    await page.getByRole('button', { name: 'Confirm' }).click()

    await ensureOutboxIsEmpty(page)
  })

  await test.step('Create a draft with only lastname', async () => {
    await page.click('#header-new-event')

    await page.getByLabel('Birth').click()

    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Continue' }).click()

    await page.locator('#surname').fill(name2.familyName)

    await page.getByRole('button', { name: 'Save & Exit' }).click()

    await page.getByRole('button', { name: 'Confirm' }).click()

    await ensureOutboxIsEmpty(page)
  })

  await test.step('Records appear in draft', async () => {
    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).toContainText(
      formatName(name1)
    )

    await expect(page.getByTestId('search-result')).toContainText(
      formatName(name2)
    )
  })

  await test.step('Records do not appear in draft for other user: RO', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)

    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name1)
    )

    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name2)
    )
  })

  await test.step('Records do not appear in draft for other user: LR', async () => {
    await login(page, CREDENTIALS.REGISTRAR)

    await page.getByRole('button', { name: 'Drafts' }).click()

    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name1)
    )

    await expect(page.getByTestId('search-result')).not.toContainText(
      formatName(name2)
    )
  })

  await page.close()
})
