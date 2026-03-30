import { expect, test } from '@playwright/test'
import { getToken, login } from '../../../helpers'
import { CREDENTIALS } from '../../../constants'
import { createDeclaration } from '../../test-data/death-declaration'
import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from './helpers'
import { expectInUrl } from '../../../utils'

test('7.0 Validate "Certify record" page', async ({ browser }) => {
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  const res = await createDeclaration(token)
  const eventId = res.eventId
  const page = await browser.newPage()
  const declaration = res.declaration

  await test.step('7.0.1 Log in', async () => {
    await login(page)
  })

  await test.step('7.0.2 Navigate to certificate print action', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
    await navigateToCertificatePrintAction(page, declaration)
  })

  await test.step('7.1 continue with "Print and issue to informant (Spouse)" redirect to Collector details page', async () => {
    await selectCertificationType(page, 'Death Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Spouse)')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expectInUrl(
      page,
      `/print-certificate/${eventId}/pages/collector.identity.verify`
    )

    await page.getByRole('button', { name: 'Verified' }).click()

    await expectInUrl(
      page,
      `/print-certificate/${eventId}/pages/collector.collect.payment`
    )

    await expect(page.locator('#content-name')).toContainText('Collect Payment')
    await expect(
      page.getByText('Death registration before 45 days of date of death')
    ).toBeVisible()
    await expect(page.getByText('$5.00')).toBeVisible()
  })

  await test.step('7.2 should navigate to ready to certify page on continue button click', async () => {
    await page.getByRole('button', { name: 'Continue' }).click()

    await expectInUrl(
      page,
      `/print-certificate/${eventId}/review?templateId=v2.death-certificate`
    )
  })

  // @TODO: this is not implemented in events v2 yet
  await test.step.skip(
    '7.3 should skip payment page if payment is 0',
    async () => {}
  )
})
