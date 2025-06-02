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
import { selectAction } from '../../v2-utils'

test.describe
  .serial('4(b) Validate Requires update tab for registration agent', () => {
  let page: Page
  let declaration: Declaration
  let eventId: string

  test.beforeAll(async ({ browser }) => {
    const token = await getToken(
      CREDENTIALS.REGISTRATION_AGENT.USERNAME,
      CREDENTIALS.REGISTRATION_AGENT.PASSWORD
    )
    const res = await createDeclaration(token, undefined, ActionType.VALIDATE)
    declaration = res.declaration
    eventId = res.eventId

    const LocalRegistrarToken = await getToken(
      CREDENTIALS.LOCAL_REGISTRAR.USERNAME,
      CREDENTIALS.LOCAL_REGISTRAR.PASSWORD
    )
    await rejectDeclaration(LocalRegistrarToken, eventId)

    page = await browser.newPage()
    await loginToV2(page, CREDENTIALS.REGISTRATION_AGENT)
  })

  test.afterAll(async () => {
    // await page.close()
  })

  test('4.1 Go to Requires update tab', async () => {
    await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS) // wait for the event to be in the workqueue. Handle better after outbox workqueue is implemented
    await page.getByText('Requires update').click()
    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).toBeVisible()
    await expect(page.getByTestId('search-result')).toContainText(
      'Requires update'
    )
  })

  test('4.2 validate the list', async () => {
    const button = page.getByRole('button', {
      name: formatV2ChildName(declaration)
    })

    const header = page.locator('div[class^="TableHeader"]')
    const columns = await header.locator(':scope > div').allInnerTexts()
    expect(columns).toStrictEqual([
      'Title',
      'Event',
      'Date of Event',
      'Sent for update'
    ])

    const row = button.locator('xpath=ancestor::*[starts-with(@id, "row_")]')

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

  test('4.5 Click validate action', async () => {
    await selectAction(page, 'Validate')
    expect(
      page.url().includes(`events/validate/${eventId}/review`)
    ).toBeTruthy()
  })
  test('4.5 Complete validate action', async () => {
    await page.getByRole('button', { name: 'Send for approval' }).click()
    await expect(page.getByText('Send for approval?')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await page.waitForTimeout(SAFE_WORKQUEUE_TIMEOUT_MS) // wait for the event to be in the workqueue. Handle better after outbox workqueue is implemented
    await page.getByText('Requires update').click()

    await expect(
      page.getByRole('button', { name: formatV2ChildName(declaration) })
    ).not.toBeVisible()
  })
})
