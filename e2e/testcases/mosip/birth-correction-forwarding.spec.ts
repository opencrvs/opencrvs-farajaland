import { expect, test } from '@playwright/test'
import { createClient } from '@opencrvs/toolkit/api'
import { v4 as uuidv4 } from 'uuid'
import { faker } from '@faker-js/faker'
import { differenceInYears } from 'date-fns'
import { aggregateActionDeclarations } from '@opencrvs/toolkit/events'
import { omit } from 'lodash'
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

    token = await getToken(
      CREDENTIALS.REGISTRAR.USERNAME,
      CREDENTIALS.REGISTRAR.PASSWORD
    )

    const declarationForMosipForwarding: Declaration = await getDeclaration({
      token,
      partialDeclaration: {
        'mother.verified': 'authenticated'
      }
    })

    const response = await createDeclaration(
      token,
      omit(declarationForMosipForwarding, ['mother.idType', 'mother.nid'])
    )

    eventId = response.eventId

    const startedAt = Date.now()
    const timeoutMs = 30000
    const intervalMs = 1000

    while (Date.now() - startedAt < timeoutMs) {
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
        return
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    throw new Error(
      'REGISTER action did not complete MOSIP requested-to-accepted flow'
    )
  })

  test('REQUEST_CORRECTION is accepted for an eligible birth record', async () => {
    /**
     * Acceptance criteria for this e2e check:
     * - The corrected birth record must have child.nid present.
     * - The child must be under 16 years old.
     * - Trigger route under test: /trigger/events/birth/actions/REQUEST_CORRECTION.
     * - On correction request, the action is processed successfully (HTTP 200 / Requested action).
     *
     * Note: child.nid is not provided directly in this test declaration payload.
     * It is added by MOSIP registration confirmation (register.request -> register.accept)
     * in line with interop behavior.
     * Console log assertions are covered in tests/mosip-birth-correction-eligibility.test.ts
     * because service stdout is not a stable assertion surface in black-box e2e runs.
     */
    const aggregatedDeclaration = aggregateActionDeclarations(registeredEvent)
    const childNid = aggregatedDeclaration['child.nid']
    const childDob = aggregatedDeclaration['child.dob'] as string | undefined

    expect(childNid).toBeTruthy()
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
          }
        },
        annotation: {
          'review.comment': 'MOSIP correction trigger e2e check'
        },
        createdAtLocation: healthFacilityId
      }
    )
    const correctedEvent = await correctionResponse.json()

    expect(correctionResponse.status).toBe(200)

    const correctionAction = (
      correctedEvent.actions as Array<{ type: string; status: string }>
    ).find((action) => action.type === 'REQUEST_CORRECTION')

    expect(correctionAction).toBeDefined()
    expect(correctionAction?.status).toBe('Requested')
  })
})
