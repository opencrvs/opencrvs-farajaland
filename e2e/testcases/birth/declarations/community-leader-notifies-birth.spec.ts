import { test, expect, type Page } from '@playwright/test'
import { formatName, goToSection, login } from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { ensureOutboxIsEmpty } from '../../../utils'
import { selectDeclarationAction } from '../../../helpers'

test('Community leader notifies birth', async ({ browser }) => {
  let page: Page
  page = await browser.newPage()

  const childName = {
    firstNames: faker.person.firstName(),
    familyName: faker.person.lastName()
  }

  await test.step('Login as Community leader', async () => {
    await login(page, CREDENTIALS.COMMUNITY_LEADER)
  })

  await test.step('Initiate birth declaration', async () => {
    await page.click('#header-new-event')

    await page.getByLabel('Birth').click()

    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Continue' }).click()
  })

  await test.step('Fill child details', async () => {
    await page.locator('#firstname').fill(childName.firstNames)

    await page.locator('#surname').fill(childName.familyName)
  })

  await test.step('Continue to review', async () => {
    await goToSection(page, 'review')
  })

  await test.step('Notify', async () => {
    await selectDeclarationAction(page, 'Notify')

    await ensureOutboxIsEmpty(page)
  })

  await test.step('Open record', async () => {
    await page.getByText('Recent').click()

    await page
      .getByRole('button', {
        name: formatName(childName)
      })
      .click()
  })

  await test.step('Assert that record is notified', async () => {
    await expect(page.getByTestId('status-value')).toHaveText('Notified')
  })

  await page.close()
})
