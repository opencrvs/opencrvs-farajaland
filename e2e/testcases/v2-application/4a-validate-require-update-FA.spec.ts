import { expect, test, type Page } from '@playwright/test'

import { loginToV2, getToken } from '../../helpers'
import { CREDENTIALS, SAFE_WORKQUEUE_TIMEOUT_MS } from '../../constants'
import {
  createDeclaration,
  Declaration,
  rejectDeclaration
} from '../v2-test-data/birth-declaration'
import { ActionType } from '@opencrvs/toolkit/events'
import { formatV2ChildName } from '../v2-birth/helpers'
import { ensureAssigned, selectAction } from '../../v2-utils'
import { getRowByTitle } from '../v2-print-certificate/birth/helpers'
import { faker } from '@faker-js/faker'

test.describe
  .serial('4(a) Validate Requires update tab for field agent', () => {
  let page: Page
  let declaration: Declaration
  let eventId: string

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.FIELD_AGENT.USERNAME,
      CREDENTIALS.FIELD_AGENT.PASSWORD
    )
    const res = await createDeclaration(token, undefined, ActionType.DECLARE)
    declaration = res.declaration
    eventId = res.eventId

    page = await browser.newPage()
  })

  test.afterAll(async () => {
    await page.close()
  })

  test('4.0.1 Login', async () => {
    await loginToV2(page, CREDENTIALS.LOCAL_REGISTRAR)
  })

  test('4.0.2 Navigate to record audit', async () => {
    await page.getByText('Ready for review').click()

    await page
      .getByRole('button', { name: formatV2ChildName(declaration) })
      .click()
  })

  test('4.0.3 Reject a declaration', async () => {
    await selectAction(page, 'Validate')

    await page.getByRole('button', { name: 'Reject' }).click()

    await page.getByTestId('reject-reason').fill(faker.lorem.sentence())

    await page.getByRole('button', { name: 'Send For Update' }).click()
  })

  test('4.1 Go to Requires update tab', async () => {
    await loginToV2(page, CREDENTIALS.FIELD_AGENT)
    await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS) // wait for the event to be in the workqueue.
    await page.getByText('Requires update').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
    await expect(page.getByTestId('search-result')).toContainText(
      'Requires update'
    )
  })

  test('4.2 validate the list', async () => {
    const header = page.locator('div[class^="TableHeader"]')
    const columns = await header.locator(':scope > div').allInnerTexts()
    expect(columns).toStrictEqual([
      'Title',
      'Event',
      'Date of Event',
      'Sent for update',
      ''
    ])

    const row = getRowByTitle(page, formatV2ChildName(declaration))

    const cells = row.locator(':scope > div')

    expect(cells.nth(0)).toHaveText(formatV2ChildName(declaration))
    expect(cells.nth(1)).toHaveText('Birth')
    expect(cells.nth(2)).toHaveText(declaration['child.dob'].split('T')[0])
  })

  test('4.4 Click a name', async () => {
    await page
      .getByRole('button', { name: formatV2ChildName(declaration) })
      .click()

    // User should navigate to record audit page
    expect(page.url().includes(`events/overview/${eventId}`)).toBeTruthy()
  })

  test('4.5 Acting directly from workqueue should redirect to the same workqueue', async () => {
    await ensureAssigned(page)
    await page.goBack()

    const row = getRowByTitle(page, formatV2ChildName(declaration))

    await row.getByRole('button', { name: 'Declare' }).click()

    await page.getByRole('button', { name: 'Send for review' }).click()
    await expect(page.getByText('Send for review?')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()

    // Should redirect back to requires update workqueue
    await expect(page.locator('#content-name')).toHaveText('Requires updates')
  })
})
