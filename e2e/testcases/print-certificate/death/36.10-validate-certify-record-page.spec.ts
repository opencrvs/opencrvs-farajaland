import { expect, test, type Page } from '@playwright/test'
import { getToken, login } from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import {
  createDeclaration,
  Declaration
} from '../../test-data/death-declaration'
import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from './helpers'
import { expectInUrl } from '../../../utils'
import { printAndExpectPopup } from '../birth/helpers'

test('10.0 Validate "Review" page', async ({ browser }) => {
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  const res = await createDeclaration(token)

  let page: Page

  let declaration: Declaration

  let eventId: string
  declaration = res.declaration
  eventId = res.eventId
  page = await browser.newPage()

  await test.step('10.0.1 Log in', async () => {
    await login(page)
  })

  await test.step('10.0.2 Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()

    await navigateToCertificatePrintAction(page, declaration)
  })

  await test.step('10.1 Review page validations', async () => {
    await selectCertificationType(page, 'Death Certificate Certified Copy')

    await selectRequesterType(page, 'Print and issue to Informant (Spouse)')

    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Verified' }).click()

    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Yes, print certificate' }).click()

    await expect(page.locator('#confirm-print-modal')).toBeVisible()

    await expect(page.locator('#confirm-print-modal')).toContainText(
      'Print certified copy?'
    )

    await expect(page.locator('#confirm-print-modal')).toContainText(
      'This will generate a certified copy of the record for printing.'
    )
  })

  await test.step('10.2 On click cancel button, modal will be closed', async () => {
    await page.getByRole('button', { name: 'Cancel' }).click()

    await expect(page.locator('#confirm-print-modal')).toBeHidden()
  })

  await test.step('10.3 On click print button, user will navigate to a new tab from where user can download PDF', async () => {
    await printAndExpectPopup(page)

    await expectInUrl(page, `/workqueue/pending-certification`)
  })

  await page.close()
})
