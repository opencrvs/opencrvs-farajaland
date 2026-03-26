import { test, type Page, expect } from '@playwright/test'
import { CREDENTIALS } from '../../../constants'
import { login } from '../../../helpers'
import { getToken } from '../../../helpers'
import {
  createDeclaration,
  Declaration
} from '../../test-data/birth-declaration'
import {
  selectRequesterType,
  selectCertificationType,
  navigateToCertificatePrintAction
} from './helpers'
import { expectInUrl } from '../../../utils'
import { mockNetworkConditions } from '../../../mock-network-conditions'
test('User should not be able to press print button twice', async ({
  browser
}) => {
  const token = await getToken(
    CREDENTIALS.REGISTRAR.USERNAME,
    CREDENTIALS.REGISTRAR.PASSWORD
  )
  const res = await createDeclaration(token)
  const declaration: Declaration = res.declaration
  const eventId: string = res.eventId
  const page: Page = await browser.newPage()

  try {
    await test.step('Log in', async () => {
      await login(page)
    })
    await test.step('Navigate to certificate print action', async () => {
      await page.getByRole('button', { name: 'Pending certification' }).click()
      await navigateToCertificatePrintAction(page, declaration)
    })
    await test.step('Fill details', async () => {
      await selectCertificationType(page, 'Birth Certificate')
      await selectRequesterType(page, 'Print and issue to Informant (Mother)')
      await page.getByRole('button', { name: 'Continue' }).click()
      await page.getByRole('button', { name: 'Verified' }).click()
      await page.getByRole('button', { name: 'Continue' }).click()
    })
    await test.step('Set slow connection', async () => {
      await mockNetworkConditions(page, 'cellular2G')
    })
    await test.step('Print with slow connection', async () => {
      await page.getByRole('button', { name: 'Yes, print certificate' }).click()
      const popupPromise = page.waitForEvent('popup')
      await page.getByRole('button', { name: 'Print', exact: true }).click()
      await expect(
        page.getByRole('button', {
          name: 'Yes, print certificate',
          exact: true
        })
      ).toBeDisabled()
      const popup = await popupPromise
      const downloadPromise = popup.waitForEvent('download')
      const download = await downloadPromise
      // Check that the popup URL contains PDF content
      await expect(popup.url()).toBe('about:blank')
      await expect(download.suggestedFilename()).toMatch(/^.*\.pdf$/)
      await expectInUrl(page, `/workqueue/pending-certification`)
    })
  } finally {
    await page.close()
  }
})
