import { expect, test } from '@playwright/test'

import { login, getToken } from '../../helpers'
import { CREDENTIALS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'

import {
  navigateToCertificatePrintAction,
  selectCertificationType,
  selectRequesterType
} from '../print-certificate/birth/helpers'
import { expectInUrl } from '../../utils'

test('Navigating in and out of action', async ({ browser }) => {
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  const res = await createDeclaration(token)

  const page = await browser.newPage()

  const declaration: Declaration = res.declaration

  const eventId: string = res.eventId

  await test.step('Login', async () => {
    await login(page)
  })

  await test.step('Navigate to "Pending certification" -workqueue', async () => {
    await page.getByRole('button', { name: 'Pending certification' }).click()
  })

  await test.step('Navigate successfully through the print certificate action flow', async () => {
    await navigateToCertificatePrintAction(page, declaration)
    await selectCertificationType(page, 'Birth Certificate')
    await selectRequesterType(page, 'Print and issue to Informant (Mother)')
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.getByRole('button', { name: 'Verified' }).click()
    await page.getByRole('button', { name: 'Continue' }).click()
    await page.waitForURL(/\/review/)

    await expectInUrl(
      page,
      `/events/print-certificate/${eventId}/review?templateId=v2.birth-certificate`
    )
  })

  await test.step('Browser back and forward actions work correctly inside the action flow', async () => {
    await page.goBack()
    await page.goBack()
    await page.goForward()
    await page.goBack()

    await expectInUrl(
      page,
      `/events/print-certificate/${eventId}/pages/collector.identity.verify`
    )

    await page.goForward()
    await page.goForward()
    await page.waitForURL(/\/review/)

    await expectInUrl(
      page,
      `/events/print-certificate/${eventId}/review?templateId=v2.birth-certificate`
    )
  })

  await test.step('After finishing action flow, user should be redirected to the event overview page', async () => {
    await page.getByRole('button', { name: 'Yes, print certificate' }).click()
    await page.getByRole('button', { name: 'Print', exact: true }).click()

    // Wait for PDF the load and the page to be redirected to the overview page
    await page.waitForURL(`**/workqueue/pending-certification`)

    await expectInUrl(page, `/workqueue/pending-certification`)
  })

  await test.step('Browser back button should take user to the front page instead of action flow', async () => {
    await page.goBack()

    await expect(page.locator('#content-name')).toContainText(
      'Pending certification'
    )
  })

  await test.step('Browser forward button should take user back to the event overview page', async () => {
    await page.goForward()

    await expectInUrl(
      page,
      `/events/${eventId}?workqueue=pending-certification`
    )
  })

  await page.close()
})
