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

test('9.0 Validate "Certify record" page', async ({ browser }) => {
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  const res = await createDeclaration(token)

  const page: Page = await browser.newPage()

  const declaration: Declaration = res.declaration

  await test.step('9.0.1 Log in', async () => {
    await login(page)
  })

  await test.step('9.0.1 Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()

    await navigateToCertificatePrintAction(page, declaration)
  })

  await test.step('9.1 Review page validations', async () => {
    await selectCertificationType(page, 'Death Certificate Certified Copy')

    await selectRequesterType(page, 'Print and issue to Informant (Spouse)')

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

  await page.close()
})
