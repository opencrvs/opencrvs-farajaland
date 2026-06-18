import { expect, test } from '@playwright/test'
import { CLIENT_URL, CREDENTIALS } from '../../constants'
import { expectInUrl } from '../../utils'
import { createPIN, getToken } from '../../helpers'
import { mockNetworkConditions } from '../../mock-network-conditions'

test('Reconnect during application loading', async ({ browser }) => {
  const page = await browser.newPage()

  await test.step('Prepare login', async () => {
    const token = await getToken(CREDENTIALS.REGISTRAR)
    await page.goto(`${CLIENT_URL}?token=${token}`, { waitUntil: 'commit' })
    await page.waitForSelector('#pin-input, #appSpinner', { state: 'visible' })
    await createPIN(page)
  })

  await test.step('Begin loading application in offline mode', async () => {
    await mockNetworkConditions(page, 'offline')
    await page.goto(CLIENT_URL)
  })

  await test.step('Reconnect to network', async () => {
    await page.waitForTimeout(5000)
    await mockNetworkConditions(page, 'default')
  })

  await test.step('Application should be visible', async () => {
    await expect(page.getByText('Farajaland CRS')).toBeVisible({
      timeout: 30000
    })
    await expectInUrl(page, 'assigned-to-you')
  })
})
