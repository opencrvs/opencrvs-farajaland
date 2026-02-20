import { expect, test, type Page } from '@playwright/test'
import { login, getToken, formatName } from '../../../helpers'
import {
  formatV2ChildName,
  REQUIRED_VALIDATION_ERROR
} from '../../birth/helpers'
import { CREDENTIALS } from '../../../constants'
import {
  createDeclaration,
  Declaration
} from '../../test-data/birth-declaration'
import { navigateToCertificatePrintAction } from '../../print-certificate/birth/helpers'
import {
  ensureAssigned,
  ensureOutboxIsEmpty,
  expectInUrl,
  selectAction
} from '../../../utils'
import exp from 'constants'

let page: Page
let declaration: Declaration
test.describe.serial('Escalate', () => {
  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.REGISTRAR.USERNAME,
      CREDENTIALS.REGISTRAR.PASSWORD
    )
    // const res = await createDeclaration(token)
    // declaration = res.declaration
    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('1.0.1 Log in', async () => {
    await login(page)
  })
  test.describe('Create and Escalate the declaration By RO', async () => {
    test('1.0.2 Click on "Print certificate" from action menu', async () => {
      // const formattedName = formatV2ChildName(declaration)
      // console.log('CHILD NAME=>', formattedName)

      await page.getByRole('button', { name: 'Pending certification' }).click()
      await page
        .getByRole('button', { name: 'Vernice Rutherford', exact: true })
        .click()
      ensureAssigned(page)
    })
    test("Event should not have the 'Escalated' -flag", async () => {
      await expect(
        page.getByText('Escalate', { exact: true })
      ).not.toBeVisible()
    })
    test.skip('1.0.3 Escalate the declaration: ', async () => {
      selectAction(page, 'Escalate')
      await expect(page.getByText('Escalate to')).toBeVisible()
      await expect(page.getByText('Reason')).toBeVisible()
    })
    test.skip('', async () => {
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
      await page.getByText(selectOptionsLabels[0], { exact: true }).click()

      const reasonsField = page.locator('#reason')
      await reasonsField.fill(
        'Escalate the declaration to the Provincial regsitrar'
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
      await page
        .getByRole('button', { name: 'Vernice Rutherford', exact: true })
        .click()
      //   await ensureAssigned(page)

      await expect(
        page.getByText('Escalate', { exact: true })
      ).not.toBeVisible()

      await expect(
        page.getByText(
          'Pending first certificate issuance, Escalated to Provincial Registrar'
        )
      ).toBeVisible()
    })
  })
  test.describe('Provincial Registrar: Review the escalation', async () => {})
})
