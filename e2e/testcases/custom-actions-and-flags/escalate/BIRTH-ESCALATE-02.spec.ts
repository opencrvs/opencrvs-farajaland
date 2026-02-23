import { expect, test, type Page } from '@playwright/test'
import { login, getToken, formatName } from '../../../helpers'
import { formatV2ChildName } from '../../birth/helpers'
import { CREDENTIALS } from '../../../constants'
import {
  createDeclaration,
  Declaration
} from '../../test-data/birth-declaration'

import {
  ensureAssigned,
  ensureOutboxIsEmpty,
  selectAction
} from '../../../utils'

let page: Page
let declaration: Declaration
test.describe.serial('Escalate', () => {
  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.REGISTRAR.USERNAME,
      CREDENTIALS.REGISTRAR.PASSWORD
    )
    const res = await createDeclaration(token)
    declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test.describe('Create and Escalate the declaration By Registrar', async () => {
    test('Click on "Print certificate" from action menu', async () => {
      await login(page, CREDENTIALS.REGISTRAR)
      await page.getByRole('button', { name: 'Pending certification' }).click()
      const formattedName = formatV2ChildName(declaration)
      await page
        .getByRole('button', { name: formattedName, exact: true })
        .click()
      await ensureAssigned(page)
    })
    test("Event should not have the 'Escalated' -flag", async () => {
      await expect(
        page.getByText('Escalate', { exact: true })
      ).not.toBeVisible()
    })
    test('Escalate the declaration: ', async () => {
      await selectAction(page, 'Escalate')
      await expect(page.getByText('Escalate to')).toBeVisible()
      await expect(page.getByText('Reason')).toBeVisible()
    })
    test('Escalate to Provincial Registrar', async () => {
      const confirmButton = page.getByRole('button', { name: 'Confirm' })
      await expect(confirmButton).toBeDisabled()
      await page.getByText('Select...').click()
      const selectOptionsLabels = [
        'My state provincial registrar',
        'Registrar General'
      ]
      for (const label of selectOptionsLabels) {
        await expect(page.getByText(label, { exact: true })).toBeVisible()
      }
      await page.getByText(selectOptionsLabels[1], { exact: true }).click()

      const reasonsField = page.locator('#reason')
      await reasonsField.fill(
        'Escalate the declaration to the Regsitrar General'
      )
      await expect(confirmButton).toBeEnabled()
      await confirmButton.click()
      await ensureOutboxIsEmpty(page)
    })
    test('Checking the flag and status', async () => {
      if (await page.getByTestId('exit-event').isVisible()) {
        await page.getByTestId('exit-event').click()
      }
      await page.getByRole('button', { name: 'Escalated' }).click()
      const formattedName = formatV2ChildName(declaration)
      await page
        .getByRole('button', { name: formattedName, exact: true })
        .click()

      await expect(
        page.getByText('Escalate', { exact: true })
      ).not.toBeVisible()
      await expect(
        page.getByText(
          'Pending first certificate issuance, Escalated to Registrar General'
        )
      ).toBeVisible()
    })
  })
  test.describe('Registrar General: Review the escalation', async () => {
    test('Click on "Pending Feedback" from action menu', async () => {
      await login(page, CREDENTIALS.REGISTRAR_GENERAL)
      await page.getByRole('button', { name: 'Pending feedback' }).click()
      const formattedName = formatV2ChildName(declaration)
      await page
        .getByRole('button', { name: formattedName, exact: true })
        .click()
    })
    test('Assign', async () => {
      await ensureAssigned(page)
    })
    test("Event should not have the 'Registered' --flag ", async () => {
      const flags = page.getByTestId('flags')
      await expect(flags.getByText(/Registered/)).not.toBeVisible()
    })
    test('Feedback by the provincial Registrar', async () => {
      await selectAction(page, 'Registrar general feedback')
      await expect(
        page.getByText(
          'Your feedback will be officially recorded and may influence the final decision on the declaration.'
        )
      ).toBeVisible()
      await expect(page.locator('#notes')).toBeEditable()
      await expect(
        page.getByRole('button', { name: 'Confirm', exact: true })
      ).not.toBeEnabled()

      await page.locator('#notes').fill('The declaration value seems ok to me.')
      await expect(
        page.getByRole('button', { name: 'Confirm', exact: true })
      ).toBeEnabled()
      await page.getByRole('button', { name: 'Confirm', exact: true }).click()
      await ensureOutboxIsEmpty(page)
    })
  })
  test.describe('Registrar verify the declaration flag ', () => {
    test('Escalated flag should not be visible', async () => {
      await login(page, CREDENTIALS.REGISTRAR, true)
      await page.getByRole('button', { name: 'Pending certification' }).click()
      const formattedName = formatV2ChildName(declaration)
      await page
        .getByRole('button', { name: formattedName, exact: true })
        .click()
      await expect(page.getByText(/Escalated/i)).not.toBeVisible()
    })
  })
})
