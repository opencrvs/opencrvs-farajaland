import { expect, test } from '@playwright/test'
import { login, getToken } from '../../helpers'
import { CREDENTIALS, SAFE_WORKQUEUE_TIMEOUT_MS } from '../../constants'
import { createDeclaration } from '../test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '../birth/helpers'
import {
  ensureAssigned,
  ensureOutboxIsEmpty,
  expectInUrl,
  selectAction
} from '../../utils'
import { getRowByTitle } from '../print-certificate/birth/helpers'

test('5(a) Validate "Pending validation"-workqueue for RO', async ({
  browser
}) => {
  const page = await browser.newPage()
  const token = await getToken(
    CREDENTIALS.HOSPITAL_OFFICIAL.USERNAME,
    CREDENTIALS.HOSPITAL_OFFICIAL.PASSWORD
  )
  const res = await createDeclaration(token, undefined, ActionType.DECLARE)
  const declaration = res.declaration
  const eventId = res.eventId

  await test.step('5.0 Login', async () => {
    await login(page, CREDENTIALS.REGISTRATION_OFFICER)
  })

  await test.step('5.1 Go to "Pending validation"-workqueue', async () => {
    await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS) // wait for the event to be in the workqueue.
    await page.getByText('Pending validation').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()

    await expect(page.getByTestId('search-result')).toContainText(
      'Pending validation'
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

  await test.step('5.3 Click a name', async () => {
    await page
      .getByRole('button', { name: formatV2ChildName(declaration) })
      .click()

    await expectInUrl(page, `events/${eventId}?workqueue=pending-validation`)
  })

  await test.step('5.4 Click "Validate"-action', async () => {
    await ensureAssigned(page)
    await selectAction(page, 'Validate')

    await expect(
      page.getByRole('heading', { name: 'Validate?', exact: true })
    ).toBeVisible()

    await expect(
      page.getByText(
        'Validating this declaration confirms it meets all requirements and is eligible for registration.'
      )
    ).toBeVisible()
  })

  await test.step('5.5 Complete validate action', async () => {
    await page.getByRole('button', { name: 'Confirm' }).click()

    // Should redirect back to "Pending validation"-workqueue
    await expect(page.locator('#content-name')).toHaveText('Pending validation')

    await ensureOutboxIsEmpty(page)

    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).not.toBeVisible()
  })

  await page.close()
})
