import { expect, test } from '@playwright/test'
import { createClient } from '@opencrvs/toolkit/api'
import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'
import { differenceInYears } from 'date-fns'
import {
  EventDocument,
  aggregateActionDeclarations
} from '@opencrvs/toolkit/events'
import { CREDENTIALS, GATEWAY_HOST } from '../../constants'
import { getToken } from '../../helpers'
import {
  createIntegrationContext,
  fetchClientAPI
} from '../events-rest-api/helpers'
import {
  createDeclaration,
  getDeclaration,
  type Declaration
} from '../test-data/birth-declaration'

async function getEventById(eventId: string, token: string) {
  const client = createClient(`${GATEWAY_HOST}/events`, `Bearer ${token}`)
  return client.event.get.query({ eventId })
}

test.describe.serial('Birth correction trigger eligibility checks', () => {
  let token: string
  let clientToken: string
  let healthFacilityId: string
  let eventId: string
  let registeredEvent: Awaited<ReturnType<typeof getEventById>>

  test.beforeAll(async () => {
    const integrationContext = await createIntegrationContext()
    clientToken = integrationContext.clientToken
    healthFacilityId = integrationContext.healthFacilityId

    token = await getToken(CREDENTIALS.REGISTRAR)

    const declarationForMosipForwarding: Declaration = await getDeclaration({
      token,
      partialDeclaration: {
        'mother.verified': 'failed'
      }
    })

    const response = await createDeclaration(
      token,
      declarationForMosipForwarding
    )

    eventId = response.eventId

    await expect
      .poll(
        async () => {
          const event = await getEventById(eventId, token)
          const registerActions = event.actions.filter(
            (action: { type: string }) => action.type === 'REGISTER'
          )

          const hasRequestedRegisterAction = registerActions.some(
            (action: { status: string }) => action.status === 'Requested'
          )
          const acceptedRegisterAction = registerActions.find(
            (action: { status: string }) => action.status === 'Accepted'
          )

          if (hasRequestedRegisterAction && acceptedRegisterAction) {
            registeredEvent = event
            return true
          }

          return false
        },
        {
          timeout: 30_000,
          intervals: [500, 1000, 2000]
        }
      )
      .toBe(true)
  })

  test('REQUEST_CORRECTION can be approved for an eligible birth record', async () => {
    /**
     * Acceptance criteria validated by this test:
     * - Setup creates a registered birth event where mother identity is not authenticated,
     *   so MOSIP does not generate child.nid during initial registration.
     * - Eligibility remains valid for correction forwarding (child has a date of birth and is younger than 16).
     * - REQUEST_CORRECTION is submitted successfully and transitions to Accepted.
     * - APPROVE_CORRECTION is submitted against the accepted request and transitions to Accepted.
     * - After approval completes, child.nid is generated and present in the latest event state.
     */
    const aggregatedDeclaration = aggregateActionDeclarations(registeredEvent)
    const childNid = aggregatedDeclaration['child.nid']
    const childDob = aggregatedDeclaration['child.dob']

    expect(childNid).toBeFalsy()
    expect(childDob).toBeTruthy()
    expect(
      differenceInYears(new Date(), new Date(childDob as string))
    ).toBeLessThan(16)

    const correctionResponse = await fetchClientAPI(
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
          },
          'mother.verified': 'verified'
        },
        annotation: {
          'review.comment': 'MOSIP correction trigger e2e check'
        },
        createdAtLocation: healthFacilityId
      }
    )

    const correctedEvent = (await correctionResponse.json()) as EventDocument
    const acceptedRequestAction = correctedEvent.actions.find(
      (action) =>
        action.type === 'REQUEST_CORRECTION' && action.status === 'Accepted'
    )
    const acceptedRequestActionId = acceptedRequestAction!.id

    const approveResponse = await fetchClientAPI(
      `/api/events/events/${eventId}/correction/approve`,
      'POST',
      clientToken,
      {
        eventId,
        transactionId: uuidv4(),
        requestId: acceptedRequestActionId,
        type: 'APPROVE_CORRECTION',
        declaration: {
          'mother.verified': 'verified'
        },
        annotation: {
          'review.comment': 'MOSIP correction approval e2e check'
        },
        createdAtLocation: healthFacilityId
      }
    )

    expect(approveResponse.status).toBe(200)

    await expect
      .poll(
        async () => {
          const event = await getEventById(eventId, token)
          const acceptedApproveAction = event.actions.find(
            ({ type, status }) =>
              type === 'APPROVE_CORRECTION' && status === 'Accepted'
          )

          return acceptedApproveAction
        },
        {
          timeout: 30_000,
          intervals: [1000, 2000, 5000]
        }
      )
      .toBeTruthy()

    const event = await getEventById(eventId, token)
    const declaration = aggregateActionDeclarations(event)
    expect(declaration['child.nid']).toMatch(/^\d{10}$/)
  })
})
