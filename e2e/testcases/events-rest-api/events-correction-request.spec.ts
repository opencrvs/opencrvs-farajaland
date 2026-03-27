import { expect, Page, test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'
import {
  createIntegrationContext,
  createRegisteredEvent,
  fetchClientAPI
} from './helpers'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import { login } from '../../helpers'
import { createClient } from '@opencrvs/toolkit/api'
import { ensureAssigned, selectAction, type } from '../../utils'

test('POST /api/events/events/{eventId}/correction/request', async ({
  browser
}) => {
  const context = await createIntegrationContext()
  const clientToken: string = context.clientToken
  const registrarToken: string = context.registrarToken
  const healthFacilityId: string = context.healthFacilityId
  const clientName: string = context.clientName
  let eventId: string
  let page: Page

  await test.step('HTTP 200 for correction request', async () => {
    eventId = await createRegisteredEvent(registrarToken)
    const response = await fetchClientAPI(
      `/api/events/events/${eventId}/correction/request`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        type: 'REQUEST_CORRECTION',
        declaration: {
          'child.name': {
            firstname: faker.person.firstName(),
            surname: faker.person.lastName()
          }
        },
        annotation: {},
        createdAtLocation: healthFacilityId
      }
    )

    const body = await response.json()

    expect(response.status).toBe(200)
    const requestAction = body.actions.find(
      (action: { type: string }) => action.type === 'REQUEST_CORRECTION'
    )

    expect(requestAction).toBeDefined()
  })

  await test.step('Correction review has submitter name as system client', async () => {
    page = await browser.newPage()
    await login(page, CREDENTIALS.REGISTRAR)

    const client = createClient(
      GATEWAY_HOST + '/events',
      `Bearer ${registrarToken}`
    )

    const eventDocument = await client.event.get.query({ eventId })
    const { trackingId } = eventDocument
    await type(page, '#searchText', trackingId)
    await page.locator('#searchIconButton').click()
    await page.getByRole('button', { name: 'Review' }).click()
    await ensureAssigned(page)
    await selectAction(page, 'Review correction request')
    await expect(page.getByText('Submitter' + clientName)).toBeVisible()
  })
})
