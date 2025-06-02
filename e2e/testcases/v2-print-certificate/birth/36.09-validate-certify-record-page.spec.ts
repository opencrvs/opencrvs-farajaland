import { expect, test, type Page } from '@playwright/test'

import { Declaration } from '../../v2-test-data/birth-declaration'
import { getToken } from '../../../helpers'
import { createDeclaration } from '../../v2-test-data/birth-declaration'
import { CREDENTIALS } from '../../../constants'
import { loginToV2 } from '../../../helpers'
import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from './helpers'

test.describe.serial('9.0 Validate "Certify record" page', () => {
  let declaration: Declaration
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    const res = await createDeclaration(token)
    declaration = res.declaration
    page = await browser.newPage()
    await loginToV2(page)

    await page.getByRole('button', { name: 'Ready to print' }).click()
    await navigateToCertificatePrintAction(page, declaration)
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('9.1 Review page validations', async () => {
    await selectCertificationType(page, 'Birth Certificate Certified Copy')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')

    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.locator('#content-name')).toContainText(
      'Print certificate'
    )
    await expect(
      page.getByText(
        'Please confirm that the informant has reviewed that the information on the certificate is correct and that it is ready to print.'
      )
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'No, make correction' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Yes, print certificate' })
    ).toBeVisible()
  })
})
