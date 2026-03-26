import { expect, test, type Page } from '@playwright/test'
import { login, getToken, validateActionMenuButton } from '../../helpers'
import { CREDENTIALS, SAFE_WORKQUEUE_TIMEOUT_MS } from '../../constants'
import { createDeclaration, Declaration } from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '../birth/helpers'
import { ensureAssigned, expectInUrl } from '../../utils'
import { getRowByTitle } from '../print-certificate/birth/helpers'
test('5(b) Validate "Pending registration"-workqueue for Registrar', async ({
  browser
}) => {
  const page: Page = await browser.newPage()
  const token = await getToken(
    CREDENTIALS.REGISTRATION_OFFICER.USERNAME,
    CREDENTIALS.REGISTRATION_OFFICER.PASSWORD
  )
  const res = await createDeclaration(token, undefined, ActionType.DECLARE)
  const declaration: Declaration = res.declaration
  const eventId: string = res.eventId

  await test.step('5.0 Login', async () => {
    await login(page, CREDENTIALS.REGISTRAR)
  })
  await test.step('5.1 Go to "Pending registration"-workqueue', async () => {
    await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS) // wait for the event to be in the workqueue.
    await page.getByText('Pending registration').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
    await expect(page.getByTestId('search-result')).toContainText(
      'Pending registration'
    )
  })
  await test.step('5.2 validate the list', async () => {
    const header = page.locator('div[class^="TableHeader"]')
    const columns = await header.locator(':scope > div').allInnerTexts()
    expect(columns).toStrictEqual([
      'Title',
      'Event',
      'Date of Event',
      'Last updated',
      ''
    ])
    const row = getRowByTitle(page, formatV2ChildName(declaration))
    const cells = row.locator(':scope > div')
    await expect(cells.nth(0)).toHaveText(formatV2ChildName(declaration))
    await expect(cells.nth(1)).toHaveText('Birth')
    await expect(cells.nth(2)).toHaveText(
      declaration['child.dob'].split('T')[0]
    )
  })
  await test.step('5.4 Click a name', async () => {
    await page
      .getByRole('button', { name: formatV2ChildName(declaration) })
      .click()
    await expectInUrl(page, `events/${eventId}?workqueue=pending-registration`)
  })
  await test.step('5.5 Register action should be available for declared and validated record', async () => {
    await ensureAssigned(page)
    await validateActionMenuButton(page, 'Register', true)
  })
  await page.close()
})
