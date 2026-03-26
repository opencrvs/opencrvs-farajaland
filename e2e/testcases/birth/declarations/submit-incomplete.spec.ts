import { test, expect, type Page } from '@playwright/test'
import {
  formatName,
  goToSection,
  login,
  selectDeclarationAction
} from '../../../helpers'
import { faker } from '@faker-js/faker'
import { CREDENTIALS } from '../../../constants'
import { ensureOutboxIsEmpty } from '../../../utils'

test('Submit and verify incomplete birth declaration', async ({ browser }) => {
  let page: Page
  page = await browser.newPage()

  const declaration = {
    child: {
      name: {
        firstNames: faker.person.firstName('male'),
        familyName: faker.person.lastName('male')
      }
    },

    placeOfBirth: 'Health Institution'
  }

  await test.step('Declaration started by HO', async () => {
    await login(page, CREDENTIALS.HOSPITAL_OFFICIAL)
    await page.click('#header-new-event')
    await page.getByLabel('Birth').click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await test.step('Fill child details', async () => {
      await page.locator('#firstname').fill(declaration.child.name.firstNames)

      await page.locator('#surname').fill(declaration.child.name.familyName)

      await page.locator('#child____placeOfBirth').click()

      await page
        .getByText(declaration.placeOfBirth, {
          exact: true
        })
        .click()
    })

    await test.step('Go to review and send for review', async () => {
      await goToSection(page, 'review')

      await selectDeclarationAction(page, 'Notify')
    })

    await test.step('Verify summary page', async () => {
      await ensureOutboxIsEmpty(page)

      await page.getByText('Recent').click()

      await page
        .getByRole('button', {
          name: formatName(declaration.child.name),
          exact: true
        })
        .click()

      await expect(page.getByText('Notified', { exact: true })).toBeVisible()

      await expect(page.locator('#content-name')).toContainText(
        formatName(declaration.child.name)
      )

      await expect(
        page.getByTestId('status-value').locator('span')
      ).toContainText('Notified')

      await expect(
        page.getByTestId('event-value').locator('span')
      ).toContainText('Birth')

      await expect(
        page.getByTestId('child.dob-value').locator('span')
      ).toBeHidden()

      await expect(
        page.getByTestId('registrationNumber-value').locator('span')
      ).toContainText('No registration number')

      await expect(
        page.getByTestId('informant.contact-value').locator('span')
      ).toBeHidden()

      await expect(
        page.getByTestId('assignedTo-value').locator('span')
      ).toContainText('Not assigned')

      await expect(
        page.getByTestId('child.birthLocation-value').locator('span')
      ).toBeHidden()
    })
  })

  await page.close()
})
